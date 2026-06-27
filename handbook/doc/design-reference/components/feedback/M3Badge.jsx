import React from "react";

const CSS = `
.m3-badge{ display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap;
  border:1px solid transparent; }
.m3-badge__dot{ width:7px; height:7px; border-radius:50%; background:currentColor; }
.m3-badge__icon{ font-family:'Material Symbols Rounded'; font-size:14px; }
.m3-badge--neutral{ background:var(--color-bg-secondary); color:var(--color-text-secondary);
  border-color:var(--color-border-default); }
.m3-badge--primary{ background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg); }
.m3-badge--success{ background:var(--color-success-bg); color:var(--color-success);
  border-color:var(--color-success-border); }
.m3-badge--warning{ background:var(--color-warning-bg); color:var(--color-warning);
  border-color:var(--color-warning-border); }
.m3-badge--danger{ background:var(--color-danger-bg); color:var(--color-danger);
  border-color:var(--color-danger-border); }
.m3-badge--info{ background:var(--color-info-bg); color:var(--color-info);
  border-color:var(--color-info-border); }
.m3-badge--solid{ border-color:transparent; color:var(--white); }
.m3-badge--solid.m3-badge--primary{ background:var(--color-action-primary); }
.m3-badge--solid.m3-badge--danger{ background:var(--color-danger); }
.m3-badge--solid.m3-badge--success{ background:var(--color-success); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-badge-css")) {
  const s = document.createElement("style");
  s.id = "m3-badge-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3Badge({
  variant = "neutral",
  solid = false,
  dot = false,
  icon,
  children,
  ...rest
}) {
  return (
    <span
      className={[
        "m3-badge",
        `m3-badge--${variant}`,
        solid ? "m3-badge--solid" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {dot && <span className="m3-badge__dot" aria-hidden="true" />}
      {icon && (
        <span className="m3-badge__icon material-symbols-rounded" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
