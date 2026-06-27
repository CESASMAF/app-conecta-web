import React from "react";

const CSS = `
.m3-avatar{ display:inline-flex; align-items:center; justify-content:center; flex:none;
  border-radius:50%; background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg);
  font-family:var(--font-sans); font-weight:var(--weight-semibold); overflow:hidden;
  text-transform:uppercase; line-height:1; }
.m3-avatar img{ width:100%; height:100%; object-fit:cover; }
.m3-avatar--sm{ width:28px; height:28px; font-size:11px; }
.m3-avatar--md{ width:40px; height:40px; font-size:var(--text-sm); }
.m3-avatar--lg{ width:56px; height:56px; font-size:var(--text-lg); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-avatar-css")) {
  const s = document.createElement("style");
  s.id = "m3-avatar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function initials(name) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]);
}

export function M3Avatar({ name, src, size = "md", alt }) {
  return (
    <span className={`m3-avatar m3-avatar--${size}`} aria-hidden={src ? undefined : "true"}>
      {src ? <img src={src} alt={alt || name || ""} /> : initials(name)}
    </span>
  );
}
