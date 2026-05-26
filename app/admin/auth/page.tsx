import { redirect } from "next/navigation";

import { AdminAuthForm } from "@/components/admin/auth-form";
import { getAdminSession } from "@/lib/admin/session";

export const metadata = {
  title: "Admin — Bolão Copa 2026",
  robots: { index: false, follow: false },
};

export default async function AdminAuthPage() {
  const session = await getAdminSession();
  if (session.isAdmin) redirect("/admin/placares");

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <section className="bg-brand-blue px-4 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Admin</h1>
          <p className="mt-1 text-sm opacity-90">
            Área restrita. Informe o token compartilhado.
          </p>
        </section>
        <AdminAuthForm />
      </main>
    </div>
  );
}
