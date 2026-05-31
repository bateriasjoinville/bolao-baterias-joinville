"use client";

import { useEffect, useState } from "react";

type Restante = { dias: number; horas: number; min: number; done: boolean };

function calcular(alvo: number): Restante {
  const diff = Math.max(0, alvo - Date.now());
  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor((diff % 86_400_000) / 3_600_000),
    min: Math.floor((diff % 3_600_000) / 60_000),
    done: diff === 0,
  };
}

function Caixa({ valor, label }: { valor: number; label: string }) {
  return (
    <div
      className="rounded-xl px-2 py-3 text-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(0,151,57,0.55)",
      }}
    >
      <p
        className="text-3xl font-extrabold leading-none text-white"
        suppressHydrationWarning
      >
        {valor}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/70">
        {label}
      </p>
    </div>
  );
}

export function Countdown({ kickoffISO }: { kickoffISO: string | null }) {
  const alvo = kickoffISO ? new Date(kickoffISO).getTime() : null;
  const [restante, setRestante] = useState<Restante | null>(() =>
    alvo ? calcular(alvo) : null,
  );

  useEffect(() => {
    if (alvo === null) return;
    const id = setInterval(() => setRestante(calcular(alvo)), 20_000);
    return () => clearInterval(id);
  }, [alvo]);

  if (alvo === null || restante === null || restante.done) return null;

  return (
    <div className="mt-6">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/70">
        Faltam pro 1º jogo
      </p>
      <div className="grid grid-cols-3 gap-2" suppressHydrationWarning>
        <Caixa valor={restante.dias} label={restante.dias === 1 ? "dia" : "dias"} />
        <Caixa valor={restante.horas} label="horas" />
        <Caixa valor={restante.min} label="min" />
      </div>
    </div>
  );
}
