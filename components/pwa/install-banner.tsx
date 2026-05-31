"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { detectarPlataforma, isStandalone } from "@/lib/pwa/detect";

const DISMISS_KEY = "pwa-install-dismiss";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function elegivel(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalone()) return false;
  return localStorage.getItem(DISMISS_KEY) !== "1";
}

// iOS não dispara beforeinstallprompt → decide a visibilidade inicial aqui
// (no init do state, fora do effect) pra mostrar a instrução manual.
function visivelInicial(): boolean {
  return elegivel() && detectarPlataforma() === "ios";
}

export function InstallBanner() {
  const [visible, setVisible] = useState(visivelInicial);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (!elegivel()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      dismiss();
      return;
    }
    // iOS: sem prompt nativo, abre instrução curta.
    setShowIosHelp((v) => !v);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-14 z-40 mx-auto max-w-md px-3 pb-2">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Adicione o bolão à tela inicial
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Fica igual um app, abre num toque.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showIosHelp ? (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Toque em <strong>Compartilhar</strong> e depois em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleInstall}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
        >
          <Download className="h-4 w-4" />
          {deferred ? "Instalar" : "Como adicionar"}
        </button>
      </div>
    </div>
  );
}
