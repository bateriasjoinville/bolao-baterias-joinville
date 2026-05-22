import { ComoFunciona } from "@/components/home/como-funciona";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { PontuacaoCard } from "@/components/home/pontuacao-card";
import { PremiosLista } from "@/components/home/premios-lista";
import { RankingPreview } from "@/components/home/ranking-preview";
import { TopBar } from "@/components/home/top-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <TopBar />
        <Hero />
        <ComoFunciona />
        <PontuacaoCard />
        <PremiosLista />
        <RankingPreview />
        <FinalCta />
      </main>
    </div>
  );
}
