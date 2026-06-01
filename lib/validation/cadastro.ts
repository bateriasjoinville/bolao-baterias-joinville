import { z } from "zod";

import { BAIRROS_OPCOES } from "@/lib/validation/bairros";
import {
  cpfSchema,
  turnstileTokenSchema,
  whatsappSchema,
} from "@/lib/validation/contato";
import { UF_SIGLAS } from "@/lib/validation/ufs";

export const nomeSchema = z
  .string()
  .trim()
  .min(3, "Informe seu nome")
  .max(120, "Nome muito longo")
  .refine(
    (v) => v.split(/\s+/).filter(Boolean).length >= 2,
    "Informe nome e sobrenome",
  );

export const idadeSchema = z.coerce
  .number({ message: "Informe sua idade" })
  .int("Idade inválida")
  .min(18, "Cadastro só pra maiores de 18")
  .max(120, "Idade inválida");

export const bairroSchema = z.enum(BAIRROS_OPCOES, {
  message: "Escolha um bairro",
});

export const cidadeSchema = z
  .string()
  .trim()
  .min(2, "Informe a cidade")
  .max(80, "Cidade muito longa")
  .regex(/^[\p{L}][\p{L}0-9 .'-]*$/u, "Cidade inválida");

export const ufSchema = z.enum(UF_SIGLAS, { message: "Escolha o estado" });

export const instagramSchema = z
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

const aceiteObrigatorioSchema = z.literal(true, {
  message: "Aceite obrigatório",
});

const camposBase = {
  nome: nomeSchema,
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  idade: idadeSchema,
  instagram: instagramSchema,
  aceite_regulamento: aceiteObrigatorioSchema,
  aceite_comunicacoes: z.boolean(),
  turnstileToken: turnstileTokenSchema,
};

export const cadastroSchema = z.discriminatedUnion("cidade_tipo", [
  z.object({
    cidade_tipo: z.literal("joinville"),
    bairro: bairroSchema,
    ...camposBase,
  }),
  z.object({
    cidade_tipo: z.literal("outra"),
    cidade: cidadeSchema,
    uf: ufSchema,
    ...camposBase,
  }),
]);

export type CadastroInput = z.infer<typeof cadastroSchema>;

export type CadastroField =
  | "nome"
  | "cpf"
  | "whatsapp"
  | "idade"
  | "cidade_tipo"
  | "bairro"
  | "cidade"
  | "uf"
  | "instagram"
  | "aceite_regulamento"
  | "aceite_comunicacoes"
  | "turnstileToken";

export type CadastroFieldErrors = Partial<Record<CadastroField, string>>;
