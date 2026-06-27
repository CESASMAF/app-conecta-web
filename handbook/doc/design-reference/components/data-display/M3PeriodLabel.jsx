import React from "react";

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** Parse the contract's 3 period formats into display + machine forms. */
export function parsePeriod(period, granularity) {
  if (!period) return { short: "—", long: "—", iso: undefined };
  if (granularity === "yearly" || /^\d{4}$/.test(period)) {
    return { short: period, long: period, iso: period };
  }
  if (granularity === "quarterly" || /^\d{4}-Q[1-4]$/i.test(period)) {
    const [y, q] = period.split("-");
    const qn = q.replace(/Q/i, "");
    return { short: `T${qn} ${y}`, long: `${qn}º trimestre de ${y}`, iso: period };
  }
  // monthly "YYYY-MM"
  const [y, m] = period.split("-");
  const mi = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  return {
    short: `${MONTHS_SHORT[mi]}/${y}`,
    long: `${MONTHS_LONG[mi]} de ${y}`,
    iso: `${y}-${m}`,
  };
}

const CSS = `
.m3-period{ font-family:var(--font-sans); }
.m3-period--axis{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-period--inline{ font-size:var(--text-sm); color:var(--color-text-primary); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-period-css")) {
  const s = document.createElement("style");
  s.id = "m3-period-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3PeriodLabel({ period, granularity = "monthly", variant = "inline" }) {
  const p = parsePeriod(period, granularity);
  return (
    <time className={`m3-period m3-period--${variant}`} dateTime={p.iso} aria-label={p.long}>
      {variant === "axis" ? p.short : p.long}
    </time>
  );
}
