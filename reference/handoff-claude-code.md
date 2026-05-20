# Handoff pro Claude Code — Bolão Copa 2026

Tudo que foi decidido/validado no projeto Claude.ai durante prototipação. Use junto com `briefing-bolao.md`, `regulamento-oficial.md`, `bairros-joinville.md` e `Copa2026TabelaCompleta.xlsx` do projeto.

Protótipos visuais finais (referência exata de design):
- `01-home-v3.html` — Home institucional pública
- `04-dashboard-v2.html` — Área logada principal
- `05-palpitar-v2.html` — Lista de 104 jogos pra palpitar

---

## 1. Stack confirmada

Frontend: Next.js 14+ App Router · TypeScript estrito · Tailwind CSS · shadcn/ui · Inter (Google Fonts)
Backend: Next.js Server Actions + Route Handlers · Supabase Postgres (São Paulo, RLS ativado)
Auth: CPF + WhatsApp sem senha · Cookie 30 dias
Hospedagem: Vercel (plano Hobby) · domínio bolao.bateriasjoinville.com.br
Repo: github.com/bateriasjoinville/bolao-baterias-joinville (privado, 2FA)
Anti-spam: Cloudflare Turnstile (gratuito)
Push: Web Push API + Service Worker (opt-in)

---

## 2. Design tokens

### Cores
```
Marca:
  azul-primario:    #2323E8   (header, CTAs primários, botão +)
  azul-escuro:      #15158a   (texto sobre amarelo, sombras)
  amarelo:          #FFD400   (CTA destaque, badge "2x pontos", selos)
  amarelo-claro:    #FFFBE6   (bg destaque sutil, 1º lugar)

Estados:
  sucesso:          emerald (50 bg, 300 border, 700/800 text)
  alerta/pendente:  amber   (50 bg, 300 border, 800 text)
  info/vencedor:    blue    (50 bg, 200 border, 800 text)
  neutro/sem-pts:   slate   (100 bg, 500/600 text)

Estruturais:
  frame app:        slate-200 (fundo fora do container)
  bg app:           slate-50
  bg cards:         white
  border padrão:    slate-200 (0.5px ou 1px)
  texto principal:  slate-900
  texto secundário: slate-600
  texto auxiliar:   slate-500
```

### Tipografia
Fonte única: **Inter**. Pesos: 400, 500, 600, 700, 800.

```
H1 hero:       text-2xl/3xl · font-extrabold · leading-tight
H2 seção:      text-base/xl · font-bold
Subtítulo:     text-sm     · font-medium
Body:          text-sm/base · font-normal/medium
Microlabel:    text-[10px] · font-bold · uppercase tracking-wider
Caption:       text-xs/[11px] · font-medium
Número grande: text-2xl/3xl · font-extrabold · leading-none
```

### Espaçamento
- Padding lateral padrão: `px-4` (mobile-first 380-420px)
- Gap entre seções: `mb-4` ou `mb-5`
- Gap entre cards: `mb-2`
- Border radius: `rounded-xl` cards · `rounded-2xl` hero · `rounded-lg` botões · `rounded-md` badges

---

## 3. Componentes validados

### Header azul sticky
```
- bg-[#2323E8], px-4 pt-3 pb-5
- Logo Baterias Joinville (placeholder amarelo)
- Ícone perfil à direita
- Saudação + nome do usuário
- Stats compactos lado-a-lado em cards bg-white/10
```

### Match card (componente central)
3 estados visuais por borda/header:

