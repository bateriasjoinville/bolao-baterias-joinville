import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { PlacaresBoard } from "@/components/admin/placares-board";
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
        <AdminNav
          current="placares"
          title="Admin · Placares"
          subtitle={`${finalizados} de ${matches.length} jogos finalizados`}
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-3">
          <RecalcButton />
          <Link
            href="/admin/mata-mata"
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            {confrontosPendentes > 0
              ? `${confrontosPendentes} confronto${confrontosPendentes === 1 ? "" : "s"} de mata-mata →`
              : "Mata-mata"}
          </Link>
          {pedidosPendentes > 0 ? (
            <Link
              href="/admin/pedidos-ajuda"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-600" />
              {pedidosPendentes} pedido{pedidosPendentes === 1 ? "" : "s"} pendente
              {pedidosPendentes === 1 ? "" : "s"}
            </Link>
          ) : null}
        </div>

        {matches.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-slate-500">
            Nenhum jogo cadastrado.
          </p>
        ) : (
          <PlacaresBoard
            matches={matches}
            serverNowISO={new Date().toISOString()}
          />
        )}
      </main>
    </div>
  );
}
