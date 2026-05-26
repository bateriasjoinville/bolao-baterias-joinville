import { type Ranked } from "@/lib/ranking/rank";
import { type RankingEntry } from "@/lib/ranking/queries";

type LinhaProps = {
  entry: Ranked<RankingEntry>;
  isMe?: boolean;
};

const MEDAL_BG: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-950",
  2: "bg-slate-300 text-slate-800",
  3: "bg-amber-600 text-amber-50",
};

export function Linha({ entry, isMe = false }: LinhaProps) {
  const medalClass = MEDAL_BG[entry.posicao];

  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 ${
        isMe
          ? "border-l-4 border-brand-blue bg-yellow-50"
          : "border-b border-slate-100"
      }`}
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          medalClass ?? "bg-slate-100 text-slate-700"
        }`}
      >
        {entry.posicao}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {entry.displayName}
          {isMe ? (
            <span className="ml-1 rounded-md bg-brand-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
              VOCÊ
            </span>
          ) : null}
        </p>
        <p className="text-[11px] text-slate-500">
          {entry.placaresExatos} exatos · {entry.vencedoresAcertados} vencedores
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-extrabold text-brand-blue">{entry.pontos}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          pts
        </p>
      </div>
    </li>
  );
}
