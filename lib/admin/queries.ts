import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { brtDateKey } from "@/lib/dashboard/format";
import { type Database } from "@/lib/supabase/database.types";

type SelecaoTable = Database["public"]["Tables"]["selecoes"]["Row"];
type MatchTable = Database["public"]["Tables"]["matches"]["Row"];

export type AdminSelecao = Pick<SelecaoTable, "id" | "nome" | "codigo_iso">;

export type AdminMatchRow = Pick<
  MatchTable,
  | "id"
  | "fase"
  | "grupo"
  | "kickoff_at"
  | "estadio"
  | "is_brasil"
  | "placar_a"
  | "placar_b"
> & {
  selecao_a: AdminSelecao;
  selecao_b: AdminSelecao;
};

const SELECT = `
  id,
  fase,
  grupo,
  kickoff_at,
  estadio,
  is_brasil,
  placar_a,
  placar_b,
  selecao_a:selecao_a_id(id, nome, codigo_iso),
  selecao_b:selecao_b_id(id, nome, codigo_iso)
`;

export async function getAdminMatches(
  admin: SupabaseClient<Database>,
): Promise<AdminMatchRow[]> {
  const { data, error } = await admin
    .from("matches")
    .select(SELECT)
    .not("selecao_a_id", "is", null)
    .not("selecao_b_id", "is", null)
    .order("kickoff_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as unknown as AdminMatchRow[];
  return rows;
}

// Jogos de HOJE pela mesma regra do "Hoje" de Placares: dia BRT via brtDateKey,
// cuja janela equivale a [diaBRT 03:00Z, +24h). Só confrontos definidos (igual
// getAdminMatches). Counts head — não carrega lista. "sem placar" = não encerrado.
export async function countJogosHoje(
  admin: SupabaseClient<Database>,
  nowISO: string,
): Promise<{ total: number; semPlacar: number }> {
  const todayKey = brtDateKey(new Date(nowISO));
  const startISO = `${todayKey}T03:00:00.000Z`;
  const endISO = new Date(
    new Date(startISO).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString();

  const base = () =>
    admin
      .from("matches")
      .select("id", { count: "exact", head: true })
      .not("selecao_a_id", "is", null)
      .not("selecao_b_id", "is", null)
      .gte("kickoff_at", startISO)
      .lt("kickoff_at", endISO);

  const { count: total, error: e1 } = await base();
  if (e1) throw e1;

  const { count: semPlacar, error: e2 } = await base().is("placar_a", null);
  if (e2) throw e2;

  return { total: total ?? 0, semPlacar: semPlacar ?? 0 };
}
