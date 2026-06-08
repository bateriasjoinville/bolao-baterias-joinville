"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ComoFuncionaBox } from "@/components/shared/como-funciona-box";
import { PalpitarHeader } from "@/components/palpitar/header";
import { MatchCard } from "@/components/palpitar/match-card";
import { salvarPalpite } from "@/app/(authed)/palpitar/actions";
import {
  type MatchRow,
  type PredictionMin,
} from "@/lib/dashboard/queries";
import { isMatchLocked, lockLabel, lockTier, minsToLock } from "@/lib/palpitar/lock";
import { type PalpiteStatus } from "@/lib/palpitar/types";

type PalpitarBoardProps = {
  nome: string;
  total: number;
  aberto: boolean;
  matches: MatchRow[];
  predictions: PredictionMin[];
  serverNowISO: string;
  banner?: ReactNode;
  mostrarAvisoMataMata?: boolean;
};

const CLOCK_TICK_MS = 30_000;

type ScoreState = { a: number | null; b: number | null };
type StatusTab = "pendentes" | "palpitados" | "encerrados" | "todos";

const DEBOUNCE_MS = 800;
const SAVED_DISPLAY_MS = 2000;

function isEncerrado(m: MatchRow): boolean {
  return m.placar_a != null && m.placar_b != null;
}

function initialScores(
  predictions: PredictionMin[],
): Map<number, ScoreState> {
  const m = new Map<number, ScoreState>();
  for (const p of predictions) {
    m.set(p.match_id, { a: p.placar_a, b: p.placar_b });
  }
  return m;
}

type DiaGrupo = { key: string; label: string; matches: MatchRow[] };

// Chave do dia com a regra da madrugada: jogos 00:00–05:59 BRT contam no dia
// anterior. BRT = UTC-3; deslocar -9h (3 do fuso + 6 da regra) e ler a data UTC.
function dayKeyOf(kickoffISO: string): string {
  const t = new Date(kickoffISO).getTime();
  return new Date(t - 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dayLabel(dayKey: string): string {
  const d = new Date(`${dayKey}T12:00:00Z`);
  const wd = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
  }).format(d);
  const dia = wd.split("-")[0] ?? wd;
  const semana = dia.charAt(0).toUpperCase() + dia.slice(1);
  const dm = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(d);
  return `${semana} · ${dm}`;
}

function agrupaPorDia(matches: MatchRow[]): DiaGrupo[] {
  const map = new Map<string, MatchRow[]>();
  for (const m of matches) {
    const k = dayKeyOf(m.kickoff_at);
    const arr = map.get(k);
    if (arr) arr.push(m);
    else map.set(k, [m]);
  }
  return Array.from(map.keys())
    .sort()
    .map((key) => {
      const ms = (map.get(key) ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(a.kickoff_at).getTime() -
            new Date(b.kickoff_at).getTime(),
        );
      return { key, label: dayLabel(key), matches: ms };
    });
}

