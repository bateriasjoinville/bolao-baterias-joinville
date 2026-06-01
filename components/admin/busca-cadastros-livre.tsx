"use client";

import { type FormEvent, useState, useTransition } from "react";

import {
  buscarCadastrosLivre,
  type CadastroEncontrado,
} from "@/app/admin/pedidos-ajuda/actions";
import { CadastroCard } from "@/components/admin/cadastro-card";

export function BuscaCadastrosLivre() {
  const [termo, setTermo] = useState("");
  const [pending, startTransition] = useTransition();
  const [resultados, setResultados] = useState<CadastroEncontrado[] | null>(
    null,
  );
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = termo.trim();
    if (t.length < 2) {
      setErro("Digite ao menos 2 caracteres.");
      setResultados(null);
      return;
    }
    startTransition(async () => {
      const res = await buscarCadastrosLivre({ termo: t });
      if (res.ok) {
        setResultados(res.resultados);
        setErro(null);
      } else {
        setResultados(null);
        setErro(res.error);
      }
    });
  };

  return (
    <section className="border-b border-slate-200 bg-white px-3 py-3">
      <p className="mb-2 text-xs font-semibold text-slate-600">
        Buscar na base inteira de cadastrados
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Nome, CPF ou WhatsApp"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:opacity-60"
        >
          {pending ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {erro ? (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
        >
          {erro}
        </p>
      ) : null}

      {resultados ? (
        resultados.length === 0 ? (
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs text-slate-500">
            Nenhum cadastro encontrado.
          </p>
        ) : (
          <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="px-1 text-[11px] font-medium text-slate-500">
              {resultados.length} resultado{resultados.length === 1 ? "" : "s"}
            </p>
            {resultados.map((r) => (
              <CadastroCard key={r.id} cadastro={r} />
            ))}
          </div>
        )
      ) : null}
    </section>
  );
}
