-- ============================================================
-- 0008_leagues_visibilidade.sql
-- Liga pública (entra sem aprovação) vs privada (precisa aprovação).
-- Default privada → preserva o comportamento de todas as ligas existentes.
-- Aplicar via SQL Editor do dashboard Supabase.
--
-- Nota RLS: a busca por nome NÃO afrouxa a RLS de leagues. Uma policy de
-- SELECT liberada exporia codigo_convite de toda liga. A busca lê via
-- service_role com projeção curada (sem codigo_convite), mesmo padrão de
-- getLigaPorCodigo no landing de convite.
-- ============================================================

alter table leagues
  add column if not exists is_publica boolean not null default false;

comment on column leagues.is_publica is
  'true = qualquer participante entra direto (aprovado); false = entrada exige aprovação do owner (fluxo pendente). Default false (privada).';
