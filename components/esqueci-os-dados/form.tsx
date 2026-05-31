"use client";

import { type TurnstileInstance } from "@marsidev/react-turnstile";
import { Loader2 } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";

import { solicitarAjuda, type HelpRequestState } from "@/app/esqueci-os-dados/actions";
import { Campo } from "@/components/cadastro/campo";
import { TurnstileWidget } from "@/components/cadastro/turnstile-widget";

const INITIAL_STATE: HelpRequestState = {};

const FIELD_ORDER = ["nome", "cpf_parcial", "whatsapp_parcial", "mensagem"] as const;

type HelpRequestFormProps = {
  turnstileSiteKey: string | null;
};

export function HelpRequestForm({ turnstileSiteKey }: HelpRequestFormProps) {
  const [state, formAction] = useActionState(solicitarAjuda, INITIAL_STATE);

  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const tokenInputRef = useRef<HTMLInputElement>(null);

  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.errors) return;
    for (const field of FIELD_ORDER) {
      if (state.errors[field]) {
        const el = formRef.current?.querySelector<HTMLElement>(
          `[name="${field}"]`,
        );
        el?.focus();
        break;
      }
    }
  }, [state]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (!turnstileSiteKey) return;

    const existingToken = tokenInputRef.current?.value;
    if (existingToken) return;

    e.preventDefault();
    setCaptchaError(null);

    const widget = turnstileRef.current;
    if (!widget) {
      setCaptchaError("Captcha indisponível. Recarrega a página.");
      return;
    }

    const form = e.currentTarget;

    try {
      widget.execute();
      const token = await widget.getResponsePromise(10000);
      if (tokenInputRef.current) tokenInputRef.current.value = token;
      form.requestSubmit();
    } catch {
      setCaptchaError("Captcha demorou. Toca de novo no botão.");
      widget.reset();
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 px-4 py-5"
    >
      {state.formError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.formError}
        </div>
      ) : null}

      {captchaError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {captchaError}
        </div>
      ) : null}

      <Campo label="Nome completo" htmlFor="nome" error={state.errors?.nome}>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          defaultValue={state.values?.nome}
          aria-invalid={Boolean(state.errors?.nome)}
          aria-describedby={state.errors?.nome ? "erro-nome" : undefined}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo
        label="Últimos 3 dígitos do CPF"
        htmlFor="cpf_parcial"
        error={state.errors?.cpf_parcial}
      >
        <input
          id="cpf_parcial"
          name="cpf_parcial"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={3}
          required
          autoComplete="off"
          placeholder="123"
          defaultValue={state.values?.cpf_parcial}
          aria-invalid={Boolean(state.errors?.cpf_parcial)}
          aria-describedby={
            state.errors?.cpf_parcial ? "erro-cpf_parcial" : undefined
          }
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo
        label="DDD + últimos 4 dígitos do WhatsApp"
        htmlFor="whatsapp_parcial"
        error={state.errors?.whatsapp_parcial}
      >
        <input
          id="whatsapp_parcial"
          name="whatsapp_parcial"
          type="text"
          inputMode="numeric"
          required
          autoComplete="off"
          placeholder="47 e 1234"
          defaultValue={state.values?.whatsapp_parcial}
          aria-invalid={Boolean(state.errors?.whatsapp_parcial)}
          aria-describedby={
            state.errors?.whatsapp_parcial ? "erro-whatsapp_parcial" : undefined
          }
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo
        label="O que aconteceu?"
        htmlFor="mensagem"
        error={state.errors?.mensagem}
      >
        <textarea
          id="mensagem"
          name="mensagem"
          required
          rows={5}
          maxLength={1000}
          placeholder="Ex: troquei de celular e perdi o WhatsApp. Meu nome é..."
          defaultValue={state.values?.mensagem}
          aria-invalid={Boolean(state.errors?.mensagem)}
          aria-describedby={
            state.errors?.mensagem ? "erro-mensagem" : undefined
          }
          className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      {turnstileSiteKey ? (
        <>
          <input
            ref={tokenInputRef}
            type="hidden"
            name="turnstileToken"
            defaultValue=""
          />
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            instanceRef={turnstileRef}
            onToken={(token) => {
              if (tokenInputRef.current) tokenInputRef.current.value = token;
            }}
          />
        </>
      ) : (
        <input type="hidden" name="turnstileToken" value="dev-bypass" readOnly />
      )}

      <SubmitButton />

      <p className="pt-1 text-center text-xs text-slate-500">
        Lembrou os dados?{" "}
        <a href="/entrar" className="font-semibold text-brand-blue underline">
          Voltar pro login
        </a>
      </p>
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
