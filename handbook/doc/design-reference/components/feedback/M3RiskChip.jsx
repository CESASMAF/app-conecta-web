import React from "react";

const CSS = `
.m3-riskchip{ display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 9px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; }
.m3-riskchip__icon{ font-family:'Material Symbols Rounded'; font-size:15px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-riskchip-css")) {
  const s = document.createElement("style");
  s.id = "m3-riskchip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MAP = {
  violation:    { label: "Violação de direitos", icon: "gavel",          fg: "--color-risk-violation",    bg: "--color-risk-violation-bg" },
  overcrowding: { label: "Sobrelotação",          icon: "home",           fg: "--color-risk-overcrowding", bg: "--color-risk-overcrowding-bg" },
  dropout:      { label: "Evasão escolar",        icon: "school",         fg: "--color-risk-delay",        bg: "--color-risk-delay-bg" },
  prenatal:     { label: "Pré-natal pendente",    icon: "pregnant_woman", fg: "--color-risk-prenatal",     bg: "--color-risk-prenatal-bg" },
  default:      { label: "Atenção",               icon: "flag",           fg: "--color-risk-default",      bg: "--color-risk-default-bg" },
};

export function M3RiskChip({ risk = "default", label, icon }) {
  const m = MAP[risk] || MAP.default;
  return (
    <span className="m3-riskchip" style={{ color: `var(${m.fg})`, background: `var(${m.bg})` }}>
      <span className="m3-riskchip__icon material-symbols-rounded" aria-hidden="true">
        {icon || m.icon}
      </span>
      {label || m.label}
    </span>
  );
}
