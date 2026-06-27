import React from "react";

const CSS = `
.m3-active{ display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px 0 7px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; border:1px solid transparent; }
.m3-active--sm{ height:19px; font-size:11px; padding:0 7px 0 6px; }
.m3-active__icon{ font-family:'Material Symbols Rounded'; font-size:15px; line-height:1; }
.m3-active--sm .m3-active__icon{ font-size:13px; }
.m3-active--on{ background:var(--color-person-active-bg); color:var(--color-person-active);
  border-color:var(--color-person-active-border); }
.m3-active--off{ background:var(--color-person-inactive-bg); color:var(--color-person-inactive);
  border-color:var(--color-person-inactive-border); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-active-css")) {
  const s = document.createElement("style");
  s.id = "m3-active-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Active / inactive state badge — a 1:1 image of the domain `active` boolean
 * (Person and SystemRole). No third state. Always colour + icon + label so it
 * stays legible without colour (daltonism / AA).
 */
export function M3ActiveBadge({ active, size = "md", labels }) {
  const l = labels || { on: "Ativa", off: "Inativa" };
  return (
    <span
      className={["m3-active", active ? "m3-active--on" : "m3-active--off", size === "sm" ? "m3-active--sm" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="m3-active__icon material-symbols-rounded" aria-hidden="true">
        {active ? "check_circle" : "pause_circle"}
      </span>
      {active ? l.on : l.off}
    </span>
  );
}
