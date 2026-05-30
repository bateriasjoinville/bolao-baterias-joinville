import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import { descreverPlaceholder } from "@/lib/admin/placeholder";
import { type MatchRow } from "@/lib/dashboard/queries";

type PlaceholderCardProps = {
  match: MatchRow;
};

export function PlaceholderCard({ match }: PlaceholderCardProps) {
  const a =
    match.selecao_a?.nome ??
    (match.placeholder_a ? descreverPlaceholder(match.placeholder_a) : "A definir");
  const b =
    match.selecao_b?.nome ??
    (match.placeholder_b ? descreverPlaceholder(match.placeholder_b) : "A definir");

  return (
    <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 last:border-b-0">
      <p className="text-xs font-medium text-slate-700">
        {a} <span className="text-slate-400">×</span> {b}
      </p>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
        <span>
          {formatMatchDate(match.kickoff_at)} ·{" "}
          {formatMatchTime(match.kickoff_at)}
        </span>
        <span aria-label="Travado">🔒</span>
        <span className="ml-auto italic">
          Confronto definido conforme a Copa avança
        </span>
      </div>
    </div>
  );
}
