import { ImageResponse } from "next/og";

import { BrandIcon } from "@/lib/og/brand-icon";

export const dynamic = "force-static";
export const contentType = "image/png";
export const size = { width: 512, height: 512 };

export function GET() {
  return new ImageResponse(<BrandIcon size={512} />, { ...size });
}
