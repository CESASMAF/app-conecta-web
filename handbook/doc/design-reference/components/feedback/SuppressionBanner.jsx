import React from "react";

const CSS = `
.m3-supp{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px;
  background:var(--color-banner-suppression-bg); border:1px solid var(--color-banner-suppression-border);
  border-radius:var(--radius-md); font-family:var(--font-sans);
  color:var(--color-banner-suppression-fg); }
.m3-supp--compact{ padding:9px 12px; gap:9px; border-radius:var(--radius-sm); }
.m3-supp__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-info);
  flex:none; }
.m3-supp--compact .m3-supp__icon{ font-size:18px; }
.m3-supp__body{ flex:1; font-size:var(--text-sm); line-height:var(--leading-snug); }
.m3-supp--compact .m3-supp__body{ font-size:var(--text-xs); }
.m3-supp__body strong{ font-weight:var(--weight-semibold); }
.m3-supp__link{ margin-left:6px; color:var(--color-info); font-weight:var(--weight-semibold);
  text-decoration:underline; text-underline-offset:2px; cursor:pointer; background:none;
  border:none; font:inherit; padding:0; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-supp-css")) {
  const s = document.createElement("style");
  s.id = "m3-supp-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Privacy suppression banner. Renders ONLY when suppressedGroups > 0. This is a
 * compliance invariant (LGPD Art. 12) — there is intentionally no prop to hide
 * it. role="note" + aria-live="polite" (informative, not an alert).
 */
export function SuppressionBanner({
  suppressedGroups,
  kThreshold = 5,
  compact = false,
  onLearnMore,
}) {
  if (!suppressedGroups || suppressedGroups <= 0) return null;
  return (
    <div
      className={["m3-supp", compact ? "m3-supp--compact" : ""].filter(Boolean).join(" ")}
      role="note"
      aria-live="polite"
    >
      <span className="m3-supp__icon material-symbols-rounded" aria-hidden="true">
        shield_lock
      </span>
      <p className="m3-supp__body">
        <strong>
          {suppressedGroups} grupo{suppressedGroups === 1 ? "" : "s"}
        </strong>{" "}
        com menos de {kThreshold} pessoas{" "}
        {suppressedGroups === 1 ? "foi omitido" : "foram omitidos"} para proteger a
        privacidade <strong>(K-anonimato, K={kThreshold})</strong>.
        {onLearnMore && (
          <button type="button" className="m3-supp__link" onClick={onLearnMore}>
            Entenda
          </button>
        )}
      </p>
    </div>
  );
}
