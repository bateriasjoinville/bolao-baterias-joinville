# Supabase — Bolão Copa 2026

## Estrutura

```
supabase/
  migrations/
    0001_initial_schema.sql   # schema inicial: 8 tabelas + indexes + RLS + policies
```

Versionamento manual por enquanto (sem Supabase CLI). Quando fizer sentido,
instalamos a CLI e migramos pra `supabase db push`.

## Como aplicar uma migration

1. Abrir o dashboard do projeto Supabase (sa-east-1)
2. **SQL Editor → New query**
3. Colar o conteúdo de `0001_initial_schema.sql`
4. **Run** (canto inferior direito ou Ctrl+Enter)
5. Confirmar que retornou sem erro
6. Em **Database → Tables**, conferir que as 8 tabelas apareceram com RLS marcado (ícone de cadeado)

> Idempotência: o script **não** é idempotente — rodar 2x dá erro de "relation already exists".
> Pra rodar em banco que já tem o schema, primeiro dropar tudo (`drop schema public cascade; create schema public;`),
> ou ajustar pra `create table if not exists` antes de aplicar.

## Pré-requisitos pro app rodar contra esse schema

### Variáveis de ambiente (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # Server Actions privilegiadas (bypass RLS)
SUPABASE_JWT_SECRET=...            # mesma key do dashboard; usada pra assinar JWT custom
```

### Auth custom (sem Supabase Auth)

As policies usam `auth.jwt() ->> 'participant_id'` pra autorização. Pra isso funcionar,
o app precisa:

1. Após login (CPF + WhatsApp validados contra `participants`), gerar um JWT com:
   ```json
   {
     "sub": "<participant_id-uuid>",
     "participant_id": "<participant_id-uuid>",
     "role": "authenticated",
     "exp": <unix-timestamp>,
     "iat": <unix-timestamp>
   }
   ```
2. Assinar com `SUPABASE_JWT_SECRET` (HS256)
3. Setar como cookie httpOnly via `iron-session` (ou equivalente)
4. Em cada request server-side, ler o cookie e passar como header
   `Authorization: Bearer <jwt>` no cliente Supabase

Detalhes em `lib/session.ts` e `middleware.ts` (Bloco 4.5).

## Decisões registradas no schema

- **Brasil tem `selecoes.id = 1`** — referenciado no seed e no badge "2x pontos" do front
- **`matches.is_brasil`** é coluna `boolean` mantida pelo seed/admin, **não computed**. Trade-off: simplicidade vs auto-consistência. Compensa porque o seed roda uma vez e o admin não altera seleções.
- **CPF imutável** — trigger `participants_cpf_immutable` rejeita `UPDATE` que altere `cpf`. Validação extra além da Server Action.
- **`predictions` UNIQUE (participant_id, match_id)** — upsert serve pra "salvar/editar palpite". App usa `on conflict (participant_id, match_id) do update`.
- **Trava de 1h antes** — codificada **na RLS policy** de `predictions` (`INSERT`/`UPDATE`). Mesmo que o app esqueça de validar, o banco recusa.
- **`league_members` SELECT restrito ao próprio membership** — listar todos os membros de uma liga (mini-ranking) passa por Server Action com `service_role` + verificação manual de autorização. Evita policy recursiva.
- **`help_requests` INSERT anônimo** — formulário "esqueci os dados" funciona sem JWT. Anti-spam via Cloudflare Turnstile no front.
- **`audit_logs`** sem policy pra usuários — só `service_role` lê/escreve. Painel admin chega via Server Action.

## Tabela rápida — quem pode fazer o quê (via PostgREST/Supabase JS)

| Tabela | anon SELECT | auth SELECT | auth INSERT | auth UPDATE | auth DELETE |
|---|---|---|---|---|---|
| `selecoes` | ✓ | ✓ | service | service | service |
| `matches` | ✓ | ✓ | service | service | service |
| `participants` | — | own | service | own | service |
| `predictions` | — | own | own (se aberto) | own (se aberto) | service |
| `leagues` | — | own/member | own | owner | owner |
| `league_members` | — | own membership | own | — | own |
| `audit_logs` | — | — | — | — | — |
| `help_requests` | — | — | ✓ | service | service |

> "service" = só via `SUPABASE_SERVICE_ROLE_KEY` (Server Actions privilegiadas que bypassam RLS).
