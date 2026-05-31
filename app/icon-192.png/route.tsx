import { ImageResponse } from "next/og";

import { BrandIcon } from "@/lib/og/brand-icon";

export const dynamic = "force-static";
export const contentType = "image/png";
export const size = { width: 192, height: 192 };

export function GET() {
  return new ImageResponse(<BrandIcon size={192} />, { ...size });
}
