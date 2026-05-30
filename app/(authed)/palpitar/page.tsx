import { BannerPreCopa } from "@/components/palpitar/banner-pre-copa";
import { PalpitarBoard } from "@/components/palpitar/board";
import { PlaceholderSection } from "@/components/palpitar/placeholder-section";
import { palpitesAbertos } from "@/lib/dashboard/format";
import { getPalpitarPageData } from "@/lib/palpitar/queries";
import { createAuthedServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Palpitar — Bolão Copa 2026",
};

export default async function PalpitarPage() {
  const supabase = await createAuthedServerClient();
  const data = await getPalpitarPageData(supabase);
  const aberto = palpitesAbertos();

  const defined = data.matches.filter(
    (m) => m.selecao_a != null && m.selecao_b != null,
  );
  const placeholders = data.matches.filter(
    (m) => m.selecao_a == null || m.selecao_b == null,
  );

  return (
    <>
      <PalpitarBoard
        nome={data.nome}
        total={data.totalMatches}
        aberto={aberto}
        matches={defined}
        predictions={data.predictions}
        banner={!aberto ? <BannerPreCopa /> : undefined}
      />
      <PlaceholderSection matches={placeholders} />
    </>
  );
}