| Estado | Borda | Header | Footer |
|---|---|---|---|
| Editável padrão | slate-200 | sem header | "trava em X" + "✓ Salvo" |
| Editável jogo do Brasil | [#FFD400] | bg amarelo claro + badge "🇧🇷 2x pontos" | "trava em X" |
| Editável prazo apertado (<30min) | amber-300 | bg amber-50 + "⚠ Trava em X" | "Palpita agora ou perde a chance" |
| Sem palpite (alerta) | 2px amber-300 | bg amber-50 + "⚠ Falta palpitar" | "Toque em + ou − pra começar" |
| Travado em andamento | slate-200 | bg slate-200/60 + "🔒 Trancado · Em andamento" + "● AO VIVO" | "Aguardando resultado oficial" |
| Encerrado placar exato | emerald-300 | bg emerald-50 + "✅ Placar exato" + "+6/+12 pts" | "Seu palpite: 2x1" |
| Encerrado só vencedor | blue-200 | bg blue-50 + "✓ Acertou o vencedor" + "+3/+6 pts" | "Seu palpite: 2x1" |
| Encerrado errou | slate-200 | bg slate-100 + "✗ Não pontuou" + "0 pts" | "Seu palpite: 2x0" |
| Encerrado sem palpite | slate-200 (opacity-90) | bg slate-100 + "— Você não palpitou" + "0 pts" | sem footer |

### Stepper de placar
- Container: `flex items-center gap-1.5`
- Botão −: `w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold text-lg`
- Número: `w-8 text-center font-extrabold text-xl text-slate-900` (ou text-slate-400 quando vazio)
- Botão +: `w-9 h-9 rounded-lg bg-[#2323E8] text-white font-bold text-lg`
- Valor vazio (não palpitado): `—` em slate-400 (NÃO `0`)
- Min/max: 0/15 (ou 0/9 — definir)

### Ranking row
- Posição (24px, font-extrabold): cores por posição
  - 1º: `text-yellow-600`
  - 2º: `text-slate-500`
  - 3º: `text-amber-700`
  - 4º+: `text-slate-400`
- Linha do usuário logado: `bg-[#2323E8]/5 border-l-4 border-[#2323E8]` + texto azul + microcopy aspiracional ("Faltam X pts pro top 3")

### Bottom nav (fixed, 5 itens)
- Container: `fixed bottom-0 bg-white border-t border-slate-200 max-w-md mx-auto`
- Grid 5 colunas
- Itens: Início · Palpitar · Rankings · Ligas · Perfil
- Ícones: SVG inline stroke-2 (Feather/Lucide style)
- Ativo: `text-[#2323E8] font-bold`
- Inativo: `text-slate-500 font-medium`
- Badge notificação: `absolute bg-red-500 text-white text-[9px] rounded-full w-4 h-4` (ex: palpites pendentes)

### Bandeiras — REGRA ABSOLUTA
**NUNCA usar emoji de bandeira** (regional indicators não renderiza em Android antigo, Windows, alguns Samsung). Sempre `<img>` de SVG.

Pra produção: baixe os SVGs de https://flagcdn.com/{iso}.svg uma vez e sirva de `/public/flags/{iso}.svg`. Tabela `selecoes` no banco tem coluna `codigo_iso` (ex: `br`, `gb-eng`, `us`).

Classes CSS reutilizáveis:
```css
.flag-xl { width: 56px; height: 40px; object-fit: cover; border-radius: 4px; border: 0.5px solid rgba(0,0,0,0.08); }
.flag-lg { width: 32px; height: 22px; object-fit: cover; border-radius: 3px; border: 0.5px solid rgba(0,0,0,0.08); }
.flag-md { width: 26px; height: 18px; object-fit: cover; border-radius: 3px; border: 0.5px solid rgba(0,0,0,0.08); }
.flag-sm { width: 16px; height: 11px; object-fit: cover; border-radius: 2px; display: inline-block; vertical-align: -2px; border: 0.5px solid rgba(0,0,0,0.08); }
```
A borda 0.5px é essencial pra bandeiras claras (Suíça, Polônia) não sumirem em fundo branco.

Atenção a casos especiais ISO: Inglaterra = `gb-eng`, Escócia = `gb-sct`, País de Gales = `gb-wls`.

---

## 4. Padrões de microcopy validados

Tom: direto, brasileiro, próximo. Sem "manda bala". Sem formalidade exagerada.

| Contexto | Microcopy |
|---|---|
| CTA principal | "Quero participar grátis →" |
| CTA secundário | "Cadastrar grátis" |
| CTA final do hero | "Bora pra cima 🇧🇷" |
| Subtítulo home | "Palpita os 104 jogos. Quem mais acerta, leva." |
| Promessa de fricção | "Leva 1 minuto. Sem cartão. Sem pegadinha." |
| Saudação dashboard | "Bom dia/tarde/noite, [Nome] 👋" |
| Status do dia | "Hoje tem X jogos · Y sem palpite" |
| Prazo confortável | "Trava em 4h 12min" |
| Prazo apertado | "⚠ Trava em 23 min" + "Palpita agora ou perde a chance" |
| Sem palpite | "⚠ Falta palpitar" + "Toque em + ou − pra começar" |
| Salvamento | "✓ Salvo" (verde) |
| Estado motivacional ranking | "Faltam 55 pts pro top 3" |
| Placar exato | "✅ Placar exato · +6/+12 pts" |
| Só vencedor | "✓ Acertou o vencedor · +3/+6 pts" |
| Errou | "✗ Não pontuou · 0 pts" |
| Sem palpite (encerrado) | "— Você não palpitou · 0 pts" |
| Comunicação prêmios | "+R$ 5.000 em prêmios" / "Mais de R$ 5.000 distribuídos em 38 dias de Copa" |

---

## 5. Estado das 8 telas

| # | Tela | Status | Reusa | Notas |
|---|---|---|---|---|
| 1 | Home `/` | ✅ Validada | — | Pública, fala +R$ 5.000 já |
| 2 | Cadastro `/cadastro` | ⏳ Construir | Header + brand | Validar CPF math, máscara WhatsApp (47), dropdown bairros (lista em `bairros-joinville.md`), 2 checkboxes LGPD obrigatórios, Turnstile invisível |
| 3 | Login `/login` | ⏳ Construir | Header + brand | Só CPF + WhatsApp, cookie 30 dias marcado por padrão, link "esqueci os dados" |
| 4 | Dashboard `/dashboard` | ✅ Validada | Match card, ranking row, stepper, bottom nav | Hero amarelo do próximo Brasil é condicional (esconder se Brasil não joga hoje) |
| 5 | Palpitar `/palpitar` | ✅ Validada | Match card, stepper, bottom nav | Filtros: fase + "Só Brasil" + pendentes/encerrados |
| 6 | Rankings `/rankings` | ⏳ Construir | Ranking row, bottom nav | Toggle Geral/Semanal, lista top 20, linha do usuário sempre visível (sticky se fora do top 20) |
| 7 | Mini-ligas `/ligas` | ⏳ Construir | Ranking row, bottom nav | Lista ligas que participa, botão "criar liga", link de convite WhatsApp, máx 5 ligas/usuário |
| 8 | Admin `/admin` | ⏳ Construir | — | Tabs: Placares · Inscritos · Imagens · Logs · Pedidos de ajuda. Protegida por ADMIN_TOKEN. Atualizar placar dispara recálculo automático |

---

## 6. Decisões importantes a respeitar

1. **Hierarquia visual do Dashboard**: jogos do dia com steppers funcionais visíveis. Usuário palpita sem sair da tela. NÃO esconder atrás de "clique pra editar".
2. **Placar não palpitado = `—`** (em slate-400), nunca `0`. Evita confusão com palpite 0×0 deliberado.
3. **Jogos do Brasil são SEMPRE destacados** com badge "🇧🇷 2x pontos" + borda/header amarelo, em qualquer estado.
4. **Status visual ≠ Estado de banco**: o card pode estar "travado" mesmo sem o resultado oficial estar fechado (regra de "1h antes"). Manter os 9 estados visuais separados das datas no banco.
5. **Bottom nav com badge vermelho** no item Palpitar quando há jogos pendentes hoje.
6. **+R$ 5.000 em prêmios** virou promessa pública. Os 17 prêmios complementares (4º-20º) PRECISAM ser definidos antes de 04/jun, com valor médio de R$ 130/item pra fechar a conta.
7. **Bandeiras nunca como emoji**, sempre como `<img>` (regra inegociável de acessibilidade visual).

---

## 7. Pendências de negócio antes de 04/jun (anúncio inicial)

- [ ] **Lista de 17 prêmios complementares (4º-20º)** — bloqueio crítico (comunicamos +R$ 5.000 publicamente)
- [ ] **Reservar fisicamente** a Bateria Moura 60Ah no estoque
- [ ] **CNPJ correto** no regulamento (campo `[INSERIR CNPJ]`)
- [ ] **E-mail do DPO** no regulamento (campo `[INSERIR E-MAIL DPO]`)
- [ ] **Logo PNG final** pra substituir placeholders textuais
- [ ] **Conferir lista oficial de bairros de Joinville+Pirabeiraba** (já tem em `bairros-joinville.md`)
- [ ] **Aprovar regulamento final** (texto em `regulamento-oficial.md`)

---

## 8. Prompt sugerido pro primeiro turno do Claude Code

Cole como primeira mensagem no terminal Claude Code, com os arquivos do projeto e os 3 HTMLs anexos:

```
Você está construindo o Bolão da Copa 2026 da Baterias Joinville — bolão gratuito,
captação de leads, roda de 11/jun a 19/jul/2026, mobile-first.

Stack: Next.js 14 App Router + TS estrito + Tailwind + shadcn/ui + Supabase Postgres
(São Paulo, RLS ativado) + Vercel (Hobby) + Cloudflare Turnstile. Repo:
github.com/bateriasjoinville/bolao-baterias-joinville (privado).

Arquivos de contexto que vou anexar:
- briefing-bolao.md (regras, premiação, funcionalidades em ordem de prioridade)
- regulamento-oficial.md (texto formal, com campos a preencher)
- bairros-joinville.md (lista oficial pro dropdown de cadastro)
- handoff-claude-code.md (este — design tokens, componentes, microcopy validada)
- 01-home-v3.html, 04-dashboard-v2.html, 05-palpitar-v2.html (referência visual EXATA)
- Copa2026TabelaCompleta.xlsx (104 jogos da FIFA pra popular o banco)

Princípios:
1. Mobile-first (~95% acessos via celular)
2. Use os HTMLs como referência VISUAL exata (cores, espaçamentos, componentes)
3. Auth sem senha — CPF + WhatsApp + cookie 30 dias
4. RLS sempre — política por participante
5. LGPD: opt-in explícito, retenção 12 meses, exclusão sob demanda
6. Server Actions pra mutação, Route Handlers pra integração

Primeira tarefa: setup. Por ordem:
1. Inicializar Next.js + TS + Tailwind + shadcn/ui
2. Configurar paleta da marca no tailwind.config.ts (#2323E8 azul, #15158a azul-escuro,
   #FFD400 amarelo) e Inter via next/font
3. Criar schema do banco no Supabase:
   - participants (cpf único, whatsapp, nome, idade, bairro, instagram, aceites, created_at)
   - selecoes (id, nome, codigo_iso) — popular com 48 seleções da Copa 2026
   - matches (id, fase, grupo, data_hora, estadio, selecao_a_id, selecao_b_id,
     placar_a, placar_b, is_brasil)
   - predictions (participant_id, match_id, placar_a, placar_b, updated_at) — unique
     (participant_id, match_id)
   - leagues (id, owner_id, nome, codigo_convite)
   - league_members (league_id, participant_id)
   - audit_logs (admin actions)
4. Popular `matches` a partir do XLSX
5. Baixar SVGs de bandeira de flagcdn.com pro /public/flags/

Depois disso, implementamos Home como primeira página. Use 01-home-v3.html como
referência pixel-by-pixel.

Pra dúvidas conceituais (estratégia, regulamento, conteúdo) eu uso projeto Claude.ai
separado — aqui foco em código que roda. Pergunte tudo que precisar sobre código.

Vai.
```

---

## 9. Telas faltantes — guia rápido de construção

### Cadastro
- Header azul institucional (sem stats — usuário ainda não tem)
- Form fields:
  - Nome completo (validação min 2 palavras)
  - CPF (máscara `123.456.789-00`, validação algoritmo)
  - WhatsApp (máscara `(47) 9xxxx-xxxx`, validação DDD)
  - Idade (number, ≥18)
  - Bairro (dropdown, lista em `bairros-joinville.md` + "Área Rural")
  - @Instagram (opcional, sem destacar como opcional)
  - ☑ "Li e aceito o regulamento" (obrigatório, link pra `/regulamento`)
  - ☑ "Aceito receber comunicações da Baterias Joinville no WhatsApp" (obrigatório por LGPD)
- Botão amarelo "Quero participar grátis →"
- Turnstile invisível
- Após sucesso: redirect direto pro dashboard (sem tela de confirmação)

### Login
- Header azul institucional
- 2 inputs: CPF (máscara) + WhatsApp (máscara)
- ☑ "Manter conectado por 30 dias" (marcado por padrão)
- Botão "Entrar"
- Link "Esqueci os dados" → form que envia pro admin via tabela `help_requests`

### Rankings
- Header com toggle: `[Ranking geral] | [Esta semana]`
- Lista top 20 (mesma linha do ranking compacto do dashboard, mas com mais info: bairro)
- Linha do usuário sempre visível (sticky no fim se ele estiver fora do top 20)
- Ícone "Compartilhar" no card pra gerar imagem PNG do top 10 (admin tem ferramenta similar)

### Mini-ligas
- Header padrão
- Lista de ligas que participa: nome, qty membros, posição do usuário
- Botão amarelo "Criar nova liga" (limite 5)
- Cada liga abre uma sub-tela com mini-ranking interno (mesma linha de ranking)
- Botão "Convidar pelo WhatsApp" gera link `bolao.bateriasjoinville.com.br/liga/{codigo}` com share API

### Admin
- Login admin por `ADMIN_TOKEN` (env var)
- Tabs:
  - **Placares**: lista de jogos com inputs `placar_a × placar_b`, botão "Salvar e recalcular" (dispara recálculo de todos os predictions)
  - **Inscritos**: tabela com filtros (bairro, data cadastro, com/sem Instagram), export CSV
  - **Imagens**: gera PNG do Top 10 Geral, Top Semanal, Ganhador do dia (via @vercel/og)
  - **Logs**: tabela de audit_logs
  - **Pedidos de ajuda**: lista de "esqueci os dados"
