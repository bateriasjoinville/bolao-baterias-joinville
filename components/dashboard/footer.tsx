export function DashboardFooter() {
  return (
    <footer className="mt-auto bg-slate-50 px-4 py-5 text-center text-[11px] leading-relaxed text-slate-500">
      <p>Baterias Joinville · Rua Dona Francisca, 4523</p>
      <p>WhatsApp (47) 99680-1100</p>
      <p className="mt-1">
        <a href="/regulamento" className="underline">
          Regulamento
        </a>{" "}
        ·{" "}
        <a href="/privacidade" className="underline">
          Privacidade
        </a>
      </p>
    </footer>
  );
}
