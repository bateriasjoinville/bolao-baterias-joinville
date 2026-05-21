-- Bolão Copa 2026 — Schema inicial
-- Aplicar via SQL Editor do dashboard Supabase (Project > SQL Editor > New query)
-- Convenção: snake_case · UUID em entidades de usuário · smallint em master data finita

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- Helpers
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function enforce_cpf_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.cpf is distinct from old.cpf then
    raise exception 'CPF não pode ser alterado após o cadastro';
  end if;
  return new;
end;
$$;

-- ============================================================
-- selecoes — master data: 48 seleções classificadas
-- Brasil precisa ter id = 1 (referenciado no seed e na coluna matches.is_brasil)
-- ============================================================
create table selecoes (
  id smallint primary key,
  nome text not null unique check (char_length(nome) between 2 and 60),
  codigo_iso text not null unique check (codigo_iso ~ '^[a-z]{2}(-[a-z]{3})?$')
);

comment on column selecoes.codigo_iso is
  'formato flagcdn.com: br, us, ar, gb-eng, gb-sct, gb-wls';

-- ============================================================
-- participants — leads cadastrados
-- ============================================================
create table participants (
  id uuid primary key default gen_random_uuid(),
  cpf text not null unique check (cpf ~ '^[0-9]{11}$'),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,11}$'),
  nome text not null check (char_length(nome) between 3 and 120),
  idade smallint not null check (idade between 18 and 120),
  bairro text not null check (char_length(bairro) between 2 and 80),
  instagram text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  aceite_regulamento boolean not null default false,
  aceite_comunicacoes boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column participants.cpf is
  '11 dígitos sem pontuação. Máscara fica no front. Validação do dígito verificador no app (Zod).';
comment on column participants.whatsapp is
  '10 ou 11 dígitos com DDD. Sem máscara. DDD 47 esperado (Joinville).';
comment on column participants.instagram is
  'Username sem @. Opcional.';

create trigger participants_set_updated_at
  before update on participants
  for each row execute function set_updated_at();

create trigger participants_cpf_immutable
  before update on participants
  for each row execute function enforce_cpf_immutable();

-- ============================================================
-- matches — 104 jogos da Copa FIFA 2026
-- ============================================================
create table matches (
  id smallint primary key,
  fase text not null check (fase in ('grupos','oitavas','quartas','semifinais','terceiro','final')),
  grupo text check (grupo is null or grupo ~ '^[A-L]$'),
  kickoff_at timestamptz not null,
  estadio text not null check (char_length(estadio) between 2 and 80),
  selecao_a_id smallint not null references selecoes(id) on delete restrict,
  selecao_b_id smallint not null references selecoes(id) on delete restrict,
  placar_a smallint check (placar_a is null or placar_a between 0 and 20),
  placar_b smallint check (placar_b is null or placar_b between 0 and 20),
  is_brasil boolean not null default false,
  updated_at timestamptz not null default now(),
  check (selecao_a_id <> selecao_b_id),
  check ((placar_a is null and placar_b is null) or (placar_a is not null and placar_b is not null)),
  check ((fase = 'grupos' and grupo is not null) or (fase <> 'grupos' and grupo is null))
);

comment on column matches.is_brasil is
  'true quando uma das seleções é o Brasil. Mantido pelo seed e pelo Server Action de admin (não computed).';

create index matches_kickoff_at_idx on matches(kickoff_at);
create index matches_fase_idx on matches(fase);
create index matches_is_brasil_idx on matches(is_brasil) where is_brasil = true;

create trigger matches_set_updated_at
  before update on matches
  for each row execute function set_updated_at();

-- ============================================================
-- predictions — palpites (participant × match)
-- ============================================================
create table predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  match_id smallint not null references matches(id) on delete cascade,
  placar_a smallint not null check (placar_a between 0 and 20),
  placar_b smallint not null check (placar_b between 0 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_id, match_id)
);

create index predictions_participant_id_idx on predictions(participant_id);
create index predictions_match_id_idx on predictions(match_id);

create trigger predictions_set_updated_at
  before update on predictions
  for each row execute function set_updated_at();

-- ============================================================
-- leagues — mini-ligas privadas
-- ============================================================
create table leagues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references participants(id) on delete restrict,
  nome text not null check (char_length(nome) between 2 and 60),
  codigo_convite text not null unique check (codigo_convite ~ '^[A-Z0-9]{6,10}$'),
  created_at timestamptz not null default now()
);

comment on column leagues.codigo_convite is
  'Código pra link de convite no WhatsApp. Gerado no app (aleatório, maiúsculas + dígitos).';

create index leagues_owner_id_idx on leagues(owner_id);

-- ============================================================
-- league_members — membership N:N
-- ============================================================
create table league_members (
  league_id uuid not null references leagues(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, participant_id)
);

create index league_members_participant_id_idx on league_members(participant_id);

-- ============================================================
-- audit_logs — ações administrativas
-- ============================================================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_action text not null check (char_length(admin_action) between 3 and 80),
  payload jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on audit_logs(created_at desc);

