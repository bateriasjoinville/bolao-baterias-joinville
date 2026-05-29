import Link from "next/link";

import { CriarLigaForm } from "./criar-form";

export const metadata = {
  title: "Criar liga — Bolão Copa 2026",
};

export default function CriarLigaPage() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-brand-blue px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Voltar pro Dashboard"
            className="text-sm font-semibold opacity-90"
          >
            ←
          </Link>
          <p className="text-sm font-semibold">Criar liga</p>
        </div>
        <p className="mt-1 text-xs opacity-85">
          Você vira o organizador. Depois compartilha o código de convite com a
          galera.
        </p>
      </header>

      <CriarLigaForm />
    </>
  );
}
