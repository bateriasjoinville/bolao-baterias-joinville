// Parser puro da notação de chaveamento do mata-mata (placeholder_a/b).
// Tokens (regex do banco): [1-3][A-L] | 3_[A-L]+ | [VP][0-9]+
// Ex.: "1A", "2C", "3_ABCDF", "V74", "P101".

export type PlaceholderInfo =
  | { tipo: "grupo"; posicao: number; grupo: string }
  | { tipo: "melhor3"; grupos: string[] }
  | { tipo: "origemJogo"; resultado: "vencedor" | "perdedor"; jogoId: number }
  | { tipo: "desconhecido"; raw: string };

export function parsePlaceholder(raw: string): PlaceholderInfo {
  const t = raw.trim().toUpperCase();

  const grupo = /^([1-3])([A-L])$/.exec(t);
  if (grupo) {
    return { tipo: "grupo", posicao: Number(grupo[1]), grupo: grupo[2]! };
  }

  const melhor3 = /^3_([A-L]+)$/.exec(t);
  if (melhor3) {
    return { tipo: "melhor3", grupos: melhor3[1]!.split("") };
  }

  const origem = /^([VP])([0-9]+)$/.exec(t);
  if (origem) {
    return {
      tipo: "origemJogo",
      resultado: origem[1] === "V" ? "vencedor" : "perdedor",
      jogoId: Number(origem[2]),
    };
  }

  return { tipo: "desconhecido", raw: t };
}

function ordinal(n: number): string {
  return `${n}º`;
}

// Descrição pt-br do token, sem nomes de times (standalone).
export function descreverPlaceholder(raw: string): string {
  const info = parsePlaceholder(raw);
  switch (info.tipo) {
    case "grupo":
      return `${ordinal(info.posicao)} do grupo ${info.grupo}`;
    case "melhor3":
      return `3º colocado (grupos ${info.grupos.join(", ")})`;
    case "origemJogo":
      return `${info.resultado === "vencedor" ? "Vencedor" : "Perdedor"} do jogo ${info.jogoId}`;
    default:
      return "A definir";
  }
}
