-- Bolão Copa 2026 — broadcasters + match_broadcasters + ALTER em matches
-- Aplicar via SQL Editor do dashboard Supabase (Project > SQL Editor > New query)
-- Pré-requisito: 0001 e 0002 já aplicados.

begin;

-- ============================================================
-- ALTER em matches: broadcasts_confirmed
-- True = lista oficial FIFA (1ª e 2ª rodada, jogos 1-48)
-- False = provisórios (3ª rodada de grupos) ou vazios (eliminatórios)
-- ============================================================

alter table matches add column broadcasts_confirmed boolean not null default false;

comment on column matches.broadcasts_confirmed is
  'true quando a lista de broadcasters do jogo foi confirmada pela FIFA. Mantida pelo seed e por Server Action admin.';

-- ============================================================
-- broadcasters — master data: 7 emissoras
-- PK = slug (text estável). Nomenclatura pt-br pra colunas.
-- ============================================================

create table broadcasters (
  slug text primary key check (slug ~ '^[a-z0-9_]{2,30}$'),
  nome text not null unique check (char_length(nome) between 1 and 60),
  tipo text not null check (tipo in ('tv_aberta','tv_fechada','youtube','streaming')),
  gratuito boolean not null,
  external_url text check (external_url is null or external_url ~ '^https?://'),
  ordem smallint not null unique check (ordem > 0)
);

comment on column broadcasters.slug is
  'Identificador estável usado em joins e como chave do logo no front (/public/broadcasters/{slug}.svg).';
comment on column broadcasters.ordem is
  'Ordem de exibição no UI. UNIQUE pra forçar valores distintos.';

-- ============================================================
-- match_broadcasters — N:N matches × broadcasters
-- 32 jogos eliminatórios (73-104) ficam sem entry até FIFA confirmar.
-- ============================================================

create table match_broadcasters (
  match_id smallint not null references matches(id) on delete cascade,
  broadcaster_slug text not null references broadcasters(slug) on delete restrict,
  primary key (match_id, broadcaster_slug)
);

create index match_broadcasters_broadcaster_idx on match_broadcasters(broadcaster_slug);

-- ============================================================
-- Row Level Security: leitura pública (igual matches/selecoes).
-- INSERT/UPDATE/DELETE só via service_role (Server Action admin).
-- ============================================================

alter table broadcasters enable row level security;
alter table match_broadcasters enable row level security;

create policy broadcasters_select_all on broadcasters
  for select to anon, authenticated
  using (true);

create policy match_broadcasters_select_all on match_broadcasters
  for select to anon, authenticated
  using (true);

-- ============================================================
-- Seed: 7 broadcasters
-- Mapeamento JSON → DB: name→nome, type→tipo, is_free→gratuito, display_order→ordem
-- ============================================================

insert into broadcasters (slug, nome, tipo, gratuito, external_url, ordem) values
  ('sbt',       'SBT',       'tv_aberta',  true,  null,                              1),
  ('globo',     'Globo',     'tv_aberta',  true,  null,                              2),
  ('nsports',   'N Sports',  'tv_fechada', false, null,                              3),
  ('sportv',    'SporTV',    'tv_fechada', false, null,                              4),
  ('getv',      'GE TV',     'youtube',    true,  'https://www.youtube.com/@ge',     5),
  ('cazetv',    'CazéTV',    'youtube',    true,  'https://www.youtube.com/@CazeTV', 6),
  ('globoplay', 'Globoplay', 'streaming',  false, 'https://globoplay.com',           7);

-- ============================================================
-- Update: marca jogos 1-48 como broadcasts_confirmed = true
-- (linha amarela no XLSX — 1ª e 2ª rodada da fase de grupos)
-- ============================================================

update matches set broadcasts_confirmed = true where id between 1 and 48;

-- ============================================================
-- Seed: match_broadcasters (196 linhas)
-- Jogos 1-72 (fase de grupos). Jogos 73-104 ficam fora.
-- Ordem dos broadcasters por jogo segue a do matches.json.
-- ============================================================

