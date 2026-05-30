"use client";

import {
  formatMatchDate,
  formatMatchTime,
} from "@/lib/dashboard/format";
import { getMatchSide } from "@/lib/dashboard/match-helpers";
import { type MatchRow } from "@/lib/dashboard/queries";
import { ScoreButtons } from "@/components/palpitar/score-buttons";
import { type PalpiteStatus } from "@/lib/palpitar/types";
import { calculatePoints } from "@/lib/scoring/calculate";

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
  onChangeScore,
  onRetry,
  onEdit,
}: MatchCardProps) {
  const ladoA = getMatchSide(match, "a");
  const ladoB = getMatchSide(match, "b");
  const hasPalpite = placarA != null && placarB != null;

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
        onEdit={onEdit}
      />
    );
  }

  return (
    <article
      className={`border-b px-4 py-4 last:border-b-0 ${
        isSaved
          ? "border-emerald-100 bg-emerald-50/60"
          : "border-slate-100 bg-white"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="text-slate-500">
          {formatMatchDate(match.kickoff_at)} ·{" "}
          {formatMatchTime(match.kickoff_at)}
        </span>
        {match.is_brasil && (
          <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-dark">
            2x PONTOS
          </span>
        )}
        {isLocked && <span aria-hidden="true">🔒</span>}
        <span className="ml-auto text-slate-400">{match.estadio}</span>
      </div>

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

function CompactCard({
  nomeA,
  nomeB,
  bandeiraA,
  bandeiraB,
  placarA,
  placarB,
  isBrasil,
  isLocked,
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
        <span className="ml-auto font-semibold text-brand-blue">
          {isLocked ? (
            <span aria-label="Travado" className="text-slate-400">
              🔒 travado
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
    label: "Acertou o vencedor",
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
          className="h-9 w-12 shrink-0 rounded-sm object-cover shadow-sm"
        />
        <p className="text-sm font-semibold text-slate-900">{nome}</p>
      </div>
      <ScoreButtons value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
