import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const contentType = "image/png";
export const size = { width: 512, height: 512 };

export function GET() {
  return new ImageResponse(<IconArt />, { ...size });
}

function IconArt() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#2323E8",
      }}
    >
      <svg width="320" height="320" viewBox="0 0 512 512">
        <path
          d="M296 56 L150 300 L242 300 L216 456 L372 212 L280 212 Z"
          fill="#FFD400"
        />
      </svg>
    </div>
  );
}
