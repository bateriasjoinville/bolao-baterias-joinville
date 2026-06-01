-- ============================================================
-- 0011_participants_cidade_estado.sql
-- Abre o cadastro pra qualquer cidade do Brasil mantendo Joinville
-- como foco. cidade/estado pra todos; bairro só pra Joinville/SC.
-- O trigger de entrada automática passa a só colocar em liga de
-- bairro quem é de Joinville/SC (bairros têm nomes genéricos:
-- Centro, Boa Vista, Fátima... — quem é de fora cairia errado).
-- Aplicar via SQL Editor do dashboard Supabase.
-- ============================================================

-- 1) Colunas com DEFAULT (foco Joinville) -------------------
-- O DEFAULT preenche as linhas existentes e blinda a janela de
-- deploy: o código antigo (sem cidade/estado no insert) segue
-- funcionando até o novo código subir. NOT NULL desde já.
alter table participants
  add column if not exists cidade text not null default 'Joinville';
alter table participants
  add column if not exists estado text not null default 'SC';

-- 2) Checks de coerência ------------------------------------
alter table participants add constraint participants_estado_uf
  check (estado ~ '^[A-Z]{2}$');
alter table participants add constraint participants_cidade_len
  check (char_length(cidade) between 2 and 80);

-- 3) bairro só existe pra residentes de Joinville/SC --------
-- O check inline de tamanho (2..80) segue válido quando bairro
-- não é nulo; com NULL, char_length(null) = NULL = passa.
alter table participants alter column bairro drop not null;
alter table participants add constraint participants_bairro_joinville
  check (bairro is null or (cidade = 'Joinville' and estado = 'SC'));

comment on column participants.cidade is
  'Cidade do participante. Joinville é o foco; aceita qualquer cidade do Brasil.';
comment on column participants.estado is
  'UF (2 letras maiúsculas). Bairro só é preenchido quando cidade=Joinville e estado=SC.';

-- 4) Trigger: liga de bairro só pra Joinville/SC ------------
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
      or (l.tipo = 'bairro'
          and new.cidade = 'Joinville'
          and new.estado = 'SC'
          and l.nome = new.bairro)
    )
  on conflict do nothing;
  return new;
end;
$$;
