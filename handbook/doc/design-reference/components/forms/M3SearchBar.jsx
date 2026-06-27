import React from "react";

const CSS = `
.m3-search{ display:flex; align-items:center; gap:8px; height:44px; padding:0 14px;
  background:var(--color-bg-secondary); border:1.5px solid transparent;
  border-radius:var(--radius-full); font-family:var(--font-sans);
  transition:border-color var(--duration-fast), background var(--duration-fast); }
.m3-search:focus-within{ background:var(--color-bg-elevated); border-color:var(--color-border-active); }
.m3-search__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-text-secondary); }
.m3-search input{ flex:1; min-width:0; border:none; outline:none; background:none;
  font-family:inherit; font-size:var(--text-base); color:var(--color-text-primary); }
.m3-search input::placeholder{ color:var(--color-text-secondary); }
.m3-search__clear{ display:flex; align-items:center; justify-content:center; width:28px; height:28px;
  border:none; background:none; border-radius:50%; cursor:pointer; color:var(--color-text-secondary);
  position:relative; isolation:isolate; }
.m3-search__clear::after{ content:""; position:absolute; inset:3px; border-radius:50%;
  background:var(--color-text-primary); opacity:0; z-index:-1; }
.m3-search__clear:hover::after{ opacity:var(--state-hover); }
.m3-search__clear .material-symbols-rounded{ font-size:18px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-search-css")) {
  const s = document.createElement("style");
  s.id = "m3-search-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function M3SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Buscar…",
  ariaLabel,
  ...rest
}) {
  return (
    <form
      className="m3-search"
      role="search"
      onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(value); }}
    >
      <span className="m3-search__icon material-symbols-rounded" aria-hidden="true">search</span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        {...rest}
      />
      {value && (
        <button type="button" className="m3-search__clear" aria-label="Limpar busca" onClick={() => onChange && onChange("")}>
          <span className="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      )}
    </form>
  );
}
