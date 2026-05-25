type DashboardHeaderProps = {
  primeiroNome: string;
};

export function DashboardHeader({ primeiroNome }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-blue px-4 py-3 text-white">
      <p className="text-sm font-semibold">Olá, {primeiroNome}</p>
      <form action="/sair" method="post">
        <button
          type="submit"
          className="text-xs font-semibold opacity-80 transition-opacity hover:opacity-100"
        >
          Sair
        </button>
      </form>
    </header>
  );
}
