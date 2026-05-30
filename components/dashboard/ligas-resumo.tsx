import Link from "next/link";

import {
  type LigaResumo,
  type LigaStats,
} from "@/lib/leagues/queries";

type Props = {
  ligas: LigaResumo[];
  stats: Map<string, LigaStats>;
};

export function LigasResumo({ ligas, stats }: Props) {
  if (ligas.length === 0) {
    return (
      <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Minhas ligas
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Crie uma liga ou entre na de alguém pra competir com amigos.
        </p>
        <div className="mt-3 space-y-2">
          <Link
            href="/ligas/criar"
            className="block rounded-md bg-brand-blue py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
          >
            Criar liga
          </Link>
          <Link
            href="/ligas/entrar"
            className="block rounded-md border border-slate-300 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Entrar em liga
          </Link>
        </div>
      </section>
    );
  }

  const ordenadas = [...ligas].sort((a, b) => {
    const rank = (l: LigaResumo) =>
      l.meuPapel === "owner" ? 0 : l.meuPapel === "aprovado" ? 1 : 2;
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
  const visiveis = ordenadas.slice(0, 3);

  return (
    <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Minhas ligas
      </p>

      <ul className="mt-3 space-y-2">
        {visiveis.map((l) => {
          const pendentes =
            l.meuPapel === "owner"
              ? (stats.get(l.id)?.countPendentes ?? 0)
              : 0;
          return (
            <li key={l.id}>
              <Link
                href={`/ligas/${l.id}`}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {l.nome}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {labelPapel(l.meuPapel)}
                  </p>
                </div>
                {pendentes > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {pendentes} pendente{pendentes === 1 ? "" : "s"}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/ligas"
        className="mt-3 block w-full rounded-md bg-slate-100 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
      >
        Ver todas as ligas
        {ordenadas.length > 3 ? ` (${ordenadas.length})` : ""}
      </Link>
    </section>
  );
}

function labelPapel(p: LigaResumo["meuPapel"]): string {
  if (p === "owner") return "Organizador";
  if (p === "aprovado") return "Membro";
  return "Aguardando aprovação";
}
