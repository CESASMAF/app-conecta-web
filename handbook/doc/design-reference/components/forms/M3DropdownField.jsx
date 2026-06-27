import React from "react";

const CSS = `
.m3-select{ display:flex; flex-direction:column; gap:6px; font-family:var(--font-sans); }
.m3-select__label{ font-size:var(--text-sm); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-select__box{ position:relative; display:flex; align-items:center; }
.m3-select__box select{ appearance:none; width:100%; height:48px;
  padding:0 40px 0 14px; background:var(--color-bg-elevated);
  border:1.5px solid var(--color-border-default); border-radius:var(--radius-md);
  font-family:inherit; font-size:var(--text-base); color:var(--color-text-primary);
  cursor:pointer; transition:border-color var(--duration-fast) var(--ease-standard); }
.m3-select__box select:focus-visible{ outline:none; border-color:var(--color-border-active);
  box-shadow:0 0 0 var(--focus-ring-offset) var(--color-border-active); }
.m3-select--error select{ border-color:var(--color-border-error); }
.m3-select__chev{ position:absolute; right:12px; pointer-events:none;
  font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-text-secondary); }
.m3-select__box select:disabled{ background:var(--color-bg-secondary);
  border-color:transparent; color:var(--color-text-disabled); cursor:not-allowed; }
.m3-select__hint{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-select__hint--error{ color:var(--color-text-error); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-select-css")) {
  const s = document.createElement("style");
  s.id = "m3-select-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

let _id = 0;

export function M3DropdownField({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  errorMessage,
  hint,
  id,
  ...rest
}) {
  const fid = React.useMemo(() => id || `m3s-${++_id}`, [id]);
  const invalid = Boolean(errorMessage);

  return (
    <div
      className={["m3-select", invalid ? "m3-select--error" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label className="m3-select__label" htmlFor={fid}>
          {label}
        </label>
      )}
      <div className="m3-select__box">
        <select
          id={fid}
          value={value ?? ""}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange && onChange(e.target.value, e)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="m3-select__chev material-symbols-rounded" aria-hidden="true">
          expand_more
        </span>
      </div>
      {invalid ? (
        <span className="m3-select__hint m3-select__hint--error">{errorMessage}</span>
      ) : (
        hint && <span className="m3-select__hint">{hint}</span>
      )}
    </div>
  );
}
