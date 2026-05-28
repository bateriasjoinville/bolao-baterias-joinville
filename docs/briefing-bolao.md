# Bolão da Copa do Mundo 2026 — Baterias Joinville

> **ATUALIZAÇÃO 27/mai/2026:** estratégia de premiação simplificada para 1 brinde cortesia (Bateria Moura 60Ah ao 1º colocado). Seções 5.x deste briefing refletem versão inicial v1.0 do produto. Versão atual v1.1 documentada no `regulamento-oficial.md`.

## Resumo executivo
Bolão GRATUITO da Copa 2026 (11/jun a 19/jul/2026), aberto a moradores de Joinville+Pirabeiraba maiores de 18 anos. Objetivo de negócio: captação de leads qualificados com opt-in LGPD + relacionamento + reforço de marca durante 38 dias.

Sem cobrança de inscrição. Não é jogo de azar pela legislação brasileira (jurisprudência: bolão gratuito sem fim lucrativo não se enquadra em jogo de azar).

## Regras do jogo
- 104 jogos da Copa do Mundo FIFA 2026
- Palpite editável até 1h antes do início de cada jogo
- Depois desse prazo, o palpite trava e não pode ser alterado
- Quem não palpitar um jogo no prazo: 0 pontos naquele jogo

### Pontuação
| Acertou | Pontos NORMAIS | Pontos JOGO DO BRASIL |
|---------|---------------|----------------------|
| Placar exato | 6 | 12 |
| Vencedor ou empate (placar errado) | 3 | 6 |
| Errou ou não palpitou | 0 | 0 |

Todos os jogos do Brasil têm pontuação dobrada (fase de grupos e mata-mata).

### Critérios de desempate (Ranking Geral)
1. Maior número de placares exatos
2. Maior número de acertos de vencedor
3. Menor diferença média de gols nos palpites
4. Ordem de cadastro (cadastrado primeiro leva)

## Cadastro
Campos obrigatórios:
- Nome completo (mínimo 2 palavras)
- CPF (validação matemática + máscara 123.456.789-00)
- WhatsApp (DDD 47, máscara (47) 9xxxx-xxxx)
- Idade (declaração, 18+)
- Bairro (dropdown com bairros de Joinville+Pirabeiraba)
- @Instagram (sem destacar como opcional — aceita vazio sem bloquear)
- ☑ Li e aceito o regulamento
- ☑ Aceito receber comunicações da Baterias Joinville no WhatsApp (LGPD)

Cadastro a qualquer momento da Copa (perde pontos dos jogos já passados).
Limite: 1 cadastro por CPF.

## Login
- CPF + WhatsApp (sem senha)
- Cookie "lembrar por 30 dias" marcado por padrão
- Botão "Esqueci os dados" → recuperação manual via admin

## Premiação

### Ranking Geral (38 dias) — Top 20
- 1º: R$ 1.000 + Bateria Moura 60Ah
- 2º: R$ 500
- 3º: R$ 250
- 4º ao 20º: 17 prêmios complementares (lavações, rodízios, potes — distribuição a definir)

### Ranking Semanal — R$ 100 × 5 semanas = R$ 500
- Reseta toda segunda-feira às 00h
- 5 semanas no total
- 1º da semana ganha R$ 100

### Vale-checkup diário
- Bateria + alternador grátis na loja
- Quem cravar placar exato no dia ganha o vale
- Limite de 1 vale-checkup por participante toda a Copa
- Resgate até 60 dias após o fim da Copa

## Resgate de prêmios
- Documento com foto comprovando 18+
- Comprovante de residência em Joinville (até 90 dias)
- Validação de identidade (CPF + WhatsApp cadastrados)
- Prêmios em dinheiro: PIX em até 7 dias úteis
- Prêmios físicos: retirada na loja (Rua Dona Francisca, 4523)

## Funcionalidades aprovadas (em ordem de prioridade)

