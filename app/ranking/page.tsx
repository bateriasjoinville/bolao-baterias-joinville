import { redirect } from "next/navigation";

import { BottomTabBar } from "@/components/shared/bottom-tab-bar";
import { HeaderRankingPublico } from "@/components/ranking/header-publico";
import { Lista } from "@/components/ranking/lista";
import { MyBanner } from "@/components/ranking/my-banner";
import { RankingTabs, type RankingTab } from "@/components/ranking/tabs";
import { findMyEntry } from "@/lib/ranking/me";
import {
  getRankingGeral,
  getRankingSemana,
} from "@/lib/ranking/queries";
import { assignRanks, rankKey } from "@/lib/ranking/rank";
import { semanasVisiveis } from "@/lib/ranking/weeks-visible";
import { type SemanaIndex } from "@/lib/scoring/weeks";
import { getSession } from "@/lib/session";
import { createAnonServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Ranking — Bolão Copa 2026",
  description: "Ranking geral e semanal do Bolão da Copa 2026.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ semana?: string }>;
};

function parseTab(raw: string | undefined, disponiveis: SemanaIndex[]): RankingTab {
  if (!raw) return "geral";
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) return "geral";
  if (!disponiveis.includes(n as SemanaIndex)) return "geral";
  return n as SemanaIndex;
}

export default async function RankingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const disponiveis = semanasVisiveis();
  const tab = parseTab(params.semana, disponiveis);

  if (params.semana && tab === "geral") {
    redirect("/ranking");
  }

  const supabase = createAnonServerClient();
  const entries =
    tab === "geral"
      ? await getRankingGeral(supabase)
      : await getRankingSemana(supabase, tab);

  const ranked = assignRanks(entries, rankKey);

  const session = await getSession();
  const myId = session.participantId ?? null;
  const myEntry = myId ? findMyEntry(ranked, myId) : null;

  return (
    <div className="min-h-screen bg-slate-200">
      <main
        className={`mx-auto min-h-screen max-w-md bg-white shadow-xl ${
          myId ? "pb-14" : ""
        }`}
      >
        <HeaderRankingPublico loggedIn={Boolean(myId)} />
        <RankingTabs active={tab} semanasDisponiveis={disponiveis} />
        {myId ? (
          <MyBanner
            entry={myEntry}
            contexto={tab === "geral" ? "geral" : "semana"}
            total={ranked.length}
          />
        ) : null}
        <section className="pb-8">
          <Lista entries={ranked} myId={myId ?? undefined} />
        </section>
      </main>
      {myId ? <BottomTabBar /> : null}
    </div>
  );
}
