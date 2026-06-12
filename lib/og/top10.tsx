import { ImageResponse } from "next/og";

import { loadFonts, publicPngDataUri } from "@/lib/og/assets";
import { type Top10Entry } from "@/lib/admin/instagram-top10";

export type Top10Format = "feed" | "stories";

const AZUL_TOPO = "#2c2cf0";
const AZUL = "#2323E8";
const AZUL_BASE = "#16169a";
const AZUL_ESCURO = "#13136e";
const VERDE = "#009739";
const AMARELO = "#FFD400";

const LOGO_RATIO = 1072 / 336;

type Theme = {
  W: number;
  H: number;
  stripe: number;
  padX: number;
  headTop: number;
  headerH: number;
  pillFs: number;
  top10Fs: number;
  subFs: number;
  logoH: number;
  // bases da lista (são escaladas pra caber)
  leaderH: number;
  rowH: number;
  gap: number;
  ordLeaderFs: number;
  nameLeaderFs: number;
  atLeaderFs: number;
  ptsLeaderFs: number;
  ordFs: number;
  nameFs: number;
  atFs: number;
  ptsFs: number;
  // rodapé (altura reservada inclui o respiro do sticker no stories)
  footerH: number;
  footPad: number;
  footTitleFs: number;
  footSubFs: number;
  footUrlFs: number;
  footUrlPad: string;
  wmFs: number;
};

function theme(formato: Top10Format): Theme {
  if (formato === "stories") {
    return {
      W: 1080,
      H: 1920,
      stripe: 20,
      padX: 64,
      headTop: 84,
      headerH: 404,
      pillFs: 30,
      top10Fs: 150,
      subFs: 31,
      logoH: 100,
      leaderH: 196,
      rowH: 104,
      gap: 10,
      ordLeaderFs: 80,
      nameLeaderFs: 56,
      atLeaderFs: 36,
      ptsLeaderFs: 96,
      ordFs: 50,
      nameFs: 46,
      atFs: 30,
      ptsFs: 48,
      footerH: 420,
      footPad: 40,
      footTitleFs: 42,
      footSubFs: 29,
      footUrlFs: 36,
      footUrlPad: "18px 32px",
      wmFs: 900,
    };
  }
  return {
    W: 1080,
    H: 1350,
    stripe: 16,
    padX: 56,
    headTop: 48,
    headerH: 300,
    pillFs: 26,
    top10Fs: 120,
    subFs: 27,
    logoH: 80,
    leaderH: 148,
    rowH: 80,
    gap: 8,
    ordLeaderFs: 64,
    nameLeaderFs: 44,
    atLeaderFs: 30,
    ptsLeaderFs: 72,
    ordFs: 40,
    nameFs: 38,
    atFs: 26,
    ptsFs: 40,
    footerH: 252,
    footPad: 32,
    footTitleFs: 36,
    footSubFs: 26,
    footUrlFs: 26,
    footUrlPad: "14px 22px",
    wmFs: 620,
  };
}

// Métricas da lista já com o fator de escala aplicado (pra caber inteira).
type Metrics = {
  leaderH: number;
  rowH: number;
  gap: number;
  ordLeaderFs: number;
  nameLeaderFs: number;
  atLeaderFs: number;
  ptsLeaderFs: number;
  ordFs: number;
  nameFs: number;
  atFs: number;
  ptsFs: number;
};

