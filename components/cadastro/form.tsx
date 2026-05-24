"use client";

import { type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";

import { criarParticipante, type CadastroState } from "@/app/cadastrar/actions";
import { formatCPF, formatWhatsApp } from "@/lib/format";

import { AceiteCheckbox } from "./aceite-checkbox";
import { BairroSelect } from "./bairro-select";
import { Campo } from "./campo";
import { TurnstileWidget } from "./turnstile-widget";

const INITIAL_STATE: CadastroState = {};

const FIELD_ORDER = [
  "nome",
  "cpf",
  "whatsapp",
  "idade",
  "bairro",
  "instagram",
  "aceite_regulamento",
  "aceite_comunicacoes",
] as const;

type CadastroFormProps = {
  turnstileSiteKey: string | null;
};

export function CadastroForm({ turnstileSiteKey }: CadastroFormProps) {
  const [state, formAction] = useActionState(
    criarParticipante,
    INITIAL_STATE,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const tokenInputRef = useRef<HTMLInputElement>(null);

  const [cpf, setCpf] = useState(state.values?.cpf ?? "");
  const [whatsapp, setWhatsapp] = useState(state.values?.whatsapp ?? "");

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!turnstileSiteKey) return;
    const token = tokenInputRef.current?.value;
    if (token) return;
    e.preventDefault();
    turnstileRef.current?.execute();
    const form = e.currentTarget;
    const wait = setInterval(() => {
      if (tokenInputRef.current?.value) {
        clearInterval(wait);
        form.requestSubmit();
      }
    }, 100);
    setTimeout(() => clearInterval(wait), 10000);
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.formError}
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
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

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

      <Campo label="WhatsApp" htmlFor="whatsapp" error={state.errors?.whatsapp}>
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

      <Campo label="Idade" htmlFor="idade" error={state.errors?.idade}>
        <input
          id="idade"
          name="idade"
          type="number"
          inputMode="numeric"
          min={18}
          max={120}
          required
          defaultValue={state.values?.idade}
          aria-invalid={Boolean(state.errors?.idade)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo label="Bairro" htmlFor="bairro" error={state.errors?.bairro}>
        <BairroSelect
          id="bairro"
          name="bairro"
          defaultValue={state.values?.bairro}
          ariaInvalid={Boolean(state.errors?.bairro)}
        />
      </Campo>

      <Campo
        label="@Instagram"
        htmlFor="instagram"
        error={state.errors?.instagram}
      >
        <input
          id="instagram"
          name="instagram"
          type="text"
          autoComplete="off"
          placeholder="@seuinsta"
          defaultValue={state.values?.instagram}
          aria-invalid={Boolean(state.errors?.instagram)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <div className="space-y-3 pt-1">
        <AceiteCheckbox
          id="aceite_regulamento"
          name="aceite_regulamento"
          defaultChecked={state.values?.aceite_regulamento}
          error={state.errors?.aceite_regulamento}
        >
          Li e aceito o{" "}
          <a
            href="/regulamento"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-blue underline"
          >
            regulamento
          </a>
          .
        </AceiteCheckbox>

        <AceiteCheckbox
          id="aceite_comunicacoes"
          name="aceite_comunicacoes"
          defaultChecked={state.values?.aceite_comunicacoes}
          error={state.errors?.aceite_comunicacoes}
        >
          Aceito receber comunicações da Baterias Joinville no WhatsApp.
        </AceiteCheckbox>
      </div>

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

      <SubmitButton />

      <p className="pt-1 text-center text-xs text-slate-500">
        Já tem cadastro?{" "}
        <a href="/entrar" className="font-semibold text-brand-blue underline">
          Entrar
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
      className="block w-full rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Quero participar grátis →"}
    </button>
  );
}
