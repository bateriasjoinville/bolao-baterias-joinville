export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-blue px-4 py-3">
      <div className="rounded-md bg-brand-yellow px-2.5 py-1 text-xs font-bold tracking-tight text-brand-blue-dark">
        Baterias Joinville
      </div>
      <a href="/entrar" className="text-sm font-medium text-white">
        Entrar →
      </a>
    </header>
  );
}
