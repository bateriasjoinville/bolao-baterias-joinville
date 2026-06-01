import Link from "next/link";

export const metadata = {
  title: "Como funciona — Bolão Copa 2026",
  description:
    "Como funciona o Bolão da Copa 2026 da Baterias Joinville: palpite os jogos, ganhe pontos e suba no ranking.",
};

export default function ComoFuncionaPage() {
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
            Como funciona o bolão
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            É grátis, rapidinho e dá pra disputar com a galera. Veja em 3 passos.
          </p>

          <Passo numero={1} titulo="Palpite os jogos">
            <p>
              Você dá o placar de cada jogo da Copa. Pode editar o palpite{" "}
              <strong>até 1 hora antes</strong> de cada partida começar — depois
              disso ele <strong>trava</strong> e não muda mais.
            </p>
            <p className="mt-2">
              Não palpitou até o prazo? O jogo fica com 0 pontos, mas você segue
              na disputa nos próximos.
            </p>
          </Passo>

          <Passo numero={2} titulo="Ganhe pontos">
            <p>Cada jogo vale pontos conforme seu acerto:</p>
            <table className="mt-3 w-full border-collapse text-sm">
              <tbody>
                <LinhaPontos
                  descricao="Placar exato"
                  pontos="6 pts"
                  destaque
                />
                <LinhaPontos
                  descricao="Acertou só o vencedor (ou o empate)"
                  pontos="3 pts"
                />
                <LinhaPontos descricao="Errou ou não palpitou" pontos="0 pts" />
              </tbody>
            </table>
            <p className="mt-3 rounded-md bg-brand-yellow px-3 py-2 text-sm font-bold text-brand-blue-dark">
              🇧🇷 Jogos do Brasil valem o dobro: placar exato = 12 pts, vencedor =
              6 pts.
            </p>
          </Passo>

          <Passo numero={3} titulo="Suba no ranking">
            <p>
              Seus pontos vão somando durante toda a Copa. Acompanhe sua posição
              no ranking e dispute com a galera.
            </p>
            <p className="mt-2">
              Quer uma disputa mais particular? <strong>Crie uma liga</strong> e
              chame seus amigos — vocês competem num ranking só de vocês.
            </p>
          </Passo>

          <hr className="my-6 border-slate-200" />

          <p className="text-xs text-slate-500">
            Regras completas no{" "}
            <Link href="/regulamento" className="underline">
              regulamento oficial
            </Link>
            .
          </p>
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

function Passo({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-extrabold text-white">
          {numero}
        </span>
        <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
      </div>
      <div className="mt-2 space-y-1 pl-11 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function LinhaPontos({
  descricao,
  pontos,
  destaque,
}: {
  descricao: string;
  pontos: string;
  destaque?: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-2 pr-3 text-slate-700">{descricao}</td>
      <td
        className={`py-2 text-right font-extrabold ${
          destaque ? "text-brand-green" : "text-slate-900"
        }`}
      >
        {pontos}
      </td>
    </tr>
  );
}
