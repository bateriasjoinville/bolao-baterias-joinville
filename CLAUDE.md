\# Bolão da Copa 2026 — Baterias Joinville



Bolão gratuito da Copa 2026 (11/jun a 19/jul/2026). Captação de leads

com opt-in LGPD. Mobile-first (\~95% acesso via celular). Joinville/SC.



\## Stack

\- Next.js 14+ App Router · TypeScript estrito (sem `any`, sem `// @ts-ignore`)

\- Tailwind CSS · shadcn/ui · Inter via next/font

\- Supabase Postgres (sa-east-1) com RLS sempre ativado

\- Server Actions pra mutação, Route Handlers pra integração

\- Vercel (Hobby) · Cloudflare Turnstile · Web Push API



\## Convenções de código

\- TypeScript estrito, sempre. Nada de `any`.

\- Mobile-first em tudo. Tailwind classes mobile primeiro, depois `md:`.

\- Server components por padrão. `'use client'` só quando necessário.

\- Validação com Zod em todo input do usuário.

\- Sanitização rigorosa antes de qualquer query.

\- Sem comentários óbvios — código claro fala por si.

\- Arquivos pequenos. Componente > 300 linhas, quebra.



\## Identidade visual (NÃO mudar)

\- Azul primário: #2323E8

\- Azul escuro (texto sobre amarelo): #15158a

\- Amarelo: #FFD400

\- Fonte: Inter (400, 500, 600, 700, 800)



\## Referências obrigatórias antes de qualquer tela

1\. Leia `reference/handoff-claude-code.md` — design tokens completos,

&#x20;  componentes, microcopy validada e prompt inicial.

2\. Para Home, Dashboard ou Palpitar, abra o HTML correspondente em

&#x20;  `reference/` e use como referência pixel-by-pixel.



\## Regras de produto inegociáveis

1\. Bandeiras SEMPRE como `<img>` SVG, NUNCA emoji (regional indicators

&#x20;  não renderiza em Android antigo/Windows). Baixe de flagcdn.com pro

&#x20;  `/public/flags/{iso}.svg`.

2\. Placar não palpitado mostra `—`, nunca `0`.

3\. Jogos do Brasil têm badge "🇧🇷 2x pontos" sempre destacado.

4\. Login sem senha — CPF + WhatsApp + cookie 30 dias.

5\. RLS ativada em toda tabela do Supabase.

6\. LGPD: opt-in explícito, retenção 12 meses, exclusão sob demanda.

7\. Todos os 9 estados visuais do match card (editável, travado, encerrado

&#x20;  com placar exato/vencedor/erro/sem-palpite, prazo apertado, sem palpite

&#x20;  alerta) precisam funcionar — veja handoff seção 3.



\## Comandos comuns

\- `pnpm dev` — ambiente local

\- `pnpm build` — build de produção

\- `pnpm lint` — ESLint

\- `pnpm typecheck` — tsc --noEmit



\## Variáveis de ambiente esperadas

Veja `.env.example` pra lista completa. Nunca commite `.env.local`.



\## Pendências de negócio (status no projeto Claude.ai)

Lista atualizada em `reference/handoff-claude-code.md` seção 7.

