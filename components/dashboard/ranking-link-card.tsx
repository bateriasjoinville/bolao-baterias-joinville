import { Trophy } from "lucide-react";
import Link from "next/link";

import { type Ranked } from "@/lib/ranking/rank";
import { type RankingEntry } from "@/lib/ranking/queries";

type RankingLinkCardProps = {
  myEntry: Ranked<RankingEntry> | null;
};

export function RankingLinkCard({ myEntry }: RankingLinkCardProps) {
  const pontuou = myEntry && myEntry.palpitesValidos > 0;

  return (
    <Link
      href="/ranking"
      className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-brand-blue"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-blue-dark">
        <Trophy className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-1 flex-col">
        {pontuou ? (
          <>
            <span className="text-sm font-semibold text-slate-900">
              Você está em {myEntry.posicao}º · {myEntry.pontos} pts
            </span>
            <span className="text-xs text-slate-500">Ver ranking completo</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-slate-900">
              Ver classificação
            </span>
            <span className="text-xs text-slate-500">
              Acompanhe quem tá na frente
            </span>
          </>
        )}
      </span>
      <span aria-hidden className="text-lg text-slate-400">
        →
      </span>
    </Link>
  );
}
