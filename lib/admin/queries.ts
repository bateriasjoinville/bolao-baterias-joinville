import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

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
