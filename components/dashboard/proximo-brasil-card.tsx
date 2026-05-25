import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import {
  getMatchSide,
  type MatchRow,
  type PredictionMin,
} from "@/lib/dashboard/queries";

type ProximoBrasilCardProps = {
  match: MatchRow;
  prediction: PredictionMin | undefined;
};

export function ProximoBrasilCard({
  match,
  prediction,
}: ProximoBrasilCardProps) {
  const ladoA = getMatchSide(match, "a");
  const ladoB = getMatchSide(match, "b");

  return (
    <section className="mx-4 mt-4 rounded-lg border-2 border-brand-yellow bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded bg-brand-yellow px-2 py-0.5 text-xs font-bold text-brand-blue-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/flags/br.svg"
            alt=""
            className="h-3 w-4 rounded-[1px] object-cover"
          />
          2x PONTOS
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Próximo do Brasil
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ladoA.bandeira}
            alt={ladoA.nome}
            className="h-16 w-24 rounded-sm object-cover shadow-sm"
          />
          <p className="text-center text-sm font-semibold text-slate-900">
            {ladoA.nome}
          </p>
        </div>

        <p className="text-sm font-bold uppercase text-slate-600">vs</p>

        <div className="flex flex-1 flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ladoB.bandeira}
            alt={ladoB.nome}
            className="h-16 w-24 rounded-sm object-cover shadow-sm"
          />
          <p className="text-center text-sm font-semibold text-slate-900">
            {ladoB.nome}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-600">
        {formatMatchDate(match.kickoff_at)} ·{" "}
        {formatMatchTime(match.kickoff_at)}
      </p>
      <p className="text-center text-xs text-slate-500">{match.estadio}</p>

      <p className="mt-3 border-t border-slate-100 pt-3 text-center text-sm">
        {prediction ? (
          <span className="font-semibold text-brand-blue">
            Seu palpite: {prediction.placar_a} × {prediction.placar_b}
          </span>
        ) : (
          <span className="text-slate-500">Sem palpite ainda</span>
        )}
      </p>
    </section>
  );
}
