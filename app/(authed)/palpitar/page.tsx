import { BannerPreCopa } from "@/components/palpitar/banner-pre-copa";
import { PalpitarBoard } from "@/components/palpitar/board";
import { PlaceholderSection } from "@/components/palpitar/placeholder-section";
import { Tabs } from "@/components/palpitar/tabs";
import { palpitesAbertos } from "@/lib/dashboard/format";
import {
  filtrarPorTab,
  isMatchToday,
  parseTab,
} from "@/lib/palpitar/filter";
import { getPalpitarPageData } from "@/lib/palpitar/queries";
import { createAuthedServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Palpitar — Bolão Copa 2026",
};

export default async function PalpitarPage({
  searchParams,
}: {
  searchParams: Promise<{ fase?: string }>;
}) {
  const supabase = await createAuthedServerClient();
  const data = await getPalpitarPageData(supabase);
  const { fase } = await searchParams;
  const activeTab = parseTab(fase);
  const aberto = palpitesAbertos();

  const showHoje = data.matches.some((m) => isMatchToday(m));
  const filtered = filtrarPorTab(data.matches, activeTab);

  const defined = filtered.filter(
    (m) => m.selecao_a != null && m.selecao_b != null,
  );
  const placeholders = filtered.filter(
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
        tabs={
          <>
            {!aberto && <BannerPreCopa />}
            <Tabs active={activeTab} showHoje={showHoje} />
          </>
        }
      />
      <PlaceholderSection matches={placeholders} />
    </>
  );
}
