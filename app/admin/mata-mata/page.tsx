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

        <section className="space-y-2 px-3 py-4">
          {confrontos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Todos os confrontos do mata-mata já estão definidos.
            </p>
          ) : (
            confrontos.map((c) => (
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
            ))
          )}
        </section>
      </main>
    </div>
  );
}
