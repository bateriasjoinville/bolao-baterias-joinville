"use client";

import { Check, Copy, ImageDown } from "lucide-react";
import { useState } from "react";

export function InstagramTools({ ats }: { ats: string }) {
  const [copied, setCopied] = useState(false);

  async function copiar() {
    if (!ats) return;
    try {
      await navigator.clipboard.writeText(ats);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem clipboard API (HTTP/browser antigo) → fallback silencioso
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href="/admin/instagram/image"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-yellow px-4 py-3 text-sm font-extrabold text-brand-blue-dark shadow-sm hover:bg-brand-yellow-hover"
        >
          <ImageDown className="h-5 w-5" />
          Gerar imagem · Feed (4:5)
        </a>
        <a
          href="/admin/instagram/image?formato=stories"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-yellow px-4 py-3 text-sm font-extrabold text-brand-blue-dark shadow-sm hover:bg-brand-yellow-hover"
        >
          <ImageDown className="h-5 w-5" />
          Gerar imagem · Stories (9:16)
        </a>
      </div>

      <button
        type="button"
        onClick={copiar}
        disabled={!ats}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {copied ? (
          <Check className="h-5 w-5 text-emerald-600" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
        {copied ? "Copiado!" : "Copiar @s do Top 10"}
      </button>
    </div>
  );
}
