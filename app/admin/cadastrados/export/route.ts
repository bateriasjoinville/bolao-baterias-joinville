import { formatCPF, formatWhatsApp } from "@/lib/format";
import { requireAdmin } from "@/lib/admin/session";
import { getParticipantsForExport } from "@/lib/admin/participants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function GET() {
  await requireAdmin();

  const admin = getSupabaseAdmin();
  const rows = await getParticipantsForExport(admin);

  const header = [
    "Nome",
    "CPF",
    "WhatsApp",
    "Cidade",
    "Estado",
    "Bairro",
    "Idade",
    "Instagram",
    "Data de cadastro",
    "WhatsApp confirmado",
  ];

  const lines = rows.map((r) =>
    [
      r.nome,
      formatCPF(r.cpf),
      formatWhatsApp(r.whatsapp),
      r.cidade,
      r.estado,
      r.bairro ?? "",
      String(r.idade),
      r.instagram ?? "",
      formatarData(r.created_at),
      r.whatsapp_confirmed_at ? "Sim" : "Não",
    ]
      .map(csvCell)
      .join(";"),
  );

  const csv =
    "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cadastrados-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
