// Ícone da marca pro favicon/PWA: quadrado azul arredondado, raio amarelo,
// faixa fina verde-amarela (50/50) em cima e embaixo. Em tamanho pequeno
// (<=48px) as faixas ficam proporcionalmente mais grossas pra não sumirem.
const AZUL = "#2323E8";
const VERDE = "#009739";
const AMARELO = "#FFD400";

function Faixa({ altura }: { altura: number }) {
  return (
    <div style={{ display: "flex", width: "100%", height: `${altura}px` }}>
      <div style={{ display: "flex", flex: 1, background: VERDE }} />
      <div style={{ display: "flex", flex: 1, background: AMARELO }} />
    </div>
  );
}

export function BrandIcon({ size }: { size: number }) {
  const pequeno = size <= 48;
  const faixaH = Math.max(2, Math.round(size * (pequeno ? 0.18 : 0.09)));
  const raio = Math.round(size * 0.22);
  const bolt = Math.round(size * 0.58);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: AZUL,
        borderRadius: `${raio}px`,
        overflow: "hidden",
      }}
    >
      <Faixa altura={faixaH} />
      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={bolt} height={bolt} viewBox="0 0 512 512">
          <path
            d="M296 56 L150 300 L242 300 L216 456 L372 212 L280 212 Z"
            fill={AMARELO}
          />
        </svg>
      </div>
      <Faixa altura={faixaH} />
    </div>
  );
}
