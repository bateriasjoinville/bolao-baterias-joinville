-- Bolão Copa 2026 — Display name desnormalizado nas tabelas de score (Bloco 13 Entrega 3)
-- Aplicar via SQL Editor do dashboard Supabase
--
-- Adiciona coluna `display_name` em participant_scores e weekly_scores. Preenchida
-- pelo recalculateAllPoints (Server Action via service_role) buscando participants.nome
-- e formatando como "Primeiro I." (primeiro nome + inicial do último sobrenome).
--
-- Motivação: rota /ranking é pública (anon). A tabela participants tem RLS restrita
-- (cada participante só lê o próprio row). Desnormalizar o nome formatado em
-- participant_scores/weekly_scores permite leitura pública do ranking sem expor
-- CPF/WhatsApp/endereço.

alter table participant_scores add column display_name text not null default '';
alter table weekly_scores add column display_name text not null default '';
