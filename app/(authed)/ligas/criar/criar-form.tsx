"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  DESCRICAO_LIGA_MAX,
  NOME_LIGA_MAX,
  NOME_LIGA_MIN,
} from "@/lib/leagues/types";

import { criarLiga, type CriarLigaState } from "../actions";

const INITIAL_STATE: CriarLigaState = {};

export function CriarLigaForm() {
  const [state, formAction] = useActionState(criarLiga, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4 px-4 py-5">
      {state.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="nome"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          Nome da liga
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          minLength={NOME_LIGA_MIN}
          maxLength={NOME_LIGA_MAX}
          placeholder="Ex.: Galera do trampo"
          defaultValue={state.values?.nome ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.nome)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
        {state.fieldErrors?.nome ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.nome}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            {NOME_LIGA_MIN}–{NOME_LIGA_MAX} caracteres.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          Descrição{" "}
          <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          maxLength={DESCRICAO_LIGA_MAX}
          placeholder="Uma mensagem pra galera que entrar..."
          defaultValue={state.values?.descricao ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.descricao)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
        {state.fieldErrors?.descricao ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.descricao}
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            Até {DESCRICAO_LIGA_MAX} caracteres.
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>Criando...</span>
        </>
      ) : (
        <span>Criar liga →</span>
      )}
    </button>
  );
}
