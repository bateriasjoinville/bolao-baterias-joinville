import { Button } from "@/components/ui/button";

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

      <div className="flex w-full flex-col gap-2">
        <Button
          size="lg"
          className="bg-brand-yellow text-brand-blue-dark hover:bg-brand-yellow-hover"
        >
          Quero participar grátis →
        </Button>
        <Button
          size="lg"
          className="bg-brand-blue text-white hover:bg-brand-blue-hover"
        >
          CTA secundária (azul)
        </Button>
        <Button size="lg" variant="outline">
          Botão outline shadcn (slate)
        </Button>
        <Button size="lg" variant="secondary">
          Botão secondary shadcn
        </Button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Smoke test do Bloco 3 — shadcn + paleta da marca convivendo.
      </p>
    </main>
  );
}
