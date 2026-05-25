"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { TAB_LABELS, type TabKey } from "@/lib/palpitar/filter";

type TabsProps = {
  active: TabKey;
  showHoje: boolean;
};

export function Tabs({ active, showHoje }: TabsProps) {
  const tabs: TabKey[] = [
    ...(showHoje ? (["hoje"] as TabKey[]) : []),
    "grupos",
    "r32",
    "oitavas",
    "quartas",
    "semi",
    "terceiro",
    "final",
    "todos",
  ];

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
      scroller.scrollTo({
        left: elLeft - 16,
        behavior: "smooth",
      });
    }
  }, [active]);

  return (
    <nav className="sticky top-[3.25rem] z-10 border-b border-slate-200 bg-white">
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((key) => {
            const isActive = key === active;
            const href = key === "todos" ? "/palpitar" : `/palpitar?fase=${key}`;
            return (
              <Link
                key={key}
                ref={isActive ? activeRef : undefined}
                href={href}
                scroll={false}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {TAB_LABELS[key]}
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
