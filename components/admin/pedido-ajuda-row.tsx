"use client";

import { useTransition } from "react";

import { marcarResolvido } from "@/app/admin/pedidos-ajuda/actions";
import { type HelpRequestRow } from "@/lib/admin/help-requests";

type PedidoAjudaRowProps = {
  pedido: HelpRequestRow;
};

function formatarCpfParcial(parcial: string | null): string {
  if (!parcial) return "CPF não informado";
  return `···.···.···-${parcial}`;
}

function formatarWhatsappParcial(parcial: string | null): string {
  if (!parcial) return "WhatsApp não informado";
  const ddd = parcial.slice(0, 2);
  const ultimos = parcial.slice(2);
  return `(${ddd}) ···· ${ultimos}`;
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PedidoAjudaRow({ pedido }: PedidoAjudaRowProps) {
  const [pending, startTransition] = useTransition();

  const handleResolver = () => {
    startTransition(async () => {
      const res = await marcarResolvido({ id: pedido.id });
      if (!res.ok) {
        alert(`Erro: ${res.error}`);
      }
    });
  };

  const isResolvido = pedido.status === "resolvido";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          {pedido.nome}
        </h2>
        <span className="shrink-0 text-xs text-slate-500">
          {formatarDataHora(pedido.created_at)}
        </span>
      </header>

      <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-slate-500">CPF: </dt>
          <dd className="inline font-mono">
            {formatarCpfParcial(pedido.cpf_parcial)}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">WhatsApp: </dt>
          <dd className="inline font-mono">
            {formatarWhatsappParcial(pedido.whatsapp_parcial)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
        {pedido.mensagem}
      </p>

      {isResolvido ? (
        <p className="mt-3 text-xs font-medium text-emerald-700">
          ✓ Resolvido
          {pedido.resolved_at
            ? ` em ${formatarDataHora(pedido.resolved_at)}`
            : ""}
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResolver}
          disabled={pending}
          className="mt-3 w-full rounded-lg bg-brand-yellow py-2.5 text-sm font-bold text-brand-blue-dark transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Marcar como resolvido"}
        </button>
      )}
    </article>
  );
}
