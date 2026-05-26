"use client";

import { useEffect, useRef, useState } from "react";

import { salvarPlacar } from "@/app/admin/placares/actions";
import { PLACAR_MAX, PLACAR_MIN } from "@/lib/validation/palpite";

const SAVED_DISPLAY_MS = 2500;

type Side = {
  nome: string;
  codigoIso: string;
};

type PlacarRowProps = {
  matchId: number;
  kickoffAt: string;
  fase: string;
  grupo: string | null;
  estadio: string;
  isBrasil: boolean;
  selecaoA: Side;
  selecaoB: Side;
  initialPlacarA: number | null;
  initialPlacarB: number | null;
};

type Status = "idle" | "saving" | "saved" | "error";

export function PlacarRow({
  matchId,
  kickoffAt,
  fase,
  grupo,
  estadio,
  isBrasil,
  selecaoA,
  selecaoB,
  initialPlacarA,
  initialPlacarB,
}: PlacarRowProps) {
  const [placarA, setPlacarA] = useState<string>(
    initialPlacarA != null ? String(initialPlacarA) : "",
  );
  const [placarB, setPlacarB] = useState<string>(
    initialPlacarB != null ? String(initialPlacarB) : "",
  );
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const hasInitial = initialPlacarA != null && initialPlacarB != null;

  const flashSaved = () => {
    setStatus("saved");
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
      setStatus("idle");
      savedTimerRef.current = null;
    }, SAVED_DISPLAY_MS);
  };

  const handleSave = async () => {
    const a = Number(placarA);
    const b = Number(placarB);
    if (
      !Number.isInteger(a) ||
      !Number.isInteger(b) ||
      a < PLACAR_MIN ||
      a > PLACAR_MAX ||
      b < PLACAR_MIN ||
      b > PLACAR_MAX
    ) {
      setStatus("error");
      setErrorMsg(`Placar deve ser inteiro entre ${PLACAR_MIN} e ${PLACAR_MAX}.`);
      return;
    }

    setStatus("saving");
    setErrorMsg(null);
    setIsPending(true);
    try {
      const result = await salvarPlacar({
        matchId,
        placarA: a,
        placarB: b,
      });
      if (result.ok) {
        flashSaved();
      } else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleClear = async () => {
    setStatus("saving");
    setErrorMsg(null);
    setIsPending(true);
    try {
      const result = await salvarPlacar({ matchId, clear: true });
      if (result.ok) {
        setPlacarA("");
        setPlacarB("");
        flashSaved();
      } else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    } finally {
      setIsPending(false);
    }
  };

  const kickoff = new Date(kickoffAt);
  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(kickoff);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>
          {dateStr} · {fase}
          {grupo ? ` ${grupo}` : ""} · {estadio}
        </span>
        {isBrasil ? (
          <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold text-brand-blue-dark">
            🇧🇷 2x pontos
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
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
          value={placarA}
          onChange={(e) => setPlacarA(e.target.value)}
          disabled={isPending}
          aria-label={`Placar ${selecaoA.nome}`}
          className="w-14 rounded-lg border border-slate-300 px-2 py-2 text-center text-base font-bold text-slate-900 focus:border-brand-blue focus:outline-none disabled:opacity-60"
        />
        <span className="text-sm font-bold text-slate-400">×</span>
        <input
          type="number"
          inputMode="numeric"
          min={PLACAR_MIN}
          max={PLACAR_MAX}
          value={placarB}
          onChange={(e) => setPlacarB(e.target.value)}
          disabled={isPending}
          aria-label={`Placar ${selecaoB.nome}`}
          className="w-14 rounded-lg border border-slate-300 px-2 py-2 text-center text-base font-bold text-slate-900 focus:border-brand-blue focus:outline-none disabled:opacity-60"
        />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">
            {selecaoB.nome}
          </span>
          <img
            src={`/flags/${selecaoB.codigoIso}.svg`}
            alt={selecaoB.nome}
            className="h-6 w-9 flex-shrink-0 object-cover"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-xs">
          {status === "saving" ? (
            <span className="text-slate-500">Salvando...</span>
          ) : status === "saved" ? (
            <span className="font-semibold text-emerald-600">✓ Salvo</span>
          ) : status === "error" ? (
            <span className="text-red-600">{errorMsg}</span>
          ) : (
            <span className="text-slate-400">&nbsp;</span>
          )}
        </div>
        <div className="flex gap-2">
          {hasInitial ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Limpar
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-blue-hover disabled:opacity-60"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
