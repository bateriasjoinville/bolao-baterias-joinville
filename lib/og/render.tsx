import { ImageResponse } from "next/og";
import { type ReactElement } from "react";

import { loadFonts } from "@/lib/og/assets";
import { OG_H, OG_W } from "@/lib/og/frame";

// Monta o ImageResponse 1080×1920. Passa Inter se os .ttf existirem;
// senão omite `fonts` e o @vercel/og usa a fonte default (Geist).
export function ogResponse(element: ReactElement): ImageResponse {
  const fonts = loadFonts();
  return new ImageResponse(element, {
    width: OG_W,
    height: OG_H,
    ...(fonts ? { fonts } : {}),
  });
}
