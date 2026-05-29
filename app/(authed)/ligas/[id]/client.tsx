"use client";

import { Check, Copy, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  apagarLiga,
  aprovarMembro,
  recusarMembro,
  removerMembro,
  sairDaLiga,
} from "../actions";

export function CopyCodeButton({ codigo }: { codigo: string }) {
  const [copied, setCopied] = useState(false);

  async function handle() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem clipboard API (HTTP, browser antigo) → fallback silencioso
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
    >
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span>{copied ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

export function MembroPendenteActions({
  ligaId,
  participantId,
}: {
  ligaId: string;
  participantId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function aprovar() {
    startTransition(async () => {
      const r = await aprovarMembro({ ligaId, participantId });
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.refresh();
    });
  }

  function recusar() {
    startTransition(async () => {
      const r = await recusarMembro({ ligaId, participantId });
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={aprovar}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md bg-brand-blue px-2 py-1 text-xs font-semibold text-white hover:bg-brand-blue-hover disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        Aprovar
      </button>
      <button
        type="button"
        onClick={recusar}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-60"
      >
        <X className="h-3 w-3" />
        Recusar
      </button>
    </div>
  );
}

export function RemoverMembroButton({
  ligaId,
  participantId,
  nome,
}: {
  ligaId: string;
  participantId: string;
  nome: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handle() {
    if (!confirm(`Remover ${nome} da liga?`)) return;
    startTransition(async () => {
      const r = await removerMembro({ ligaId, participantId });
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="text-xs font-medium text-red-600 underline hover:text-red-700 disabled:opacity-60"
    >
      Remover
    </button>
  );
}

export function SairButton({ ligaId }: { ligaId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handle() {
    if (!confirm("Sair desta liga?")) return;
    startTransition(async () => {
      const r = await sairDaLiga({ ligaId });
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.push("/ligas");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="block w-full rounded-md border border-slate-300 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? "Saindo..." : "Sair da liga"}
    </button>
  );
}

export function ApagarButton({ ligaId }: { ligaId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handle() {
    if (
      !confirm(
        "Apagar a liga? Os membros perdem acesso. Essa ação não pode ser desfeita.",
      )
    )
      return;
    startTransition(async () => {
      const r = await apagarLiga({ ligaId });
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.push("/ligas");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="block w-full rounded-md border border-red-300 bg-white py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Apagando..." : "Apagar liga"}
    </button>
  );
}
