import React from "react";

const CSS = `
.m3-rail{ display:flex; flex-direction:column; align-items:center; width:var(--rail-width);
  flex:none; background:var(--color-bg-elevated); border-right:1px solid var(--color-border-default);
  padding:12px 0; gap:4px; font-family:var(--font-sans); }
.m3-rail__logo{ width:40px; height:40px; display:flex; align-items:center; justify-content:center;
  margin-bottom:12px; }
.m3-rail__logo img{ max-width:100%; max-height:100%; }
.m3-rail__item{ display:flex; flex-direction:column; align-items:center; gap:4px; width:100%;
  padding:6px 0; border:none; background:none; cursor:pointer; color:var(--color-text-secondary);
  text-decoration:none; font:inherit; }
.m3-rail__icon{ position:relative; isolation:isolate; display:flex; align-items:center;
  justify-content:center; width:48px; height:32px; border-radius:var(--radius-full);
  transition:background var(--duration-fast); }
.m3-rail__icon .material-symbols-rounded{ font-size:24px; }
.m3-rail__icon::after{ content:""; position:absolute; inset:0; border-radius:inherit;
  background:var(--color-action-primary); opacity:0; z-index:-1; transition:opacity var(--duration-fast); }
.m3-rail__item:hover .m3-rail__icon::after{ opacity:var(--state-hover); }
.m3-rail__item:focus-visible{ outline:none; }
.m3-rail__item:focus-visible .m3-rail__icon{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
.m3-rail__label{ font-size:11px; font-weight:var(--weight-medium); line-height:1;
  text-align:center; }
.m3-rail__item[aria-current="page"]{ color:var(--color-action-primary-tint-fg); }
.m3-rail__item[aria-current="page"] .m3-rail__icon{ background:var(--color-action-primary-tint); }
.m3-rail__item[aria-current="page"] .m3-rail__label{ color:var(--color-text-primary);
  font-weight:var(--weight-semibold); }
.m3-rail__spacer{ flex:1; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-rail-css")) {
  const s = document.createElement("style");
  s.id = "m3-rail-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3NavRail({ items = [], activeId, onSelect, logo, footer }) {
  return (
    <nav className="m3-rail" aria-label="Navegação principal">
      {logo && (
        <div className="m3-rail__logo">
          {typeof logo === "string" ? <img src={logo} alt="" /> : logo}
        </div>
      )}
      {items.map((it) => {
        const active = it.id === activeId;
        const common = {
          className: "m3-rail__item",
          "aria-current": active ? "page" : undefined,
          key: it.id,
        };
        const inner = (
          <React.Fragment>
            <span className="m3-rail__icon">
              <span className="material-symbols-rounded" aria-hidden="true">
                {it.icon}
              </span>
            </span>
            <span className="m3-rail__label">{it.label}</span>
          </React.Fragment>
        );
        return it.href ? (
          <a href={it.href} {...common}>
            {inner}
          </a>
        ) : (
          <button type="button" onClick={() => onSelect && onSelect(it.id)} {...common}>
            {inner}
          </button>
        );
      })}
      {footer && (
        <React.Fragment>
          <div className="m3-rail__spacer" />
          {footer}
        </React.Fragment>
      )}
    </nav>
  );
}
