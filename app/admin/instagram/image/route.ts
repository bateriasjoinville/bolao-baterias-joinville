import { getTop10ForInstagram } from "@/lib/admin/instagram-top10";
import { requireAdmin } from "@/lib/admin/session";
import { renderTop10, type Top10Format } from "@/lib/og/top10";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await requireAdmin();

  const formato: Top10Format =
    new URL(req.url).searchParams.get("formato") === "stories"
      ? "stories"
      : "feed";

  // Vercel roda em UTC: sem timeZone, depois das 21h BRT a data viraria a de
  // amanhã. Fixa no fuso de Brasília.
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const admin = getSupabaseAdmin();
  const entries = await getTop10ForInstagram(admin);

  return renderTop10(entries, { formato, dataHoje });
}
