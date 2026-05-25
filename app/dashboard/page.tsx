import { CountdownCard } from "@/components/dashboard/countdown-card";
import { DashboardFooter } from "@/components/dashboard/footer";
import { DashboardHeader } from "@/components/dashboard/header";
import { LigasPlaceholder } from "@/components/dashboard/ligas-placeholder";
import { PredictionsProgress } from "@/components/dashboard/predictions-progress";
import { ProximoBrasilCard } from "@/components/dashboard/proximo-brasil-card";
import { ProximoJogoCard } from "@/components/dashboard/proximo-jogo-card";
import { ProximosJogosList } from "@/components/dashboard/proximos-jogos-list";
import {
  diasParaCopa,
  isPreCopa,
  palpitesAbertos,
} from "@/lib/dashboard/format";
import { findPrediction, getDashboardData } from "@/lib/dashboard/queries";
import { createAuthedServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Bolão Copa 2026",
};

export default async function DashboardPage() {
  const supabase = await createAuthedServerClient();
  const data = await getDashboardData(supabase);
  const preCopa = isPreCopa();
  const dias = diasParaCopa();
  const aberto = palpitesAbertos();
  const mostrarProximoJogo =
    data.proximoGeral != null &&
    data.proximoGeral.id !== data.proximoBrasil?.id;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white shadow-xl">
        <DashboardHeader nome={data.nome} />

        {preCopa && <CountdownCard dias={dias} />}

        {data.proximoBrasil && (
          <ProximoBrasilCard
            match={data.proximoBrasil}
            prediction={findPrediction(data.predictions, data.proximoBrasil.id)}
          />
        )}

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

        <LigasPlaceholder />

        <div className="h-10" />

        <DashboardFooter />
      </main>
    </div>
  );
}
