-- Bolão Copa 2026 — Pontuação e Ranking (Bloco 13)
-- Aplicar via SQL Editor do dashboard Supabase
--
-- Cria duas tabelas de cache de pontuação:
--   participant_scores  — agregado total por participante (ranking geral)
--   weekly_scores       — agregado por participante × semana (ranking semanal)
--
-- Atualização: feita por Server Action via service_role após admin salvar placar.
-- RLS: read público (anon + authenticated). Write apenas via service_role.

-- ============================================================
-- participant_scores — ranking geral acumulativo
-- ============================================================
create table participant_scores (
  participant_id uuid primary key references participants(id) on delete cascade,
  pontos_total int not null default 0,
  placares_exatos int not null default 0,
  vencedores_acertados int not null default 0,
  diff_gols_total int not null default 0,
  palpites_validos int not null default 0,
  updated_at timestamptz not null default now()
);

create trigger participant_scores_updated_at
  before update on participant_scores
  for each row execute function set_updated_at();

-- Index pra ordenar ranking eficientemente
create index participant_scores_ranking_idx on participant_scores (
  pontos_total desc,
  placares_exatos desc,
  vencedores_acertados desc
);

-- ============================================================
-- weekly_scores — ranking semanal (5 semanas, 11/jun a 19/jul)
-- ============================================================
create table weekly_scores (
  participant_id uuid not null references participants(id) on delete cascade,
  semana smallint not null check (semana between 1 and 5),
  pontos int not null default 0,
  placares_exatos int not null default 0,
  vencedores_acertados int not null default 0,
  diff_gols_total int not null default 0,
  palpites_validos int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (participant_id, semana)
);

create trigger weekly_scores_updated_at
  before update on weekly_scores
  for each row execute function set_updated_at();

create index weekly_scores_ranking_idx on weekly_scores (
  semana,
  pontos desc,
  placares_exatos desc,
  vencedores_acertados desc
);

-- ============================================================
-- RLS
-- ============================================================
alter table participant_scores enable row level security;
alter table weekly_scores enable row level security;

-- Leitura pública: qualquer um pode ver o ranking (rota /ranking é pública)
create policy participant_scores_select_all on participant_scores
  for select to anon, authenticated
  using (true);

create policy weekly_scores_select_all on weekly_scores
  for select to anon, authenticated
  using (true);

-- INSERT/UPDATE/DELETE: somente via service_role (não cria policy).
-- Server Action recalculateAllPoints usa getSupabaseAdmin() que bypassa RLS.
