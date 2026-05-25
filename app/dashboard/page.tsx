import { DashboardHeader } from "@/components/dashboard/header";
import { getDashboardData } from "@/lib/dashboard/queries";
import { createAuthedServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Bolão Copa 2026",
};

export default async function DashboardPage() {
  const supabase = await createAuthedServerClient();
  const data = await getDashboardData(supabase);

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <DashboardHeader nome={data.nome} />
        <section className="px-4 py-10 text-center">
          <p className="mb-3 text-4xl">🎯</p>
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            Bolão confirmado
          </h2>
          <p className="mx-auto max-w-xs text-sm leading-snug text-slate-600">
            Você palpita quando a janela abrir, 10 dias antes do 1º jogo, em
            11 de junho.
          </p>
        </section>
        <footer className="mt-auto bg-slate-50 px-4 py-5 text-center text-[11px] leading-relaxed text-slate-500">
          <p>Baterias Joinville · Rua Dona Francisca, 4523</p>
          <p>WhatsApp (47) 99680-1100</p>
          <p className="mt-1">
            <a href="/regulamento" className="underline">
              Regulamento
            </a>{" "}
            ·{" "}
            <a href="/privacidade" className="underline">
              Privacidade
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
