import React from "react";

const CSS = `
.m3-card{ background:var(--color-bg-elevated); border:1px solid var(--color-border-default);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); }
.m3-card--flat{ box-shadow:none; }
.m3-card--pad{ padding:var(--space-6); }
.m3-card--pad-sm{ padding:var(--space-4); }
a.m3-card, button.m3-card{ display:block; text-align:left; width:100%; font:inherit;
  color:inherit; cursor:pointer; text-decoration:none; position:relative; isolation:isolate;
  transition:box-shadow var(--duration-fast) var(--ease-standard),
             border-color var(--duration-fast) var(--ease-standard); }
a.m3-card::after, button.m3-card::after{ content:""; position:absolute; inset:0;
  border-radius:inherit; background:var(--color-action-primary); opacity:0; z-index:-1;
  transition:opacity var(--duration-fast); }
a.m3-card:hover, button.m3-card:hover{ box-shadow:var(--shadow-md); border-color:var(--color-border-strong); }
a.m3-card:hover::after, button.m3-card:hover::after{ opacity:0.04; }
a.m3-card:focus-visible, button.m3-card:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-card-css")) {
  const s = document.createElement("style");
  s.id = "m3-card-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3Card({
  children,
  padding = "md",
  flat = false,
  href,
  onPress,
  className = "",
  style,
  ...rest
}) {
  const cls = [
    "m3-card",
    flat ? "m3-card--flat" : "",
    padding === "md" ? "m3-card--pad" : padding === "sm" ? "m3-card--pad-sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a className={cls} href={href} style={style} {...rest}>
        {children}
      </a>
    );
  }
  if (onPress) {
    return (
      <button type="button" className={cls} onClick={onPress} style={style} {...rest}>
        {children}
      </button>
    );
  }
  return (
    <div className={cls} style={style} {...rest}>
      {children}
    </div>
  );
}
