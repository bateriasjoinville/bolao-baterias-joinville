import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { ConfrontoMini } from "@/components/admin/confronto-mini";
import { getPalpitesPorJogo } from "@/lib/admin/predictions";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Palpites do jogo — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ matchId: string }>;
};

export default async function AdminPalpitesJogoPage({ params }: PageProps) {
  await requireAdmin();

  const { matchId } = await params;
  const id = Number(matchId);
  if (!Number.isInteger(id)) notFound();

  const admin = getSupabaseAdmin();
  const data = await getPalpitesPorJogo(admin, id, new Date().toISOString());
  if (!data) notFound();

  const { match } = data;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <AdminNav
          current="placares"
          title="Admin · Palpites do jogo"
          subtitle={`${match.selecaoA.nome} × ${match.selecaoB.nome}`}
        />

        <div className="border-b border-slate-200 bg-white px-3 py-3">
          <Link
            href="/admin/placares"
            className="text-xs font-medium text-brand-blue hover:underline"
          >
            ← Voltar pros placares
          </Link>
        </div>

        <div className="space-y-4 px-3 py-4">
          <ConfrontoMini match={match} />

          {!data.locked ? (
            <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-6 text-center text-sm font-medium text-amber-800">
              🔒 Jogo ainda aberto. Os palpites ficam ocultos até 1h antes do
              início — a mesma proteção que impede ver o palpite alheio.
            </p>
          ) : data.total === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Ninguém palpitou esse jogo.
            </p>
          ) : (
            <>
              <section>
                <h2 className="mb-2 px-1 text-sm font-extrabold text-slate-800">
                  Cravaram esse placar
                </h2>
                <ul className="space-y-1.5">
                  {data.contagem.map((c) => (
                    <li
                      key={`${c.placarA}-${c.placarB}`}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                    >
                      <span className="font-bold text-slate-900">
                        {c.placarA} × {c.placarB}
                      </span>
                      <span className="font-semibold text-slate-600">
                        {c.total}{" "}
                        {c.total === 1 ? "pessoa" : "pessoas"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-2 px-1 text-sm font-extrabold text-slate-800">
                  {data.total} {data.total === 1 ? "palpite" : "palpites"}
                </h2>
                <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {data.palpites.map((p) => (
                    <li
                      key={p.participantId}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <Link
                        href={`/admin/cadastrados/${p.participantId}`}
                        className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-blue hover:underline"
                      >
                        {p.nome}
                      </Link>
                      <span className="shrink-0 font-mono text-sm font-bold text-slate-900">
                        {p.placarA} × {p.placarB}
                      </span>
                      {p.pontos != null ? (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            p.exato
                              ? "bg-emerald-100 text-emerald-700"
                              : p.pontos > 0
                                ? "bg-blue-100 text-brand-blue"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.exato ? "Cravou! " : ""}
                          {p.pontos} pts
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
