"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Turnstile } from "@/components/cadastro/turnstile-widget";
import { enviarPedidoAjuda, type PedidoAjudaState } from "@/app/esqueci-os-dados/actions";

const INITIAL_STATE: PedidoAjudaState = {};

export function EsqueciDadosForm() {
  const [state, formAction] = useActionState(
    enviarPedidoAjuda,
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

      {state.fieldErrors?.geral ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.fieldErrors.geral}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="nome"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          Nome completo
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          maxLength={120}
          placeholder="Seu nome completo"
          defaultValue={state.values?.nome ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.nome)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
        {state.fieldErrors?.nome ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.nome}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="cpf"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          CPF
        </label>
        <input
          id="cpf"
          name="cpf"
          type="text"
          required
          inputMode="numeric"
          maxLength={14}
          placeholder="000.000.000-00"
          defaultValue={state.values?.cpf ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.cpf)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
        {state.fieldErrors?.cpf ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.cpf}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">
            Pra gente achar seu cadastro.
          </p>
        )}
      </div>

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
          required
          inputMode="numeric"
          maxLength={15}
          placeholder="(47) 99999-9999"
          defaultValue={state.values?.whatsapp ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.whatsapp)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
        {state.fieldErrors?.whatsapp ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.whatsapp}
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">Com DDD.</p>
        )}
      </div>

      <div>
        <label
          htmlFor="mensagem"
          className="mb-1.5 block text-sm font-semibold text-slate-900"
        >
          Mensagem{" "}
          <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={4}
          maxLength={1000}
          placeholder="Conta pra gente o que aconteceu..."
          defaultValue={state.values?.mensagem ?? ""}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
        />
      </div>

      <Turnstile />

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
          <span>Enviando...</span>
        </>
      ) : (
        <span>Enviar pedido</span>
      )}
    </button>
  );
}
