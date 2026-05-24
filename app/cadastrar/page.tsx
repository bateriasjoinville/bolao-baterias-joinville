import { CadastroForm } from "@/components/cadastro/form";
import { TopBar } from "@/components/home/top-bar";

export const metadata = {
  title: "Cadastro — Bolão Copa 2026",
  description: "Cadastro grátis no Bolão da Copa 2026. Leva 2 minutos.",
};

export default function CadastrarPage() {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <TopBar />
        <section className="bg-brand-blue px-4 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Cadastro grátis</h1>
          <p className="mt-1 text-sm opacity-90">
            Leva uns 2 minutos. Sem pegadinha, sem pagar nada.
          </p>
        </section>
        <CadastroForm turnstileSiteKey={turnstileSiteKey} />
        <footer className="bg-slate-50 px-4 py-5 text-center text-[11px] leading-relaxed text-slate-500">
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
