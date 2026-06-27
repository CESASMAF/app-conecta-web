import React from "react";

const CSS = `
.m3-legend{ display:inline-flex; align-items:center; gap:7px; font-family:var(--font-sans);
  font-size:var(--text-xs); color:var(--color-text-secondary); border:none; background:none;
  padding:2px 4px; border-radius:var(--radius-xs); }
button.m3-legend{ cursor:pointer; }
button.m3-legend:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:1px; }
.m3-legend__swatch{ width:12px; height:12px; border-radius:3px; flex:none; }
.m3-legend__swatch--line{ height:3px; border-radius:var(--radius-full); }
.m3-legend--muted{ opacity:.45; }
.m3-legend--muted .m3-legend__swatch{ background:var(--color-text-disabled) !important; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-legend-css")) {
  const s = document.createElement("style");
  s.id = "m3-legend-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3SeriesLegendItem({
  label,
  colorToken,
  shape = "square",
  muted = false,
  onPress,
}) {
  const cls = ["m3-legend", muted ? "m3-legend--muted" : ""].filter(Boolean).join(" ");
  const swatch = (
    <span
      className={`m3-legend__swatch ${shape === "line" ? "m3-legend__swatch--line" : ""}`}
      style={{ background: `var(${colorToken})` }}
      aria-hidden="true"
    />
  );
  if (onPress) {
    return (
      <button type="button" className={cls} onClick={onPress} aria-pressed={!muted}>
        {swatch}
        {label}
      </button>
    );
  }
  return (
    <span className={cls}>
      {swatch}
      {label}
    </span>
  );
}
