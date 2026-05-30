"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { definirConfrontoMataMata } from "@/app/admin/mata-mata/actions";
import {
  type LadoConfronto,
  type SelecaoOption,
} from "@/lib/admin/mata-mata-types";

const FASE_LABEL: Record<string, string> = {
  r32: "32-avos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semifinais: "Semifinais",
  terceiro: "3º lugar",
  final: "Final",
};

type ConfrontoRowProps = {
  matchId: number;
  fase: string;
  kickoffAt: string;
  estadio: string;
  isBrasil: boolean;
  ladoA: LadoConfronto;
  ladoB: LadoConfronto;
  todasSelecoes: SelecaoOption[];
};

type Status = "idle" | "saving" | "saved" | "error";

export function ConfrontoRow({
  matchId,
  fase,
  kickoffAt,
  estadio,
  isBrasil,
  ladoA,
  ladoB,
  todasSelecoes,
}: ConfrontoRowProps) {
  const router = useRouter();
  const [selA, setSelA] = useState("");
  const [selB, setSelB] = useState("");
  const [brasil, setBrasil] = useState(isBrasil);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selById = useMemo(
    () => new Map(todasSelecoes.map((s) => [s.id, s])),
    [todasSelecoes],
  );

  function handlePick(value: string, lado: "a" | "b") {
    if (lado === "a") setSelA(value);
    else setSelB(value);
    const s = value ? selById.get(Number(value)) : undefined;
    if (s?.codigoIso === "br") setBrasil(true);
  }

  function handleSave() {
    const selecaoAId = selA ? Number(selA) : null;
    const selecaoBId = selB ? Number(selB) : null;
    setStatus("saving");
    setErrorMsg(null);
    startTransition(async () => {
      const r = await definirConfrontoMataMata({
        matchId,
        selecaoAId,
        selecaoBId,
        isBrasil: brasil,
      });
      if (!r.ok) {
        setStatus("error");
        setErrorMsg(r.error);
        return;
      }
      setStatus("saved");
      router.refresh();
    });
  }

  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(kickoffAt));

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
        <span>
          Jogo {matchId} · {FASE_LABEL[fase] ?? fase} · {dateStr} · {estadio}
        </span>
        {brasil ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold text-brand-blue-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flags/br.svg"
              alt=""
              className="h-2.5 w-3.5 rounded-[1px] object-cover"
            />
            2x
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-3">
        <LadoPicker
          titulo="Time A"
          lado="a"
          info={ladoA}
          value={selA}
          todasSelecoes={todasSelecoes}
          onPick={handlePick}
        />
        <LadoPicker
          titulo="Time B"
          lado="b"
          info={ladoB}
          value={selB}
          todasSelecoes={todasSelecoes}
          onPick={handlePick}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={brasil}
            onChange={(e) => setBrasil(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
          />
          Jogo do Brasil (2x)
        </label>

        <div className="flex items-center gap-2">
          {status === "saving" ? (
            <span className="text-xs text-slate-500">Salvando...</span>
          ) : status === "saved" ? (
            <span className="text-xs font-semibold text-emerald-600">
              ✓ Salvo
            </span>
          ) : status === "error" ? (
            <span className="text-xs text-red-600">{errorMsg}</span>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-blue-hover disabled:opacity-60"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function LadoPicker({
  titulo,
  lado,
  info,
  value,
  todasSelecoes,
  onPick,
}: {
  titulo: string;
  lado: "a" | "b";
  info: LadoConfronto;
  value: string;
  todasSelecoes: SelecaoOption[];
  onPick: (value: string, lado: "a" | "b") => void;
}) {
  const temFiltro = info.candidatos.length > 0;
  const [showAll, setShowAll] = useState(!temFiltro);

  // Lado já definido: mostra o time real, sem dropdown.
  if (info.selecao) {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {titulo}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/flags/${info.selecao.codigoIso}.svg`}
            alt=""
            className="h-5 w-7 rounded-sm object-cover"
          />
          <span className="text-sm font-semibold text-slate-900">
            {info.selecao.nome}
          </span>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
            definido
          </span>
        </div>
      </div>
    );
  }

  const opcoes = showAll ? todasSelecoes : info.candidatos;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {titulo}{" "}
          <span className="font-mono normal-case text-slate-500">
            ({info.placeholder})
          </span>
        </p>
        {temFiltro ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[10px] font-semibold text-brand-blue hover:underline"
          >
            {showAll ? "ver sugeridos" : "ver todas (48)"}
          </button>
        ) : null}
      </div>
      <p className="mt-0.5 text-xs text-slate-600">{info.descricao}</p>
      <select
        value={value}
        onChange={(e) => onPick(e.target.value, lado)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 focus:border-brand-blue focus:outline-none"
      >
        <option value="">— manter placeholder —</option>
        {opcoes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </select>
      {!temFiltro ? (
        <p className="mt-0.5 text-[10px] text-slate-400">
          Sem filtro automático — todas as seleções.
        </p>
      ) : null}
    </div>
  );
}
