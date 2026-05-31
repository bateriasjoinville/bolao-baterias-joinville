-- ============================================================
-- 0010_leagues_oficiais.sql
-- Ligas oficiais: "Baterias Joinville" (geral) + 1 por bairro.
-- Entrada automática no cadastro, sem dono, sem código, fora do limite.
-- Aplicar via SQL Editor do dashboard Supabase.
-- ============================================================

-- 1) Colunas de marcação ------------------------------------
alter table leagues
  add column if not exists is_oficial boolean not null default false;

alter table leagues
  add column if not exists tipo text;

-- 2) Afrouxa NOT NULL de owner_id e codigo_convite ----------
-- Oficiais não têm dono nem código. O CHECK do regex em codigo_convite
-- passa quando NULL (NULL ~ pattern = NULL, não FALSE). UNIQUE aceita
-- múltiplos NULL. FK owner_id on delete restrict segue válida com NULL.
alter table leagues alter column owner_id drop not null;
alter table leagues alter column codigo_convite drop not null;

-- 3) CHECKs de coerência oficial vs comum -------------------
alter table leagues
  add constraint leagues_oficial_coerente check (
    (is_oficial = true
       and owner_id is null
       and codigo_convite is null
       and tipo in ('geral','bairro'))
    or
    (is_oficial = false
       and owner_id is not null
       and codigo_convite is not null
       and tipo is null)
  );

comment on column leagues.is_oficial is
  'Liga oficial (geral/bairro): entrada automática, sem dono, sem código, fora do limite. Imutável pelo usuário.';
comment on column leagues.tipo is
  'geral = Baterias Joinville (todos) · bairro = nome da liga casa com participants.bairro. NULL em ligas de usuário.';

-- 4) Unicidade das oficiais (1 geral, 1 por bairro) ---------
create unique index if not exists leagues_oficial_tipo_nome_idx
  on leagues (tipo, nome) where is_oficial = true;

create index if not exists leagues_is_oficial_idx
  on leagues (is_oficial) where is_oficial = true;

-- 5) Blinda o trigger de owner auto-join contra owner NULL ---
create or replace function add_owner_as_league_member()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id is not null then
    insert into league_members (league_id, participant_id, status)
    values (new.id, new.owner_id, 'aprovado');
  end if;
  return new;
end;
$$;

-- 6) Trigger: novo participante entra nas oficiais ----------
create or replace function add_participant_to_official_leagues()
returns trigger
language plpgsql
as $$
begin
  insert into league_members (league_id, participant_id, status)
  select l.id, new.id, 'aprovado'
  from leagues l
  where l.is_oficial = true
    and (
      l.tipo = 'geral'
      or (l.tipo = 'bairro' and l.nome = new.bairro)
    )
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists participants_join_official on participants;
create trigger participants_join_official
  after insert on participants
  for each row execute function add_participant_to_official_leagues();

-- 7) Seed: liga geral + 1 por bairro (idempotente) ----------
insert into leagues (nome, is_oficial, tipo, owner_id, codigo_convite)
select v.nome, true, v.tipo, null, null
from (values
  ('Baterias Joinville', 'geral'),
  ('Adhemar Garcia', 'bairro'),
  ('América', 'bairro'),
  ('Anita Garibaldi', 'bairro'),
  ('Atiradores', 'bairro'),
  ('Aventureiro', 'bairro'),
  ('Boa Vista', 'bairro'),
  ('Boehmerwald', 'bairro'),
  ('Bom Retiro', 'bairro'),
  ('Bucarein', 'bairro'),
  ('Centro', 'bairro'),
  ('Comasa', 'bairro'),
  ('Costa e Silva', 'bairro'),
  ('Dona Francisca', 'bairro'),
  ('Espinheiros', 'bairro'),
  ('Fátima', 'bairro'),
  ('Floresta', 'bairro'),
  ('Glória', 'bairro'),
  ('Guanabara', 'bairro'),
  ('Iririú', 'bairro'),
  ('Itaum', 'bairro'),
  ('Itinga', 'bairro'),
  ('Jardim Iririú', 'bairro'),
  ('Jardim Paraíso', 'bairro'),
  ('Jardim Sofia', 'bairro'),
  ('Jarivatuba', 'bairro'),
  ('Jativoca', 'bairro'),
  ('João Costa', 'bairro'),
  ('Marinas', 'bairro'),
  ('Morro do Meio', 'bairro'),
  ('Nova Brasília', 'bairro'),
  ('Paranaguamirim', 'bairro'),
  ('Parque Guarani', 'bairro'),
  ('Petrópolis', 'bairro'),
  ('Pirabeiraba', 'bairro'),
  ('Profipo', 'bairro'),
  ('Saguaçu', 'bairro'),
  ('Santa Catarina', 'bairro'),
  ('Santo Antônio', 'bairro'),
  ('São Marcos', 'bairro'),
  ('Ulysses Guimarães', 'bairro'),
  ('Vale Verde', 'bairro'),
  ('Vila Cubatão', 'bairro'),
  ('Vila Nova', 'bairro'),
  ('Zona Industrial Norte', 'bairro'),
  ('Zona Industrial Tupy', 'bairro'),
  ('Área Rural', 'bairro')
) as v(nome, tipo)
where not exists (
  select 1 from leagues l
  where l.is_oficial = true and l.tipo = v.tipo and l.nome = v.nome
);

-- 8) Backfill: participantes existentes nas oficiais --------
insert into league_members (league_id, participant_id, status)
select l.id, p.id, 'aprovado'
from participants p
join leagues l
  on l.is_oficial = true
  and (
    l.tipo = 'geral'
    or (l.tipo = 'bairro' and l.nome = p.bairro)
  )
on conflict do nothing;
