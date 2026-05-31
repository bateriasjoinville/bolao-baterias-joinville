import { type NextRequest } from "next/server";
import { z } from "zod";

import { OgFrame } from "@/lib/og/frame";
import { ogResponse } from "@/lib/og/render";

export const runtime = "nodejs";

const querySchema = z.object({
  pos: z.coerce.number().int().min(1).max(99999),
  total: z.coerce.number().int().min(1).max(99999),
  pts: z.coerce.number().int().min(0).max(99999),
  nome: z.string().min(1).max(40).optional(),
});

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(sp));
  if (!parsed.success) {
    return new Response("Parâmetros inválidos.", { status: 400 });
  }
  const { pos, total, pts, nome } = parsed.data;

  return ogResponse(
    <OgFrame>
      {nome ? (
        <div
          style={{
            display: "flex",
            fontSize: "44px",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          {nome}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          fontSize: "40px",
          fontWeight: 700,
          letterSpacing: "6px",
          color: "#FFD400",
          marginBottom: "24px",
        }}
      >
        MINHA POSIÇÃO
      </div>

      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontSize: "300px", fontWeight: 800, lineHeight: 1 }}>
          {pos}
        </span>
        <span style={{ fontSize: "120px", fontWeight: 800, color: "#FFD400" }}>
          º
        </span>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: "48px",
          fontWeight: 500,
          marginTop: "16px",
        }}
      >
        de {total} palpiteiros
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "64px",
          padding: "24px 56px",
          borderRadius: "999px",
          background: "#009739",
          fontSize: "56px",
          fontWeight: 800,
        }}
      >
        {pts} pts
      </div>
    </OgFrame>,
  );
}
