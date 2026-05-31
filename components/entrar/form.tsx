"use client";

import { type TurnstileInstance } from "@marsidev/react-turnstile";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";

import { entrar, type LoginState } from "@/app/entrar/actions";
import { AceiteCheckbox } from "@/components/cadastro/aceite-checkbox";
import { Campo } from "@/components/cadastro/campo";
import { TurnstileWidget } from "@/components/cadastro/turnstile-widget";
import { formatCPF, formatWhatsApp } from "@/lib/format";

const INITIAL_STATE: LoginState = {};

const FIELD_ORDER = ["cpf", "whatsapp"] as const;

type LoginFormProps = {
  turnstileSiteKey: string | null;
  cpfInicial?: string | null;
  convite?: string | null;
};

export function LoginForm({
  turnstileSiteKey,
  cpfInicial,
  convite,
}: LoginFormProps) {
  const cadastrarHref = convite
    ? `/cadastrar?convite=${convite}`
    : "/cadastrar";
  const [state, formAction] = useActionState(entrar, INITIAL_STATE);

  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const tokenInputRef = useRef<HTMLInputElement>(null);

  const cpfInicialFormatado = cpfInicial ? formatCPF(cpfInicial) : "";
  const [cpf, setCpf] = useState(
    state.values?.cpf ?? cpfInicialFormatado,
  );
  const [whatsapp, setWhatsapp] = useState(state.values?.whatsapp ?? "");
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

  useEffect(() => {
    if (!cpfInicialFormatado || state.errors) return;
    const el = formRef.current?.querySelector<HTMLElement>(
      `[name="whatsapp"]`,
    );
    el?.focus();
  }, [cpfInicialFormatado, state.errors]);

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

  const manterConectadoDefault = state.values?.manter_conectado ?? true;

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

      <Campo label="CPF" htmlFor="cpf" error={state.errors?.cpf}>
        <input
          id="cpf"
          name="cpf"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(formatCPF(e.target.value))}
          aria-invalid={Boolean(state.errors?.cpf)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo
        label="WhatsApp"
        htmlFor="whatsapp"
        error={state.errors?.whatsapp}
      >
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
          aria-invalid={Boolean(state.errors?.whatsapp)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <AceiteCheckbox
        id="manter_conectado"
        name="manter_conectado"
        defaultChecked={manterConectadoDefault}
      >
        Manter conectado por 30 dias
      </AceiteCheckbox>

      {convite ? (
        <input type="hidden" name="convite" value={convite} readOnly />
      ) : null}

      <input
        ref={tokenInputRef}
        type="hidden"
        name="turnstileToken"
        defaultValue=""
      />

      {turnstileSiteKey ? (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          instanceRef={turnstileRef}
          onToken={(token) => {
            if (tokenInputRef.current) tokenInputRef.current.value = token;
          }}
        />
      ) : (
        <input type="hidden" name="turnstileToken" value="dev-bypass" readOnly />
      )}

      <SubmitButton convite={Boolean(convite)} />

      <p className="pt-1 text-center text-sm">
        <a
          href="/esqueci-os-dados"
          className="font-semibold text-brand-blue underline"
        >
          Esqueci os dados →
        </a>
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-brand-green bg-brand-green-soft">
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-brand-green" />
          <div className="flex-1 bg-brand-yellow" />
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-sm font-bold text-brand-green-dark">
            🎉 Primeira vez por aqui?
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Crie sua conta em 1 minuto. É grátis e sem pegadinha.
          </p>
          <Link
            href={cadastrarHref}
            className="mt-3 block w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover"
          >
            Cadastrar grátis →
          </Link>
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ convite }: { convite: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Entrando..." : convite ? "Entrar e ir pra liga" : "Entrar"}
    </button>
  );
}
