import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import {
  getMatchSide,
  type MatchRow,
  type PredictionMin,
} from "@/lib/dashboard/queries";

type ProximoJogoCardProps = {
  match: MatchRow;
  prediction: PredictionMin | undefined;
};

export function ProximoJogoCard({
  match,
  prediction,
}: ProximoJogoCardProps) {
  const ladoA = getMatchSide(match, "a");
  const ladoB = getMatchSide(match, "b");

  return (
    <section className="mx-4 mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Próximo jogo
      </p>

      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ladoA.bandeira}
          alt={ladoA.nome}
          className="h-8 w-12 shrink-0 rounded-sm object-cover shadow-sm"
        />
        <p className="flex-1 truncate text-sm font-semibold text-slate-900">
          {ladoA.nome}
        </p>
        <p className="text-xs text-slate-400">×</p>
        <p className="flex-1 truncate text-right text-sm font-semibold text-slate-900">
          {ladoB.nome}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ladoB.bandeira}
          alt={ladoB.nome}
          className="h-8 w-12 shrink-0 rounded-sm object-cover shadow-sm"
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {formatMatchDate(match.kickoff_at)} ·{" "}
          {formatMatchTime(match.kickoff_at)}
        </span>
        {prediction ? (
          <span className="font-semibold text-brand-blue">
            Palpite: {prediction.placar_a} × {prediction.placar_b}
          </span>
        ) : (
          <span className="text-slate-400">Sem palpite</span>
        )}
      </div>
    </section>
  );
}
