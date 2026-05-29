export const MEMBRO_STATUS = {
  PENDENTE: "pendente",
  APROVADO: "aprovado",
} as const;

export type MembroStatus = (typeof MEMBRO_STATUS)[keyof typeof MEMBRO_STATUS];

export type MeuPapel = "owner" | MembroStatus;

export const LIMITE_LIGAS_CRIADAS = 10;
export const LIMITE_LIGAS_PARTICIPANDO = 20;

export const CODIGO_CONVITE_LEN = 8;
export const NOME_LIGA_MIN = 2;
export const NOME_LIGA_MAX = 60;
export const DESCRICAO_LIGA_MAX = 500;
