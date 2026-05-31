-- ============================================================
-- 0009_help_requests_dados_completos.sql
-- "Esqueci os dados" passou a coletar CPF e WhatsApp COMPLETOS (antes parciais).
-- Rename pra nomes honestos. Colunas seguem text/nullable; a validação completa
-- (CPF com dígito verificador, WhatsApp com DDD) é feita no app (Zod) e o que
-- guardamos são os dígitos normalizados. Obrigatoriedade garantida no app.
-- Aplicar via SQL Editor do dashboard Supabase.
-- ============================================================

alter table help_requests rename column cpf_parcial to cpf;
alter table help_requests rename column whatsapp_parcial to whatsapp;

comment on column help_requests.cpf is
  'CPF completo (11 dígitos normalizados) de quem pediu ajuda. Visível só pro admin (RLS: sem policy de select pra anon; leitura via service_role).';
comment on column help_requests.whatsapp is
  'WhatsApp completo (10–11 dígitos normalizados). Visível só pro admin.';
