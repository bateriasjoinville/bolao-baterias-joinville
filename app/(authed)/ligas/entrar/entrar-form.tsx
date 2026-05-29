"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  pedirEntradaPorCodigo,
  type PedirEntradaState,
} from "../actions";

const INITIAL_STATE: PedirEntradaState = {};

export function EntrarForm() {
  const [state, formAction] = useActionState(
    pedirEntradaPorCodigo,
    INITIAL_STATE,
  );

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
          htmlFor="codigo"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          Código de convite
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          required
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          placeholder="EX.: ABC23XYZ"
          defaultValue={state.codigo ?? ""}
          aria-invalid={Boolean(state.error)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 font-mono text-base tracking-wider text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Letras e números, 6 a 10 caracteres.
        </p>
      </div>

      <Submit />
    </form>
  );
}

function Submit() {
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
          <span>Pedindo entrada...</span>
        </>
      ) : (
        <span>Pedir entrada →</span>
      )}
    </button>
  );
}
