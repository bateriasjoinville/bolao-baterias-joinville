import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import { type MatchRow } from "@/lib/dashboard/queries";

type PlaceholderCardProps = {
  match: MatchRow;
};

export function PlaceholderCard({ match }: PlaceholderCardProps) {
  const a = match.selecao_a?.nome ?? match.placeholder_a ?? "A definir";
  const b = match.selecao_b?.nome ?? match.placeholder_b ?? "A definir";

  return (
    <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2 last:border-b-0">
      <div className="flex items-center gap-2 text-xs">
        <span className="flex-1 truncate text-slate-600">
          {a} × {b}
        </span>
        <span className="text-slate-500">
          {formatMatchDate(match.kickoff_at)} ·{" "}
          {formatMatchTime(match.kickoff_at)}
        </span>
        <span aria-label="Travado">🔒</span>
      </div>
      <p className="mt-0.5 text-[11px] italic text-slate-500">
        Confronto definido após fase de grupos
      </p>
    </div>
  );
}
