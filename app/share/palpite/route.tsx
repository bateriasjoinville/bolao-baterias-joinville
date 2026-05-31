import { type NextRequest } from "next/server";
import { z } from "zod";

import { flagDataUri } from "@/lib/og/assets";
import { BadgeBrasil, OgFrame, Placar, Time } from "@/lib/og/frame";
import { ogResponse } from "@/lib/og/render";

export const runtime = "nodejs";

const isoSchema = z.string().regex(/^[a-z]{2}(-[a-z]{3})?$/);
const placarSchema = z.coerce.number().int().min(0).max(30);

const querySchema = z.object({
  a: z.string().min(1).max(40),
  b: z.string().min(1).max(40),
  fa: isoSchema,
  fb: isoSchema,
  pa: placarSchema,
  pb: placarSchema,
  br: z.enum(["0", "1"]).optional(),
});

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse(Object.fromEntries(sp));
  if (!parsed.success) {
    return new Response("Parâmetros inválidos.", { status: 400 });
  }
  const { a, b, fa, fb, pa, pb, br } = parsed.data;

  return ogResponse(
    <OgFrame>
      <div
        style={{
          display: "flex",
          fontSize: "44px",
          fontWeight: 700,
          letterSpacing: "6px",
          color: "#FFD400",
          marginBottom: "64px",
        }}
      >
        MEU PALPITE
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "48px",
        }}
      >
        <Time flag={flagDataUri(fa)} nome={a} />
        <Placar a={pa} b={pb} />
        <Time flag={flagDataUri(fb)} nome={b} />
      </div>

      {br === "1" ? <BadgeBrasil flag={flagDataUri("br")} /> : null}
    </OgFrame>,
  );
}
