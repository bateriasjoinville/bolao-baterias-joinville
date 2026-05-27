import Link from "next/link";

import { PedidoAjudaRow } from "@/components/admin/pedido-ajuda-row";
import {
  listHelpRequests,
  type HelpRequestStatus,
} from "@/lib/admin/help-requests";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Pedidos de ajuda — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

function parseStatus(s: string | undefined): HelpRequestStatus {
  return s === "resolvido" ? "resolvido" : "pendente";
}

export default async function AdminPedidosAjudaPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const status = parseStatus(params.status);

  const admin = getSupabaseAdmin();
  const pedidos = await listHelpRequests(admin, status);

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <header className="sticky top-0 z-10 bg-brand-blue px-4 py-4 text-white shadow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-extrabold">Admin · Pedidos de ajuda</h1>
              <p className="text-xs opacity-90">
                {pedidos.length}{" "}
                {status === "pendente" ? "pendente" : "resolvido"}
                {pedidos.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Link
                href="/admin/placares"
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Placares
              </Link>
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

        <nav
          aria-label="Filtro de status"
          className="flex gap-2 border-b border-slate-200 bg-white px-3 py-3"
        >
          <Link
            href="/admin/pedidos-ajuda"
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
              status === "pendente"
                ? "bg-brand-blue text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Pendentes
          </Link>
          <Link
            href="/admin/pedidos-ajuda?status=resolvido"
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
              status === "resolvido"
                ? "bg-brand-blue text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Resolvidos
          </Link>
        </nav>

        <section className="space-y-3 px-3 py-4">
          {pedidos.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {status === "pendente"
                ? "Nenhum pedido pendente."
                : "Nenhum pedido resolvido ainda."}
            </p>
          ) : (
            pedidos.map((p) => <PedidoAjudaRow key={p.id} pedido={p} />)
          )}
        </section>
      </main>
    </div>
  );
}
