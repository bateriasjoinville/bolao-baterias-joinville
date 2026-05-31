import { z } from "zod";

import { stripDigits } from "@/lib/format";
import { turnstileTokenSchema } from "@/lib/validation/contato";

export const nomeAjudaSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome")
  .max(120, "Nome muito longo");

export const mensagemSchema = z
  .string()
  .trim()
  .min(5, "Conta um pouco mais")
  .max(1000, "Mensagem muito longa");

const cpfParcialDigitos = z
  .string()
  .regex(/^\d{3}$/, "Informe os 3 últimos dígitos do CPF");

export const cpfParcialSchema = z
  .string()
  .transform(stripDigits)
  .pipe(cpfParcialDigitos);

const whatsappParcialDigitos = z
  .string()
  .regex(/^\d{6}$/, "Informe DDD + 4 últimos dígitos do WhatsApp (6 números)");

export const whatsappParcialSchema = z
  .string()
  .transform(stripDigits)
  .pipe(whatsappParcialDigitos);

export const helpRequestSchema = z.object({
  nome: nomeAjudaSchema,
  cpf_parcial: cpfParcialSchema,
  whatsapp_parcial: whatsappParcialSchema,
  mensagem: mensagemSchema,
  turnstileToken: turnstileTokenSchema,
});

export type HelpRequestInput = z.infer<typeof helpRequestSchema>;
export type HelpRequestFieldErrors = Partial<
  Record<"nome" | "cpf_parcial" | "whatsapp_parcial" | "mensagem", string>
>;
