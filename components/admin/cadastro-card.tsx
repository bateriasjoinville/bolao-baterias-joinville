"use client";

import { formatCPF, formatWhatsApp } from "@/lib/format";

export type CadastroCardData = {
  nome: string;
  cpf: string;
  whatsapp: string;
  bairro: string;
  created_at: string;
};

export function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CadastroCard({ cadastro }: { cadastro: CadastroCardData }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs">
      <p className="text-sm font-semibold text-slate-900">{cadastro.nome}</p>
      <dl className="mt-1 grid grid-cols-1 gap-0.5 text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-slate-500">CPF: </dt>
          <dd className="inline font-mono">{formatCPF(cadastro.cpf)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">WhatsApp: </dt>
          <dd className="inline font-mono">{formatWhatsApp(cadastro.whatsapp)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">Bairro: </dt>
          <dd className="inline">{cadastro.bairro}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">Cadastro: </dt>
          <dd className="inline">{formatarDataHora(cadastro.created_at)}</dd>
        </div>
      </dl>
      <a
        href={`https://wa.me/55${cadastro.whatsapp}`}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
      >
        Abrir WhatsApp →
      </a>
    </div>
  );
}
