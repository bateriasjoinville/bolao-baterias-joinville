"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { type SemanaIndex } from "@/lib/scoring/weeks";

export type RankingTab = "geral" | SemanaIndex;

type TabsProps = {
  active: RankingTab;
  semanasDisponiveis: SemanaIndex[];
};

export function RankingTabs({ active, semanasDisponiveis }: TabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const el = activeRef.current;
    if (!scroller || !el) return;
    const elLeft = el.offsetLeft;
    const elRight = elLeft + el.offsetWidth;
    const viewLeft = scroller.scrollLeft;
    const viewRight = viewLeft + scroller.clientWidth;
    if (elLeft < viewLeft || elRight > viewRight) {
      scroller.scrollTo({ left: elLeft - 16, behavior: "smooth" });
    }
  }, [active]);

  const tabs: { key: RankingTab; label: string; href: string }[] = [
    { key: "geral", label: "Geral", href: "/ranking" },
    ...semanasDisponiveis.map((s) => ({
      key: s as RankingTab,
      label: `Sem. ${s}`,
      href: `/ranking?semana=${s}`,
    })),
  ];

  return (
    <nav className="sticky top-[3.25rem] z-10 border-b border-slate-200 bg-white">
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <Link
                key={String(t.key)}
                ref={isActive ? activeRef : undefined}
                href={t.href}
                scroll={false}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
        />
      </div>
    </nav>
  );
}
