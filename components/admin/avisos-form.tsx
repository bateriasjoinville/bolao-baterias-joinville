"use client";

import { useState, useTransition } from "react";

import { salvarPopupLembrete } from "@/app/admin/avisos/actions";

type Props = {
  initial: { enabled: boolean; titulo: string; mensagem: string };
};

export function AvisosForm({ initial }: Props) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [titulo, setTitulo] = useState(initial.titulo);
  const [mensagem, setMensagem] = useState(initial.mensagem);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setFeedback(null);
    setErro(null);
    startTransition(async () => {
      const res = await salvarPopupLembrete({ enabled, titulo, mensagem });
      if (res.ok) {
        setFeedback("Salvo! O aviso já reflete pra galera.");
      } else {
        setErro(res.error);
      }
    });
  }

  return (
    <div className="space-y-4 px-3 py-4">
      <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <div className="font-bold text-slate-900">Pop-up de lembrete</div>
          <p className="text-xs text-slate-500">
            Liga/desliga o aviso pra quem tem jogo nas próximas 48h sem palpitar.
          </p>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-6 w-6 shrink-0 accent-brand-blue"
          aria-label="Ligar pop-up de lembrete"
        />
      </label>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Título
        </label>
        <input
          type="text"
          value={titulo}
          maxLength={60}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-blue focus:outline-none"
        />
        <p className="mt-1 text-right text-[11px] text-slate-400">
          {titulo.length}/60
        </p>

        <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
          Mensagem
        </label>
        <textarea
          value={mensagem}
          maxLength={200}
          rows={3}
          onChange={(e) => setMensagem(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-blue focus:outline-none"
        />
        <p className="mt-1 text-right text-[11px] text-slate-400">
          {mensagem.length}/200
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Prévia
        </p>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-1.5 w-full bg-brand-yellow" />
          <div className="px-4 pb-4 pt-3">
            <p className="text-lg font-extrabold text-brand-blue-dark">
              {titulo || "—"}
            </p>
            <p className="mt-1 text-sm text-slate-600">{mensagem || "—"}</p>
            <div className="mt-3 rounded-xl bg-brand-blue px-4 py-2 text-center text-sm font-bold text-white">
              Palpitar agora
            </div>
          </div>
        </div>
      </div>

      {erro ? <p className="text-sm font-semibold text-red-600">{erro}</p> : null}
      {feedback ? (
        <p className="text-sm font-semibold text-emerald-600">{feedback}</p>
      ) : null}

      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white hover:bg-brand-blue-hover disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}
