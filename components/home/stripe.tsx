// Faixa verde-amarela 50/50 — acento de Copa reutilizado no topo de seções.
export function TricolorStripe({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-1 w-full ${className}`}
      style={{
        background: "linear-gradient(90deg, #009739 0 50%, #ffd400 50% 100%)",
      }}
    />
  );
}
