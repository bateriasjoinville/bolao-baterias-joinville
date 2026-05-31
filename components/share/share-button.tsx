"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

type ShareButtonProps = {
  // Caminho da imagem PNG já com querystring, ex: "/share/palpite?a=..."
  imagePath: string;
  // Texto que acompanha o compartilhamento.
  texto: string;
  label?: string;
};

export function ShareButton({
  imagePath,
  texto,
  label = "Compartilhar",
}: ShareButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    try {
      const origin = window.location.origin;
      const imageUrl = `${origin}${imagePath}`;

      // 1) Web Share com arquivo (Android/iOS modernos): compartilha o PNG.
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], "bolao.png", { type: "image/png" });
        const navAny = navigator as Navigator & {
          canShare?: (d: { files: File[] }) => boolean;
        };
        if (navAny.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: texto });
          return;
        }
      } catch {
        // cai pros fallbacks
      }

      // 2) Web Share só com texto/link.
      if (navigator.share) {
        await navigator.share({ text: `${texto} ${imageUrl}` });
        return;
      }

      // 3) Fallback final: abre WhatsApp com texto + link da imagem.
      const wa = `https://wa.me/?text=${encodeURIComponent(`${texto} ${imageUrl}`)}`;
      window.open(wa, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
    >
      <Share2 className="h-4 w-4" />
      {busy ? "Preparando..." : label}
    </button>
  );
}
