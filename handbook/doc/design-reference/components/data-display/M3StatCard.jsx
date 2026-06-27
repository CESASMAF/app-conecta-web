import React from "react";
import { M3Card } from "./M3Card.jsx";
import { M3KpiValue } from "./M3KpiValue.jsx";

const CSS = `
.m3-stat{ display:flex; flex-direction:column; gap:6px; }
.m3-stat__top{ display:flex; align-items:center; gap:8px; }
.m3-stat__icon{ font-family:'Material Symbols Rounded'; font-size:20px; color:var(--color-text-secondary); }
.m3-stat__label{ font-size:var(--text-sm); color:var(--color-text-secondary); font-weight:var(--weight-medium); }
.m3-stat__value{ display:flex; align-items:baseline; gap:6px; }
.m3-stat__tone{ display:inline-flex; align-items:center; gap:5px; align-self:flex-start;
  height:22px; padding:0 9px; border-radius:var(--radius-full); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); margin-top:2px; }
.m3-stat__tone .material-symbols-rounded{ font-size:14px; }
.m3-stat__tone--success{ color:var(--color-success); background:var(--color-success-bg); }
.m3-stat__tone--warning{ color:var(--color-warning); background:var(--color-warning-bg); }
.m3-stat__tone--danger{ color:var(--color-danger); background:var(--color-danger-bg); }
.m3-stat__tone--neutral{ color:var(--color-text-secondary); background:var(--color-bg-secondary); }
.m3-stat__foot{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-stat__skel{ height:30px; width:55%; border-radius:var(--radius-sm); background:var(--color-bg-secondary);
  animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-stat-css")) {
  const s = document.createElement("style");
  s.id = "m3-stat-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const TONE_ICON = { success: "check_circle", warning: "warning", danger: "error", neutral: "info" };

export function M3StatCard({
  label,
  value,
  format,
  unit,
  icon,
  tone,
  toneLabel,
  footnote,
  pending = false,
}) {
  const numeric = typeof value === "number" || value == null;
  return (
    <M3Card padding="md">
      <div className="m3-stat">
        <div className="m3-stat__top">
          {icon && <span className="m3-stat__icon material-symbols-rounded" aria-hidden="true">{icon}</span>}
          <span className="m3-stat__label">{label}</span>
        </div>
        {pending ? (
          <div className="m3-stat__skel" aria-hidden="true" />
        ) : (
          <div className="m3-stat__value">
            {numeric ? (
              <M3KpiValue value={value} format={format || "integer"} unitLabel={unit} size="sm" />
            ) : (
              <span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-text-primary)" }}>{value}</span>
            )}
          </div>
        )}
        {!pending && tone && (
          <span className={`m3-stat__tone m3-stat__tone--${tone}`}>
            <span className="material-symbols-rounded" aria-hidden="true">{TONE_ICON[tone]}</span>
            {toneLabel}
          </span>
        )}
        {footnote && <div className="m3-stat__foot">{footnote}</div>}
      </div>
    </M3Card>
  );
}
