import { ImageResponse } from "next/og";

import { emojiDataUri, flagDataUri, loadFonts } from "@/lib/og/assets";

export const PREVIEW_SIZE = { width: 1200, height: 630 };
export const PREVIEW_ALT =
  "Bolão da Copa 2026 · Baterias Joinville — 100% grátis";

const AZUL = "#2323E8";
const AZUL_ESCURO = "#13136e";
const VERDE = "#009739";
const AMARELO = "#FFD400";

// Bola de futebol: emoji ⚽ do Twemoji (SVG embutido) renderizado como <img>.
// Satori não rasteriza emoji nativo (vira tofu); como <img> de SVG funciona
// igual às bandeiras.
function SoccerBall({ size }: { size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      width={size}
      height={size}
      src={emojiDataUri("soccer-26bd")}
      alt=""
      style={{ display: "flex" }}
    />
  );
}

function Card() {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        color: "#ffffff",
        background: `linear-gradient(160deg, ${AZUL} 0%, ${AZUL_ESCURO} 100%)`,
      }}
    >
      {/* losango amarelo sutil ao fundo */}
      <div
        style={{
          position: "absolute",
          top: "55px",
          left: "560px",
          width: "520px",
          height: "520px",
          display: "flex",
          background: `${AMARELO}12`,
          transform: "rotate(45deg)",
          borderRadius: "60px",
        }}
      />
      {/* brilho verde difuso */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "-150px",
          width: "560px",
          height: "560px",
          display: "flex",
          background: `radial-gradient(circle, ${VERDE}66 0%, ${VERDE}00 70%)`,
        }}
      />
      {/* brilho amarelo difuso */}
      <div
        style={{
          position: "absolute",
          bottom: "-180px",
          right: "-120px",
          width: "560px",
          height: "560px",
          display: "flex",
          background: `radial-gradient(circle, ${AMARELO}4d 0%, ${AMARELO}00 70%)`,
        }}
      />

      {/* faixa verde-amarela 50/50 */}
      <div style={{ display: "flex", width: "100%", height: "14px" }}>
        <div style={{ display: "flex", flex: 1, background: VERDE }} />
        <div style={{ display: "flex", flex: 1, background: AMARELO }} />
      </div>

      {/* selo da marca */}
      <div style={{ display: "flex", padding: "40px 56px 0 56px" }}>
        <div
          style={{
            display: "flex",
            background: AMARELO,
            color: AZUL_ESCURO,
            fontSize: "26px",
            fontWeight: 800,
            padding: "10px 22px",
            borderRadius: "10px",
          }}
        >
          Baterias Joinville
        </div>
      </div>

      {/* bola à direita */}
      <div style={{ position: "absolute", top: "172px", right: "60px", display: "flex" }}>
        <SoccerBall size={336} />
      </div>

      {/* conteúdo principal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          padding: "0 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "8px",
            color: AMARELO,
          }}
        >
          COPA DO MUNDO 2026
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "10px",
            fontSize: "104px",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-2px",
          }}
        >
          Bolão da Copa
        </div>
        <div style={{ display: "flex", marginTop: "34px", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              background: AMARELO,
              color: AZUL_ESCURO,
              fontSize: "32px",
              fontWeight: 800,
              padding: "12px 28px",
              borderRadius: "9999px",
            }}
          >
            100% GRÁTIS
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: VERDE,
              fontSize: "32px",
              fontWeight: 800,
              padding: "12px 28px",
              borderRadius: "9999px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={44}
              height={30}
              src={flagDataUri("br")}
              alt=""
              style={{ borderRadius: "4px" }}
            />
            Brasil vale 2x
          </div>
        </div>
      </div>

      {/* rodapé */}
      <div
        style={{
          display: "flex",
          padding: "0 56px 44px 56px",
          fontSize: "30px",
          fontWeight: 700,
          color: AMARELO,
        }}
      >
        bolao.bateriasjoinville.com.br
      </div>
    </div>
  );
}

export function renderSocialPreview(): ImageResponse {
  const fonts = loadFonts();
  return new ImageResponse(<Card />, {
    ...PREVIEW_SIZE,
    ...(fonts ? { fonts } : {}),
  });
}
