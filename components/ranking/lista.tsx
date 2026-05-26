import { Linha } from "@/components/ranking/linha";
import { type RankingEntry } from "@/lib/ranking/queries";
import { type Ranked } from "@/lib/ranking/rank";

type ListaProps = {
  entries: Ranked<RankingEntry>[];
  myId?: string;
};

export function Lista({ entries, myId }: ListaProps) {
  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-slate-500">Ninguém pontuou ainda.</p>
        <p className="mt-1 text-xs text-slate-400">
          O ranking aparece quando os primeiros placares forem lançados.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {entries.map((e) => (
        <Linha key={e.participantId} entry={e} isMe={e.participantId === myId} />
      ))}
    </ul>
  );
}
