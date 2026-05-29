"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  pedirEntradaPorCodigo,
  type PedirEntradaState,
} from "../../actions";

export function PedirEntradaButton({ codigo }: { codigo: string }) {
  const initial: PedirEntradaState = { codigo };
  const [state, formAction] = useActionState(
    pedirEntradaPorCodigo,
    initial,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="codigo" value={codigo} />
      {state.error ? (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.error}
        </div>
      ) : null}
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
