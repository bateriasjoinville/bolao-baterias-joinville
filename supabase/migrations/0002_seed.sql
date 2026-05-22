-- Bolão Copa 2026 — Seed: 48 seleções + 104 jogos + ajustes em matches
-- Aplicar via SQL Editor do dashboard Supabase (Project > SQL Editor > New query)
-- Pré-requisito: 0001_initial_schema.sql já aplicado.

begin;

-- ============================================================
-- ALTERs em matches
-- 1) Fase r32 (32-avos) — exclusiva da Copa de 48 times
-- 2) selecao_a_id / selecao_b_id nullable em fases eliminatórias
-- 3) placeholder_a / placeholder_b pra notação de chaveamento
--    (1A, 2C, 3_ABCDF, V73, P101)
-- ============================================================

alter table matches drop constraint matches_fase_check;
alter table matches add constraint matches_fase_check
  check (fase in ('grupos','r32','oitavas','quartas','semifinais','terceiro','final'));

alter table matches alter column selecao_a_id drop not null;
alter table matches alter column selecao_b_id drop not null;

alter table matches add column placeholder_a text;
alter table matches add column placeholder_b text;

alter table matches add constraint matches_placeholder_a_format
  check (placeholder_a is null or placeholder_a ~ '^([1-3][A-L]|3_[A-L]+|[VP][0-9]+)$');
alter table matches add constraint matches_placeholder_b_format
  check (placeholder_b is null or placeholder_b ~ '^([1-3][A-L]|3_[A-L]+|[VP][0-9]+)$');

alter table matches add constraint matches_side_a_exclusive
  check ((selecao_a_id is not null and placeholder_a is null)
      or (selecao_a_id is null and placeholder_a is not null));
alter table matches add constraint matches_side_b_exclusive
  check ((selecao_b_id is not null and placeholder_b is null)
      or (selecao_b_id is null and placeholder_b is not null));

comment on column matches.placeholder_a is
  'Notação de chaveamento quando seleção ainda não definida: 1A/2C/3_ABCDF (r32) ou V73/P101 (oitavas em diante). Preenchido quando selecao_a_id é NULL.';
comment on column matches.placeholder_b is
  'Idem placeholder_a, lado B.';

-- ============================================================
-- Seed: 48 seleções
-- Brasil id=1 fixo (referenciado em matches.is_brasil e no front).
-- Restantes 2..48 ordenadas alfabeticamente em pt-br (ignorando acentos).
-- codigo_iso = ISO 3166-1 alpha-2 lowercase, com gb-eng/gb-sct pras
-- subdivisões do UK (formato flagcdn.com).
-- ============================================================

insert into selecoes (id, nome, codigo_iso) values
  (1,  'Brasil',             'br'),
  (2,  'África do Sul',      'za'),
  (3,  'Alemanha',           'de'),
  (4,  'Arábia Saudita',     'sa'),
  (5,  'Argélia',            'dz'),
  (6,  'Argentina',          'ar'),
  (7,  'Austrália',          'au'),
  (8,  'Áustria',            'at'),
  (9,  'Bélgica',            'be'),
  (10, 'Bósnia-Herzegovina', 'ba'),
  (11, 'Cabo Verde',         'cv'),
  (12, 'Canadá',             'ca'),
  (13, 'Catar',              'qa'),
  (14, 'Colômbia',           'co'),
  (15, 'Coreia do Sul',      'kr'),
  (16, 'Costa do Marfim',    'ci'),
  (17, 'Croácia',            'hr'),
  (18, 'Curaçao',            'cw'),
  (19, 'Egito',              'eg'),
  (20, 'Equador',            'ec'),
  (21, 'Escócia',            'gb-sct'),
  (22, 'Espanha',            'es'),
  (23, 'Estados Unidos',     'us'),
  (24, 'França',             'fr'),
  (25, 'Gana',               'gh'),
  (26, 'Haiti',              'ht'),
  (27, 'Inglaterra',         'gb-eng'),
  (28, 'Irã',                'ir'),
  (29, 'Iraque',             'iq'),
  (30, 'Japão',              'jp'),
  (31, 'Jordânia',           'jo'),
  (32, 'Marrocos',           'ma'),
  (33, 'México',             'mx'),
  (34, 'Noruega',            'no'),
  (35, 'Nova Zelândia',      'nz'),
  (36, 'Países Baixos',      'nl'),
  (37, 'Panamá',             'pa'),
  (38, 'Paraguai',           'py'),
  (39, 'Portugal',           'pt'),
  (40, 'RD Congo',           'cd'),
  (41, 'Senegal',            'sn'),
  (42, 'Suécia',             'se'),
  (43, 'Suíça',              'ch'),
  (44, 'Tchéquia',           'cz'),
  (45, 'Tunísia',            'tn'),
  (46, 'Turquia',            'tr'),
  (47, 'Uruguai',            'uy'),
  (48, 'Uzbequistão',        'uz');

