"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ChamarAmigosBanner } from "@/components/share/chamar-amigos-banner";
import { detectarPlataforma, isStandalone } from "@/lib/pwa/detect";

const INSTALL_DISMISS_KEY = "pwa-install-dismiss";
const CHAMAR_DISMISS_KEY = "chamar-amigos-dismiss";
const FALLBACK_MS = 2000;

type Mode = "install" | "chamar" | "none";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function installDismissed(): boolean {
  return localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
}

function chamarDismissed(): boolean {
  return localStorage.getItem(CHAMAR_DISMISS_KEY) === "1";
}

function depoisDoInstall(): Mode {
  return chamarDismissed() ? "none" : "chamar";
}

// Decide o banner inicial sem flash: app instalado ou install já dispensado
// → vai direto pro "chamar"; iOS (sem beforeinstallprompt) mostra o install
// na hora; demais aguardam o evento no effect.
function modoInicial(): Mode {
  if (typeof window === "undefined") return "none";
  if (isStandalone()) return depoisDoInstall();
  if (installDismissed()) return depoisDoInstall();
  return detectarPlataforma() === "ios" ? "install" : "none";
}

export function BottomBanner() {
  const [mode, setMode] = useState<Mode>(modoInicial);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e: Event) => {
      if (installDismissed()) return;
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode((prev) => (prev === "none" ? "install" : prev));
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Sem prompt nativo (desktop/sem suporte) o slot ficaria vazio → cai
    // pro "chamar". Só age se o install ainda não assumiu o slot.
    const timer = setTimeout(() => {
      setMode((prev) =>
        prev === "none" ? (chamarDismissed() ? "none" : "chamar") : prev,
      );
    }, FALLBACK_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  function dismissInstall() {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    setMode(depoisDoInstall());
  }

  async function handleInstall() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      localStorage.setItem(INSTALL_DISMISS_KEY, "1");
      setMode(depoisDoInstall());
      return;
    }
    setShowIosHelp((v) => !v);
  }

  function dismissChamar() {
    localStorage.setItem(CHAMAR_DISMISS_KEY, "1");
    setMode("none");
  }

  if (mode === "none") return null;

  return (
    <div className="fixed inset-x-0 bottom-14 z-40 mx-auto max-w-md px-3 pb-2">
      {mode === "chamar" ? (
        <ChamarAmigosBanner onDismiss={dismissChamar} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.svg"
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg"
            />
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
              onClick={dismissInstall}
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
      )}
    </div>
  );
}