1. **Tabela pública da Copa** (visível sem login — landing institucional)
2. **Cadastro + Login** CPF+WhatsApp + cookie 30 dias
3. **Palpitar** lista de 104 jogos, salva automaticamente, trava 1h antes
4. **Rankings** Geral + Semanal (públicos, com nome completo)
5. **Mini-ligas privadas** entre amigos (link de convite, sem prêmio extra, gera viralização)
6. **Compartilhar palpites no WhatsApp** (gera imagem PNG)
7. **Compartilhamento ESPECIAL para palpite do Brasil** (imagem diferenciada, viraliza)
8. **"X pessoas acertaram este placar"** após cada jogo (prova social)
9. **Notificação push 30min antes do jogo** (opt-in via Service Worker)
10. **Captcha invisível** (Cloudflare Turnstile) no cadastro
11. **Página /regulamento** separada com texto formal
12. **Backup automático diário** do banco via GitHub Actions
13. **Painel admin** protegido por ADMIN_TOKEN:
    - Atualizar placares (recalcula tudo automaticamente)
    - Listar inscritos com filtros + export CSV
    - Gerar imagens prontas para Instagram (Top 10 Geral, Semanal, Ganhadores diários)
    - Logs de auditoria
    - Pedidos de ajuda ("esqueci os dados")

## Stack técnica
- Frontend: Next.js 14+ App Router (TypeScript estrito)
- Estilo: Tailwind CSS + shadcn/ui
- Backend: Next.js Server Actions e Route Handlers
- Banco: Supabase Postgres (Free tier, região São Paulo) com RLS ativado
- Hospedagem: Vercel (conta pessoal Gabriel, plano Hobby)
- Repositório: github.com/bateriasjoinville/bolao-baterias-joinville (privado, com 2FA)
- Captcha: Cloudflare Turnstile (gratuito)
- Notificações push: Web Push API + Service Worker

## Identidade visual
- Azul primário: #2323E8
- Amarelo: #FFD400
- Branco: #FFFFFF
- Logo: PNG quadrado em fundo azul com acento amarelo
- Mobile-first (~95% dos acessos via celular)
- Tom: direto, próximo, com toque brasileiro

## Cronograma
- 18/mai/2026: planejamento finalizado ✓
- 19/mai a 03/jun: construção (5 entregas incrementais)
- 04/jun: ANÚNCIO INICIAL (Instagram + WhatsApp Status)
- 08/jun: CADASTROS ABERTOS
- 11/jun: COPA INICIA — bolão ativo
- 19/jul: FINAL DA COPA
- 20-31/jul: VALIDAÇÃO E ENTREGA DE PRÊMIOS

## URLs planejadas
- Tabela pública (atual, manter): copa.bateriasjoinville.com.br (Netlify)
- Bolão (novo): bolao.bateriasjoinville.com.br (Vercel)
- Os dois sites linkam entre si

## Princípios operacionais
- Construção técnica via Claude Code (terminal local)
- Discussões estratégicas + conteúdo via projeto Claude.ai dedicado
- Senha admin: gerada (K9#mPx2vR$nL5wXz!Jh8qT), armazenada localmente
- Backup automático do banco rodando diariamente
- LGPD: opt-in explícito, direito de exclusão, retenção 12 meses
- Logs de auditoria em todas as ações admin
- Sanitização rigorosa de inputs

## Decisões importantes registradas

### Por que não cobrar inscrição
Bolão pago com prêmio em dinheiro entra em zona cinzenta do Código Penal (DL 3.688/1941). Bolão gratuito + prêmio em produto evita o problema. Vantagem adicional: aumenta drasticamente o volume de inscritos (sem barreira) e captura leads qualificados.

### Por que login sem senha
Público mais velho compra bateria. Senha vira atrito e dor de cabeça de recuperação. CPF + WhatsApp dá segurança suficiente (ninguém sabe os dois) sem complicar.

### Por que mini-liga gratuita
Viralização orgânica gratuita. Cliente convida 3-5 amigos = base de leads pode triplicar. Custo zero, retorno enorme.

### Por que jogos do Brasil dobrados
Foca atenção onde o brasileiro mais se importa. Mantém ranking competitivo até o fim. Quem entrou tarde no bolão tem chance de subir nos jogos do Brasil.

## Pendências do Gabriel
- [ ] Definir 17 prêmios complementares (4º ao 20º lugar)
- [ ] Reservar Bateria Moura 60Ah no estoque
- [ ] Validar regulamento final
- [ ] Aprovar templates de divulgação Instagram/WhatsApp
- [ ] Conferir lista oficial de bairros de Joinville+Pirabeiraba

## Contatos
- Loja: Rua Dona Francisca, 4523 — Santo Antônio — Joinville/SC
- WhatsApp: (47) 99680-1100
- Site: bateriasjoinville.com.br
- Horário: Seg-Sex 8h-18h