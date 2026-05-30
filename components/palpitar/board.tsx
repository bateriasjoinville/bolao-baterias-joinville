"use client";

import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";

import { PalpitarHeader } from "@/components/palpitar/header";
import { MatchCard } from "@/components/palpitar/match-card";
import { salvarPalpite } from "@/app/(authed)/palpitar/actions";
import {
  type MatchRow,
  type PredictionMin,
} from "@/lib/dashboard/queries";
import { isMatchLocked, lockLabel } from "@/lib/palpitar/lock";
import { type PalpiteStatus } from "@/lib/palpitar/types";

type PalpitarBoardProps = {
  nome: string;
  total: number;
  aberto: boolean;
  matches: MatchRow[];
  predictions: PredictionMin[];
  banner?: ReactNode;
};

type ScoreState = { a: number | null; b: number | null };
type StatusTab = "pendentes" | "palpitados" | "todos";

const DEBOUNCE_MS = 800;
const SAVED_DISPLAY_MS = 2000;

function initialScores(
  predictions: PredictionMin[],
): Map<number, ScoreState> {
  const m = new Map<number, ScoreState>();
  for (const p of predictions) {
    m.set(p.match_id, { a: p.placar_a, b: p.placar_b });
  }
  return m;
}

export function PalpitarBoard({
  nome,
  total,
  aberto,
  matches,
  predictions,
  banner,
}: PalpitarBoardProps) {
  const [tab, setTab] = useState<StatusTab>("pendentes");
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
    let palpitados = 0;
    for (const m of matches) if (savedIds.has(m.id)) palpitados += 1;
    return {
      pendentes: matches.length - palpitados,
      palpitados,
      todos: matches.length,
    };
  }, [matches, savedIds]);

  const visiveis = matches.filter((m) => {
    const saved = savedIds.has(m.id);
    if (tab === "pendentes") return !saved || keepVisible.has(m.id);
    if (tab === "palpitados") return saved;
    return true;
  });

  return (
    <>
      <PalpitarHeader nome={nome} feitos={counts.palpitados} total={total} />
      {banner}
      <StatusFilter active={tab} counts={counts} onChange={handleTab} />
      {visiveis.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          {tab === "pendentes"
            ? "Tudo palpitado por aqui 🎉"
            : tab === "palpitados"
              ? "Você ainda não palpitou nenhum jogo."
              : "Nenhum jogo encontrado."}
        </p>
      ) : (
        <ul className="bg-white">
          {visiveis.map((match) => {
            const s = scores.get(match.id);
            const status = statuses.get(match.id) ?? "idle";
            const matchLocked = isMatchLocked(match.kickoff_at);
            const locked = !aberto || matchLocked;
            const lockText = !aberto
              ? "Palpites ainda não abriram"
              : matchLocked
                ? lockLabel(match.kickoff_at)
                : undefined;
            const saved = savedIds.has(match.id);
            const editing = editingIds.has(match.id) || keepVisible.has(match.id);
            const mode: "edit" | "compact" =
              saved && !editing ? "compact" : "edit";
            return (
              <li key={match.id}>
                <MatchCard
                  match={match}
                  placarA={s?.a ?? null}
                  placarB={s?.b ?? null}
                  mode={mode}
                  isSaved={saved}
                  status={status}
                  errorMsg={errors.get(match.id)}
                  isLocked={locked}
                  lockText={lockText}
                  onChangeScore={(side, value) =>
                    handleChangeScore(match.id, side, value)
                  }
                  onRetry={() => handleRetry(match.id)}
                  onEdit={() => handleEdit(match.id)}
                />
              </li>
            );
          })}
        </ul>
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
  counts: { pendentes: number; palpitados: number; todos: number };
  onChange: (tab: StatusTab) => void;
}) {
  const items: { key: StatusTab; label: string; count: number }[] = [
    { key: "pendentes", label: "Pendentes", count: counts.pendentes },
    { key: "palpitados", label: "Palpitados", count: counts.palpitados },
    { key: "todos", label: "Todos", count: counts.todos },
  ];

  return (
    <nav className="sticky top-[3.25rem] z-10 grid grid-cols-3 gap-1.5 border-b border-slate-200 bg-white px-3 py-2">
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-brand-blue text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {it.label} ({it.count})
          </button>
        );
      })}
    </nav>
  );
}
