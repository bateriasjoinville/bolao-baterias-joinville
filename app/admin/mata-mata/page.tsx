import Link from "next/link";

import { ConfrontoRow } from "@/components/admin/confronto-row";
import { getConfrontosPendentes } from "@/lib/admin/mata-mata";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Mata-mata — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FASE_ORDEM = [
  "r32",
  "oitavas",
  "quartas",
  "semifinais",
  "terceiro",
  "final",
] as const;

const FASE_TITULO: Record<string, string> = {
  r32: "32-avos de final",
  oitavas: "Oitavas de final",
  quartas: "Quartas de final",
  semifinais: "Semifinal",
  terceiro: "Disputa de 3º lugar",
  final: "Final",
};

export default async function AdminMataMataPage() {
  await requireAdmin();

  const admin = getSupabaseAdmin();
  const { confrontos, selecoes } = await getConfrontosPendentes(admin);

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <header className="sticky top-0 z-10 bg-brand-blue px-4 py-4 text-white shadow">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/placares"
              aria-label="Voltar pros placares"
              className="text-sm font-semibold opacity-90"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-extrabold">Admin · Mata-mata</h1>
              <p className="text-xs opacity-90">
                {confrontos.length}{" "}
                {confrontos.length === 1
                  ? "confronto a definir"
                  : "confrontos a definir"}
              </p>
            </div>
          </div>
        </header>

        <div className="px-3 py-4">
          {confrontos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Todos os confrontos do mata-mata já estão definidos.
            </p>
          ) : (
            FASE_ORDEM.map((fase) => {
              const doFase = confrontos.filter((c) => c.fase === fase);
              if (doFase.length === 0) return null;
              return (
                <section key={fase} className="mb-6">
                  <h2 className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-sm font-extrabold text-slate-800">
                      {FASE_TITULO[fase]}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {doFase.length}{" "}
                      {doFase.length === 1 ? "jogo" : "jogos"}
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {doFase.map((c) => (
                      <ConfrontoRow
                        key={c.id}
                        matchId={c.id}
                        fase={c.fase}
                        kickoffAt={c.kickoffAt}
                        estadio={c.estadio}
                        isBrasil={c.isBrasil}
                        ladoA={c.ladoA}
                        ladoB={c.ladoB}
                        todasSelecoes={selecoes}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
