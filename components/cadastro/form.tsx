"use client";

import { type TurnstileInstance } from "@marsidev/react-turnstile";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";
import { type ZodTypeAny } from "zod";

import { criarParticipante, type CadastroState } from "@/app/cadastrar/actions";
import { formatCPF, formatWhatsApp } from "@/lib/format";
import {
  bairroSchema,
  idadeSchema,
  instagramSchema,
  nomeSchema,
} from "@/lib/validation/cadastro";
import { cpfSchema, whatsappSchema } from "@/lib/validation/contato";

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

type CampoValidavel =
  | "nome"
  | "cpf"
  | "whatsapp"
  | "idade"
  | "bairro"
  | "instagram";

type ClientErrors = Partial<Record<CampoValidavel, string | undefined>>;

function validarCom(schema: ZodTypeAny, value: string): string | undefined {
  if (value.trim() === "") return undefined;
  const r = schema.safeParse(value);
  if (r.success) return undefined;
  return r.error.issues[0]?.message ?? "Valor inválido";
}

const VALIDATORS: Record<CampoValidavel, (v: string) => string | undefined> = {
  nome: (v) => validarCom(nomeSchema, v),
  cpf: (v) => validarCom(cpfSchema, v),
  whatsapp: (v) => validarCom(whatsappSchema, v),
  idade: (v) => validarCom(idadeSchema, v),
  bairro: (v) => validarCom(bairroSchema, v),
  instagram: (v) => validarCom(instagramSchema, v),
};

function isCampoValidavel(name: string): name is CampoValidavel {
  return name in VALIDATORS;
}

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
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  const getErro = (field: CampoValidavel): string | undefined =>
    state.errors?.[field] ?? clientErrors[field];

  const handleFieldBlur = (e: FocusEvent<HTMLFormElement>) => {
    const target = e.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }
    const name = target.name;
    if (!isCampoValidavel(name)) return;
    const err = VALIDATORS[name](target.value);
    setClientErrors((prev) =>
      prev[name] === err ? prev : { ...prev, [name]: err },
    );
  };

  const handleFieldFocus = (e: FocusEvent<HTMLFormElement>) => {
    const target = e.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }
    const name = target.name;
    if (!isCampoValidavel(name) || !clientErrors[name]) return;
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

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
      onBlur={handleFieldBlur}
      onFocus={handleFieldFocus}
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

      {state.cpfDuplicadoDigits ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-slate-800"
        >
          Esse CPF já está cadastrado.{" "}
          <Link
            href={`/entrar?cpf=${state.cpfDuplicadoDigits}`}
            className="font-semibold text-brand-blue underline"
          >
            Entrar com esse CPF →
          </Link>
        </div>
      ) : null}

      <Campo label="Nome completo" htmlFor="nome" error={getErro("nome")}>
        <input
          id="nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          defaultValue={state.values?.nome}
          aria-invalid={Boolean(getErro("nome"))}
          aria-describedby={getErro("nome") ? "erro-nome" : undefined}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo label="CPF" htmlFor="cpf" error={getErro("cpf")}>
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
          aria-invalid={Boolean(getErro("cpf"))}
          aria-describedby={getErro("cpf") ? "erro-cpf" : undefined}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo label="WhatsApp" htmlFor="whatsapp" error={getErro("whatsapp")}>
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
          aria-invalid={Boolean(getErro("whatsapp"))}
          aria-describedby={getErro("whatsapp") ? "erro-whatsapp" : undefined}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo label="Idade" htmlFor="idade" error={getErro("idade")}>
        <input
          id="idade"
          name="idade"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={3}
          required
          defaultValue={state.values?.idade}
          aria-invalid={Boolean(getErro("idade"))}
          aria-describedby={getErro("idade") ? "erro-idade" : undefined}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
        />
      </Campo>

      <Campo label="Bairro" htmlFor="bairro" error={getErro("bairro")}>
        <BairroSelect
          id="bairro"
          name="bairro"
          defaultValue={state.values?.bairro}
          ariaInvalid={Boolean(getErro("bairro"))}
          ariaDescribedBy={getErro("bairro") ? "erro-bairro" : undefined}
        />
      </Campo>

      <Campo
        label="Instagram (opcional)"
        htmlFor="instagram"
        error={getErro("instagram")}
      >
        <input
          id="instagram"
          name="instagram"
          type="text"
          autoComplete="off"
          placeholder="@seuinsta"
          defaultValue={state.values?.instagram}
          aria-invalid={Boolean(getErro("instagram"))}
          aria-describedby={getErro("instagram") ? "erro-instagram" : undefined}
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
          defaultChecked={state.values?.aceite_comunicacoes ?? true}
          error={state.errors?.aceite_comunicacoes}
          helperText="Você pode descadastrar a qualquer momento."
        >
          Quero receber dicas de cuidado com bateria e ofertas exclusivas no
          WhatsApp.
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
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>Enviando...</span>
        </>
      ) : (
        <span>Quero participar grátis →</span>
      )}
    </button>
  );
}
