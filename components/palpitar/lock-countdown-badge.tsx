import { type LockTier } from "@/lib/palpitar/lock";

type LockCountdownBadgeProps = {
  tier: LockTier;
  mins: number;
};

function formatDuracao(mins: number): string {
  if (mins >= 1440) return `${Math.floor(mins / 1440)}d`;
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${String(m).padStart(2, "0")}`;
  }
  return `${mins}min`;
}

const ESTILO: Record<LockTier, string> = {
  tranquilo: "bg-brand-blue-soft text-brand-blue",
  perto: "bg-orange-100 text-orange-700",
  urgente: "bg-rose-100 text-rose-700",
  locked: "bg-slate-100 text-slate-500",
};

export function LockCountdownBadge({ tier, mins }: LockCountdownBadgeProps) {
  const texto =
    tier === "locked"
      ? "🔒 Palpite encerrado"
      : tier === "urgente"
        ? `🔴 Trava em ${formatDuracao(mins)}!`
        : tier === "perto"
          ? `⏳ Trava em ${formatDuracao(mins)}`
          : `🕐 Trava em ${formatDuracao(mins)}`;

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${ESTILO[tier]}`}
    >
      {texto}
    </span>
  );
}
