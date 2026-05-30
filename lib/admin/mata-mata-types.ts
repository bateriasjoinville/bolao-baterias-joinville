export type SelecaoOption = {
  id: number;
  nome: string;
  codigoIso: string;
};

export type LadoConfronto = {
  selecao: SelecaoOption | null; // definido: time real; null: ainda placeholder
  placeholder: string | null;
  descricao: string; // pt-br do placeholder (com nomes do jogo de origem quando dá)
  candidatos: SelecaoOption[]; // filtrados; vazio => front usa todas as 48
};

export type ConfrontoPendente = {
  id: number;
  fase: string;
  kickoffAt: string;
  estadio: string;
  isBrasil: boolean;
  ladoA: LadoConfronto;
  ladoB: LadoConfronto;
};

export type ConfrontosData = {
  confrontos: ConfrontoPendente[];
  selecoes: SelecaoOption[];
};
