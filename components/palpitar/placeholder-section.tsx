"use client";

import { useState } from "react";

import { PlaceholderCard } from "@/components/palpitar/placeholder-card";
import { type MatchRow } from "@/lib/dashboard/queries";

type PlaceholderSectionProps = {
  matches: MatchRow[];
};

export function PlaceholderSection({ matches }: PlaceholderSectionProps) {
  const [open, setOpen] = useState(false);
  if (matches.length === 0) return null;

  const total = matches.length;
  const aDefinir = matches.filter(
    (m) => m.selecao_a == null || m.selecao_b == null,
  ).length;

  return (
    <section className="border-t border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span>
          Mata-mata{" "}
          <span className="text-xs font-normal text-slate-500">
            ({total} jogos · {aDefinir} a definir)
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              <PlaceholderCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
