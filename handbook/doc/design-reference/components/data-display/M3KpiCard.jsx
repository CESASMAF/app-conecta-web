import React from "react";
import { M3Card } from "./M3Card.jsx";
import { M3KpiValue } from "./M3KpiValue.jsx";
import { M3PeriodLabel } from "./M3PeriodLabel.jsx";

const CSS = `
.m3-kpicard{ display:flex; flex-direction:column; gap:8px; }
.m3-kpicard__top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.m3-kpicard__label{ font-size:var(--text-sm); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-kpicard__icon{ font-family:'Material Symbols Rounded'; font-size:22px;
  color:var(--color-action-primary); }
.m3-kpicard__value{ margin-top:2px; }
.m3-kpicard__meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-kpicard__foot{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-kpicard__chev{ font-family:'Material Symbols Rounded'; font-size:20px;
  color:var(--color-text-secondary); margin-left:auto; }
.m3-kpicard__skel{ height:34px; width:60%; border-radius:var(--radius-sm);
  background:var(--color-bg-secondary); }
@keyframes m3-pulse{ 0%,100%{ opacity:1; } 50%{ opacity:.5; } }
.m3-kpicard__skel{ animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-kpicard-css")) {
  const s = document.createElement("style");
  s.id = "m3-kpicard-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3KpiCard({
  label,
  value,
  format = "integer",
  unitLabel,
  period,
  granularity = "monthly",
  footnote,
  icon,
  href,
  onPress,
  pending = false,
}) {
  const clickable = Boolean(href || onPress);
  return (
    <M3Card padding="md" href={href} onPress={onPress}>
      <div className="m3-kpicard">
        <div className="m3-kpicard__top">
          {icon && (
            <span className="m3-kpicard__icon material-symbols-rounded" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="m3-kpicard__label">{label}</span>
          {clickable && (
            <span className="m3-kpicard__chev material-symbols-rounded" aria-hidden="true">
              chevron_right
            </span>
          )}
        </div>
        <div className="m3-kpicard__value">
          {pending ? (
            <div className="m3-kpicard__skel" aria-hidden="true" />
          ) : (
            <M3KpiValue value={value} format={format} unitLabel={unitLabel} size="md" />
          )}
        </div>
        <div className="m3-kpicard__meta">
          {period && <M3PeriodLabel period={period} granularity={granularity} variant="inline" />}
        </div>
        {footnote && <div className="m3-kpicard__foot">{footnote}</div>}
      </div>
    </M3Card>
  );
}
