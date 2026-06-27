import React from "react";

const CSS = `
.m3-lgpd{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px;
  background:var(--color-banner-lgpd-bg); border:1px solid var(--color-banner-lgpd-border);
  border-radius:var(--radius-md); font-family:var(--font-sans); color:var(--color-banner-lgpd-fg); }
.m3-lgpd__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-info); flex:none; }
.m3-lgpd__body{ font-size:var(--text-sm); line-height:var(--leading-snug); }
.m3-lgpd__body strong{ font-weight:var(--weight-semibold); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-lgpd-css")) {
  const s = document.createElement("style");
  s.id = "m3-lgpd-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Permanent banner shown on an LGPD-anonymized record. Not dismissible — PII is
 * hidden and edits are blocked while this is present. role="note".
 */
export function LgpdAnonymizedBanner({ message }) {
  return (
    <div className="m3-lgpd" role="note">
      <span className="m3-lgpd__icon material-symbols-rounded" aria-hidden="true">
        privacy_tip
      </span>
      <p className="m3-lgpd__body">
        {message || (
          <React.Fragment>
            <strong>Dados pessoais removidos por solicitação LGPD.</strong> O histórico
            clínico e social é preservado; a edição da avaliação está bloqueada.
          </React.Fragment>
        )}
      </p>
    </div>
  );
}
