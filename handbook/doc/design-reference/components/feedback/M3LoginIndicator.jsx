import React from "react";

const CSS = `
.m3-login{ display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px 0 7px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; border:1px solid transparent; }
.m3-login__icon{ font-family:'Material Symbols Rounded'; font-size:15px; line-height:1; }
.m3-login--linked{ background:var(--color-idp-linked-bg); color:var(--color-idp-linked); }
.m3-login--none{ background:var(--color-idp-none-bg); color:var(--color-idp-none); }
.m3-login--failed{ background:var(--color-idp-failed-bg); color:var(--color-idp-failed);
  border-color:var(--color-idp-failed-border); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-login-css")) {
  const s = document.createElement("style");
  s.id = "m3-login-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MAP = {
  linked: { icon: "key", label: "Tem login" },
  none: { icon: "key_off", label: "Sem login" },
  failed: { icon: "warning", label: "Provisão falhou" },
};

/**
 * "Tem login" indicator — derived in the ViewModel from idpUserId:
 * present → "linked", null → "none", null + a 207 creation flag in the current
 * session → "failed". Not an alert itself (the IdpRetryBanner owns the alert).
 */
export function M3LoginIndicator({ state = "none" }) {
  const m = MAP[state] || MAP.none;
  return (
    <span className={`m3-login m3-login--${state}`}>
      <span className="m3-login__icon material-symbols-rounded" aria-hidden="true">
        {m.icon}
      </span>
      {m.label}
    </span>
  );
}
