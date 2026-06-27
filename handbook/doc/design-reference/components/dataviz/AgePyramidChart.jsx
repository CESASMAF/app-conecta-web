import React from "react";
import { M3SeriesLegendItem } from "./M3SeriesLegendItem.jsx";
import { M3Button } from "../forms/M3Button.jsx";
import { M3EmptyState } from "../feedback/M3EmptyState.jsx";

const BANDS = [
  "0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39","40-44",
  "45-49","50-54","55-59","60-64","65-69","70-74","75-79","80+",
];
const SEX_LABEL = { MALE: "Masculino", FEMALE: "Feminino", UNKNOWN: "Sem registro" };

const CSS = `
.m3-pyr{ font-family:var(--font-sans); }
.m3-pyr__legend{ display:flex; gap:16px; justify-content:center; margin-bottom:12px; flex-wrap:wrap; }
.m3-pyr__svg{ width:100%; display:block; }
.m3-pyr__band{ font-family:var(--font-mono); font-size:11px; fill:var(--color-text-secondary); }
.m3-pyr__val{ font-family:var(--font-mono); font-size:10px; fill:var(--color-text-primary); }
.m3-pyr__axis{ stroke:var(--chart-grid); stroke-width:1; }
.m3-pyr__bar{ transition:opacity var(--duration-fast); outline:none; }
.m3-pyr__bar:hover, .m3-pyr__bar:focus-visible{ opacity:.78; }
.m3-pyr__bar:focus-visible{ stroke:var(--color-focus-ring); stroke-width:2; }
.m3-pyr__unknown{ text-align:center; font-size:var(--text-xs); color:var(--color-text-secondary);
  margin-top:8px; }
.m3-pyr__table{ width:100%; border-collapse:collapse; font-size:var(--text-sm); margin-top:8px; }
.m3-pyr__table caption{ text-align:left; font-size:var(--text-xs); color:var(--color-text-secondary);
  margin-bottom:6px; }
.m3-pyr__table th, .m3-pyr__table td{ text-align:left; padding:5px 10px;
  border-bottom:1px solid var(--color-border-default); }
.m3-pyr__table td.num{ font-family:var(--font-mono); text-align:right; font-variant-numeric:tabular-nums; }
.m3-pyr__toolbar{ display:flex; justify-content:center; margin-top:10px; }
.m3-pyr__skel{ height:var(--chart-h-pyramid); border-radius:var(--radius-md);
  background:var(--color-bg-secondary); animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-pyr-css")) {
  const s = document.createElement("style");
  s.id = "m3-pyr-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function AgePyramidChart({
  items = [],
  suppressedGroups = 0,
  pending = false,
  error,
  onRetry,
}) {
  const [asTable, setAsTable] = React.useState(false);

  if (pending) return <div className="m3-pyr__skel" aria-hidden="true" />;
  if (error) {
    return (
      <M3EmptyState
        variant="unavailable"
        title="Não foi possível carregar a pirâmide etária"
        description={error}
        action={onRetry ? { label: "Tentar de novo", onPress: onRetry, icon: "refresh" } : undefined}
      />
    );
  }
  if (!items.length) {
    return (
      <M3EmptyState
        variant={suppressedGroups > 0 ? "privacy" : "default"}
        title={suppressedGroups > 0 ? "Dados omitidos por privacidade" : "Sem dados no período"}
        description={
          suppressedGroups > 0
            ? `Todos os grupos do recorte têm menos de 5 pessoas (K=5).`
            : "Amplie o período para ver resultados."
        }
      />
    );
  }

  // Aggregate by band + sex
  const byBand = {};
  let max = 0;
  let unknownTotal = 0;
  for (const it of items) {
    const b = (byBand[it.ageBand] = byBand[it.ageBand] || { MALE: 0, FEMALE: 0, UNKNOWN: 0 });
    b[it.sex] = (b[it.sex] || 0) + it.value;
    if (it.sex === "UNKNOWN") unknownTotal += it.value;
  }
  for (const band of BANDS) {
    const b = byBand[band];
    if (b) max = Math.max(max, b.MALE, b.FEMALE);
  }
  max = max || 1;

  // Geometry (viewBox units)
  const rowH = 22;
  const gap = 4;
  const labelW = 56;
  const halfW = 230;
  const pad = 8;
  const rows = [...BANDS].reverse(); // oldest at top
  const cx = pad + halfW;
  const h = rows.length * (rowH + gap) + pad;
  const vbW = pad * 2 + halfW * 2 + labelW;

  function bar(value, side, y) {
    const w = (value / max) * (halfW - 4);
    const x = side === "MALE" ? cx - labelW / 2 - w : cx + labelW / 2;
    const token = side === "MALE" ? "--chart-sex-male" : "--chart-sex-female";
    if (!value) return null;
    return (
      <g key={side}>
        <rect
          className="m3-pyr__bar"
          x={x}
          y={y}
          width={w}
          height={rowH}
          rx="3"
          fill={`var(${token})`}
          tabIndex={0}
          role="img"
          aria-label={`${SEX_LABEL[side]}, faixa ${rows[Math.round((y - pad) / (rowH + gap))]}, ${value} pessoas`}
        >
          <title>{`${SEX_LABEL[side]} · ${value}`}</title>
        </rect>
        <text
          className="m3-pyr__val"
          x={side === "MALE" ? x - 4 : x + w + 4}
          y={y + rowH / 2 + 3}
          textAnchor={side === "MALE" ? "end" : "start"}
        >
          {value}
        </text>
      </g>
    );
  }

  return (
    <div className="m3-pyr">
      <div className="m3-pyr__legend">
        <M3SeriesLegendItem label="Masculino" colorToken="--chart-sex-male" />
        <M3SeriesLegendItem label="Feminino" colorToken="--chart-sex-female" />
        {unknownTotal > 0 && (
          <M3SeriesLegendItem label="Sem registro" colorToken="--chart-sex-unknown" />
        )}
      </div>

      {asTable ? (
        <table className="m3-pyr__table">
          <caption>Pirâmide etária — dados por faixa e sexo</caption>
          <thead>
            <tr>
              <th scope="col">Faixa</th>
              <th scope="col">Masculino</th>
              <th scope="col">Feminino</th>
              {unknownTotal > 0 && <th scope="col">Sem registro</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((band) => {
              const b = byBand[band] || {};
              return (
                <tr key={band}>
                  <th scope="row" style={{ fontWeight: 500 }}>{band}</th>
                  <td className="num">{b.MALE || 0}</td>
                  <td className="num">{b.FEMALE || 0}</td>
                  {unknownTotal > 0 && <td className="num">{b.UNKNOWN || 0}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <svg
          className="m3-pyr__svg"
          viewBox={`0 0 ${vbW} ${h}`}
          role="img"
          aria-label="Pirâmide etária por faixa e sexo. Use a tabela para os valores exatos."
        >
          <line className="m3-pyr__axis" x1={cx} y1={pad} x2={cx} y2={h - pad} />
          {rows.map((band, i) => {
            const y = pad + i * (rowH + gap);
            const b = byBand[band] || {};
            return (
              <g key={band}>
                {bar(b.MALE, "MALE", y)}
                {bar(b.FEMALE, "FEMALE", y)}
                <text className="m3-pyr__band" x={cx} y={y + rowH / 2 + 4} textAnchor="middle">
                  {band}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {unknownTotal > 0 && !asTable && (
        <p className="m3-pyr__unknown">
          {unknownTotal} {unknownTotal === 1 ? "registro" : "registros"} sem sexo informado
        </p>
      )}

      <div className="m3-pyr__toolbar">
        <M3Button variant="text" icon={asTable ? "bar_chart" : "table"} onPress={() => setAsTable((v) => !v)}>
          {asTable ? "Ver como gráfico" : "Ver como tabela"}
        </M3Button>
      </div>
    </div>
  );
}
