import { z } from "zod";

import {
  cpfSchema,
  turnstileTokenSchema,
  whatsappSchema,
} from "@/lib/validation/contato";

export const loginSchema = z.object({
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  manter_conectado: z.boolean(),
  turnstileToken: turnstileTokenSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>;
