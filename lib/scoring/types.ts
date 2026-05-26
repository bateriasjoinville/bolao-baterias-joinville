export type PointsBreakdown = {
  pontos: number;
  exato: boolean;
  vencedor: boolean;
  diffGols: number;
};

export type ScoreboardEntry = {
  participant_id: string;
  nome: string;
  posicao: number;
  pontos_total: number;
  placares_exatos: number;
  vencedores_acertados: number;
  palpites_validos: number;
};

export type WeeklyScoreboardEntry = {
  participant_id: string;
  nome: string;
  semana: number;
  posicao: number;
  pontos: number;
  placares_exatos: number;
  vencedores_acertados: number;
  palpites_validos: number;
};
