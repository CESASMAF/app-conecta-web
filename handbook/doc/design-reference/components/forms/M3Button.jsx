import React from "react";

/* Inject component CSS once (self-contained, React-only, tokens via CSS vars). */
const CSS = `
.m3-btn{
  --_h:40px; --_px:24px; --_fs:var(--text-sm);
  position:relative; isolation:isolate; display:inline-flex; align-items:center;
  justify-content:center; gap:8px; height:var(--_h); padding:0 var(--_px);
  border-radius:var(--radius-full); border:none; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--_fs); font-weight:var(--weight-semibold);
  letter-spacing:.01em; line-height:1; white-space:nowrap; text-decoration:none;
  transition:background var(--duration-fast) var(--ease-standard),
             box-shadow var(--duration-fast) var(--ease-standard),
             color var(--duration-fast) var(--ease-standard);
}
.m3-btn::after{ content:""; position:absolute; inset:0; border-radius:inherit;
  background:currentColor; opacity:0; transition:opacity var(--duration-fast); z-index:-1; }
.m3-btn:hover::after{ opacity:var(--state-hover); }
.m3-btn:active::after{ opacity:var(--state-pressed); }
.m3-btn:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
.m3-btn--sm{ --_h:32px; --_px:16px; --_fs:var(--text-xs); }

.m3-btn--filled{ background:var(--color-action-primary); color:var(--color-action-primary-fg); }
.m3-btn--filled:hover{ background:var(--color-action-primary-hover); }
.m3-btn--filled:active{ background:var(--color-action-primary-active); }
.m3-btn--filled::after{ background:var(--white); }

.m3-btn--tonal{ background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg); }
.m3-btn--tonal::after{ background:var(--color-action-primary); }

.m3-btn--outlined{ background:transparent; color:var(--color-text-primary);
  border:1.5px solid var(--color-border-strong); }
.m3-btn--outlined::after{ background:var(--color-text-primary); }

.m3-btn--text{ background:transparent; color:var(--color-action-primary); padding:0 12px; }
.m3-btn--text::after{ background:var(--color-action-primary); }

.m3-btn--destructive{ background:var(--color-danger); color:var(--white); }
.m3-btn--destructive::after{ background:var(--white); }

.m3-btn[disabled]{ cursor:not-allowed; background:var(--color-bg-secondary);
  color:var(--color-text-disabled); border-color:transparent; box-shadow:none; }
.m3-btn[disabled]::after{ opacity:0; }
.m3-btn--text[disabled],.m3-btn--outlined[disabled]{ background:transparent; }

.m3-btn .m3-btn__icon{ font-family:'Material Symbols Rounded'; font-size:18px;
  line-height:1; font-weight:normal; }
.m3-btn .m3-btn__spin{ width:16px; height:16px; border-radius:50%;
  border:2px solid currentColor; border-top-color:transparent; opacity:.7;
  animation:m3-spin .7s linear infinite; }
@keyframes m3-spin{ to{ transform:rotate(360deg); } }
@media (prefers-reduced-motion: reduce){ .m3-btn .m3-btn__spin{ animation-duration:1.4s; } }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-btn-css")) {
  const s = document.createElement("style");
  s.id = "m3-btn-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3Button({
  variant = "filled",
  size = "md",
  type = "button",
  disabled = false,
  pending = false,
  icon,
  iconTrailing,
  onPress,
  children,
  ...rest
}) {
  const cls = [
    "m3-btn",
    `m3-btn--${variant}`,
    size === "sm" ? "m3-btn--sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || pending}
      aria-disabled={disabled || pending || undefined}
      aria-busy={pending || undefined}
      onClick={onPress}
      {...rest}
    >
      {pending && <span className="m3-btn__spin" aria-hidden="true" />}
      {!pending && icon && (
        <span className="m3-btn__icon material-symbols-rounded" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {!pending && iconTrailing && (
        <span className="m3-btn__icon material-symbols-rounded" aria-hidden="true">
          {iconTrailing}
        </span>
      )}
    </button>
  );
}
