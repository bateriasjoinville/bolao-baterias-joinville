import Link from "next/link";

type HeaderProps = {
  loggedIn: boolean;
};

export function HeaderRankingPublico({ loggedIn }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-brand-blue px-4 py-3 shadow">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-brand-yellow px-2.5 py-1 text-xs font-bold tracking-tight text-brand-blue-dark">
          Baterias Joinville
        </div>
        <h1 className="text-sm font-semibold text-white">Ranking</h1>
      </div>
      {loggedIn ? (
        <Link
          href="/dashboard"
          className="text-sm font-medium text-white hover:opacity-80"
        >
          ← Início
        </Link>
      ) : (
        <div className="flex gap-3 text-sm font-medium text-white">
          <Link href="/entrar" className="hover:opacity-80">
            Entrar
          </Link>
          <Link
            href="/cadastrar"
            className="rounded-md bg-brand-yellow px-2.5 py-1 text-xs font-bold text-brand-blue-dark"
          >
            Cadastrar
          </Link>
        </div>
      )}
    </header>
  );
}
