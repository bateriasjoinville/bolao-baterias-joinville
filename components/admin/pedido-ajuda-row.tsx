"use client";

import { useState, useTransition } from "react";

import {
  buscarCadastros,
  marcarResolvido,
  type CadastroEncontrado,
} from "@/app/admin/pedidos-ajuda/actions";
import { CadastroCard } from "@/components/admin/cadastro-card";
import { formatCPF, formatWhatsApp } from "@/lib/format";
import { type HelpRequestRow } from "@/lib/admin/help-requests";

type PedidoAjudaRowProps = {
  pedido: HelpRequestRow;
};

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

type BuscaState = {
  resultados: CadastroEncontrado[] | null;
  erro: string | null;
};

export function PedidoAjudaRow({ pedido }: PedidoAjudaRowProps) {
  const [pending, startTransition] = useTransition();
  const [buscando, startBusca] = useTransition();
  const [busca, setBusca] = useState<BuscaState>({
    resultados: null,
    erro: null,
  });

  const handleResolver = () => {
    startTransition(async () => {
      const res = await marcarResolvido({ id: pedido.id });
      if (!res.ok) {
        alert(`Erro: ${res.error}`);
      }
    });
  };

  const handleBuscar = () => {
    if (busca.resultados !== null) {
      setBusca({ resultados: null, erro: null });
      return;
    }
    startBusca(async () => {
      const res = await buscarCadastros({ helpRequestId: pedido.id });
      if (res.ok) {
        setBusca({ resultados: res.resultados, erro: null });
      } else {
        setBusca({ resultados: null, erro: res.error });
      }
    });
  };

  const isResolvido = pedido.status === "resolvido";
  const mostrandoResultados = busca.resultados !== null;

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
            {pedido.cpf ? formatCPF(pedido.cpf) : "CPF não informado"}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">WhatsApp: </dt>
          <dd className="inline font-mono">
            {pedido.whatsapp ? formatWhatsApp(pedido.whatsapp) : "WhatsApp não informado"}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
        {pedido.mensagem}
      </p>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={handleBuscar}
          disabled={buscando}
          className="w-full rounded-lg border border-brand-blue bg-white py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:opacity-60"
        >
          {buscando
            ? "Buscando..."
            : mostrandoResultados
              ? "Esconder cadastros"
              : "Buscar em cadastros"}
        </button>

        {busca.erro ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
          >
            {busca.erro}
          </p>
        ) : null}

        {mostrandoResultados ? (
          <ResultadosBusca resultados={busca.resultados ?? []} />
        ) : null}

        {isResolvido ? (
          <p className="text-xs font-medium text-emerald-700">
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
            className="w-full rounded-lg bg-brand-yellow py-2.5 text-sm font-bold text-brand-blue-dark transition-transform active:scale-[0.98] hover:bg-brand-yellow-hover disabled:opacity-60"
          >
            {pending ? "Salvando..." : "Marcar como resolvido"}
          </button>
        )}
      </div>
    </article>
  );
}

type ResultadosBuscaProps = {
  resultados: CadastroEncontrado[];
};

function ResultadosBusca({ resultados }: ResultadosBuscaProps) {
  if (resultados.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs text-slate-500">
        Nenhum cadastro encontrado com esses critérios.
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      {resultados.map((r) => (
        <CadastroCard key={r.id} cadastro={r} />
      ))}
    </div>
  );
}
