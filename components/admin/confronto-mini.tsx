import { type MatchInfo } from "@/lib/admin/predictions";

function dataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function Flag({ iso, nome }: { iso: string; nome: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${iso}.svg`}
      alt={nome}
      className="h-5 w-7 flex-shrink-0 rounded-[2px] object-cover"
    />
  );
}

type Props = {
  match: MatchInfo;
  /** Placar oficial do jogo (se já encerrado). */
  showPlacar?: boolean;
};

export function ConfrontoMini({ match, showPlacar = true }: Props) {
  const encerrado = match.placarA != null && match.placarB != null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
        <span className="truncate">
          {dataHora(match.kickoffAt)} · {match.fase}
          {match.grupo ? ` ${match.grupo}` : ""} · {match.estadio}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {match.isBrasil ? (
            <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold text-brand-blue-dark">
              🇧🇷 2x pontos
            </span>
          ) : null}
          {encerrado ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Encerrado
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag iso={match.selecaoA.codigoIso} nome={match.selecaoA.nome} />
          <span className="truncate text-sm font-semibold text-slate-900">
            {match.selecaoA.nome}
          </span>
        </div>

        <span className="shrink-0 text-base font-extrabold text-slate-900">
          {showPlacar && encerrado ? (
            `${match.placarA} × ${match.placarB}`
          ) : (
            <span className="text-slate-300">×</span>
          )}
        </span>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">
            {match.selecaoB.nome}
          </span>
          <Flag iso={match.selecaoB.codigoIso} nome={match.selecaoB.nome} />
        </div>
      </div>
    </div>
  );
}
