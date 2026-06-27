-- Config global editável pelo admin (key/value). Reusável pra futuros toggles.
-- Hoje guarda a chave `popup_lembrete` = { enabled, titulo, mensagem }.

create table app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;
-- Sem policy: default deny pra usuários comuns; só service_role lê/grava
-- (mesmo padrão de audit_logs). A leitura no app é sempre via service role.
