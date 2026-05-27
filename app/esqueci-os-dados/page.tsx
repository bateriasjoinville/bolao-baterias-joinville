import { HelpRequestForm } from "@/components/esqueci-os-dados/form";
import { TopBar } from "@/components/home/top-bar";

export const metadata = {
  title: "Esqueci os dados — Bolão Copa 2026",
  description: "Não consegue acessar? A gente recupera seu cadastro.",
  robots: { index: false, follow: false },
};

export default function EsqueciOsDadosPage() {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <TopBar />
        <section className="bg-brand-blue px-4 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Esqueci os dados</h1>
          <p className="mt-1 text-sm opacity-90">
            Conta o que aconteceu que a gente recupera teu acesso.
          </p>
        </section>
        <HelpRequestForm turnstileSiteKey={turnstileSiteKey} />
      </main>
    </div>
  );
}
