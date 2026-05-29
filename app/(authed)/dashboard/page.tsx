import { CountdownCard } from "@/components/dashboard/countdown-card";
import { DashboardHeader } from "@/components/dashboard/header";
import { LigasResumo } from "@/components/dashboard/ligas-resumo";
import { PredictionsProgress } from "@/components/dashboard/predictions-progress";
import { ProximoBrasilCard } from "@/components/dashboard/proximo-brasil-card";
import { ProximoJogoCard } from "@/components/dashboard/proximo-jogo-card";
import { ProximosJogosList } from "@/components/dashboard/proximos-jogos-list";
import { RankingLinkCard } from "@/components/dashboard/ranking-link-card";
import {
  diasParaCopa,
  isPreCopa,
  palpitesAbertos,
} from "@/lib/dashboard/format";
import { findPrediction, getDashboardData } from "@/lib/dashboard/queries";
import {
  aggregateLigaStats,
  getMinhasLigas,
  type LigaResumo,
  type LigaStats,
} from "@/lib/leagues/queries";
import { findMyEntry } from "@/lib/ranking/me";
import { getRankingGeral } from "@/lib/ranking/queries";
import { assignRanks, rankKey } from "@/lib/ranking/rank";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createAuthedServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Bolão Copa 2026",
};

export default async function DashboardPage() {
  const supabase = await createAuthedServerClient();
  const session = await getSession();
  const myId = session.participantId;

  // Admin (service role) pra listagem das ligas: RLS de league_members é
  // estrita pra non-owners (só self), o que esconderia ligas pendentes do user.
  // Como já temos myId via session, autorização aqui é trivial.
  const admin = getSupabaseAdmin();
  const ligasPromise: Promise<LigaResumo[]> = myId
    ? getMinhasLigas(admin, myId)
    : Promise.resolve([]);

  const [data, rankingEntries, ligas] = await Promise.all([
    getDashboardData(supabase),
    getRankingGeral(supabase),
    ligasPromise,
  ]);

  const ownedIds = ligas
    .filter((l) => l.meuPapel === "owner")
    .map((l) => l.id);
  const ligaStats =
    ownedIds.length > 0
      ? await aggregateLigaStats(admin, ownedIds)
      : new Map<string, LigaStats>();

  const ranked = assignRanks(rankingEntries, rankKey);
  const myEntry = myId ? findMyEntry(ranked, myId) : null;

  const preCopa = isPreCopa();
  const dias = diasParaCopa();
  const aberto = palpitesAbertos();
  const mostrarProximoJogo =
    data.proximoGeral != null &&
    data.proximoGeral.id !== data.proximoBrasil?.id;
  const mostrarRankingCard = !preCopa || myEntry !== null;

  return (
    <>
      <DashboardHeader nome={data.nome} />

      {preCopa && <CountdownCard dias={dias} />}

      {data.proximoBrasil && (
        <ProximoBrasilCard
          match={data.proximoBrasil}
          prediction={findPrediction(data.predictions, data.proximoBrasil.id)}
        />
      )}

      {mostrarRankingCard && <RankingLinkCard myEntry={myEntry} />}

      {mostrarProximoJogo && data.proximoGeral && (
        <ProximoJogoCard
          match={data.proximoGeral}
          prediction={findPrediction(data.predictions, data.proximoGeral.id)}
        />
      )}

      <PredictionsProgress
        feitos={data.predictions.length}
        total={data.totalMatches}
        aberto={aberto}
      />

      <ProximosJogosList
        matches={data.proximos5}
        predictions={data.predictions}
        aberto={aberto}
      />

      <LigasResumo ligas={ligas} stats={ligaStats} />
    </>
  );
}