insert into match_broadcasters (match_id, broadcaster_slug) values
  -- Match 1: pacote completo
  (1, 'sbt'), (1, 'nsports'), (1, 'globo'), (1, 'getv'), (1, 'sportv'), (1, 'cazetv'), (1, 'globoplay'),
  (2, 'cazetv'),
  (3, 'cazetv'),
  -- Match 4: pacote completo
  (4, 'sbt'), (4, 'nsports'), (4, 'globo'), (4, 'getv'), (4, 'sportv'), (4, 'cazetv'), (4, 'globoplay'),
  (5, 'cazetv'),
  -- Match 6: pacote 5
  (6, 'globo'), (6, 'getv'), (6, 'sportv'), (6, 'cazetv'), (6, 'globoplay'),
  -- Match 7: Brasil x Marrocos — pacote completo
  (7, 'sbt'), (7, 'nsports'), (7, 'globo'), (7, 'getv'), (7, 'sportv'), (7, 'cazetv'), (7, 'globoplay'),
  (8, 'cazetv'),
  -- Match 9: pacote 4
  (9, 'globo'), (9, 'sportv'), (9, 'cazetv'), (9, 'globoplay'),
  (10, 'cazetv'),
  -- Match 11: pacote completo
  (11, 'sbt'), (11, 'nsports'), (11, 'globo'), (11, 'getv'), (11, 'sportv'), (11, 'cazetv'), (11, 'globoplay'),
  -- Match 12: pacote 4
  (12, 'globo'), (12, 'sportv'), (12, 'cazetv'), (12, 'globoplay'),
  -- Match 13: pacote 6 (sem getv)
  (13, 'sbt'), (13, 'nsports'), (13, 'globo'), (13, 'sportv'), (13, 'cazetv'), (13, 'globoplay'),
  (14, 'cazetv'),
  (15, 'cazetv'),
  -- Match 16: pacote 5
  (16, 'globo'), (16, 'getv'), (16, 'sportv'), (16, 'cazetv'), (16, 'globoplay'),
  -- Match 17: pacote completo
  (17, 'sbt'), (17, 'nsports'), (17, 'globo'), (17, 'getv'), (17, 'sportv'), (17, 'cazetv'), (17, 'globoplay'),
  (18, 'cazetv'),
  (19, 'cazetv'),
  -- Match 20: pacote 4
  (20, 'globo'), (20, 'sportv'), (20, 'cazetv'), (20, 'globoplay'),
  (21, 'cazetv'),
  -- Match 22: pacote completo
  (22, 'sbt'), (22, 'nsports'), (22, 'globo'), (22, 'getv'), (22, 'sportv'), (22, 'cazetv'), (22, 'globoplay'),
  (23, 'cazetv'),
  -- Match 24: pacote 4
  (24, 'globo'), (24, 'sportv'), (24, 'cazetv'), (24, 'globoplay'),
  (25, 'cazetv'),
  -- Match 26: pacote completo
  (26, 'sbt'), (26, 'nsports'), (26, 'globo'), (26, 'getv'), (26, 'sportv'), (26, 'cazetv'), (26, 'globoplay'),
  (27, 'cazetv'),
  -- Match 28: pacote 4
  (28, 'globo'), (28, 'sportv'), (28, 'cazetv'), (28, 'globoplay'),
  -- Match 29: Brasil x Haiti — pacote completo
  (29, 'sbt'), (29, 'nsports'), (29, 'globo'), (29, 'getv'), (29, 'sportv'), (29, 'cazetv'), (29, 'globoplay'),
  (30, 'cazetv'),
  -- Match 31: pacote 4
  (31, 'globo'), (31, 'sportv'), (31, 'cazetv'), (31, 'globoplay'),
  (32, 'cazetv'),
  -- Match 33: pacote completo
  (33, 'sbt'), (33, 'nsports'), (33, 'globo'), (33, 'getv'), (33, 'sportv'), (33, 'cazetv'), (33, 'globoplay'),
  (34, 'cazetv'),
  (35, 'cazetv'),
  -- Match 36: pacote 4
  (36, 'globo'), (36, 'sportv'), (36, 'cazetv'), (36, 'globoplay'),
  -- Match 37: pacote completo
  (37, 'sbt'), (37, 'nsports'), (37, 'globo'), (37, 'getv'), (37, 'sportv'), (37, 'cazetv'), (37, 'globoplay'),
  (38, 'cazetv'),
  (39, 'cazetv'),
  -- Match 40: pacote 4
  (40, 'globo'), (40, 'sportv'), (40, 'cazetv'), (40, 'globoplay'),
  -- Match 41: pacote 4
  (41, 'globo'), (41, 'sportv'), (41, 'cazetv'), (41, 'globoplay'),
  (42, 'cazetv'),
  -- Match 43: pacote completo
  (43, 'sbt'), (43, 'nsports'), (43, 'globo'), (43, 'getv'), (43, 'sportv'), (43, 'cazetv'), (43, 'globoplay'),
  -- Match 44: pacote 4
  (44, 'globo'), (44, 'sportv'), (44, 'cazetv'), (44, 'globoplay'),
  -- Match 45: pacote completo
  (45, 'sbt'), (45, 'nsports'), (45, 'globo'), (45, 'getv'), (45, 'sportv'), (45, 'cazetv'), (45, 'globoplay'),
  (46, 'cazetv'),
  (47, 'cazetv'),
  -- Match 48: pacote 4
  (48, 'globo'), (48, 'sportv'), (48, 'cazetv'), (48, 'globoplay'),
  -- Match 49: Brasil x Escócia — pacote completo (provisório)
  (49, 'sbt'), (49, 'nsports'), (49, 'globo'), (49, 'getv'), (49, 'sportv'), (49, 'cazetv'), (49, 'globoplay'),
  -- Matches 50-72: 3ª rodada provisória, todos só cazetv
  (50, 'cazetv'),
  (51, 'cazetv'),
  (52, 'cazetv'),
  (53, 'cazetv'),
  (54, 'cazetv'),
  (55, 'cazetv'),
  (56, 'cazetv'),
  (57, 'cazetv'),
  (58, 'cazetv'),
  (59, 'cazetv'),
  (60, 'cazetv'),
  (61, 'cazetv'),
  (62, 'cazetv'),
  (63, 'cazetv'),
  (64, 'cazetv'),
  (65, 'cazetv'),
  (66, 'cazetv'),
  (67, 'cazetv'),
  (68, 'cazetv'),
  (69, 'cazetv'),
  (70, 'cazetv'),
  (71, 'cazetv'),
  (72, 'cazetv');

commit;
