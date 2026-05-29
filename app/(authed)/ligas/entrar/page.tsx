import Link from "next/link";

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
          Cole o código que o organizador da liga te mandou.
        </p>
      </header>

      <EntrarForm />
    </>
  );
}
