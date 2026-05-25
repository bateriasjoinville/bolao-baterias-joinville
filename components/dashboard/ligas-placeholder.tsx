export function LigasPlaceholder() {
  return (
    <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Minhas ligas
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Crie uma liga ou entre na de alguém pra competir com amigos.
      </p>
      <div className="mt-3 space-y-2">
        <BotaoEmBreve label="Criar liga" />
        <BotaoEmBreve label="Entrar em liga" />
      </div>
    </section>
  );
}

function BotaoEmBreve({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="flex w-full cursor-not-allowed items-center justify-between rounded-md bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
    >
      <span>{label}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        Em breve
      </span>
    </button>
  );
}
