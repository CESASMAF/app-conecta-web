import React from "react";

const CSS = `
.m3-switch{ display:inline-flex; align-items:center; gap:10px; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--color-text-primary); }
.m3-switch__track{ position:relative; width:48px; height:28px; flex:none;
  background:var(--color-bg-secondary); border:2px solid var(--color-border-strong);
  border-radius:var(--radius-full); transition:background var(--duration-normal) var(--ease-standard),
  border-color var(--duration-normal) var(--ease-standard); }
.m3-switch__thumb{ position:absolute; top:50%; left:6px; width:14px; height:14px;
  translate:0 -50%; border-radius:50%; background:var(--color-border-strong);
  transition:left var(--duration-normal) var(--ease-standard),
  width var(--duration-normal), height var(--duration-normal), background var(--duration-normal); }
.m3-switch input{ position:absolute; opacity:0; width:0; height:0; }
.m3-switch input:checked + .m3-switch__track{ background:var(--color-action-primary);
  border-color:var(--color-action-primary); }
.m3-switch input:checked + .m3-switch__track .m3-switch__thumb{ left:24px; width:18px;
  height:18px; background:var(--white); }
.m3-switch input:focus-visible + .m3-switch__track{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
.m3-switch[aria-disabled="true"]{ opacity:.5; pointer-events:none; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-switch-css")) {
  const s = document.createElement("style");
  s.id = "m3-switch-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

let _id = 0;

export function M3Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  ...rest
}) {
  const fid = React.useMemo(() => id || `m3sw-${++_id}`, [id]);
  return (
    <label className="m3-switch" htmlFor={fid} aria-disabled={disabled || undefined}>
      <input
        id={fid}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked, e)}
        {...rest}
      />
      <span className="m3-switch__track" aria-hidden="true">
        <span className="m3-switch__thumb" />
      </span>
      {label && <span className="m3-switch__label">{label}</span>}
    </label>
  );
}
