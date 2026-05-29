import "server-only";

import { CODIGO_CONVITE_LEN } from "./types";

// 32 chars, exclui 0/O/1/I pra evitar confusão visual em links curtos.
// 32 divide 256 sem resto — sem modulo bias.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function gerarCodigoConvite(): string {
  const bytes = new Uint8Array(CODIGO_CONVITE_LEN);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < CODIGO_CONVITE_LEN; i += 1) {
    out += ALFABETO[bytes[i]! % ALFABETO.length];
  }
  return out;
}
