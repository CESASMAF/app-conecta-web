import React from "react";

const CSS = `
.m3-topbar{ position:sticky; top:0; z-index:var(--z-sticky); display:flex; align-items:center;
  gap:8px; height:var(--topbar-height); padding:0 16px 0 8px;
  background:var(--color-bg-elevated); border-bottom:1px solid var(--color-border-default);
  font-family:var(--font-sans); }
.m3-topbar__back{ display:inline-flex; align-items:center; justify-content:center;
  width:44px; height:44px; border-radius:var(--radius-full); border:none; background:none;
  cursor:pointer; color:var(--color-text-secondary); position:relative; isolation:isolate; }
.m3-topbar__back::after{ content:""; position:absolute; inset:6px; border-radius:50%;
  background:var(--color-text-primary); opacity:0; z-index:-1; transition:opacity var(--duration-fast); }
.m3-topbar__back:hover::after{ opacity:var(--state-hover); }
.m3-topbar__back:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring); outline-offset:1px; }
.m3-topbar__back .material-symbols-rounded{ font-size:24px; }
.m3-topbar__title{ font-size:var(--text-xl); font-weight:var(--weight-bold); margin:0;
  letter-spacing:var(--tracking-tight); white-space:nowrap; overflow:hidden;
  text-overflow:ellipsis; padding-left:8px; }
.m3-topbar__status{ margin:0 4px; }
.m3-topbar__spacer{ flex:1; }
.m3-topbar__actions{ display:flex; align-items:center; gap:8px; flex:none; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-topbar-css")) {
  const s = document.createElement("style");
  s.id = "m3-topbar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3TopAppBar({ title, onBack, statusSlot, actions }) {
  return (
    <header className="m3-topbar">
      {onBack && (
        <button type="button" className="m3-topbar__back" onClick={onBack} aria-label="Voltar">
          <span className="material-symbols-rounded" aria-hidden="true">
            arrow_back
          </span>
        </button>
      )}
      <h1 className="m3-topbar__title">{title}</h1>
      {statusSlot && <div className="m3-topbar__status">{statusSlot}</div>}
      <div className="m3-topbar__spacer" />
      {actions && <div className="m3-topbar__actions">{actions}</div>}
    </header>
  );
}
