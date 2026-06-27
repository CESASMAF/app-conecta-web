import React from "react";
import { M3Button } from "../forms/M3Button.jsx";
import { M3EmptyState } from "../feedback/M3EmptyState.jsx";

const CSS = `
.m3-bars{ font-family:var(--font-sans); }
.m3-bars__list{ display:flex; flex-direction:column; gap:12px; }
.m3-bars__row{ display:grid; grid-template-columns:1fr; gap:4px; }
.m3-bars__head{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.m3-bars__label{ font-size:var(--text-sm); color:var(--color-text-primary);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.m3-bars__code{ font-family:var(--font-mono); color:var(--color-text-secondary); margin-right:6px; }
.m3-bars__value{ font-family:var(--font-mono); font-variant-numeric:tabular-nums;
  font-weight:var(--weight-semibold); color:var(--color-text-primary); flex:none; }
.m3-bars__track{ height:14px; border-radius:var(--radius-full); background:var(--color-bg-secondary);
  overflow:hidden; }
.m3-bars__fill{ height:100%; border-radius:var(--radius-full); min-width:3px;
  outline:none; transition:opacity var(--duration-fast); }
.m3-bars__fill:hover, .m3-bars__fill:focus-visible{ opacity:.8; }
.m3-bars__fill:focus-visible{ box-shadow:0 0 0 2px var(--color-focus-ring); }
.m3-bars__table{ width:100%; border-collapse:collapse; font-size:var(--text-sm); }
.m3-bars__table caption{ text-align:left; font-size:var(--text-xs); color:var(--color-text-secondary);
  margin-bottom:6px; }
.m3-bars__table th, .m3-bars__table td{ text-align:left; padding:5px 10px;
  border-bottom:1px solid var(--color-border-default); }
.m3-bars__table td.num{ font-family:var(--font-mono); text-align:right; font-variant-numeric:tabular-nums; }
.m3-bars__table td.code{ font-family:var(--font-mono); color:var(--color-text-secondary); }
.m3-bars__toolbar{ display:flex; justify-content:center; margin-top:14px; }
.m3-bars__skel{ height:var(--chart-h-bars); border-radius:var(--radius-md);
  background:var(--color-bg-secondary); animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-bars-css")) {
  const s = document.createElement("style");
  s.id = "m3-bars-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function TopNBarChart({
  items = [],
  fixedOrder = false,
  suppressedGroups = 0,
  unitLabel,
  pending = false,
  error,
  onRetry,
  caption = "Ranking — dados por categoria",
}) {
  const [asTable, setAsTable] = React.useState(false);

  if (pending) return <div className="m3-bars__skel" aria-hidden="true" />;
  if (error) {
    return (
      <M3EmptyState
        variant="unavailable"
        title="Não foi possível carregar o gráfico"
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
            ? "As categorias com menos de 5 pessoas (K=5) ficam fora do ranking."
            : "Amplie o período para ver resultados."
        }
      />
    );
  }

  const ordered = fixedOrder ? items : [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...ordered.map((d) => d.value), 1);
  const colorFor = (i) => `var(--chart-cat-${(i % 8) + 1})`;

  return (
    <div className="m3-bars">
      {asTable ? (
        <table className="m3-bars__table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Código</th>
              <th scope="col">Categoria</th>
              <th scope="col" style={{ textAlign: "right" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((d, i) => (
              <tr key={d.code || d.label}>
                <td className="num">{i + 1}</td>
                <td className="code">{d.code || "—"}</td>
                <th scope="row" style={{ fontWeight: 500 }}>{d.label}</th>
                <td className="num">{d.value.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ol className="m3-bars__list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ordered.map((d, i) => (
            <li className="m3-bars__row" key={d.code || d.label}>
              <div className="m3-bars__head">
                <span className="m3-bars__label">
                  {d.code && <span className="m3-bars__code">{d.code}</span>}
                  {d.label}
                </span>
                <span className="m3-bars__value">
                  {d.value.toLocaleString("pt-BR")}
                  {unitLabel ? ` ${unitLabel}` : ""}
                </span>
              </div>
              <div className="m3-bars__track">
                <div
                  className="m3-bars__fill"
                  style={{ width: `${(d.value / max) * 100}%`, background: colorFor(i) }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${i + 1}º: ${d.code ? d.code + " — " : ""}${d.label}, ${d.value} ${unitLabel || ""}`}
                >
                  <title>{`${d.label} · ${d.value}`}</title>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="m3-bars__toolbar">
        <M3Button variant="text" icon={asTable ? "bar_chart" : "table"} onPress={() => setAsTable((v) => !v)}>
          {asTable ? "Ver como gráfico" : "Ver como tabela"}
        </M3Button>
      </div>
    </div>
  );
}
