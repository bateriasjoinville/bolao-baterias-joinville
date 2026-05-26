"use client";

import { House, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TabDef = {
  label: string;
  href: string;
  Icon: typeof House;
};

const TABS: TabDef[] = [
  { label: "Início", href: "/dashboard", Icon: House },
  { label: "Palpitar", href: "/palpitar", Icon: Target },
  { label: "Ranking", href: "/ranking", Icon: Trophy },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white"
    >
      <ul className="flex">
        {TABS.map(({ label, href, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  active
                    ? "text-brand-blue"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
