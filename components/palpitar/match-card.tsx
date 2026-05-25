"use client";

import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import { getMatchSide } from "@/lib/dashboard/match-helpers";
import { type MatchRow } from "@/lib/dashboard/queries";
import { ScoreButtons } from "@/components/palpitar/score-buttons";
import { type PalpiteStatus } from "@/lib/palpitar/types";

type MatchCardProps = {
  match: MatchRow;
  placarA: number | null;
  placarB: number | null;
  isSaved: boolean;
  status: PalpiteStatus;
  errorMsg?: string;
  isLocked: boolean;
  lockText?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onChangeScore: (side: "a" | "b", value: number) => void;
  onRetry: () => void;
};

export function MatchCard({
  match,
  placarA,
  placarB,
  isSaved,
  status,
  errorMsg,
  isLocked,
  lockText,
  isExpanded,
  onToggle,
  onChangeScore,
  onRetry,
}: MatchCardProps) {
  const ladoA = getMatchSide(match, "a");
  const ladoB = getMatchSide(match, "b");
  const hasPalpite = placarA != null && placarB != null;

  return (
    <article className="border-b border-slate-100 bg-white last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ladoA.bandeira}
            alt=""
            className="h-8 w-12 shrink-0 rounded-sm object-cover shadow-sm"
          />
          <p className="flex-1 truncate text-right text-sm font-semibold text-slate-900">
            {ladoA.nome}
          </p>
          <span className="text-xs text-slate-400">×</span>
          <p className="flex-1 truncate text-sm font-semibold text-slate-900">
            {ladoB.nome}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ladoB.bandeira}
            alt=""
            className="h-8 w-12 shrink-0 rounded-sm object-cover shadow-sm"
          />
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          <span className="text-slate-500">
            {formatMatchDate(match.kickoff_at)} ·{" "}
            {formatMatchTime(match.kickoff_at)}
          </span>
          {match.is_brasil && (
            <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-dark">
              2x
            </span>
          )}
          {isLocked && <span aria-hidden="true">🔒</span>}
          <span className="ml-auto">
            {hasPalpite ? (
              isSaved ? (
                <span className="font-semibold text-emerald-600">
                  ✓ {placarA}×{placarB}
                </span>
              ) : (
                <span className="font-semibold text-slate-700">
                  {placarA}×{placarB}
                </span>
              )
            ) : (
              <span className="text-slate-400">— sem palpite</span>
            )}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          <p className="mb-4 text-xs text-slate-500">{match.estadio}</p>

          <SidePicker
            nome={ladoA.nome}
            bandeira={ladoA.bandeira}
            value={placarA}
            disabled={isLocked}
            onChange={(v) => onChangeScore("a", v)}
          />

          <div className="mt-4" />

          <SidePicker
            nome={ladoB.nome}
            bandeira={ladoB.bandeira}
            value={placarB}
            disabled={isLocked}
            onChange={(v) => onChangeScore("b", v)}
          />

          {isLocked ? (
            <p className="mt-4 text-xs font-semibold text-slate-600">
              🔒 Palpite travado{lockText ? ` · ${lockText}` : ""}
            </p>
          ) : (
            <StatusLine
              status={status}
              errorMsg={errorMsg}
              onRetry={onRetry}
            />
          )}
        </div>
      )}
    </article>
  );
}

function StatusLine({
  status,
  errorMsg,
  onRetry,
}: {
  status: PalpiteStatus;
  errorMsg?: string;
  onRetry: () => void;
}) {
  if (status === "idle") return <div className="mt-3 h-5" />;
  if (status === "saving") {
    return (
      <p className="mt-3 text-xs text-slate-500">salvando…</p>
    );
  }
  if (status === "saved") {
    return (
      <p className="mt-3 text-xs font-semibold text-emerald-600">✓ salvo</p>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <span className="text-rose-600">
        ❌ {errorMsg ?? "Erro ao salvar."}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="font-semibold text-brand-blue underline-offset-2 hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function SidePicker({
  nome,
  bandeira,
  value,
  disabled,
  onChange,
}: {
  nome: string;
  bandeira: string;
  value: number | null;
  disabled: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bandeira}
          alt=""
          className="h-12 w-16 shrink-0 rounded-sm object-cover shadow-sm"
        />
        <p className="text-sm font-semibold text-slate-900">{nome}</p>
      </div>
      <ScoreButtons value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