-- ============================================================
-- help_requests — "esqueci os dados"
-- ============================================================
create table help_requests (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  cpf_parcial text check (cpf_parcial is null or char_length(cpf_parcial) between 1 and 20),
  whatsapp_parcial text check (whatsapp_parcial is null or char_length(whatsapp_parcial) between 1 and 20),
  mensagem text not null check (char_length(mensagem) between 5 and 1000),
  status text not null default 'pendente' check (status in ('pendente','resolvido')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index help_requests_pendente_idx on help_requests(created_at desc) where status = 'pendente';

-- ============================================================
-- Row Level Security
-- ============================================================
-- Estratégia: bypass total do Supabase Auth. JWT custom (assinado com SUPABASE_JWT_SECRET)
-- carrega o claim 'participant_id'. Policies usam auth.jwt() ->> 'participant_id'.
-- service_role bypassa RLS — Server Actions com service key fazem operações privilegiadas.
-- ============================================================

alter table selecoes enable row level security;
alter table participants enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table leagues enable row level security;
alter table league_members enable row level security;
alter table audit_logs enable row level security;
alter table help_requests enable row level security;

-- selecoes: leitura pública (página institucional mostra os times)
create policy selecoes_select_all on selecoes
  for select to anon, authenticated
  using (true);

-- matches: leitura pública (página institucional mostra a tabela)
create policy matches_select_all on matches
  for select to anon, authenticated
  using (true);

-- participants: usuário vê e edita só o próprio registro (CPF é imutável via trigger acima)
create policy participants_select_own on participants
  for select to authenticated
  using (id::text = (auth.jwt() ->> 'participant_id'));

create policy participants_update_own on participants
  for update to authenticated
  using (id::text = (auth.jwt() ->> 'participant_id'))
  with check (id::text = (auth.jwt() ->> 'participant_id'));

-- INSERT e DELETE de participants ficam só via service_role (Server Action de cadastro)

-- predictions: usuário vê só os próprios; INSERT/UPDATE só se match ainda não travou (kickoff > now + 1h)
create policy predictions_select_own on predictions
  for select to authenticated
  using (participant_id::text = (auth.jwt() ->> 'participant_id'));

create policy predictions_insert_open on predictions
  for insert to authenticated
  with check (
    participant_id::text = (auth.jwt() ->> 'participant_id')
    and exists (
      select 1 from matches m
      where m.id = match_id
      and m.kickoff_at > now() + interval '1 hour'
    )
  );

create policy predictions_update_open on predictions
  for update to authenticated
  using (
    participant_id::text = (auth.jwt() ->> 'participant_id')
    and exists (
      select 1 from matches m
      where m.id = predictions.match_id
      and m.kickoff_at > now() + interval '1 hour'
    )
  )
  with check (participant_id::text = (auth.jwt() ->> 'participant_id'));

-- DELETE de predictions: bloqueado pelo usuário (preserva auditoria)

-- leagues: owner ou member lê; só owner edita/deleta; usuário cria liga em nome próprio
create policy leagues_select_own_or_member on leagues
  for select to authenticated
  using (
    owner_id::text = (auth.jwt() ->> 'participant_id')
    or exists (
      select 1 from league_members lm
      where lm.league_id = leagues.id
      and lm.participant_id::text = (auth.jwt() ->> 'participant_id')
    )
  );

create policy leagues_insert_own on leagues
  for insert to authenticated
  with check (owner_id::text = (auth.jwt() ->> 'participant_id'));

create policy leagues_update_owner on leagues
  for update to authenticated
  using (owner_id::text = (auth.jwt() ->> 'participant_id'))
  with check (owner_id::text = (auth.jwt() ->> 'participant_id'));

create policy leagues_delete_owner on leagues
  for delete to authenticated
  using (owner_id::text = (auth.jwt() ->> 'participant_id'));

-- league_members: usuário só vê/manipula a própria participação.
-- Listagem de membros de uma liga (mini-ranking) passa por Server Action com service_role,
-- que faz a verificação de "usuário é membro/owner da liga" antes de retornar.
create policy league_members_select_self on league_members
  for select to authenticated
  using (participant_id::text = (auth.jwt() ->> 'participant_id'));

create policy league_members_insert_self on league_members
  for insert to authenticated
  with check (participant_id::text = (auth.jwt() ->> 'participant_id'));

create policy league_members_delete_self on league_members
  for delete to authenticated
  using (participant_id::text = (auth.jwt() ->> 'participant_id'));

-- help_requests: qualquer um pode submeter (form de "esqueci os dados" é anônimo, sem JWT).
-- DELIBERADAMENTE sem policies de SELECT/UPDATE/DELETE pra anon/authenticated.
-- Default deny do Postgres bloqueia leitura/edição via PostgREST.
-- O painel admin lê e marca como 'resolvido' via Server Action com SUPABASE_SERVICE_ROLE_KEY,
-- que bypassa RLS. Anti-spam no INSERT fica por conta do Cloudflare Turnstile no front.
create policy help_requests_insert_anyone on help_requests
  for insert to anon, authenticated
  with check (true);

-- audit_logs: nenhuma policy pra usuários — só service_role escreve e lê.
-- Default deny do Postgres bloqueia qualquer acesso de anon/authenticated.