export function PalpitarBoard({
  nome,
  total,
  aberto,
  matches,
  predictions,
  serverNowISO,
  banner,
  mostrarAvisoMataMata,
}: PalpitarBoardProps) {
  const [tab, setTab] = useState<StatusTab>("pendentes");
  // Relógio leve: inicia do tempo do servidor (sem mismatch de hidratação) e
  // atualiza a cada 30s pra o selo de trava e o lock refletirem o tempo.
  const [now, setNow] = useState<Date>(() => new Date(serverNowISO));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const [editingIds, setEditingIds] = useState<Set<number>>(() => new Set());
  // Palpites salvos durante esta visita à aba: ficam visíveis em modo edição
  // (verde) e não recolhem, mesmo já contando como palpitados. Limpa ao trocar de aba.
  const [keepVisible, setKeepVisible] = useState<Set<number>>(() => new Set());
  const [scores, setScores] = useState<Map<number, ScoreState>>(() =>
    initialScores(predictions),
  );
  const [savedIds, setSavedIds] = useState<Set<number>>(
    () => new Set(predictions.map((p) => p.match_id)),
  );
  const [statuses, setStatuses] = useState<Map<number, PalpiteStatus>>(
    () => new Map(),
  );
  const [errors, setErrors] = useState<Map<number, string>>(() => new Map());

  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const savedTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const setStatus = useCallback(
    (id: number, status: PalpiteStatus, errorMsg?: string) => {
      setStatuses((curr) => {
        const next = new Map(curr);
        if (status === "idle") next.delete(id);
        else next.set(id, status);
        return next;
      });
      if (status === "error" && errorMsg) {
        setErrors((curr) => new Map(curr).set(id, errorMsg));
      } else if (status !== "error") {
        setErrors((curr) => {
          if (!curr.has(id)) return curr;
          const next = new Map(curr);
          next.delete(id);
          return next;
        });
      }
    },
    [],
  );

  const executeSave = useCallback(
    async (id: number, a: number, b: number) => {
      setStatus(id, "saving");
      const result = await salvarPalpite({
        matchId: id,
        placarA: a,
        placarB: b,
      });
      if (result.ok) {
        setSavedIds((curr) => {
          if (curr.has(id)) return curr;
          return new Set(curr).add(id);
        });
        setKeepVisible((curr) => {
          if (curr.has(id)) return curr;
          return new Set(curr).add(id);
        });
        setStatus(id, "saved");
        const t = savedTimers.current.get(id);
        if (t) clearTimeout(t);
        const newTimer = setTimeout(() => {
          setStatus(id, "idle");
          savedTimers.current.delete(id);
        }, SAVED_DISPLAY_MS);
        savedTimers.current.set(id, newTimer);
      } else {
        setStatus(id, "error", result.error);
      }
    },
    [setStatus],
  );

  const scheduleSave = useCallback(
    (id: number, next: ScoreState) => {
      const existing = debounceTimers.current.get(id);
      if (existing) clearTimeout(existing);
      if (next.a == null || next.b == null) return;
      const a = next.a;
      const b = next.b;
      setStatus(id, "saving");
      const timer = setTimeout(() => {
        debounceTimers.current.delete(id);
        void executeSave(id, a, b);
      }, DEBOUNCE_MS);
      debounceTimers.current.set(id, timer);
    },
    [executeSave, setStatus],
  );

  function handleChangeScore(id: number, side: "a" | "b", value: number) {
    if (!aberto) return;
    const match = matches.find((m) => m.id === id);
    if (match && isMatchLocked(match.kickoff_at)) return;
    setScores((curr) => {
      const existing = curr.get(id) ?? { a: null, b: null };
      const updated: ScoreState = { ...existing, [side]: value };
      const next = new Map(curr).set(id, updated);
      scheduleSave(id, updated);
      return next;
    });
  }

  function handleRetry(id: number) {
    if (!aberto) return;
    const match = matches.find((m) => m.id === id);
    if (match && isMatchLocked(match.kickoff_at)) return;
    const s = scores.get(id);
    if (!s || s.a == null || s.b == null) return;
    void executeSave(id, s.a, s.b);
  }

  function handleEdit(id: number) {
    setEditingIds((curr) => new Set(curr).add(id));
  }

  function handleTab(next: StatusTab) {
    if (next === tab) return;
    setTab(next);
    setEditingIds(new Set());
    setKeepVisible(new Set());
  }

  const counts = useMemo(() => {
    let pendentes = 0;
    let palpitados = 0;
    let encerrados = 0;
    for (const m of matches) {
      if (isEncerrado(m)) encerrados += 1;
      else if (savedIds.has(m.id)) palpitados += 1;
      else pendentes += 1;
    }
    return { pendentes, palpitados, encerrados, todos: matches.length };
  }, [matches, savedIds]);

  const visiveis = matches.filter((m) => {
    const encerrado = isEncerrado(m);
    const saved = savedIds.has(m.id);
    if (tab === "pendentes") return !encerrado && (!saved || keepVisible.has(m.id));
    if (tab === "palpitados") return !encerrado && saved;
    if (tab === "encerrados") return encerrado;
    return true;
  });

  const renderCard = (match: MatchRow) => {
    const s = scores.get(match.id);
    const status = statuses.get(match.id) ?? "idle";
    const matchLocked = isMatchLocked(match.kickoff_at, now);
    const locked = !aberto || matchLocked;
    const lockText = !aberto
      ? "Palpites ainda não abriram"
      : matchLocked
        ? lockLabel(match.kickoff_at, now)
        : undefined;
    const encerrado = isEncerrado(match);
    const lockCountdown =
      aberto && !encerrado
        ? {
            tier: lockTier(match.kickoff_at, now),
            mins: minsToLock(match.kickoff_at, now),
          }
        : undefined;
    const saved = savedIds.has(match.id);
    const editing = editingIds.has(match.id) || keepVisible.has(match.id);
    const mode: "edit" | "compact" | "encerrado" = encerrado
      ? "encerrado"
      : saved && !editing
        ? "compact"
        : "edit";
    return (
      <MatchCard
        key={match.id}
        match={match}
        placarA={s?.a ?? null}
        placarB={s?.b ?? null}
        mode={mode}
        isSaved={saved}
        status={status}
        errorMsg={errors.get(match.id)}
        isLocked={locked}
        lockText={lockText}
        lockCountdown={lockCountdown}
        onChangeScore={(side, value) =>
          handleChangeScore(match.id, side, value)
        }
        onRetry={() => handleRetry(match.id)}
        onEdit={() => handleEdit(match.id)}
      />
    );
  };

  return (
    <>
      <PalpitarHeader
        nome={nome}
        feitos={counts.palpitados}
        total={total}
        mostrarAviso={mostrarAvisoMataMata}
      />
      {banner}
      <ComoFuncionaBox />
      <StatusFilter active={tab} counts={counts} onChange={handleTab} />
      {visiveis.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          {tab === "pendentes"
            ? "Tudo palpitado por aqui 🎉"
            : tab === "palpitados"
              ? "Você ainda não palpitou nenhum jogo."
              : tab === "encerrados"
                ? "Nenhum jogo encerrado ainda."
                : "Nenhum jogo encontrado."}
        </p>
      ) : (
        <div className="bg-white pb-28">
          {agrupaPorDia(visiveis).map((grupo) => {
            const palpitadosDia = grupo.matches.filter((m) =>
              savedIds.has(m.id),
            ).length;
            const n = grupo.matches.length;
            return (
              <section key={grupo.key}>
                <div className="flex items-baseline justify-between gap-2 px-4 pt-4 pb-1">
                  <h2 className="text-sm font-bold text-slate-700">
                    {grupo.label}
                  </h2>
                  <span className="shrink-0 text-xs text-slate-500">
                    {n} jogo{n !== 1 ? "s" : ""} · {palpitadosDia} palpitado
                    {palpitadosDia !== 1 ? "s" : ""}
                  </span>
                </div>
                {grupo.matches.map(renderCard)}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function StatusFilter({
  active,
  counts,
  onChange,
}: {
  active: StatusTab;
  counts: {
    pendentes: number;
    palpitados: number;
    encerrados: number;
    todos: number;
  };
  onChange: (tab: StatusTab) => void;
}) {
  const items: { key: StatusTab; label: string; count: number }[] = [
    { key: "pendentes", label: "Pendentes", count: counts.pendentes },
    { key: "palpitados", label: "Palpitados", count: counts.palpitados },
    { key: "encerrados", label: "Encerrados", count: counts.encerrados },
    { key: "todos", label: "Todos", count: counts.todos },
  ];

  return (
    <nav className="sticky top-[3.25rem] z-10 border-b border-slate-200 bg-white">
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => {
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onChange(it.key)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-brand-blue text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {it.label} ({it.count})
            </button>
          );
        })}
      </div>
    </nav>
  );
}
