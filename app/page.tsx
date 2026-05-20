export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex flex-col items-center gap-2">
        <span className="rounded-md bg-brand-yellow px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue-dark">
          Em construção
        </span>
        <h1 className="text-center text-3xl font-extrabold leading-tight text-brand-blue">
          Bolão Copa 2026
        </h1>
        <p className="text-center text-sm font-medium text-slate-600">
          Baterias Joinville · 11/jun a 19/jul
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
        <div className="rounded-lg bg-brand-blue px-3 py-4 text-white">
          Azul #2323E8
        </div>
        <div className="rounded-lg bg-brand-yellow px-3 py-4 text-brand-blue-dark">
          Amarelo #FFD400
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Smoke test do Bloco 2 — Tailwind theme + Inter. Vai ser substituído pela
        Home real.
      </p>
    </main>
  );
}
