"use client";

import Link from "next/link";

import { PLACAR_MAX, PLACAR_MIN } from "@/lib/validation/palpite";

type Side = {
  nome: string;
  codigoIso: string;
};

type PlacarRowProps = {
  kickoffAt: string;
  fase: string;
  grupo: string | null;
  estadio: string;
  isBrasil: boolean;
  selecaoA: Side;
  selecaoB: Side;
  valueA: string;
  valueB: string;
  encerrado: boolean;
  changed: boolean;
  invalid: boolean;
  palpitesHref: string | null;
  onChange: (side: "a" | "b", value: string) => void;
};

export function PlacarRow({
  kickoffAt,
  fase,
  grupo,
  estadio,
  isBrasil,
  selecaoA,
  selecaoB,
  valueA,
  valueB,
  encerrado,
  changed,
  invalid,
  palpitesHref,
  onChange,
}: PlacarRowProps) {
  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(kickoffAt));

  const inputClass = `w-14 rounded-lg border px-2 py-2 text-center text-base font-bold text-slate-900 focus:border-brand-blue focus:outline-none ${
    invalid ? "border-red-500 bg-red-50" : "border-slate-300"
  }`;

  return (
    <div
      className={`rounded-xl border bg-white px-3 py-3 shadow-sm ${
        changed ? "border-brand-blue ring-1 ring-brand-blue" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
        <span className="truncate">
          {dateStr} · {fase}
          {grupo ? ` ${grupo}` : ""} · {estadio}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isBrasil ? (
            <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold text-brand-blue-dark">
              🇧🇷 2x pontos
            </span>
          ) : null}
          {encerrado ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Encerrado
            </span>
          ) : null}
          {changed ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              Alterado
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/flags/${selecaoA.codigoIso}.svg`}
            alt={selecaoA.nome}
            className="h-6 w-9 flex-shrink-0 object-cover"
          />
          <span className="truncate text-sm font-semibold text-slate-900">
            {selecaoA.nome}
          </span>
        </div>

        <input
          type="number"
          inputMode="numeric"
          min={PLACAR_MIN}
          max={PLACAR_MAX}
          value={valueA}
          onChange={(e) => onChange("a", e.target.value)}
          aria-label={`Placar ${selecaoA.nome}`}
          className={inputClass}
        />
        <span className="text-sm font-bold text-slate-400">×</span>
        <input
          type="number"
          inputMode="numeric"
          min={PLACAR_MIN}
          max={PLACAR_MAX}
          value={valueB}
          onChange={(e) => onChange("b", e.target.value)}
          aria-label={`Placar ${selecaoB.nome}`}
          className={inputClass}
        />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">
            {selecaoB.nome}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/flags/${selecaoB.codigoIso}.svg`}
            alt={selecaoB.nome}
            className="h-6 w-9 flex-shrink-0 object-cover"
          />
        </div>
      </div>

      {palpitesHref ? (
        <div className="mt-2 border-t border-slate-100 pt-2">
          <Link
            href={palpitesHref}
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            🔒 Ver palpites →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
