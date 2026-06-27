import React from "react";

const CSS = `
.m3-field{ display:flex; flex-direction:column; gap:6px; font-family:var(--font-sans); }
.m3-field__label{ font-size:var(--text-sm); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-field__req{ color:var(--color-text-error); margin-left:2px; }
.m3-field__box{ display:flex; align-items:center; gap:8px; height:48px;
  padding:0 14px; background:var(--color-bg-elevated);
  border:1.5px solid var(--color-border-default); border-radius:var(--radius-md);
  transition:border-color var(--duration-fast) var(--ease-standard); }
.m3-field__box:focus-within{ border-color:var(--color-border-active);
  box-shadow:0 0 0 var(--focus-ring-offset) var(--color-border-active); }
.m3-field--error .m3-field__box{ border-color:var(--color-border-error); }
.m3-field--error .m3-field__box:focus-within{ box-shadow:0 0 0 1px var(--color-border-error); }
.m3-field__box input{ flex:1; min-width:0; border:none; outline:none; background:none;
  font-family:inherit; font-size:var(--text-base); color:var(--color-text-primary); }
.m3-field__box input::placeholder{ color:var(--color-text-disabled); }
.m3-field--mono .m3-field__box input{ font-family:var(--font-mono);
  font-variant-numeric:tabular-nums; }
.m3-field__icon{ font-family:'Material Symbols Rounded'; font-size:20px;
  color:var(--color-text-secondary); line-height:1; }
.m3-field[aria-disabled="true"] .m3-field__box{ background:var(--color-bg-secondary);
  border-color:transparent; }
.m3-field[aria-disabled="true"] input{ color:var(--color-text-disabled); }
.m3-field__hint{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-field__hint--error{ color:var(--color-text-error); display:flex; gap:5px; align-items:center; }
.m3-field__hint--error .m3-field__icon{ font-size:15px; color:var(--color-text-error); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-field-css")) {
  const s = document.createElement("style");
  s.id = "m3-field-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

let _id = 0;

export function M3TextField({
  label,
  value = "",
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  errorMessage,
  hint,
  mono = false,
  leadingIcon,
  trailingIcon,
  id,
  ...rest
}) {
  const fid = React.useMemo(() => id || `m3f-${++_id}`, [id]);
  const hintId = `${fid}-hint`;
  const invalid = Boolean(errorMessage);

  return (
    <div
      className={[
        "m3-field",
        mono ? "m3-field--mono" : "",
        invalid ? "m3-field--error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-disabled={disabled || undefined}
    >
      {label && (
        <label className="m3-field__label" htmlFor={fid}>
          {label}
          {required && (
            <span className="m3-field__req" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="m3-field__box">
        {leadingIcon && (
          <span className="m3-field__icon material-symbols-rounded" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          id={fid}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={hint || errorMessage ? hintId : undefined}
          onChange={(e) => onChange && onChange(e.target.value, e)}
          {...rest}
        />
        {trailingIcon && (
          <span className="m3-field__icon material-symbols-rounded" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </div>
      {invalid ? (
        <span id={hintId} className="m3-field__hint m3-field__hint--error">
          <span className="m3-field__icon material-symbols-rounded" aria-hidden="true">
            error
          </span>
          {errorMessage}
        </span>
      ) : (
        hint && (
          <span id={hintId} className="m3-field__hint">
            {hint}
          </span>
        )
      )}
    </div>
  );
}
