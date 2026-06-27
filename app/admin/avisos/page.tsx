import { AdminNav } from "@/components/admin/admin-nav";
import { AvisosForm } from "@/components/admin/avisos-form";
import { requireAdmin } from "@/lib/admin/session";
import { getPopupLembrete } from "@/lib/config/app-config";

export const metadata = {
  title: "Avisos — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAvisosPage() {
  await requireAdmin();

  const config = await getPopupLembrete();

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <AdminNav
          current="avisos"
          title="Admin · Avisos"
          subtitle="Pop-up de lembrete pra palpitar"
        />
        <AvisosForm
          initial={{
            enabled: config.enabled,
            titulo: config.titulo,
            mensagem: config.mensagem,
          }}
        />
      </main>
    </div>
  );
}
