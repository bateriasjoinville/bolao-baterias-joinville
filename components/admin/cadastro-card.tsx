"use client";

import Link from "next/link";

import { formatCPF, formatWhatsApp } from "@/lib/format";

export type CadastroCardData = {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  created_at: string;
};

function formatarLocal(c: CadastroCardData): string {
  const base = `${c.cidade}/${c.estado}`;
  return c.bairro ? `${base} · ${c.bairro}` : base;
}

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
      <Link
        href={`/admin/cadastrados/${cadastro.id}`}
        className="text-sm font-semibold text-brand-blue hover:underline"
      >
        {cadastro.nome}
      </Link>
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
          <dt className="inline font-medium text-slate-500">Local: </dt>
          <dd className="inline">{formatarLocal(cadastro)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-500">Cadastro: </dt>
          <dd className="inline">{formatarDataHora(cadastro.created_at)}</dd>
        </div>
      </dl>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a
          href={`https://wa.me/55${cadastro.whatsapp}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
        >
          Abrir WhatsApp →
        </a>
        <Link
          href={`/admin/cadastrados/${cadastro.id}`}
          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
        >
          Ver palpites →
        </Link>
      </div>
    </div>
  );
}