// Escala a lista pro conjunto (nLíderes × leaderH + nLinhas × rowH + gaps) caber
// na altura disponível. Nunca aumenta (teto 1). As 10 posições sempre inteiras.
function fitMetrics(t: Theme, entries: Top10Entry[]): Metrics {
  const listAvail = t.H - t.stripe - t.headerH - t.footerH;
  const nLeaders = entries.filter((e) => e.posicao === 1).length;
  const nRows = entries.length - nLeaders;
  const gaps = Math.max(0, entries.length - 1);
  const needed = nLeaders * t.leaderH + nRows * t.rowH + gaps * t.gap;
  const scale = needed > 0 ? Math.min(1, listAvail / needed) : 1;

  const s = (n: number) => Math.round(n * scale);
  return {
    leaderH: Math.floor(t.leaderH * scale),
    rowH: Math.floor(t.rowH * scale),
    gap: Math.floor(t.gap * scale),
    ordLeaderFs: s(t.ordLeaderFs),
    nameLeaderFs: s(t.nameLeaderFs),
    atLeaderFs: s(t.atLeaderFs),
    ptsLeaderFs: s(t.ptsLeaderFs),
    ordFs: s(t.ordFs),
    nameFs: s(t.nameFs),
    atFs: s(t.atFs),
    ptsFs: s(t.ptsFs),
  };
}

// @s longos diminuem a fonte pra nunca estourar a largura da coluna.
function atFontSize(handle: string, base: number): number {
  const n = handle.length;
  if (n <= 16) return base;
  if (n <= 22) return Math.round(base * 0.85);
  if (n <= 28) return Math.round(base * 0.72);
  return Math.round(base * 0.62);
}

function Leader({
  entry,
  m,
  padX,
}: {
  entry: Top10Entry;
  m: Metrics;
  padX: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${m.leaderH}px`,
        margin: `0 ${padX}px`,
        padding: "0 28px",
        background: "rgba(255,212,0,0.14)",
        borderLeft: `6px solid ${AMARELO}`,
        borderRadius: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${Math.round(m.ordLeaderFs * 1.7)}px`,
          fontSize: `${m.ordLeaderFs}px`,
          fontWeight: 800,
          color: AMARELO,
        }}
      >
        {entry.posicao}º
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: `${m.nameLeaderFs}px`,
            fontWeight: 800,
            color: "#ffffff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.displayName}
        </div>
        {entry.instagram ? (
          <div
            style={{
              display: "flex",
              marginTop: "4px",
              fontSize: `${atFontSize(entry.instagram, m.atLeaderFs)}px`,
              fontWeight: 700,
              color: AMARELO,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.instagram}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          color: AMARELO,
        }}
      >
        <div style={{ display: "flex", fontSize: `${m.ptsLeaderFs}px`, fontWeight: 800 }}>
          {entry.pontos}
        </div>
        <div style={{ display: "flex", fontSize: `${Math.round(m.ptsLeaderFs * 0.4)}px`, fontWeight: 700 }}>
          pts
        </div>
      </div>
    </div>
  );
}

function Row({
  entry,
  m,
  padX,
}: {
  entry: Top10Entry;
  m: Metrics;
  padX: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${m.rowH}px`,
        margin: `0 ${padX}px`,
        padding: "0 28px",
        borderTop: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${Math.round(m.ordFs * 2)}px`,
          fontSize: `${m.ordFs}px`,
          fontWeight: 800,
          color: AMARELO,
        }}
      >
        {entry.posicao}º
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          paddingRight: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: `${m.nameFs}px`,
            fontWeight: 700,
            color: "#ffffff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.displayName}
        </div>
        {entry.instagram ? (
          <div
            style={{
              display: "flex",
              marginTop: "2px",
              fontSize: `${atFontSize(entry.instagram, m.atFs)}px`,
              fontWeight: 700,
              color: AMARELO,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.instagram}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: `${m.ptsFs}px`, fontWeight: 800 }}>
          {entry.pontos}
        </div>
        <div style={{ display: "flex", fontSize: `${Math.round(m.ptsFs * 0.5)}px`, fontWeight: 700, opacity: 0.7 }}>
          pts
        </div>
      </div>
    </div>
  );
}

