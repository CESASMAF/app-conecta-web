import React from "react";

const CSS = `
.idp-retry{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px;
  background:var(--color-idp-failed-bg); border:1px solid var(--color-idp-failed-border);
  border-radius:var(--radius-md); font-family:var(--font-sans); color:var(--color-text-primary); }
.idp-retry__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-idp-failed); flex:none; }
.idp-retry__body{ flex:1; font-size:var(--text-sm); line-height:var(--leading-snug); }
.idp-retry__body strong{ font-weight:var(--weight-semibold); }
.idp-retry__code{ font-family:var(--font-mono); font-size:var(--text-xs); color:var(--color-text-secondary); }
.idp-retry__btn{ flex:none; align-self:center; display:inline-flex; align-items:center; gap:6px;
  height:38px; padding:0 16px; border-radius:var(--radius-full); border:none; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); font-weight:var(--weight-semibold);
  background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg);
  transition:filter var(--duration-fast) var(--ease-standard); }
.idp-retry__btn:hover{ filter:brightness(.97); }
.idp-retry__btn:disabled{ opacity:.6; cursor:default; }
.idp-retry__btn .material-symbols-rounded{ font-size:18px; }
`;
if (typeof document !== "undefined" && !document.getElementById("idp-retry-css")) {
  const s = document.createElement("style");
  s.id = "idp-retry-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * 207 Multi-Status retry banner. Appears when POST /people created the person
 * but IdP provisioning failed, or when a retry (POST /people/:id/login) returns
 * 502 IDP-001. role="alert"; the button delegates the retry to the ViewModel.
 */
export function IdpRetryBanner({ onRetry, isPending = false, error }) {
  return (
    <div className="idp-retry" role="alert">
      <span className="idp-retry__icon material-symbols-rounded" aria-hidden="true">
        sync_problem
      </span>
      <div className="idp-retry__body">
        <strong>Pessoa criada, mas o login não foi provisionado.</strong>{" "}
        O provedor de identidade não respondeu. Os dados da pessoa estão salvos — você pode tentar provisionar o login de novo.
        {error && <div className="idp-retry__code">{error}</div>}
      </div>
      <button type="button" className="idp-retry__btn" onClick={onRetry} disabled={isPending}>
        <span className="material-symbols-rounded" aria-hidden="true">
          {isPending ? "progress_activity" : "key"}
        </span>
        {isPending ? "Provisionando…" : "Provisionar login agora"}
      </button>
    </div>
  );
}
