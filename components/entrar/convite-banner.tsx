export function ConviteBanner({ nomeLiga }: { nomeLiga: string }) {
  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-brand-green bg-brand-green-soft">
      <div className="flex h-1.5 w-full">
        <div className="flex-1 bg-brand-green" />
        <div className="flex-1 bg-brand-yellow" />
      </div>
      <div className="px-4 py-3">
        <p className="text-sm font-bold text-brand-green-dark">
          🏆 Convite pra liga {nomeLiga}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          Entre ou cadastre-se pra participar.
        </p>
      </div>
    </div>
  );
}
