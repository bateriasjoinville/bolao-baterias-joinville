# Supabase — Bolão Copa 2026

## Estrutura

```
supabase/
  migrations/
    0001_initial_schema.sql   # schema inicial: 8 tabelas + indexes + RLS + policies
    0002_seed.sql             # ALTERs em matches + seed 48 seleções + 104 jogos
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

## Migration 0002 — Seed selecoes + matches

Aplica em sequência (precisa do 0001 já rodado):

1. **SQL Editor → New query**
2. Colar o conteúdo de `0002_seed.sql`
3. **Run**
4. Confirmar que retornou sem erro

### O que o 0002 faz

- **ALTERs em `matches`**
  - Adiciona valor `'r32'` ao `CHECK` da coluna `fase` (32-avos, fase nova da Copa de 48 times)
  - Torna `selecao_a_id` e `selecao_b_id` nullable (jogos eliminatórios ainda não têm time definido)
  - Cria colunas `placeholder_a` e `placeholder_b` (text) pra notação de chaveamento: `1A`, `2C`, `3_ABCDF` (no r32) e `V73`, `P101` (oitavas em diante)
  - Adiciona CHECK XOR: cada lado tem exatamente um dos dois preenchidos (`selecao_*_id` OU `placeholder_*`, nunca ambos nem nenhum)
- **Seed `selecoes`** — 48 linhas. Brasil id=1 fixo. Restantes 2..48 alfabéticas. `codigo_iso` no formato flagcdn.com (`br`, `us`, `gb-eng`, `gb-sct`, etc).
- **Seed `matches`** — 104 linhas. Fase de grupos (72) com `selecao_*_id` preenchido + r32/oitavas/quartas/semifinais/terceiro/final (32) com placeholders. Brasil joga em 7 (vs Marrocos), 29 (vs Haiti), 49 (vs Escócia) — `is_brasil = true`.

### Validações esperadas pós-apply

Rodar no SQL Editor depois de aplicar:

```sql
select count(*) from selecoes;                          -- esperado: 48
select count(*) from matches;                           -- esperado: 104
select count(*) from matches where is_brasil = true;    -- esperado: 3
```

E pra conferir a Brasil é id=1:

```sql
select id, nome, codigo_iso from selecoes where id = 1; -- Brasil, br
```

### Idempotência

Igual ao 0001 — **não é idempotente**. A transação `BEGIN/COMMIT` rola tudo de volta se houver qualquer erro no meio (incluindo PK duplicada se já tiver dados). Pra reaplicar do zero: dropar schema, reaplicar 0001, depois 0002.

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

## Estratégia de assinatura do JWT custom

- **HS256 com `SUPABASE_JWT_SECRET` (legacy "Previously used")** — o painel **JWT Signing Keys** do projeto já migrou pra ES256 como key atual, mas a private key ES256 **não é extraível** (só Supabase Auth pode assinar com ela). A legacy HS256 ficou em modo **verify-only**: PostgREST aceita JWT custom assinado com o legacy secret quando o token vem com `alg: HS256` e sem header `kid` (fallback documentado pelo Supabase).
- **Por que não third-party auth com JWKS próprio agora:** custo de operação alto (par de chaves, endpoint `/.well-known/jwks.json`, cadastro no dashboard, gerenciamento de `kid`) pra uma janela de produto de ~38 dias úteis (cadastro de leads + Copa 11/jun a 19/jul/2026).
- **Ponto de migração:** se o projeto for prolongado pós-Copa e o Supabase anunciar EOL do HS256 legacy, migrar pra third-party auth — gerar par EC P-256, expor JWKS em `/api/jwks` (Vercel route handler), cadastrar como provider no dashboard. As policies RLS (`auth.jwt() ->> 'participant_id'`) **não mudam**, só o lado de quem assina.

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
