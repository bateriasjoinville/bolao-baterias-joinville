// Formata nome completo pra exibição pública no ranking.
// Regra: primeiro nome + inicial do último sobrenome com ponto.
// - "Gabriel Minatti"        → "Gabriel M."
// - "Maria Da Silva Oliveira" → "Maria O."
// - "João"                   → "João"
// - "  Ana   Souza  "         → "Ana S."
// - ""                       → "Participante"

export function toDisplayName(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "Participante";
  const primeiro = partes[0]!;
  if (partes.length === 1) return primeiro;
  const ultimo = partes[partes.length - 1]!;
  const inicial = ultimo.charAt(0).toUpperCase();
  return `${primeiro} ${inicial}.`;
}
