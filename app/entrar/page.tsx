import { redirect } from "next/navigation";

import { ConviteBanner } from "@/components/entrar/convite-banner";
import { LoginForm } from "@/components/entrar/form";
import { TopBar } from "@/components/home/top-bar";
import { parseConvite } from "@/lib/leagues/entrar";
import { getLigaPorCodigo } from "@/lib/leagues/queries";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Entrar — Bolão Copa 2026",
  description: "Entrar no Bolão da Copa 2026 com CPF e WhatsApp.",
};

type EntrarPageProps = {
  searchParams: Promise<{ cpf?: string; convite?: string }>;
};

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const session = await getSession();
  if (session.participantId) redirect("/dashboard");

  const params = await searchParams;
  const cpfInicial = params.cpf ?? null;

  const convite = parseConvite(params.convite);
  const ligaConvite = convite
    ? await getLigaPorCodigo(getSupabaseAdmin(), convite)
    : null;

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <TopBar />
        <section className="bg-brand-blue px-4 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Entrar</h1>
          <p className="mt-1 text-sm opacity-90">
            Sem senha. Só CPF e WhatsApp.
          </p>
        </section>
        {ligaConvite ? <ConviteBanner nomeLiga={ligaConvite.nome} /> : null}
        <LoginForm
          turnstileSiteKey={turnstileSiteKey}
          cpfInicial={cpfInicial}
          convite={ligaConvite ? convite : null}
        />
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
