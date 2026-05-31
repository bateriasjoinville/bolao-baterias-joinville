import { Brinde } from "@/components/home/brinde";
import { ComoFunciona } from "@/components/home/como-funciona";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { LigaSocial } from "@/components/home/liga-social";
import { PontuacaoCard } from "@/components/home/pontuacao-card";
import { ProvaSocial } from "@/components/home/prova-social";
import { Urgencia } from "@/components/home/urgencia";
import {
  getPrimeiroJogoKickoff,
  getTotalParticipantes,
} from "@/lib/home/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [kickoffISO, totalParticipantes] = await Promise.all([
    getPrimeiroJogoKickoff(),
    getTotalParticipantes(),
  ]);

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <Hero kickoffISO={kickoffISO} />
        <Brinde />
        <LigaSocial />
        <ComoFunciona />
        <PontuacaoCard />
        <Urgencia />
        <ProvaSocial total={totalParticipantes} />
        <FinalCta />
      </main>
    </div>
  );
}
