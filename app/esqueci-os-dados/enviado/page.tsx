import Link from "next/link";

import { TopBar } from "@/components/home/top-bar";

export const metadata = {
  title: "Pedido enviado — Bolão Copa 2026",
  robots: { index: false, follow: false },
};

export default function EnviadoPage() {
  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <TopBar />
        <section className="bg-brand-blue px-4 py-6 text-white">
          <h1 className="text-2xl font-extrabold">Pedido enviado</h1>
        </section>
        <div className="px-4 py-6">
          <div
            role="status"
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-slate-800"
          >
            <p className="font-semibold">
              Recebemos sua mensagem.
            </p>
            <p className="mt-1">
              Vamos retornar pelo WhatsApp em até 2 dias úteis.
            </p>
          </div>
          <Link
            href="/"
            className="mt-6 block w-full rounded-xl bg-brand-yellow py-4 text-center text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
          >
            Voltar pro início
          </Link>
        </div>
      </main>
    </div>
  );
}
