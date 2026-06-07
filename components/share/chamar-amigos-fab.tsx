"use client";

import { Share2 } from "lucide-react";

import { compartilharChamarAmigos } from "@/lib/share/chamar";

export function ChamarAmigosFab({
  aboveTabBar = false,
}: {
  aboveTabBar?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-30 mx-auto flex max-w-md justify-end px-3 ${
        aboveTabBar ? "bottom-[68px]" : "bottom-4"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          void compartilharChamarAmigos();
        }}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-blue-hover"
      >
        <Share2 className="h-4 w-4" />
        Chamar amigos
      </button>
    </div>
  );
}
