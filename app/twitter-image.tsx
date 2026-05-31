import {
  PREVIEW_ALT,
  PREVIEW_SIZE,
  renderSocialPreview,
} from "@/lib/og/social-preview";

export const alt = PREVIEW_ALT;
export const size = PREVIEW_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
  return renderSocialPreview();
}
