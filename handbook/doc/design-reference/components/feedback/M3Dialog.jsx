import React from "react";

const CSS = `
.m3-dialog__scrim{ position:fixed; inset:0; background:var(--color-overlay);
  display:flex; align-items:center; justify-content:center; padding:24px; z-index:var(--z-modal);
  animation:m3-dialog-fade var(--duration-normal) var(--ease-standard); }
.m3-dialog{ background:var(--color-bg-elevated); border-radius:var(--radius-xl);
  box-shadow:var(--shadow-lg); width:100%; max-width:440px; max-height:90vh; overflow:auto;
  font-family:var(--font-sans); animation:m3-dialog-pop var(--duration-normal) var(--ease-standard); }
.m3-dialog__head{ padding:24px 24px 8px; display:flex; gap:12px; align-items:flex-start; }
.m3-dialog__icon{ font-family:'Material Symbols Rounded'; font-size:24px; flex:none;
  color:var(--color-action-primary); }
.m3-dialog--destructive .m3-dialog__icon{ color:var(--color-danger); }
.m3-dialog__title{ font-size:var(--text-xl); font-weight:var(--weight-bold);
  color:var(--color-text-primary); letter-spacing:var(--tracking-tight); }
.m3-dialog__body{ padding:0 24px 8px; font-size:var(--text-sm); color:var(--color-text-secondary);
  line-height:var(--leading-snug); }
.m3-dialog__content{ padding:12px 24px 4px; }
.m3-dialog__actions{ padding:16px 24px 24px; display:flex; gap:8px; justify-content:flex-end; }
@keyframes m3-dialog-fade{ from{ opacity:0; } }
@keyframes m3-dialog-pop{ from{ opacity:0; transform:translateY(8px) scale(.98); } }
@media (prefers-reduced-motion: reduce){ .m3-dialog,.m3-dialog__scrim{ animation:none; } }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-dialog-css")) {
  const s = document.createElement("style");
  s.id = "m3-dialog-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3Dialog({
  open,
  title,
  description,
  icon,
  destructive = false,
  children,
  actions,
  onClose,
}) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && onClose) onClose(); };
    document.addEventListener("keydown", onKey);
    if (ref.current) ref.current.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="m3-dialog__scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div
        className={["m3-dialog", destructive ? "m3-dialog--destructive" : ""].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="m3-dialog__head">
          {icon && <span className="m3-dialog__icon material-symbols-rounded" aria-hidden="true">{icon}</span>}
          <h2 className="m3-dialog__title">{title}</h2>
        </div>
        {description && <p className="m3-dialog__body">{description}</p>}
        {children && <div className="m3-dialog__content">{children}</div>}
        {actions && <div className="m3-dialog__actions">{actions}</div>}
      </div>
    </div>
  );
}
