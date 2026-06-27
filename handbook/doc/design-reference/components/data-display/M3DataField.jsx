import React from "react";

const CSS = `
.m3-dfield{ display:flex; flex-direction:column; gap:3px; font-family:var(--font-sans);
  padding:0; margin:0; }
.m3-dfield__label{ font-size:var(--text-xs); color:var(--color-text-secondary);
  letter-spacing:var(--tracking-wide); }
.m3-dfield__value{ font-size:var(--text-sm); color:var(--color-text-primary);
  font-weight:var(--weight-medium); margin:0; }
.m3-dfield--mono .m3-dfield__value{ font-family:var(--font-mono);
  font-variant-numeric:tabular-nums; }
.m3-dfield--empty .m3-dfield__value{ color:var(--color-text-disabled);
  font-weight:var(--weight-regular); }
.m3-dfield--inline{ flex-direction:row; align-items:baseline; gap:8px; justify-content:space-between; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-dfield-css")) {
  const s = document.createElement("style");
  s.id = "m3-dfield-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3DataField({
  label,
  value,
  mono = false,
  inline = false,
  emptyFallback = "—",
}) {
  const isEmpty = value == null || value === "";
  return (
    <div
      className={[
        "m3-dfield",
        mono ? "m3-dfield--mono" : "",
        inline ? "m3-dfield--inline" : "",
        isEmpty ? "m3-dfield--empty" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <dt className="m3-dfield__label">{label}</dt>
      <dd className="m3-dfield__value">{isEmpty ? emptyFallback : value}</dd>
    </div>
  );
}
