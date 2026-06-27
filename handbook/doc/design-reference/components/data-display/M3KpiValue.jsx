import React from "react";

const CSS = `
.m3-kpi{ font-family:var(--font-mono); font-variant-numeric:tabular-nums;
  font-weight:var(--weight-bold); color:var(--color-text-primary);
  line-height:1; letter-spacing:-0.01em; }
.m3-kpi--lg{ font-size:var(--text-4xl); }
.m3-kpi--md{ font-size:var(--text-3xl); }
.m3-kpi--sm{ font-size:var(--text-2xl); }
.m3-kpi__unit{ font-family:var(--font-sans); font-size:0.42em; font-weight:var(--weight-medium);
  color:var(--color-text-secondary); margin-left:6px; letter-spacing:0; }
.m3-kpi--empty{ color:var(--color-text-disabled); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-kpi-css")) {
  const s = document.createElement("style");
  s.id = "m3-kpi-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const PTBR = "pt-BR";

function formatValue(value, format) {
  if (value == null || Number.isNaN(value)) return null;
  switch (format) {
    case "currency":
      // value arrives in cents per the contract
      return new Intl.NumberFormat(PTBR, {
        style: "currency",
        currency: "BRL",
      }).format(value / 100);
    case "percent":
      // value is a 0–1 ratio
      return new Intl.NumberFormat(PTBR, {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(value);
    case "decimal":
      return new Intl.NumberFormat(PTBR, { maximumFractionDigits: 1 }).format(value);
    case "integer":
    default:
      return new Intl.NumberFormat(PTBR, { maximumFractionDigits: 0 }).format(value);
  }
}

export function M3KpiValue({
  value,
  format = "integer",
  unitLabel,
  size = "md",
  ariaLabel,
}) {
  const formatted = formatValue(value, format);
  const empty = formatted == null;
  return (
    <span
      className={["m3-kpi", `m3-kpi--${size}`, empty ? "m3-kpi--empty" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel || (empty ? "Sem valor" : `${formatted}${unitLabel ? " " + unitLabel : ""}`)}
    >
      {empty ? "—" : formatted}
      {!empty && unitLabel && <span className="m3-kpi__unit">{unitLabel}</span>}
    </span>
  );
}

export { formatValue };