function Card({
  entries,
  t,
  dataHoje,
}: {
  entries: Top10Entry[];
  t: Theme;
  dataHoje: string;
}) {
  const m = fitMetrics(t, entries);
  const logoW = Math.round(t.logoH * LOGO_RATIO);

  return (
    <div
      style={{
        position: "relative",
        width: `${t.W}px`,
        height: `${t.H}px`,
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(160deg, ${AZUL_TOPO} 0%, ${AZUL} 48%, ${AZUL_BASE} 100%)`,
        color: "#ffffff",
      }}
    >
      {/* marca-d'água "TOP" gigante atrás da lista */}
      <div
        style={{
          position: "absolute",
          bottom: `${Math.round(t.H * 0.06)}px`,
          left: "-30px",
          display: "flex",
          fontSize: `${t.wmFs}px`,
          fontWeight: 800,
          lineHeight: 1,
          color: "rgba(255,255,255,0.045)",
        }}
      >
        TOP
      </div>

      {/* faixa verde-amarela no topo */}
      <div style={{ display: "flex", width: "100%", height: `${t.stripe}px` }}>
        <div style={{ display: "flex", flex: 1, background: VERDE }} />
        <div style={{ display: "flex", flex: 1, background: AMARELO }} />
      </div>

      {/* cabeçalho (altura fixa) */}
      <div
        style={{
          display: "flex",
          height: `${t.headerH}px`,
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: `${t.headTop}px ${t.padX}px 0 ${t.padX}px`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: AMARELO,
              color: AZUL_ESCURO,
              fontSize: `${t.pillFs}px`,
              fontWeight: 800,
              letterSpacing: "4px",
              padding: "10px 22px",
              borderRadius: "9999px",
            }}
          >
            BOLÃO GRÁTIS DA COPA
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "16px",
              fontSize: `${t.top10Fs}px`,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-3px",
            }}
          >
            TOP 10
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "14px",
              fontSize: `${t.subFs}px`,
              fontWeight: 700,
              color: AMARELO,
            }}
          >
            ranking geral · {dataHoje}
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={logoW}
          height={t.logoH}
          src={publicPngDataUri("logo-bj.png")}
          alt=""
          style={{ display: "flex", objectFit: "contain" }}
        />
      </div>

      {/* lista (ocupa o espaço entre header e footer; cabe sempre inteira) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: `${m.gap}px`,
        }}
      >
        {entries.map((e) =>
          e.posicao === 1 ? (
            <Leader
              key={`${e.posicao}-${e.displayName}`}
              entry={e}
              m={m}
              padX={t.padX}
            />
          ) : (
            <Row
              key={`${e.posicao}-${e.displayName}`}
              entry={e}
              m={m}
              padX={t.padX}
            />
          ),
        )}
      </div>

      {/* rodapé (altura fixa; no stories sobra espaço pro sticker) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: `${t.footerH}px`,
          padding: `16px ${t.padX}px 0 ${t.padX}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: `${t.footPad}px`,
            background: AMARELO,
            borderRadius: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: `${t.footTitleFs}px`,
              fontWeight: 800,
              color: AZUL_ESCURO,
              whiteSpace: "nowrap",
            }}
          >
            Quer ver teu nome aqui?
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "6px",
              fontSize: `${t.footSubFs}px`,
              fontWeight: 600,
              color: AZUL_ESCURO,
              whiteSpace: "nowrap",
            }}
          >
            É grátis — palpita e entra na disputa
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "18px",
              background: AZUL_ESCURO,
              color: AMARELO,
              fontSize: `${t.footUrlFs}px`,
              fontWeight: 700,
              padding: t.footUrlPad,
              borderRadius: "9999px",
              whiteSpace: "nowrap",
            }}
          >
            bolao.bateriasjoinville.com.br
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderTop10(
  entries: Top10Entry[],
  opts: { formato?: Top10Format; dataHoje?: string } = {},
): ImageResponse {
  const formato = opts.formato ?? "feed";
  const t = theme(formato);
  const fonts = loadFonts();
  return new ImageResponse(
    <Card entries={entries} t={t} dataHoje={opts.dataHoje ?? ""} />,
    {
      width: t.W,
      height: t.H,
      ...(fonts ? { fonts } : {}),
    },
  );
}
