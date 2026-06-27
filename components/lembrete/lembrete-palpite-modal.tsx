"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "lembrete_palpite";
const INTERVALO_MS = 6 * 60 * 60 * 1000;

type Props = {
  titulo: string;
  mensagem: string;
  version: string;
};

type Visto = { v: string; t: number };

function leuRecente(version: string, agora: number): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const visto = JSON.parse(raw) as Visto;
    if (visto.v !== version) return false;
    return agora - visto.t < INTERVALO_MS;
  } catch {
    return false;
  }
}

function marcarVisto(version: string): void {
  try {
    const visto: Visto = { v: version, t: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visto));
  } catch {
    // localStorage indisponível (modo privado etc.) — só não persiste.
  }
}

export function LembretePalpiteModal({ titulo, mensagem, version }: Props) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/palpitar")) return;
    if (leuRecente(version, Date.now())) return;
    const id = setTimeout(() => setAberto(true), 0);
    return () => clearTimeout(id);
  }, [pathname, version]);

  function fechar() {
    marcarVisto(version);
    setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => (open ? null : fechar())}>
      <DialogContent
        showCloseButton={false}
        className="border-0 bg-white p-0 sm:max-w-sm"
      >
        <div className="h-1.5 w-full rounded-t-xl bg-brand-yellow" />
        <div className="px-5 pb-5 pt-3">
          <DialogTitle className="text-xl font-extrabold leading-tight text-brand-blue-dark">
            {titulo}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">
            {mensagem}
          </DialogDescription>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/palpitar"
              onClick={fechar}
              className="flex w-full items-center justify-center rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-hover"
            >
              Palpitar agora
            </Link>
            <button
              type="button"
              onClick={fechar}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Agora não
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
