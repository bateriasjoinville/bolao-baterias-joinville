import Link from "next/link";

export const metadata = {
  title: "Regulamento — Bolão Copa 2026",
  description:
    "Regulamento oficial do Bolão da Copa 2026 da Baterias Joinville. Quem pode participar, como funciona, brinde cortesia, LGPD.",
};

// Fonte canônica: docs/regulamento-oficial.md (v1.1). Mantém em sync se editar lá.
export default function RegulamentoPage() {
  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-blue px-4 py-3">
          <div className="rounded-md bg-brand-yellow px-2.5 py-1 text-xs font-bold tracking-tight text-brand-blue-dark">
            Baterias Joinville
          </div>
          <Link href="/" className="text-sm font-medium text-white">
            ← Voltar
          </Link>
        </header>

        <article className="px-5 py-6 text-slate-700">
          <h1 className="text-2xl font-extrabold text-brand-blue-dark">
            Regulamento do Bolão da Copa do Mundo 2026
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Baterias Joinville
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Versão 1.1 — Publicado em [DATA DA PUBLICAÇÃO]
          </p>

          <hr className="my-6 border-slate-200" />

          <Section title="1. Sobre o bolão">
            <p>
              A <strong>Baterias Joinville</strong>, inscrita sob CNPJ [INSERIR
              CNPJ], localizada à Rua Dona Francisca, 4523, Santo Antônio,
              Joinville/SC, promove o{" "}
              <strong>Bolão da Copa do Mundo FIFA 2026</strong>{" "}
              (&ldquo;Bolão&rdquo;), atividade promocional{" "}
              <strong>GRATUITA</strong> e sem fins lucrativos, destinada a
              fortalecer o relacionamento com seus clientes e potenciais
              clientes na região de Joinville/SC.
            </p>
            <p>
              O Bolão NÃO se caracteriza como jogo de azar, sorteio ou
              modalidade lotérica, conforme legislação vigente, por se tratar
              de atividade gratuita baseada em conhecimento esportivo e
              prognóstico. O brinde cortesia descrito na seção 5 não constitui
              prêmio em dinheiro, distribuição gratuita por sorteio, nem
              contraprestação financeira.
            </p>
          </Section>

          <Section title="2. Quem pode participar">
            <p>São elegíveis a participar:</p>
            <Bullets>
              <li>
                Pessoas físicas com idade igual ou superior a{" "}
                <strong>18 (dezoito) anos</strong>
              </li>
              <li>
                Residentes em <strong>Joinville/SC</strong>, incluindo o
                distrito de <strong>Pirabeiraba</strong>
              </li>
              <li>Que aceitem expressamente este regulamento</li>
            </Bullets>

            <p className="mt-4">
              <strong>Não podem participar:</strong>
            </p>
            <Bullets>
              <li>Menores de 18 anos</li>
              <li>Pessoas residentes fora de Joinville/SC</li>
              <li>
                Funcionários da Baterias Joinville e seus familiares diretos
                (cônjuges, filhos, pais, irmãos)
              </li>
            </Bullets>

            <p className="mt-4">
              <strong>Limite:</strong> 1 (uma) inscrição por CPF.
            </p>
          </Section>

          <Section title="3. Período de participação">
            <Bullets>
              <li>
                <strong>Início dos cadastros:</strong> [DATA DE ABERTURA]
              </li>
              <li>
                <strong>Início da Copa:</strong> 11 de junho de 2026
              </li>
              <li>
                <strong>Fim da Copa:</strong> 19 de julho de 2026
              </li>
              <li>
                <strong>Cadastros aceitos:</strong> a qualquer momento durante
                a Copa
              </li>
            </Bullets>
            <p className="mt-4">
              Participantes que se cadastrarem após o início da Copa{" "}
              <strong>NÃO pontuam nos jogos já realizados</strong>, mas
              concorrem normalmente nos jogos seguintes.
            </p>
          </Section>

          <Section title="4. Como funciona">
            <Sub title="4.1 Palpites">
              <Bullets>
                <li>
                  O participante palpita o <strong>resultado exato</strong>{" "}
                  (número de gols de cada equipe) em cada um dos 104 jogos da
                  Copa
                </li>
                <li>
                  Os palpites podem ser editados livremente{" "}
                  <strong>até 1 (uma) hora antes</strong> do início de cada
                  jogo
                </li>
                <li>
                  Após esse prazo, o palpite é <strong>travado</strong> e não
                  pode mais ser alterado
                </li>
                <li>
                  Jogos não palpitados até o prazo: 0 (zero) pontos naquele
                  jogo
                </li>
              </Bullets>
            </Sub>

            <Sub title="4.2 Pontuação">
              <p>
                <strong>Jogos normais:</strong>
              </p>
              <Bullets>
                <li>Placar exato: 6 pontos</li>
                <li>Acerto do vencedor ou empate (placar errado): 3 pontos</li>
                <li>Erro ou não palpitou: 0 pontos</li>
              </Bullets>

              <p className="mt-4">
                <strong>Jogos do Brasil (pontuação dobrada):</strong>
              </p>
              <Bullets>
                <li>Placar exato: 12 pontos</li>
                <li>Acerto do vencedor ou empate: 6 pontos</li>
                <li>Erro ou não palpitou: 0 pontos</li>
              </Bullets>

              <p className="mt-4">
                A pontuação dobrada se aplica a{" "}
                <strong>todos os jogos da Seleção Brasileira</strong>, em todas
                as fases (grupos, oitavas, quartas, semifinal, final, terceiro
                lugar).
              </p>
            </Sub>

            <Sub title="4.3 Rankings">
              <Bullets>
                <li>
                  <strong>Ranking Geral:</strong> acumula pontos durante toda a
                  Copa (104 jogos)
                </li>
                <li>
                  <strong>Ranking Semanal:</strong> reseta toda segunda-feira
                  às 00h00, totalizando 5 semanas, para acompanhamento e
                  reconhecimento público dos participantes mais engajados na
                  semana (sem brinde associado)
                </li>
              </Bullets>
            </Sub>
          </Section>

          <Section title="5. Brinde cortesia">
            <p>
              A Baterias Joinville oferece um <strong>brinde cortesia</strong>{" "}
              ao participante que alcançar a 1ª posição do Ranking Geral ao
              final dos 104 jogos da Copa do Mundo FIFA 2026:
            </p>
            <p className="my-4 rounded-md bg-brand-yellow px-4 py-3 text-center text-base font-bold text-brand-blue-dark">
              1 (uma) Bateria Moura 60Ah
            </p>
            <p>
              O brinde é uma cortesia da loja como reconhecimento ao
              participante mais engajado e não constitui prêmio, sorteio ou
              modalidade lotérica. Não há contraprestação financeira, sorteio
              ou álea — o brinde é entregue ao participante que demonstrar
              melhor conhecimento esportivo ao longo da competição.
            </p>
            <p className="mt-4">
              <strong>Não há brindes para outras posições.</strong> Os
              participantes do 2º ao 20º lugar do Ranking Geral, bem como os
              líderes do Ranking Semanal, são reconhecidos publicamente no
              painel de classificação, sem brinde associado.
            </p>
          </Section>

          <Section title="6. Critérios de desempate">
            <p>
              Em caso de empate em qualquer posição do Ranking Geral,
              aplicar-se-ão, nesta ordem:
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Maior número de placares exatos</li>
              <li>Maior número de acertos de vencedor</li>
              <li>Menor diferença média de gols nos palpites</li>
              <li>Ordem cronológica de cadastro (cadastrado primeiro leva)</li>
            </ol>
          </Section>

          <Section title="7. Mini-ligas">
            <p>
              Os participantes podem criar <strong>ligas privadas</strong> para
              competir contra amigos, gerando um link de convite para outros
              participantes.
            </p>
            <p className="mt-4">As mini-ligas:</p>
            <Bullets>
              <li>
                Têm finalidade <strong>exclusivamente recreativa</strong>
              </li>
              <li>
                <strong>NÃO conferem brinde adicional</strong> da Baterias
                Joinville
              </li>
              <li>
                Limite: 5 ligas por participante (como criador ou membro)
              </li>
            </Bullets>
          </Section>

          <Section title="8. Retirada do brinde">
            <p>
              Para receber o brinde cortesia, o participante 1º colocado deverá
              comparecer pessoalmente à loja física da Baterias Joinville (Rua
              Dona Francisca, 4523, Santo Antônio, Joinville/SC), de segunda a
              sexta, das 8h às 18h, apresentando:
            </p>
            <Bullets>
              <li>
                <strong>Documento oficial com foto</strong> (RG, CNH ou
                similar) confirmando idade igual ou superior a 18 anos
              </li>
              <li>
                <strong>Comprovante de residência em Joinville</strong> (conta
                de luz, água, gás, internet, ou similar), com data de emissão
                de até 90 (noventa) dias
              </li>
              <li>
                Confirmação de identidade do cadastro (CPF e WhatsApp
                informados)
              </li>
            </Bullets>
            <p className="mt-4">
              Prazo para retirada: até <strong>60 (sessenta) dias</strong>{" "}
              após o término da Copa (até 17/09/2026). Após esse prazo, o
              brinde não fica mais disponível.
            </p>
          </Section>

          <Section title="9. Privacidade e proteção de dados (LGPD)">
            <p>
              A Baterias Joinville coleta os seguintes dados pessoais durante o
              cadastro:
            </p>
            <Bullets>
              <li>Nome completo</li>
              <li>CPF</li>
              <li>WhatsApp</li>
              <li>Idade</li>
              <li>Bairro</li>
              <li>Instagram (se fornecido voluntariamente)</li>
            </Bullets>

            <p className="mt-4">Adicionalmente, são coletados:</p>
            <Bullets>
              <li>Palpites realizados durante a Copa</li>
              <li>Pontuação obtida</li>
              <li>Mini-ligas criadas ou participadas</li>
            </Bullets>

            <Sub title="Finalidades do tratamento">
              <Bullets>
                <li>
                  Operação do Bolão e validação de unicidade dos participantes
                  (1 cadastro por CPF)
                </li>
                <li>
                  Comunicação sobre o Bolão (ranking, resultados) via WhatsApp
                </li>
                <li>
                  Identificação do participante para retirada do brinde
                  cortesia
                </li>
                <li>
                  Comunicações promocionais sobre produtos e serviços da
                  Baterias Joinville,{" "}
                  <strong>mediante aceite explícito</strong> do participante
                </li>
              </Bullets>
            </Sub>

            <Sub title="Bases legais">
              <Bullets>
                <li>Consentimento do titular dos dados</li>
                <li>
                  Execução de obrigações pré-contratuais (entrega do brinde
                  cortesia)
                </li>
                <li>Legítimo interesse (prevenção de fraude no Bolão)</li>
              </Bullets>
            </Sub>

            <Sub title="Direitos do titular">
              <p>A qualquer momento, o participante pode solicitar:</p>
              <Bullets>
                <li>Acesso aos seus dados pessoais armazenados</li>
                <li>Correção de dados imprecisos</li>
                <li>
                  Exclusão dos dados (&ldquo;direito ao esquecimento&rdquo;)
                </li>
                <li>Revogação do consentimento para comunicações</li>
              </Bullets>
              <p className="mt-4">
                Solicitações via WhatsApp <strong>(47) 99680-1100</strong> ou
                e-mail <strong>[INSERIR E-MAIL DPO]</strong>.
              </p>
            </Sub>

            <Sub title="Retenção">
              <p>
                Os dados serão mantidos por até{" "}
                <strong>12 (doze) meses</strong> após o término da Copa (julho
                de 2027), exceto se houver consentimento explícito para uso
                continuado em ações de marketing, caso em que o participante
                poderá revogar a qualquer tempo.
              </p>
            </Sub>
          </Section>

          <Section title="10. Desclassificação">
            <p>
              Será desclassificado, sem direito ao brinde, o participante que:
            </p>
            <Bullets>
              <li>Cadastrar dados falsos ou de terceiros</li>
              <li>
                Tentar realizar múltiplos cadastros (mesmo CPF, mesmo
                WhatsApp, ou identificação por outros meios)
              </li>
              <li>
                Não comprovar residência em Joinville/SC no momento da retirada
                do brinde
              </li>
              <li>
                Não tiver 18 (dezoito) anos completos na data do cadastro
              </li>
              <li>Praticar qualquer ato fraudulento ou abusivo</li>
              <li>
                Tentar manipular o resultado do bolão (uso de bots, contas
                falsas, conluio entre participantes)
              </li>
              <li>Violar os termos deste regulamento</li>
            </Bullets>
          </Section>

          <Section title="11. Casos omissos">
            <p>
              Os casos omissos neste regulamento serão decididos pela
              organização do Bolão (Baterias Joinville), de forma justa e
              razoável.
            </p>
          </Section>

          <Section title="12. Disposições finais">
            <Bullets>
              <li>
                A Baterias Joinville se reserva o direito de{" "}
                <strong>interromper, suspender ou modificar</strong> o Bolão
                por motivos de força maior, alteração no calendário da Copa
                pela FIFA, ou por necessidade operacional, comunicando
                previamente aos participantes via WhatsApp e/ou pelo site
              </li>
              <li>
                Em caso de cancelamento total do Bolão por força maior, o
                brinde cortesia não será devido
              </li>
              <li>
                Este regulamento entra em vigor na data de publicação e tem
                validade até 31/08/2026
              </li>
            </Bullets>
          </Section>

          <hr className="my-6 border-slate-200" />

          <div className="text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Baterias Joinville</p>
            <p>Rua Dona Francisca, 4523 — Santo Antônio</p>
            <p>Joinville/SC — Brasil</p>
            <p>WhatsApp: (47) 99680-1100</p>
            <p>www.bateriasjoinville.com.br</p>
          </div>
        </article>

        <footer className="bg-slate-50 px-4 py-5 text-center text-[11px] leading-relaxed text-slate-500">
          <p>
            <Link href="/" className="underline">
              ← Voltar pra home
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Sub({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

function Bullets({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
      {children}
    </ul>
  );
}
