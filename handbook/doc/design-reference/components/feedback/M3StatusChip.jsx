import React from "react";

const CSS = `
.m3-statuschip{ display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 11px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; }
.m3-statuschip__icon{ font-family:'Material Symbols Rounded'; font-size:16px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-statuschip-css")) {
  const s = document.createElement("style");
  s.id = "m3-statuschip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MAP = {
  waitlisted:  { label: "Fila de espera", icon: "schedule",     fg: "--color-status-fila",       bg: "--color-status-fila-bg" },
  active:      { label: "Acolhido",       icon: "check_circle", fg: "--color-status-acolhido",   bg: "--color-status-acolhido-bg" },
  discharged:  { label: "Alta",           icon: "arrow_upward", fg: "--color-status-alta",       bg: "--color-status-alta-bg" },
  withdrawn:   { label: "Desistente",     icon: "cancel",       fg: "--color-status-desistente", bg: "--color-status-desistente-bg" },
};

export function M3StatusChip({ status, label }) {
  const m = MAP[status] || MAP.withdrawn;
  return (
    <span
      className="m3-statuschip"
      style={{ color: `var(${m.fg})`, background: `var(${m.bg})` }}
    >
      <span className="m3-statuschip__icon material-symbols-rounded" aria-hidden="true">
        {m.icon}
      </span>
      {label || m.label}
    </span>
  );
}
