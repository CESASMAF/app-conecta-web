import React from "react";
import { M3TextField } from "./M3TextField.jsx";

/* PT-BR input masks. Each returns the display string; raw digits are emitted to
   onChange so the BFF receives clean values (FR-002). */
function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}

function format(mask, raw) {
  const d = onlyDigits(raw);
  switch (mask) {
    case "cpf":
      return d
        .slice(0, 11)
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
    case "nis":
      return d.slice(0, 11).replace(/^(\d{3})(\d{5})(\d{2})(\d)/, "$1.$2.$3-$4");
    case "cep":
      return d.slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
    case "phone": {
      const x = d.slice(0, 11);
      if (x.length <= 10) return x.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/[-\s()]+$/, "");
      return x.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/[-\s()]+$/, "");
    }
    case "date":
      return d.slice(0, 8).replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    case "money": {
      if (!d) return "";
      const cents = parseInt(d.slice(0, 13), 10);
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
    }
    default:
      return raw;
  }
}

const PLACEHOLDER = {
  cpf: "000.000.000-00", nis: "000.00000.00-0", cep: "00000-000",
  phone: "(00) 00000-0000", date: "dd/mm/aaaa", money: "R$ 0,00",
};

export function M3MaskedField({
  mask = "cpf",
  value = "",
  onChange,
  label,
  placeholder,
  ...rest
}) {
  const display = format(mask, value);
  return (
    <M3TextField
      label={label}
      mono
      value={display}
      placeholder={placeholder || PLACEHOLDER[mask]}
      inputMode={mask === "date" || mask === "money" ? "numeric" : "numeric"}
      onChange={(v) => {
        const raw = onlyDigits(v);
        onChange && onChange(raw, format(mask, raw));
      }}
      {...rest}
    />
  );
}

export { format as formatMask, onlyDigits };
