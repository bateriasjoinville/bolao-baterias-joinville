"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

import {
  type LigaBuscaResultado,
  type MeuPapel,
} from "@/lib/leagues/types";

import { buscarLigasAction, entrarNaLigaPorId } from "../actions";

export function BuscaLigas() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<LigaBuscaResultado[] | null>(
    null,
  );
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, startBusca] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    startBusca(async () => {
      const r = await buscarLigasAction(termo);
      if (!r.ok) {
        setErro(r.error);
        setResultados(null);
        return;
      }
      setResultados(r.resultados);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Nome da liga"
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
        />
        <button
          type="submit"
          disabled={buscando}
          aria-label="Buscar"
          className="flex shrink-0 items-center justify-center rounded-xl bg-brand-blue px-4 text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-60"
        >
          {buscando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Search className="h-5 w-5" aria-hidden />
          )}
        </button>
      </form>

      {erro ? <p className="text-xs text-red-600">{erro}</p> : null}

      {resultados !== null ? (
        resultados.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            Nenhuma liga encontrada.
          </p>
        ) : (
          <ul className="space-y-2">
            {resultados.map((l) => (
              <ResultadoItem key={l.id} liga={l} />
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

function ResultadoItem({ liga }: { liga: LigaBuscaResultado }) {
  const [entrando, startEntrar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleEntrar() {
    setErro(null);
    startEntrar(async () => {
      const r = await entrarNaLigaPorId({ ligaId: liga.id });
      // Sucesso redireciona no servidor; só cai aqui em erro.
      if (!r.ok) setErro(r.error);
    });
  }

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {liga.nome}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {liga.ownerNome} · {liga.countAprovados}{" "}
            {liga.countAprovados === 1 ? "membro" : "membros"}
          </p>
        </div>
        <VisibilidadeBadge isPublica={liga.isPublica} />
      </div>

      {liga.descricao ? (
        <p className="mt-2 line-clamp-2 text-xs text-slate-600">
          {liga.descricao}
        </p>
      ) : null}

      <div className="mt-3">
        {liga.meuPapel !== null ? (
          <Link
            href={`/ligas/${liga.id}`}
            className="block w-full rounded-md bg-slate-100 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            {labelMeuPapel(liga.meuPapel)} →
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={handleEntrar}
              disabled={entrando}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-60"
            >
              {entrando ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {liga.isPublica ? "Entrar" : "Pedir pra entrar"}
            </button>
            {erro ? (
              <p className="mt-1 text-xs text-red-600">{erro}</p>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
}

function VisibilidadeBadge({ isPublica }: { isPublica: boolean }) {
  return isPublica ? (
    <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
      Pública
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
      Privada
    </span>
  );
}

function labelMeuPapel(papel: MeuPapel): string {
  if (papel === "owner") return "Você organiza";
  if (papel === "aprovado") return "Você já participa";
  return "Pedido pendente";
}