-- ============================================================
-- Seed: 104 jogos
-- kickoff_at em horário de Brasília (BRT, UTC-3). Postgres armazena em UTC.
-- Brasil: jogos 7, 29, 49 — is_brasil = true.
-- Fases eliminatórias usam placeholder_a/placeholder_b (notação FIFA).
-- ============================================================

insert into matches
  (id, fase, grupo, kickoff_at, estadio, selecao_a_id, selecao_b_id, placeholder_a, placeholder_b, is_brasil) values
  -- Fase de Grupos (72 jogos)
  (1,  'grupos', 'A', '2026-06-11 16:00-03'::timestamptz, 'Cidade do México', 33, 2,  null, null, false),
  (2,  'grupos', 'A', '2026-06-11 23:00-03'::timestamptz, 'Guadalajara',      15, 44, null, null, false),
  (3,  'grupos', 'B', '2026-06-12 16:00-03'::timestamptz, 'Toronto',          12, 10, null, null, false),
  (4,  'grupos', 'D', '2026-06-12 22:00-03'::timestamptz, 'Los Angeles',      23, 38, null, null, false),
  (5,  'grupos', 'C', '2026-06-13 22:00-03'::timestamptz, 'Boston',           26, 21, null, null, false),
  (6,  'grupos', 'D', '2026-06-14 01:00-03'::timestamptz, 'Vancouver',         7, 46, null, null, false),
  (7,  'grupos', 'C', '2026-06-13 19:00-03'::timestamptz, 'Nova York',         1, 32, null, null, true),
  (8,  'grupos', 'B', '2026-06-13 16:00-03'::timestamptz, 'Santa Clara',      13, 43, null, null, false),
  (9,  'grupos', 'E', '2026-06-14 20:00-03'::timestamptz, 'Filadélfia',       16, 20, null, null, false),
  (10, 'grupos', 'E', '2026-06-14 14:00-03'::timestamptz, 'Houston',           3, 18, null, null, false),
  (11, 'grupos', 'F', '2026-06-14 17:00-03'::timestamptz, 'Dallas',           36, 30, null, null, false),
  (12, 'grupos', 'F', '2026-06-14 23:00-03'::timestamptz, 'Monterrey',        42, 45, null, null, false),
  (13, 'grupos', 'H', '2026-06-15 19:00-03'::timestamptz, 'Miami',             4, 47, null, null, false),
  (14, 'grupos', 'H', '2026-06-15 13:00-03'::timestamptz, 'Atlanta',          22, 11, null, null, false),
  (15, 'grupos', 'G', '2026-06-15 22:00-03'::timestamptz, 'Los Angeles',      28, 35, null, null, false),
  (16, 'grupos', 'G', '2026-06-15 16:00-03'::timestamptz, 'Seattle',           9, 19, null, null, false),
  (17, 'grupos', 'I', '2026-06-16 16:00-03'::timestamptz, 'Nova York',        24, 41, null, null, false),
  (18, 'grupos', 'I', '2026-06-16 19:00-03'::timestamptz, 'Boston',           29, 34, null, null, false),
  (19, 'grupos', 'J', '2026-06-16 22:00-03'::timestamptz, 'Kansas City',       6,  5, null, null, false),
  (20, 'grupos', 'J', '2026-06-17 01:00-03'::timestamptz, 'Santa Clara',       8, 31, null, null, false),
  (21, 'grupos', 'L', '2026-06-17 20:00-03'::timestamptz, 'Toronto',          25, 37, null, null, false),
  (22, 'grupos', 'L', '2026-06-17 17:00-03'::timestamptz, 'Dallas',           27, 17, null, null, false),
  (23, 'grupos', 'K', '2026-06-17 14:00-03'::timestamptz, 'Houston',          39, 40, null, null, false),
  (24, 'grupos', 'K', '2026-06-17 23:00-03'::timestamptz, 'Cidade do México', 48, 14, null, null, false),
  (25, 'grupos', 'A', '2026-06-18 13:00-03'::timestamptz, 'Atlanta',          44,  2, null, null, false),
  (26, 'grupos', 'B', '2026-06-18 16:00-03'::timestamptz, 'Los Angeles',      43, 10, null, null, false),
  (27, 'grupos', 'B', '2026-06-18 19:00-03'::timestamptz, 'Vancouver',        12, 13, null, null, false),
  (28, 'grupos', 'A', '2026-06-18 22:00-03'::timestamptz, 'Guadalajara',      33, 15, null, null, false),
  (29, 'grupos', 'C', '2026-06-19 21:30-03'::timestamptz, 'Filadélfia',        1, 26, null, null, true),
  (30, 'grupos', 'C', '2026-06-19 19:00-03'::timestamptz, 'Boston',           21, 32, null, null, false),
  (31, 'grupos', 'D', '2026-06-20 00:00-03'::timestamptz, 'Santa Clara',      46, 38, null, null, false),
  (32, 'grupos', 'D', '2026-06-19 16:00-03'::timestamptz, 'Seattle',          23,  7, null, null, false),
  (33, 'grupos', 'E', '2026-06-20 17:00-03'::timestamptz, 'Toronto',           3, 16, null, null, false),
  (34, 'grupos', 'E', '2026-06-20 21:00-03'::timestamptz, 'Kansas City',      20, 18, null, null, false),
  (35, 'grupos', 'F', '2026-06-20 14:00-03'::timestamptz, 'Houston',          36, 42, null, null, false),
  (36, 'grupos', 'F', '2026-06-21 01:00-03'::timestamptz, 'Monterrey',        45, 30, null, null, false),
  (37, 'grupos', 'H', '2026-06-21 19:00-03'::timestamptz, 'Miami',            47, 11, null, null, false),
  (38, 'grupos', 'H', '2026-06-21 13:00-03'::timestamptz, 'Atlanta',          22,  4, null, null, false),
  (39, 'grupos', 'G', '2026-06-21 16:00-03'::timestamptz, 'Los Angeles',       9, 28, null, null, false),
  (40, 'grupos', 'G', '2026-06-21 22:00-03'::timestamptz, 'Vancouver',        35, 19, null, null, false),
  (41, 'grupos', 'I', '2026-06-22 21:00-03'::timestamptz, 'Nova York',        34, 41, null, null, false),
  (42, 'grupos', 'I', '2026-06-22 18:00-03'::timestamptz, 'Filadélfia',       24, 29, null, null, false),
  (43, 'grupos', 'J', '2026-06-22 14:00-03'::timestamptz, 'Dallas',            6,  8, null, null, false),
  (44, 'grupos', 'J', '2026-06-23 00:00-03'::timestamptz, 'Santa Clara',      31,  5, null, null, false),
  (45, 'grupos', 'L', '2026-06-23 17:00-03'::timestamptz, 'Boston',           27, 25, null, null, false),
  (46, 'grupos', 'L', '2026-06-23 20:00-03'::timestamptz, 'Toronto',          37, 17, null, null, false),
  (47, 'grupos', 'K', '2026-06-23 14:00-03'::timestamptz, 'Houston',          39, 48, null, null, false),
  (48, 'grupos', 'K', '2026-06-23 23:00-03'::timestamptz, 'Guadalajara',      14, 40, null, null, false),
  (49, 'grupos', 'C', '2026-06-24 19:00-03'::timestamptz, 'Miami',            21,  1, null, null, true),
  (50, 'grupos', 'C', '2026-06-24 19:00-03'::timestamptz, 'Atlanta',          32, 26, null, null, false),
  (51, 'grupos', 'B', '2026-06-24 16:00-03'::timestamptz, 'Vancouver',        43, 12, null, null, false),
  (52, 'grupos', 'B', '2026-06-24 16:00-03'::timestamptz, 'Seattle',          10, 13, null, null, false),
  (53, 'grupos', 'A', '2026-06-24 22:00-03'::timestamptz, 'Cidade do México', 44, 33, null, null, false),
  (54, 'grupos', 'A', '2026-06-24 22:00-03'::timestamptz, 'Monterrey',         2, 15, null, null, false),
  (55, 'grupos', 'E', '2026-06-25 17:00-03'::timestamptz, 'Filadélfia',       18, 16, null, null, false),
  (56, 'grupos', 'E', '2026-06-25 17:00-03'::timestamptz, 'Nova York',        20,  3, null, null, false),
  (57, 'grupos', 'F', '2026-06-25 20:00-03'::timestamptz, 'Dallas',           30, 42, null, null, false),
  (58, 'grupos', 'F', '2026-06-25 20:00-03'::timestamptz, 'Kansas City',      45, 36, null, null, false),
  (59, 'grupos', 'D', '2026-06-25 23:00-03'::timestamptz, 'Los Angeles',      46, 23, null, null, false),
  (60, 'grupos', 'D', '2026-06-25 23:00-03'::timestamptz, 'Santa Clara',      38,  7, null, null, false),
  (61, 'grupos', 'I', '2026-06-26 16:00-03'::timestamptz, 'Boston',           34, 24, null, null, false),
  (62, 'grupos', 'I', '2026-06-26 16:00-03'::timestamptz, 'Toronto',          41, 29, null, null, false),
  (63, 'grupos', 'G', '2026-06-27 00:00-03'::timestamptz, 'Seattle',          19, 28, null, null, false),
  (64, 'grupos', 'G', '2026-06-27 00:00-03'::timestamptz, 'Vancouver',        35,  9, null, null, false),
  (65, 'grupos', 'H', '2026-06-26 21:00-03'::timestamptz, 'Houston',          11,  4, null, null, false),
  (66, 'grupos', 'H', '2026-06-26 21:00-03'::timestamptz, 'Guadalajara',      47, 22, null, null, false),
  (67, 'grupos', 'L', '2026-06-27 18:00-03'::timestamptz, 'Nova York',        37, 27, null, null, false),
  (68, 'grupos', 'L', '2026-06-27 18:00-03'::timestamptz, 'Filadélfia',       17, 25, null, null, false),
  (69, 'grupos', 'J', '2026-06-27 23:00-03'::timestamptz, 'Kansas City',       5,  8, null, null, false),
  (70, 'grupos', 'J', '2026-06-27 23:00-03'::timestamptz, 'Dallas',           31,  6, null, null, false),
  (71, 'grupos', 'K', '2026-06-27 20:30-03'::timestamptz, 'Miami',            14, 39, null, null, false),
  (72, 'grupos', 'K', '2026-06-27 20:30-03'::timestamptz, 'Atlanta',          40, 48, null, null, false),
  -- 32-avos (16 jogos)
  (73, 'r32',  null, '2026-06-28 16:00-03'::timestamptz, 'Los Angeles',      null, null, '2A',      '2B',       false),
  (74, 'r32',  null, '2026-06-29 17:30-03'::timestamptz, 'Boston',           null, null, '1E',      '3_ABCDF',  false),
  (75, 'r32',  null, '2026-06-29 22:00-03'::timestamptz, 'Monterrey',        null, null, '1F',      '2C',       false),
  (76, 'r32',  null, '2026-06-29 14:00-03'::timestamptz, 'Houston',          null, null, '1C',      '2F',       false),
  (77, 'r32',  null, '2026-06-30 18:00-03'::timestamptz, 'Nova York',        null, null, '1I',      '3_CDFGH',  false),
  (78, 'r32',  null, '2026-06-30 14:00-03'::timestamptz, 'Dallas',           null, null, '2E',      '2I',       false),
  (79, 'r32',  null, '2026-06-30 22:00-03'::timestamptz, 'Cidade do México', null, null, '1A',      '3_CEFHI',  false),
  (80, 'r32',  null, '2026-07-01 13:00-03'::timestamptz, 'Atlanta',          null, null, '1L',      '3_EHIJK',  false),
  (81, 'r32',  null, '2026-07-01 21:00-03'::timestamptz, 'Santa Clara',      null, null, '1D',      '3_BEFIJ',  false),
  (82, 'r32',  null, '2026-07-01 17:00-03'::timestamptz, 'Seattle',          null, null, '1G',      '3_AEHIJ',  false),
  (83, 'r32',  null, '2026-07-02 20:00-03'::timestamptz, 'Toronto',          null, null, '2K',      '2L',       false),
  (84, 'r32',  null, '2026-07-02 16:00-03'::timestamptz, 'Los Angeles',      null, null, '1H',      '2J',       false),
  (85, 'r32',  null, '2026-07-02 00:00-03'::timestamptz, 'Vancouver',        null, null, '1B',      '3_EFGIJ',  false),
  (86, 'r32',  null, '2026-07-03 17:00-03'::timestamptz, 'Miami',            null, null, '1J',      '2H',       false),
  (87, 'r32',  null, '2026-07-03 22:30-03'::timestamptz, 'Kansas City',      null, null, '1K',      '3_DEIJL',  false),
  (88, 'r32',  null, '2026-07-03 15:00-03'::timestamptz, 'Dallas',           null, null, '2D',      '2G',       false),
  -- Oitavas (8 jogos)
  (89, 'oitavas',    null, '2026-07-04 18:00-03'::timestamptz, 'Filadélfia',       null, null, 'V74',  'V77',  false),
  (90, 'oitavas',    null, '2026-07-04 14:00-03'::timestamptz, 'Houston',          null, null, 'V73',  'V75',  false),
  (91, 'oitavas',    null, '2026-07-05 17:00-03'::timestamptz, 'Nova York',        null, null, 'V76',  'V78',  false),
  (92, 'oitavas',    null, '2026-07-05 21:00-03'::timestamptz, 'Cidade do México', null, null, 'V79',  'V80',  false),
  (93, 'oitavas',    null, '2026-07-06 15:00-03'::timestamptz, 'Dallas',           null, null, 'V83',  'V84',  false),
  (94, 'oitavas',    null, '2026-07-06 20:00-03'::timestamptz, 'Seattle',          null, null, 'V81',  'V82',  false),
  (95, 'oitavas',    null, '2026-07-07 13:00-03'::timestamptz, 'Atlanta',          null, null, 'V86',  'V88',  false),
  (96, 'oitavas',    null, '2026-07-07 17:00-03'::timestamptz, 'Vancouver',        null, null, 'V85',  'V87',  false),
  -- Quartas (4 jogos)
  (97, 'quartas',    null, '2026-07-09 17:00-03'::timestamptz, 'Boston',           null, null, 'V89',  'V90',  false),
  (98, 'quartas',    null, '2026-07-10 16:00-03'::timestamptz, 'Los Angeles',      null, null, 'V93',  'V94',  false),
  (99, 'quartas',    null, '2026-07-12 18:00-03'::timestamptz, 'Miami',            null, null, 'V91',  'V92',  false),
  (100,'quartas',    null, '2026-07-12 21:00-03'::timestamptz, 'Kansas City',      null, null, 'V95',  'V96',  false),
  -- Semifinais (2 jogos)
  (101,'semifinais', null, '2026-07-14 16:00-03'::timestamptz, 'Dallas',           null, null, 'V97',  'V98',  false),
  (102,'semifinais', null, '2026-07-15 16:00-03'::timestamptz, 'Atlanta',          null, null, 'V99',  'V100', false),
  -- Disputa de 3º lugar
  (103,'terceiro',   null, '2026-07-18 18:00-03'::timestamptz, 'Miami',            null, null, 'P101', 'P102', false),
  -- Final
  (104,'final',      null, '2026-07-19 16:00-03'::timestamptz, 'Nova York',        null, null, 'V101', 'V102', false);

commit;
