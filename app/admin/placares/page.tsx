import Link from "next/link";

import { PlacarRow } from "@/components/admin/placar-row";
import { RecalcButton } from "@/components/admin/recalc-button";
import { countPendentes } from "@/lib/admin/help-requests";
import { countConfrontosPendentes } from "@/lib/admin/mata-mata";
import { requireAdmin } from "@/lib/admin/session";
import { getAdminMatches } from "@/lib/admin/queries";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Placares — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPlacaresPage() {
  await requireAdmin();

  const admin = getSupabaseAdmin();
  const [matches, pedidosPendentes, confrontosPendentes] = await Promise.all([
    getAdminMatches(admin),
    countPendentes(admin),
    countConfrontosPendentes(admin),
  ]);

  const finalizados = matches.filter(
    (m) => m.placar_a != null && m.placar_b != null,
  ).length;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <header className="sticky top-0 z-10 bg-brand-blue px-4 py-4 text-white shadow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-extrabold">Admin · Placares</h1>
              <p className="text-xs opacity-90">
                {finalizados} de {matches.length} jogos finalizados
              </p>
              {pedidosPendentes > 0 ? (
                <Link
                  href="/admin/pedidos-ajuda"
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-2.5 py-0.5 text-[11px] font-bold text-brand-blue-dark hover:bg-brand-yellow-hover"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-red-600"
                  />
                  {pedidosPendentes} pedido
                  {pedidosPendentes === 1 ? "" : "s"} pendente
                  {pedidosPendentes === 1 ? "" : "s"} →
                </Link>
              ) : null}
              <Link
                href="/admin/mata-mata"
                className="mt-1.5 block text-[11px] font-semibold text-white underline underline-offset-2 opacity-90 hover:opacity-100"
              >
                {confrontosPendentes > 0
                  ? `${confrontosPendentes} confronto${confrontosPendentes === 1 ? "" : "s"} de mata-mata a definir →`
                  : "Definir confrontos do mata-mata →"}
              </Link>
            </div>
            <div className="flex items-start gap-2">
              <RecalcButton />
              <form action="/admin/sair" method="post">
                <button
                  type="submit"
                  className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="space-y-2 px-3 py-4">
          {matches.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Nenhum jogo cadastrado.
            </p>
          ) : (
            matches.map((m) => (
              <PlacarRow
                key={m.id}
                matchId={m.id}
                kickoffAt={m.kickoff_at}
                fase={m.fase}
                grupo={m.grupo}
                estadio={m.estadio}
                isBrasil={m.is_brasil}
                selecaoA={{
                  nome: m.selecao_a.nome,
                  codigoIso: m.selecao_a.codigo_iso,
                }}
                selecaoB={{
                  nome: m.selecao_b.nome,
                  codigoIso: m.selecao_b.codigo_iso,
                }}
                initialPlacarA={m.placar_a}
                initialPlacarB={m.placar_b}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
