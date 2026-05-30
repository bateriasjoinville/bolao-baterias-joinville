import Link from "next/link";

import { BuscaLigas } from "./busca";
import { EntrarForm } from "./entrar-form";

export const metadata = {
  title: "Entrar em liga — Bolão Copa 2026",
};

export default function EntrarPage() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-brand-blue px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/ligas"
            aria-label="Voltar pra Minhas ligas"
            className="text-sm font-semibold opacity-90"
          >
            ←
          </Link>
          <p className="text-sm font-semibold">Entrar em liga</p>
        </div>
        <p className="mt-1 text-xs opacity-85">
          Busca pelo nome ou usa o código de convite.
        </p>
      </header>

      <section className="px-4 py-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Buscar por nome
        </p>
        <BuscaLigas />
      </section>

      <section className="border-t border-slate-200">
        <p className="px-4 pt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Tenho um código
        </p>
        <EntrarForm />
      </section>
    </>
  );
}
