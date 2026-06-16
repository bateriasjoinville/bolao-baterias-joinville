"use client";

import { formatMatchTime } from "@/lib/dashboard/format";
import { getMatchSide } from "@/lib/dashboard/match-helpers";
import { type MatchRow } from "@/lib/dashboard/queries";
import { LockCountdownBadge } from "@/components/palpitar/lock-countdown-badge";
import { ScoreButtons } from "@/components/palpitar/score-buttons";
import { type LockTier } from "@/lib/palpitar/lock";
import { type PalpiteStatus } from "@/lib/palpitar/types";
import { calculatePoints } from "@/lib/scoring/calculate";

export type LockCountdown = { tier: LockTier; mins: number };

type MatchCardProps = {
  match: MatchRow;
  placarA: number | null;
  placarB: number | null;
  mode: "edit" | "compact" | "encerrado";
  isSaved: boolean;
  status: PalpiteStatus;
  errorMsg?: string;
  isLocked: boolean;
  lockText?: string;
  lockCountdown?: LockCountdown;
  onChangeScore: (side: "a" | "b", value: number) => void;
  onRetry: () => void;
  onEdit: () => void;
};

export function MatchCard({
  match,
  placarA,
  placarB,
  mode,
  isSaved,
  status,
  errorMsg,
  isLocked,
  lockText,
  lockCountdown,
  onChangeScore,
  onRetry,
  onEdit,
}: MatchCardProps) {
  const ladoA = getMatchSide(match, "a");
  const ladoB = getMatchSide(match, "b");
  const hasPalpite = placarA != null && placarB != null;
  // Madrugada: 00:00–05:59 no horário BRT (UTC-3).
  const brtHour = new Date(
    new Date(match.kickoff_at).getTime() - 3 * 60 * 60 * 1000,
  ).getUTCHours();
  const madrugada = brtHour < 6;

  if (
    mode === "encerrado" &&
    match.placar_a != null &&
    match.placar_b != null
  ) {
    return (
      <EncerradoCard
        nomeA={ladoA.nome}
        nomeB={ladoB.nome}
        bandeiraA={ladoA.bandeira}
        bandeiraB={ladoB.bandeira}
        realA={match.placar_a}
        realB={match.placar_b}
        palpiteA={placarA}
        palpiteB={placarB}
        isBrasil={match.is_brasil}
      />
    );
  }

  if (mode === "compact") {
    return (
      <CompactCard
        nomeA={ladoA.nome}
        nomeB={ladoB.nome}
        bandeiraA={ladoA.bandeira}
        bandeiraB={ladoB.bandeira}
        placarA={placarA}
        placarB={placarB}
        isBrasil={match.is_brasil}
        isLocked={isLocked}
        lockCountdown={lockCountdown}
        onEdit={onEdit}
      />
    );
  }

  return (
    <article
      className={`mx-3 my-2 rounded-xl border-[0.5px] px-2.5 py-2.5 shadow-sm ${
        match.is_brasil ? "border-brand-yellow" : "border-slate-200"
      } ${isSaved ? "bg-emerald-50/60" : "bg-white"}`}
    >
      <div className="flex items-center gap-1.5 text-xs">
        <span className="shrink-0 font-medium text-slate-500">
          {formatMatchTime(match.kickoff_at)}
        </span>
        {madrugada && (
          <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-500">
            🌙 madrugada
          </span>
        )}
        <span className="min-w-0 truncate text-slate-400">
          · {match.estadio}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {match.is_brasil && (
            <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-[#13136e]">
              vale o dobro
            </span>
          )}
          {lockCountdown && (
            <LockCountdownBadge
              tier={lockCountdown.tier}
              mins={lockCountdown.mins}
            />
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <p className="truncate text-right text-sm font-semibold text-slate-900">
            {ladoA.nome}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ladoA.bandeira}
            alt=""
            className="h-4 w-6 shrink-0 rounded-[2px] object-cover shadow-sm"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ScoreBox value={placarA} />
          <span className="text-sm font-bold text-slate-400">×</span>
          <ScoreBox value={placarB} />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ladoB.bandeira}
            alt=""
            className="h-4 w-6 shrink-0 rounded-[2px] object-cover shadow-sm"
          />
          <p className="truncate text-sm font-semibold text-slate-900">
            {ladoB.nome}
          </p>
        </div>
      </div>

      <div className="mt-2.5 space-y-2">
        <GolsBlock
          nome={ladoA.nome}
          value={placarA}
          disabled={isLocked}
          onChange={(v) => onChangeScore("a", v)}
        />
        <GolsBlock
          nome={ladoB.nome}
          value={placarB}
          disabled={isLocked}
          onChange={(v) => onChangeScore("b", v)}
        />
      </div>

      {isLocked ? (
        <p className="mt-2.5 text-xs font-semibold text-slate-600">
          {hasPalpite
            ? `🔒 Palpite travado${lockText ? ` · ${lockText}` : ""}`
            : `🔒 Sem palpite${lockText ? ` · ${lockText}` : ""}`}
        </p>
      ) : (
        <StatusLine status={status} errorMsg={errorMsg} onRetry={onRetry} />
      )}
    </article>
  );
}

function ScoreBox({ value }: { value: number | null }) {
  const filled = value != null;
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-md text-lg font-extrabold tabular-nums ${
        filled
          ? "bg-brand-blue text-white"
          : "border border-dashed border-slate-300 bg-slate-100 text-slate-300"
      }`}
    >
      {filled ? value : "–"}
    </div>
  );
}

function GolsBlock({
  nome,
  value,
  disabled,
  onChange,
}: {
  nome: string;
  value: number | null;
  disabled: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="mb-1.5 text-xs font-semibold text-slate-600">
        Gols do {nome}
      </p>
      <ScoreButtons value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function CompactCard({
  nomeA,
  nomeB,
  bandeiraA,
  bandeiraB,
  placarA,
  placarB,
  isBrasil,
  isLocked,
  lockCountdown,
  onEdit,
}: {
  nomeA: string;
  nomeB: string;
  bandeiraA: string;
  bandeiraB: string;
  placarA: number | null;
  placarB: number | null;
  isBrasil: boolean;
  isLocked: boolean;
  lockCountdown?: LockCountdown;
  onEdit: () => void;
}) {
  const conteudo = (
    <>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bandeiraA}
          alt=""
          className="h-6 w-9 shrink-0 rounded-sm object-cover shadow-sm"
        />
        <p className="flex-1 truncate text-right text-sm font-medium text-slate-900">
          {nomeA}
        </p>
        <span className="text-xs text-slate-400">×</span>
        <p className="flex-1 truncate text-sm font-medium text-slate-900">
          {nomeB}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bandeiraB}
          alt=""
          className="h-6 w-9 shrink-0 rounded-sm object-cover shadow-sm"
        />
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className="font-semibold text-emerald-600">
          ✓ {placarA}×{placarB}
        </span>
        {isBrasil && (
          <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-dark">
            2x
          </span>
        )}
        {lockCountdown && (
          <LockCountdownBadge tier={lockCountdown.tier} mins={lockCountdown.mins} />
        )}
        <span className="ml-auto font-semibold text-brand-blue">
          {isLocked ? (
            <span aria-label="Travado" className="text-slate-400">
              Editar bloqueado
            </span>
          ) : (
            "Editar"
          )}
        </span>
      </div>
    </>
  );

  return (
    <article className="border-b border-emerald-100 bg-emerald-50/60 last:border-b-0">
      {isLocked ? (
        <div className="px-4 py-3">{conteudo}</div>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="w-full px-4 py-3 text-left transition-colors hover:bg-emerald-100/60"
        >
          {conteudo}
        </button>
      )}
    </article>
  );
}

type CasoEncerrado = "exato" | "vencedor" | "errou" | "sem";

const CASO_ESTILO: Record<
  CasoEncerrado,
  { label: string; accent: string; faixa: string; selo: string; pontos: string }
> = {
  exato: {
    label: "✓ Cravou!",
    accent: "border-l-emerald-500",
    faixa: "border-emerald-200 bg-emerald-50",
    selo: "text-emerald-700",
    pontos: "bg-emerald-600 text-white",
  },
  vencedor: {
    label: "Acertou o resultado",
    accent: "border-l-amber-400",
    faixa: "border-amber-200 bg-amber-50",
    selo: "text-amber-800",
    pontos: "bg-brand-yellow text-brand-blue-dark",
  },
  errou: {
    label: "Não foi dessa vez",
    accent: "border-l-rose-400",
    faixa: "border-rose-200 bg-rose-50",
    selo: "text-rose-700",
    pontos: "bg-slate-200 text-slate-600",
  },
  sem: {
    label: "Sem palpite",
    accent: "border-l-slate-300",
    faixa: "border-slate-200 bg-slate-50",
    selo: "text-slate-600",
    pontos: "bg-slate-200 text-slate-500",
  },
};

function BrasilTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-dark">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/flags/br.svg"
        alt=""
        className="h-3 w-4 rounded-[1px] object-cover"
      />
      2x PONTOS
    </span>
  );
}

function EncerradoCard({
  nomeA,
  nomeB,
  bandeiraA,
  bandeiraB,
  realA,
  realB,
  palpiteA,
  palpiteB,
  isBrasil,
}: {
  nomeA: string;
  nomeB: string;
  bandeiraA: string;
  bandeiraB: string;
  realA: number;
  realB: number;
  palpiteA: number | null;
  palpiteB: number | null;
  isBrasil: boolean;
}) {
  const hasPalpite = palpiteA != null && palpiteB != null;
  const bd =
    palpiteA != null && palpiteB != null
      ? calculatePoints(
          { a: palpiteA, b: palpiteB },
          { a: realA, b: realB },
          isBrasil,
        )
      : null;

  const caso: CasoEncerrado = !bd
    ? "sem"
    : bd.exato
      ? "exato"
      : bd.vencedor
        ? "vencedor"
        : "errou";
  const estilo = CASO_ESTILO[caso];

  return (
    <article
      className={`border-b border-b-slate-100 border-l-4 bg-white px-4 py-4 last:border-b-0 ${estilo.accent}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Resultado final
        </span>
        {isBrasil ? <BrasilTag /> : null}
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-1 flex-col items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bandeiraA}
            alt=""
            className="h-10 w-14 rounded-sm object-cover shadow-sm"
          />
          <p className="text-center text-xs font-semibold text-slate-900">
            {nomeA}
          </p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900">{realA}</span>
          <span className="text-base font-bold text-slate-400">×</span>
          <span className="text-3xl font-extrabold text-slate-900">{realB}</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bandeiraB}
            alt=""
            className="h-10 w-14 rounded-sm object-cover shadow-sm"
          />
          <p className="text-center text-xs font-semibold text-slate-900">
            {nomeB}
          </p>
        </div>
      </div>

      <div
        className={`mt-3 flex items-center justify-between gap-2 rounded-md border px-3 py-2 ${estilo.faixa}`}
      >
        <div className="min-w-0">
          <p className={`text-xs font-bold ${estilo.selo}`}>{estilo.label}</p>
          <p className="mt-0.5 text-xs text-slate-600">
            {hasPalpite
              ? `Seu palpite: ${palpiteA}×${palpiteB}`
              : "Você não palpitou"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-extrabold ${estilo.pontos}`}
        >
          {bd && bd.pontos > 0 ? `+${bd.pontos} pts` : "0 pts"}
        </span>
      </div>
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
    return <p className="mt-3 text-xs text-slate-500">salvando…</p>;
  }
  if (status === "saved") {
    return (
      <p className="mt-3 text-xs font-semibold text-emerald-600">✓ salvo</p>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <span className="text-rose-600">❌ {errorMsg ?? "Erro ao salvar."}</span>
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

