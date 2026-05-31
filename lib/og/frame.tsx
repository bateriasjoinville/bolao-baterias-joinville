import { type ReactNode } from "react";

export const OG_W = 1080;
export const OG_H = 1920;

const AZUL = "#2323E8";
const AZUL_ESCURO = "#13136e";
const VERDE = "#009739";
const AMARELO = "#FFD400";

// Moldura comum dos stories: gradiente azul, brilhos difusos verde/amarelo,
// faixa tricolor no topo, marca e URL no rodapé.
export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: `${OG_W}px`,
        height: `${OG_H}px`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        color: "white",
        background: `linear-gradient(160deg, ${AZUL} 0%, ${AZUL_ESCURO} 100%)`,
      }}
    >
      {/* brilho verde difuso (radial = soft, sem filter:blur) */}
      <div
        style={{
          position: "absolute",
          top: "-160px",
          left: "-160px",
          width: "720px",
          height: "720px",
          display: "flex",
          background: `radial-gradient(circle, ${VERDE}66 0%, ${VERDE}00 70%)`,
        }}
      />
      {/* brilho amarelo difuso */}
      <div
        style={{
          position: "absolute",
          bottom: "120px",
          right: "-180px",
          width: "760px",
          height: "760px",
          display: "flex",
          background: `radial-gradient(circle, ${AMARELO}55 0%, ${AMARELO}00 70%)`,
        }}
      />

      {/* faixa tricolor */}
      <div style={{ display: "flex", width: "100%", height: "28px" }}>
        <div style={{ display: "flex", flex: 1, background: VERDE }} />
        <div style={{ display: "flex", flex: 1, background: AMARELO }} />
        <div style={{ display: "flex", flex: 1, background: "#FFFFFF" }} />
      </div>

      {/* conteúdo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: "90px",
        }}
      >
        {children}
      </div>

      {/* rodapé / marca */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: "90px",
        }}
      >
        <div style={{ display: "flex", fontSize: "40px", fontWeight: 800 }}>
          Baterias Joinville
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "10px",
            fontSize: "30px",
            color: AMARELO,
          }}
        >
          bolao.bateriasjoinville.com.br
        </div>
      </div>
    </div>
  );
}

export function Time({ flag, nome }: { flag: string; nome: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "300px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={250}
        height={167}
        src={flag}
        alt=""
        style={{ borderRadius: "16px" }}
      />
      <div
        style={{
          display: "flex",
          width: "300px",
          marginTop: "28px",
          fontSize: "46px",
          fontWeight: 700,
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {nome}
      </div>
    </div>
  );
}

export function Placar({ a, b }: { a: number; b: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
      <span style={{ fontSize: "170px", fontWeight: 800 }}>{a}</span>
      <span style={{ fontSize: "100px", fontWeight: 700, color: AMARELO }}>
        ×
      </span>
      <span style={{ fontSize: "170px", fontWeight: 800 }}>{b}</span>
    </div>
  );
}

export function BadgeBrasil({ flag }: { flag: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "18px",
        marginTop: "64px",
        padding: "22px 44px",
        borderRadius: "999px",
        background: VERDE,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img width={54} height={36} src={flag} alt="" style={{ borderRadius: "4px" }} />
      <span style={{ display: "flex", fontSize: "42px", fontWeight: 800 }}>
        2x PONTOS
      </span>
    </div>
  );
}
