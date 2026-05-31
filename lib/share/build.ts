// Monta os caminhos das rotas de PNG (/share/*) e os textos de compartilhamento.
// Caminho relativo — o ShareButton prefixa window.location.origin.

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

type Confronto = {
  nomeA: string;
  nomeB: string;
  isoA: string;
  isoB: string;
  placarA: number;
  placarB: number;
  isBrasil: boolean;
};

export function palpitePath(c: Confronto): string {
  return `/share/palpite?${qs({
    a: c.nomeA,
    b: c.nomeB,
    fa: c.isoA,
    fb: c.isoB,
    pa: c.placarA,
    pb: c.placarB,
    br: c.isBrasil ? "1" : "0",
  })}`;
}

export function palpiteTexto(c: Confronto): string {
  return `Meu palpite no Bolão da Copa: ${c.nomeA} ${c.placarA}×${c.placarB} ${c.nomeB}. Faz o seu!`;
}

export function cravouPath(c: Confronto & { pontos: number }): string {
  return `/share/cravou?${qs({
    a: c.nomeA,
    b: c.nomeB,
    fa: c.isoA,
    fb: c.isoB,
    pa: c.placarA,
    pb: c.placarB,
    pts: c.pontos,
    br: c.isBrasil ? "1" : "0",
  })}`;
}

export function cravouTexto(c: Confronto & { pontos: number }): string {
  return `CRAVEI o placar de ${c.nomeA} ${c.placarA}×${c.placarB} ${c.nomeB} no Bolão da Copa! +${c.pontos} pts 🎯`;
}

type RankingShare = {
  posicao: number;
  total: number;
  pontos: number;
  nome?: string;
};

export function rankingPath(r: RankingShare): string {
  return `/share/ranking?${qs({
    pos: r.posicao,
    total: r.total,
    pts: r.pontos,
    nome: r.nome,
  })}`;
}

export function rankingTexto(r: RankingShare): string {
  return `Tô em ${r.posicao}º de ${r.total} no Bolão da Copa, com ${r.pontos} pts. Bora competir!`;
}
