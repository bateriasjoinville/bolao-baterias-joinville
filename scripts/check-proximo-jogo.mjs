import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

const nowIso = new Date().toISOString();

const select = `
  id,
  kickoff_at,
  is_brasil,
  selecao_a:selecao_a_id(nome),
  selecao_b:selecao_b_id(nome)
`;

const [{ data: brasil }, { data: geral }] = await Promise.all([
  supabase
    .from("matches")
    .select(select)
    .eq("is_brasil", true)
    .gt("kickoff_at", nowIso)
    .order("kickoff_at", { ascending: true })
    .limit(1)
    .maybeSingle(),
  supabase
    .from("matches")
    .select(select)
    .gt("kickoff_at", nowIso)
    .order("kickoff_at", { ascending: true })
    .limit(1)
    .maybeSingle(),
]);

console.log("now:", nowIso);
console.log("\nproximoBrasil:", brasil);
console.log("\nproximoGeral:", geral);
console.log(
  "\nSão o mesmo jogo?",
  brasil?.id === geral?.id ? "SIM — card compacto NÃO renderiza" : "NÃO — card compacto renderiza",
);
