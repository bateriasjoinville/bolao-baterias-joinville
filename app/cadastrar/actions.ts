"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { parseConvite } from "@/lib/leagues/entrar";
import { createSession, stashPendingConvite } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  cadastroSchema,
  type CadastroFieldErrors,
} from "@/lib/validation/cadastro";

export type CadastroState = {
  errors?: CadastroFieldErrors;
  formError?: string;
  cpfDuplicadoDigits?: string;
  values?: {
    nome?: string;
    cpf?: string;
    whatsapp?: string;
    idade?: string;
    cidade_tipo?: "joinville" | "outra";
    bairro?: string;
    cidade?: string;
    uf?: string;
    instagram?: string;
    aceite_regulamento?: boolean;
    aceite_comunicacoes?: boolean;
  };
};

function flattenIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
): CadastroFieldErrors {
  const out: CadastroFieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      (out as Record<string, string>)[key] = issue.message;
    }
  }
  return out;
}

export async function criarParticipante(
  _prev: CadastroState,
  formData: FormData,
): Promise<CadastroState> {
  const cidadeTipo =
    String(formData.get("cidade_tipo") ?? "joinville") === "outra"
      ? "outra"
      : "joinville";

  const raw = {
    nome: String(formData.get("nome") ?? ""),
    cpf: String(formData.get("cpf") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    idade: String(formData.get("idade") ?? ""),
    cidade_tipo: cidadeTipo,
    bairro: String(formData.get("bairro") ?? ""),
    cidade: String(formData.get("cidade") ?? ""),
    uf: String(formData.get("uf") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    aceite_regulamento: formData.get("aceite_regulamento") === "on",
    aceite_comunicacoes: formData.get("aceite_comunicacoes") === "on",
    turnstileToken: String(formData.get("turnstileToken") ?? ""),
  };

  const values: CadastroState["values"] = {
    nome: raw.nome,
    cpf: raw.cpf,
    whatsapp: raw.whatsapp,
    idade: raw.idade,
    cidade_tipo: cidadeTipo,
    bairro: raw.bairro,
    cidade: raw.cidade,
    uf: raw.uf,
    instagram: raw.instagram,
    aceite_regulamento: raw.aceite_regulamento,
    aceite_comunicacoes: raw.aceite_comunicacoes,
  };

  const parsed = cadastroSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: flattenIssues(parsed.error.issues),
      values,
    };
  }

  const reqHeaders = await headers();
  const remoteIp =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    reqHeaders.get("x-real-ip") ??
    undefined;

  const captchaOk = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    remoteIp,
  );
  if (!captchaOk) {
    return {
      formError: "Captcha falhou. Recarrega a página e tenta de novo.",
      values,
    };
  }

  const localizacao =
    parsed.data.cidade_tipo === "joinville"
      ? { cidade: "Joinville", estado: "SC", bairro: parsed.data.bairro }
      : { cidade: parsed.data.cidade, estado: parsed.data.uf, bairro: null };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .insert({
      nome: parsed.data.nome,
      cpf: parsed.data.cpf,
      whatsapp: parsed.data.whatsapp,
      idade: parsed.data.idade,
      cidade: localizacao.cidade,
      estado: localizacao.estado,
      bairro: localizacao.bairro,
      instagram: parsed.data.instagram ? parsed.data.instagram : null,
      aceite_regulamento: parsed.data.aceite_regulamento,
      aceite_comunicacoes: parsed.data.aceite_comunicacoes,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        cpfDuplicadoDigits: parsed.data.cpf,
        values,
      };
    }
    return {
      formError: "Erro ao cadastrar. Tenta de novo em uns segundos.",
      values,
    };
  }

  await createSession(data.id);

  const convite = parseConvite(String(formData.get("convite") ?? ""));
  if (convite) await stashPendingConvite(convite);

  redirect("/confirmar-whatsapp");
}
