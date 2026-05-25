import Link from "next/link";

import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import {
  findPrediction,
  getMatchSide,
  type MatchRow,
  type PredictionMin,
} from "@/lib/dashboard/queries";

type ProximosJogosListProps = {
  matches: MatchRow[];
  predictions: PredictionMin[];
  aberto: boolean;
};

export function ProximosJogosList({
  matches,
  predictions,
  aberto,
}: ProximosJogosListProps) {
  if (matches.length === 0) return null;

  return (
    <section className="mx-4 mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <p className="border-b border-slate-100 px-4 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Próximos jogos
      </p>
      <ul>
        {matches.map((match) => (
          <ProximosJogosItem
            key={match.id}
            match={match}
            prediction={findPrediction(predictions, match.id)}
            aberto={aberto}
          />
        ))}
      </ul>
    </section>
  );
}

type ItemProps = {
  match: MatchRow;
  prediction: PredictionMin | undefined;
  aberto: boolean;
};

function ProximosJogosItem({ match, prediction, aberto }: ItemProps) {
  const ladoA = getMatchSide(match, "a");
  const ladoB = getMatchSide(match, "b");

  const conteudo = (
    <>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ladoA.bandeira}
          alt=""
          className="h-6 w-9 shrink-0 rounded-sm object-cover shadow-sm"
        />
        <p className="flex-1 truncate text-right text-sm font-medium text-slate-900">
          {ladoA.nome}
        </p>
        <span className="text-xs text-slate-400">×</span>
        <p className="flex-1 truncate text-sm font-medium text-slate-900">
          {ladoB.nome}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ladoB.bandeira}
          alt=""
          className="h-6 w-9 shrink-0 rounded-sm object-cover shadow-sm"
        />
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
        <span>
          {formatMatchDate(match.kickoff_at)} ·{" "}
          {formatMatchTime(match.kickoff_at)}
        </span>
        {match.is_brasil && (
          <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-dark">
            2x
          </span>
        )}
        <span className="ml-auto">
          {prediction ? (
            <span className="font-semibold text-brand-blue">
              {prediction.placar_a} × {prediction.placar_b}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </span>
      </div>
    </>
  );

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      {aberto ? (
        <Link
          href={`/palpitar/${match.id}`}
          className="block px-4 py-3 transition-colors hover:bg-slate-50"
        >
          {conteudo}
        </Link>
      ) : (
        <div className="px-4 py-3">{conteudo}</div>
      )}
    </li>
  );
}
