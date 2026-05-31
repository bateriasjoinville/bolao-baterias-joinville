import { z } from "zod";

import {
  cpfSchema,
  turnstileTokenSchema,
  whatsappSchema,
} from "@/lib/validation/contato";

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

export const helpRequestSchema = z.object({
  nome: nomeAjudaSchema,
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  mensagem: mensagemSchema,
  turnstileToken: turnstileTokenSchema,
});

export type HelpRequestInput = z.infer<typeof helpRequestSchema>;
export type HelpRequestFieldErrors = Partial<
  Record<"nome" | "cpf" | "whatsapp" | "mensagem", string>
>;
