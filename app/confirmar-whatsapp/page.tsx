import { redirect } from "next/navigation";

import { formatWhatsApp } from "@/lib/format";
import { getSession } from "@/lib/session";
import { createAuthedServerClient } from "@/lib/supabase/server";

import { confirmarWhatsapp } from "./actions";
import { EditarWhatsappForm } from "./editar-form";

export const metadata = {
  title: "Confere teu WhatsApp — Bolão Copa 2026",
};

type SearchParams = Promise<{ editar?: string | string[] }>;

export default async function ConfirmarWhatsappPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createAuthedServerClient();
  const session = await getSession();

  const { data: participant } = await supabase
    .from("participants")
    .select("whatsapp, whatsapp_confirmed_at")
    .eq("id", session.participantId!)
    .maybeSingle();

  if (!participant) redirect("/entrar");
  if (participant.whatsapp_confirmed_at) redirect("/dashboard");

  const { editar } = await searchParams;
  const isEdit = editar === "1";

  if (isEdit) {
    return (
      <div className="min-h-screen bg-slate-200">
        <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
          <section className="bg-brand-blue px-4 py-6 text-white">
            <h1 className="text-2xl font-extrabold">Corrige teu WhatsApp</h1>
            <p className="mt-1 text-sm opacity-90">
              Digita o número certo abaixo.
            </p>
          </section>
          <EditarWhatsappForm defaultValue={participant.whatsapp} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <section className="bg-brand-blue px-4 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Confere teu WhatsApp</h1>
          <p className="mt-1 text-sm opacity-90">
            É por aqui que você entra no bolão e recebe o ranking. Se tiver
            errado, você fica de fora.
          </p>
        </section>

        <section className="px-4 py-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              {formatWhatsApp(participant.whatsapp)}
            </p>
          </div>

          <form action={confirmarWhatsapp} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
            >
              Tá certo →
            </button>
          </form>

          <a
            href="/confirmar-whatsapp?editar=1"
            className="mt-3 block py-3 text-center text-sm font-semibold text-brand-blue underline"
          >
            Corrigir número
          </a>
        </section>
      </main>
    </div>
  );
}
