import { z } from "zod";

import { BAIRROS_OPCOES } from "@/lib/validation/bairros";
import {
  cpfSchema,
  turnstileTokenSchema,
  whatsappSchema,
} from "@/lib/validation/contato";

const nomeSchema = z
  .string()
  .trim()
  .min(3, "Informe seu nome")
  .max(120, "Nome muito longo")
  .refine(
    (v) => v.split(/\s+/).filter(Boolean).length >= 2,
    "Informe nome e sobrenome",
  );

const idadeSchema = z.coerce
  .number({ message: "Informe sua idade" })
  .int("Idade inválida")
  .min(18, "Cadastro só pra maiores de 18")
  .max(120, "Idade inválida");

const bairroSchema = z.enum(BAIRROS_OPCOES, { message: "Escolha um bairro" });

const instagramSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^@+/, ""))
  .pipe(
    z
      .string()
      .regex(/^[A-Za-z0-9._]{1,30}$/, "@ do Instagram inválido")
      .or(z.literal("")),
  )
  .optional();

const aceiteSchema = z.literal(true, { message: "Aceite obrigatório" });

export const cadastroSchema = z.object({
  nome: nomeSchema,
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  idade: idadeSchema,
  bairro: bairroSchema,
  instagram: instagramSchema,
  aceite_regulamento: aceiteSchema,
  aceite_comunicacoes: aceiteSchema,
  turnstileToken: turnstileTokenSchema,
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type CadastroFieldErrors = Partial<
  Record<keyof CadastroInput, string>
>;
