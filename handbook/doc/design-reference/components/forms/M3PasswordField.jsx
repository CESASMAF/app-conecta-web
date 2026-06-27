import React from "react";

const CSS = `
.m3-pw__btn{ display:flex; align-items:center; justify-content:center; background:none; border:none;
  cursor:pointer; color:var(--color-text-secondary); padding:0; margin:0; line-height:1; }
.m3-pw__btn .material-symbols-rounded{ font-family:'Material Symbols Rounded'; font-size:20px; }
.m3-pw__btn:hover{ color:var(--color-text-primary); }
.m3-pw__btn:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring); outline-offset:2px;
  border-radius:var(--radius-sm); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-pw-css")) {
  const s = document.createElement("style");
  s.id = "m3-pw-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

let _id = 0;

/**
 * Initial-password field. Composes the M3TextField shell (same `.m3-field`
 * styling) plus a reveal/hide toggle and a min-length requirement hint shown via
 * aria-describedby (not colour alone). Optional by design — provisioning can
 * create the user and set the password later via reset. autocomplete is
 * "new-password"; the value is never logged or persisted client-side.
 */
export function M3PasswordField({
  label = "Senha inicial",
  value = "",
  onChange,
  errorMessage,
  required = false,
  disabled = false,
  minLength = 8,
  hint,
  id,
  autoComplete = "new-password",
}) {
  const [reveal, setReveal] = React.useState(false);
  const fid = React.useMemo(() => id || `m3pw-${++_id}`, [id]);
  const hintId = `${fid}-hint`;
  const invalid = Boolean(errorMessage);
  const describe = hint || `Mínimo ${minLength} caracteres`;

  return (
    <div
      className={["m3-field", invalid ? "m3-field--error" : ""].filter(Boolean).join(" ")}
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
        <span className="m3-field__icon material-symbols-rounded" aria-hidden="true">
          lock
        </span>
        <input
          id={fid}
          type={reveal ? "text" : "password"}
          value={value}
          disabled={disabled}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          onChange={(e) => onChange && onChange(e.target.value, e)}
        />
        <button
          type="button"
          className="m3-pw__btn"
          aria-pressed={reveal}
          aria-label={reveal ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setReveal((r) => !r)}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            {reveal ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {invalid ? (
        <span id={hintId} className="m3-field__hint m3-field__hint--error">
          <span className="m3-field__icon material-symbols-rounded" aria-hidden="true">
            error
          </span>
          {errorMessage}
        </span>
      ) : (
        <span id={hintId} className="m3-field__hint">
          {describe}
        </span>
      )}
    </div>
  );
}
