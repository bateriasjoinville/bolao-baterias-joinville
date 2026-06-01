import Link from "next/link";

import { CadastradosLista } from "@/components/admin/cadastrados-lista";
import { PAGE_SIZE, listParticipants } from "@/lib/admin/participants";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Cadastrados — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCadastradosPage() {
  await requireAdmin();

  const admin = getSupabaseAdmin();
  const { rows, total } = await listParticipants(admin, {
    limit: PAGE_SIZE,
    offset: 0,
  });

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <header className="sticky top-0 z-10 bg-brand-blue px-4 py-4 text-white shadow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-extrabold">Admin · Cadastrados</h1>
              <p className="text-xs opacity-90">
                {total} inscrito{total === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Link
                href="/admin/placares"
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Placares
              </Link>
              <Link
                href="/admin/pedidos-ajuda"
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Pedidos
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
          <a
            href="/admin/cadastrados/export"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-3 py-1.5 text-xs font-bold text-brand-blue-dark hover:bg-brand-yellow-hover"
          >
            ⬇ Exportar CSV
          </a>
        </header>

        <CadastradosLista initialRows={rows} total={total} />
      </main>
    </div>
  );
}
