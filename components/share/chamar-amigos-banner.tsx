"use client";

import { Share2, Users, X } from "lucide-react";

import { CHAMAR_AMIGOS_TEXT } from "@/lib/share/messages";

export function ChamarAmigosBanner({ onDismiss }: { onDismiss: () => void }) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: CHAMAR_AMIGOS_TEXT });
        return;
      } catch {
        // usuário cancelou ou share indisponível → não força fallback
        return;
      }
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(CHAMAR_AMIGOS_TEXT)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Chama a galera!
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Convida os amigos pro bolão e monte sua liga.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar"
          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
      >
        <Share2 className="h-4 w-4" />
        Chamar amigos
      </button>
    </div>
  );
}
