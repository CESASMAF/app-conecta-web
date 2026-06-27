import React from "react";

const CSS = `
.m3-chips{ display:inline-flex; gap:8px; flex-wrap:wrap; }
.m3-chip{ position:relative; isolation:isolate; display:inline-flex; align-items:center;
  gap:6px; height:36px; padding:0 16px; border-radius:var(--radius-full);
  border:1.5px solid var(--color-border-default); background:var(--color-bg-elevated);
  font-family:var(--font-sans); font-size:var(--text-sm); font-weight:var(--weight-medium);
  color:var(--color-text-primary); cursor:pointer; white-space:nowrap;
  transition:background var(--duration-fast), border-color var(--duration-fast), color var(--duration-fast); }
.m3-chip::after{ content:""; position:absolute; inset:0; border-radius:inherit;
  background:var(--color-action-primary); opacity:0; z-index:-1; transition:opacity var(--duration-fast); }
.m3-chip:hover::after{ opacity:var(--state-hover); }
.m3-chip:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring); outline-offset:2px; }
.m3-chip[aria-checked="true"]{ background:var(--color-action-primary-tint);
  border-color:var(--color-action-primary); color:var(--color-action-primary-tint-fg); }
.m3-chip[aria-checked="true"] .m3-chip__check{ display:inline; }
.m3-chip__check{ display:none; font-family:'Material Symbols Rounded'; font-size:18px; line-height:1; }
.m3-chip__icon{ font-family:'Material Symbols Rounded'; font-size:18px; line-height:1; }
.m3-chips[aria-disabled="true"] .m3-chip{ opacity:.5; pointer-events:none; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-chip-css")) {
  const s = document.createElement("style");
  s.id = "m3-chip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3ChoiceChip({
  options = [],
  value,
  onChange,
  ariaLabel,
  disabled = false,
  showCheck = true,
}) {
  function onKey(e, idx) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + options.length) % options.length;
    onChange && onChange(options[next].value);
  }

  return (
    <div
      className="m3-chips"
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (value == null && i === 0) ? 0 : -1}
            className="m3-chip"
            onClick={() => onChange && onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {showCheck && (
              <span className="m3-chip__check material-symbols-rounded" aria-hidden="true">
                check
              </span>
            )}
            {o.icon && (
              <span className="m3-chip__icon material-symbols-rounded" aria-hidden="true">
                {o.icon}
              </span>
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
