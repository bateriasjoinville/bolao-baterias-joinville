"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { formatWhatsApp } from "@/lib/format";

import {
  atualizarWhatsapp,
  type AtualizarWhatsappState,
} from "./actions";

const INITIAL_STATE: AtualizarWhatsappState = {};

export function EditarWhatsappForm({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const [state, formAction] = useActionState(atualizarWhatsapp, INITIAL_STATE);
  const [whatsapp, setWhatsapp] = useState(
    formatWhatsApp(state.value ?? defaultValue),
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
          htmlFor="whatsapp"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          WhatsApp
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          placeholder="(47) 99999-9999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
          aria-invalid={Boolean(state.error)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </div>

      <SubmitButton />

      <a
        href="/confirmar-whatsapp"
        className="block py-2 text-center text-sm font-medium text-slate-600 underline"
      >
        Cancelar
      </a>
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
          <span>Salvando...</span>
        </>
      ) : (
        <span>Salvar e continuar →</span>
      )}
    </button>
  );
}
