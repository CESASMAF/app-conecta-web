import React from "react";
import { M3Button } from "../forms/M3Button.jsx";

const CSS = `
.m3-empty{ display:flex; flex-direction:column; align-items:center; text-align:center;
  gap:10px; padding:48px 24px; font-family:var(--font-sans); }
.m3-empty__icon{ font-family:'Material Symbols Rounded'; font-size:40px;
  color:var(--color-text-disabled); }
.m3-empty--privacy .m3-empty__icon{ color:var(--color-info); }
.m3-empty--unavailable .m3-empty__icon{ color:var(--color-danger); }
.m3-empty__title{ font-size:var(--text-lg); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-empty__desc{ font-size:var(--text-sm); color:var(--color-text-secondary);
  max-width:42ch; line-height:var(--leading-snug); }
.m3-empty__action{ margin-top:6px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-empty-css")) {
  const s = document.createElement("style");
  s.id = "m3-empty-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const ICONS = {
  default: "inbox",
  privacy: "shield_lock",
  unavailable: "cloud_off",
};

export function M3EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
}) {
  return (
    <div className={`m3-empty m3-empty--${variant}`}>
      <span className="m3-empty__icon material-symbols-rounded" aria-hidden="true">
        {icon || ICONS[variant] || ICONS.default}
      </span>
      <h3 className="m3-empty__title">{title}</h3>
      {description && <p className="m3-empty__desc">{description}</p>}
      {action && (
        <div className="m3-empty__action">
          <M3Button
            variant={variant === "unavailable" ? "tonal" : "text"}
            icon={action.icon}
            onPress={action.onPress}
          >
            {action.label}
          </M3Button>
        </div>
      )}
    </div>
  );
}
