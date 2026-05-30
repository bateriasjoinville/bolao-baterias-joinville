"use client";

import { type ReactNode, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { definirConfrontoMataMata } from "@/app/admin/mata-mata/actions";
import { parsePlaceholder } from "@/lib/admin/placeholder";
import {
  type LadoConfronto,
  type SelecaoOption,
} from "@/lib/admin/mata-mata-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const FLAG_FALLBACK = "/flags/unknown.svg";

function flagSrc(codigoIso: string | undefined): string {
  return codigoIso ? `/flags/${codigoIso}.svg` : FLAG_FALLBACK;
}

export function ConfrontoRow({
  matchId,
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const selById = useMemo(
    () => new Map(todasSelecoes.map((s) => [s.id, s])),
    [todasSelecoes],
  );

  const resolvedA: SelecaoOption | null =
    ladoA.selecao ?? (selA ? (selById.get(Number(selA)) ?? null) : null);
  const resolvedB: SelecaoOption | null =
    ladoB.selecao ?? (selB ? (selById.get(Number(selB)) ?? null) : null);
  const bothReady = resolvedA != null && resolvedB != null;

  function handleBrasilChange(checked: boolean) {
    if (checked) {
      const ok = window.confirm(
        "Tem certeza que esse é um jogo do Brasil? Isso faz o jogo valer pontuação dobrada (2x) pra todos.",
      );
      if (!ok) return;
      setBrasil(true);
    } else {
      setBrasil(false);
    }
  }

  function doSave() {
    setConfirmOpen(false);
    setStatus("saving");
    setErrorMsg(null);
    startTransition(async () => {
      const r = await definirConfrontoMataMata({
        matchId,
        selecaoAId: selA ? Number(selA) : null,
        selecaoBId: selB ? Number(selB) : null,
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
          Jogo {matchId} · {dateStr} · {estadio}
        </span>
        {brasil ? <BrasilPill /> : null}
      </div>

      <div className="mt-3 space-y-3">
        <LadoPicker
          titulo="Time A"
          lado="a"
          info={ladoA}
          value={selA}
          todasSelecoes={todasSelecoes}
          onPick={setSelA}
        />
        <LadoPicker
          titulo="Time B"
          lado="b"
          info={ladoB}
          value={selB}
          todasSelecoes={todasSelecoes}
          onPick={setSelB}
        />
      </div>

      {bothReady && resolvedA && resolvedB ? (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Prévia do confronto
          </p>
          <Confronto a={resolvedA} b={resolvedB} />
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={brasil}
            onChange={(e) => handleBrasilChange(e.target.checked)}
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
            onClick={() => setConfirmOpen(true)}
            disabled={!bothReady || pending}
            className="rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar confronto
          </button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confirmar confronto</DialogTitle>
          </DialogHeader>

          {resolvedA && resolvedB ? (
            <div className="space-y-3">
              <ConfirmSide selecao={resolvedA} posicao={ladoA} />
              <p className="text-center text-xs font-bold text-slate-400">×</p>
              <ConfirmSide selecao={resolvedB} posicao={ladoB} />
            </div>
          ) : null}

          {brasil ? (
            <div className="flex items-center gap-2 rounded-md border border-brand-yellow bg-brand-yellow-soft px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/flags/br.svg"
                alt=""
                className="h-4 w-6 rounded-[1px] object-cover"
              />
              <p className="text-xs font-bold text-brand-blue-dark">
                Jogo do Brasil — pontuação dobrada (2x) pra todos.
              </p>
            </div>
          ) : null}

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={doSave}
              className="flex-1 rounded-lg bg-brand-blue py-2.5 text-sm font-bold text-white hover:bg-brand-blue-hover"
            >
              Confirmar e salvar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Confronto({ a, b }: { a: SelecaoOption; b: SelecaoOption }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagSrc(a.codigoIso)}
        alt=""
        className="h-5 w-7 rounded-sm object-cover"
      />
      <span className="truncate">{a.nome}</span>
      <span className="text-slate-400">×</span>
      <span className="truncate">{b.nome}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagSrc(b.codigoIso)}
        alt=""
        className="h-5 w-7 rounded-sm object-cover"
      />
    </div>
  );
}

function ConfirmSide({
  selecao,
  posicao,
}: {
  selecao: SelecaoOption;
  posicao: LadoConfronto;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-slate-200 px-3 py-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagSrc(selecao.codigoIso)}
        alt=""
        className="h-7 w-10 rounded-sm object-cover shadow-sm"
      />
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">{selecao.nome}</p>
        <p className="text-xs text-slate-500">
          {posicao.descricao || "já definido"}
        </p>
      </div>
    </div>
  );
}

function BrasilPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow px-2 py-0.5 text-[10px] font-bold text-brand-blue-dark">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/flags/br.svg"
        alt=""
        className="h-2.5 w-3.5 rounded-[1px] object-cover"
      />
      2x
    </span>
  );
}

function PosicaoBadge({ token }: { token: string }) {
  const info = parsePlaceholder(token);

  if (info.tipo === "grupo") {
    return (
      <div className="flex items-center gap-2">
        <Badge>{info.posicao}º</Badge>
        <span className="text-sm font-medium text-slate-700">
          do grupo {info.grupo}
        </span>
      </div>
    );
  }
  if (info.tipo === "melhor3") {
    return (
      <div className="flex items-center gap-2">
        <Badge>3º</Badge>
        <span className="text-sm font-medium text-slate-700">
          melhor 3º · grupos {info.grupos.join(", ")}
        </span>
      </div>
    );
  }
  if (info.tipo === "origemJogo") {
    return (
      <div className="flex items-center gap-2">
        <Badge>{info.resultado === "vencedor" ? "V" : "P"}</Badge>
        <span className="text-sm font-medium text-slate-700">
          {info.resultado === "vencedor" ? "Vencedor" : "Perdedor"} do jogo{" "}
          {info.jogoId}
        </span>
      </div>
    );
  }
  return (
    <span className="font-mono text-sm font-semibold text-slate-700">
      {token}
    </span>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-brand-blue px-1.5 text-sm font-extrabold text-white">
      {children}
    </span>
  );
}

function LadoPicker({
  titulo,
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
  onPick: (value: string) => void;
}) {
  const temFiltro = info.candidatos.length > 0;
  const [showAll, setShowAll] = useState(!temFiltro);
  const isOrigem = info.placeholder
    ? parsePlaceholder(info.placeholder).tipo === "origemJogo"
    : false;

  if (info.selecao) {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {titulo}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flagSrc(info.selecao.codigoIso)}
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
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {titulo}
          </p>
          <div className="mt-1">
            <PosicaoBadge token={info.placeholder ?? ""} />
            {isOrigem ? (
              <p className="mt-0.5 text-xs text-slate-500">
                {info.candidatos.length >= 2
                  ? info.candidatos.map((c) => c.nome).join(" × ")
                  : "jogo de origem ainda não definido"}
              </p>
            ) : null}
          </div>
        </div>
        {temFiltro ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="shrink-0 text-[10px] font-semibold text-brand-blue hover:underline"
          >
            {showAll ? "ver sugeridos" : "ver todas (48)"}
          </button>
        ) : null}
      </div>

      <select
        value={value}
        onChange={(e) => onPick(e.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 focus:border-brand-blue focus:outline-none"
      >
        <option value="">— escolher seleção —</option>
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
