"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";

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
  tabs: ReactNode;
};

type ScoreState = { a: number | null; b: number | null };

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
  tabs,
}: PalpitarBoardProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
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

  function handleToggle(id: number) {
    setExpandedId((curr) => (curr === id ? null : id));
  }

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

  return (
    <>
      <PalpitarHeader nome={nome} feitos={savedIds.size} total={total} />
      {tabs}
      {matches.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          Nenhum jogo encontrado.
        </p>
      ) : (
        <ul className="bg-white">
          {matches.map((match) => {
            const s = scores.get(match.id);
            const status = statuses.get(match.id) ?? "idle";
            const matchLocked = isMatchLocked(match.kickoff_at);
            const locked = !aberto || matchLocked;
            const lockText = !aberto
              ? "Palpites ainda não abriram"
              : matchLocked
                ? lockLabel(match.kickoff_at)
                : undefined;
            return (
              <li key={match.id}>
                <MatchCard
                  match={match}
                  placarA={s?.a ?? null}
                  placarB={s?.b ?? null}
                  isSaved={savedIds.has(match.id)}
                  status={status}
                  errorMsg={errors.get(match.id)}
                  isLocked={locked}
                  lockText={lockText}
                  isExpanded={expandedId === match.id}
                  onToggle={() => handleToggle(match.id)}
                  onChangeScore={(side, value) =>
                    handleChangeScore(match.id, side, value)
                  }
                  onRetry={() => handleRetry(match.id)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
