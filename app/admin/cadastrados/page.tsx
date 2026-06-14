import { AdminNav } from "@/components/admin/admin-nav";
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
        <AdminNav
          current="cadastrados"
          title="Admin · Cadastrados"
          subtitle={`${total} inscrito${total === 1 ? "" : "s"}`}
        />
        <div className="border-b border-slate-200 bg-white px-3 py-3">
          {/* Route handler de download (CSV), não uma página — <a> é intencional.
              O segmento [id] faz a regra de pages disparar falso-positivo aqui. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/admin/cadastrados/export"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow px-3 py-1.5 text-xs font-bold text-brand-blue-dark hover:bg-brand-yellow-hover"
          >
            ⬇ Exportar CSV
          </a>
        </div>

        <CadastradosLista initialRows={rows} total={total} />
      </main>
    </div>
  );
}
