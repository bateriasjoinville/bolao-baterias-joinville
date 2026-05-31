"use client";

import { useState } from "react";

import { detectarPlataforma, isStandalone } from "@/lib/pwa/detect";

const DISMISS_KEY = "pwa-a2hs-card-dismiss";

function deveMostrar(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalone()) return false;
  return localStorage.getItem(DISMISS_KEY) !== "1";
}

export function AddToHomeCard() {
  const [show, setShow] = useState(deveMostrar);
  const [plataforma] = useState(detectarPlataforma);

  if (!show) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  return (
    <section className="mx-4 mt-4 rounded-lg border-2 border-brand-yellow bg-brand-yellow-soft p-4">
      <p className="text-sm font-extrabold text-brand-blue-dark">
        Não perca nenhum jogo!
      </p>
      <p className="mt-1 text-xs text-slate-700">
        Salva o bolão na tela inicial e abre num toque, igual um app.
      </p>

      <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-slate-700">
        {plataforma === "ios" ? (
          <p>
            <strong>iPhone:</strong> toque em <strong>Compartilhar</strong> →{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </p>
        ) : plataforma === "android" ? (
          <p>
            <strong>Android:</strong> toque no menu <strong>⋮</strong> →{" "}
            <strong>Adicionar à tela inicial</strong>.
          </p>
        ) : (
          <>
            <p>
              <strong>iPhone:</strong> Compartilhar → Adicionar à Tela de
              Início.
            </p>
            <p className="mt-1">
              <strong>Android:</strong> menu ⋮ → Adicionar à tela inicial.
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="mt-2 text-xs font-semibold text-brand-blue hover:underline"
      >
        Já fiz / não quero
      </button>
    </section>
  );
}
