import Link from "next/link";
import { type ReactNode } from "react";

export type AdminNavKey =
  | "inicio"
  | "placares"
  | "cadastrados"
  | "instagram"
  | "ajuda"
  | "mata-mata";

const LINKS: { key: AdminNavKey; href: string; label: string }[] = [
  { key: "inicio", href: "/admin", label: "Início" },
  { key: "placares", href: "/admin/placares", label: "Placares" },
  { key: "cadastrados", href: "/admin/cadastrados", label: "Cadastrados" },
  { key: "instagram", href: "/admin/instagram", label: "Top 10" },
  { key: "ajuda", href: "/admin/pedidos-ajuda", label: "Ajuda" },
];

export function AdminNav({
  current,
  title,
  subtitle,
}: {
  current: AdminNavKey;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-brand-blue text-white shadow">
      <div className="px-4 pb-2 pt-3">
        <h1 className="text-lg font-extrabold">{title}</h1>
        {subtitle ? <p className="text-xs opacity-90">{subtitle}</p> : null}
      </div>
      <nav
        aria-label="Navegação do admin"
        className="flex items-center gap-2 overflow-x-auto px-3 pb-3"
      >
        {LINKS.map((l) => {
          const active = l.key === current;
          return (
            <Link
              key={l.key}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${
                active
                  ? "bg-white text-brand-blue"
                  : "border border-white/30 text-white/90 hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <form action="/admin/sair" method="post" className="shrink-0">
          <button
            type="submit"
            className="whitespace-nowrap rounded-full border border-white/30 px-3 py-1.5 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Sair
          </button>
        </form>
      </nav>
    </header>
  );
}
