"use client";

import { type FormEvent, useState, useTransition } from "react";

import { carregarCadastrados } from "@/app/admin/cadastrados/actions";
import { CadastroCard } from "@/components/admin/cadastro-card";
import { type ParticipantRow } from "@/lib/admin/participants";

type Props = {
  initialRows: ParticipantRow[];
  total: number;
};

export function CadastradosLista({ initialRows, total }: Props) {
  const [rows, setRows] = useState<ParticipantRow[]>(initialRows);
  const [totalCount, setTotalCount] = useState(total);
  const [termo, setTermo] = useState("");
  const [termoAtivo, setTermoAtivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, startBusca] = useTransition();
  const [carregando, startCarregar] = useTransition();

  const aplicar = (t: string) => {
    startBusca(async () => {
      const res = await carregarCadastrados({ termo: t, offset: 0 });
      if (res.ok) {
        setRows(res.rows);
        setTotalCount(res.total);
        setTermoAtivo(t);
        setErro(null);
      } else {
        setErro(res.error);
      }
    });
  };

  const handleBuscar = (e: FormEvent) => {
    e.preventDefault();
    aplicar(termo.trim());
  };

  const handleLimpar = () => {
    setTermo("");
    aplicar("");
  };

  const handleCarregarMais = () => {
    startCarregar(async () => {
      const res = await carregarCadastrados({
        termo: termoAtivo,
        offset: rows.length,
      });
      if (res.ok) {
        setRows((prev) => [...prev, ...res.rows]);
        setTotalCount(res.total);
        setErro(null);
      } else {
        setErro(res.error);
      }
    });
  };

  const temMais = rows.length < totalCount;

  return (
    <>
      <section className="border-b border-slate-200 bg-white px-3 py-3">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar: nome, CPF ou WhatsApp"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
          <button
            type="submit"
            disabled={buscando}
            className="shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:opacity-60"
          >
            {buscando ? "..." : "Buscar"}
          </button>
        </form>
        {termoAtivo ? (
          <button
            type="button"
            onClick={handleLimpar}
            className="mt-2 text-xs font-medium text-brand-blue hover:underline"
          >
            ← Limpar busca / ver todos
          </button>
        ) : null}
      </section>

      <section className="space-y-2 px-3 py-4">
        {erro ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
          >
            {erro}
          </p>
        ) : null}

        <p className="text-xs text-slate-500">
          {termoAtivo
            ? `${totalCount} resultado${totalCount === 1 ? "" : "s"} para “${termoAtivo}”`
            : `${totalCount} inscrito${totalCount === 1 ? "" : "s"}`}
        </p>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {termoAtivo ? "Nenhum cadastro encontrado." : "Nenhum cadastro ainda."}
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <CadastroCard key={r.id} cadastro={r} />
            ))}
          </div>
        )}

        {temMais ? (
          <button
            type="button"
            onClick={handleCarregarMais}
            disabled={carregando}
            className="w-full rounded-lg border border-brand-blue bg-white py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:opacity-60"
          >
            {carregando
              ? "Carregando..."
              : `Carregar mais (${rows.length}/${totalCount})`}
          </button>
        ) : null}
      </section>
    </>
  );
}
