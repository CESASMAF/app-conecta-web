import React from "react";

const CSS = `
.m3-role{ display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-medium); line-height:1; white-space:nowrap;
  background:var(--color-bg-elevated); border:1px solid var(--color-border-default);
  color:var(--color-text-primary); }
.m3-role__dot{ width:7px; height:7px; border-radius:50%; background:var(--color-person-active); flex:none; }
.m3-role--inactive{ color:var(--color-text-disabled); border-style:dashed; }
.m3-role--inactive .m3-role__dot{ background:var(--color-person-inactive); }
.m3-role--raw{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
.m3-role__sys{ color:var(--color-text-secondary); font-weight:var(--weight-regular); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-role-css")) {
  const s = document.createElement("style");
  s.id = "m3-role-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const SYSTEMS = {
  "social-care": "Social Care",
  "queue-manager": "Fila",
  therapies: "Terapias",
  timesheet: "Ponto",
};
const ROLES = {
  patient: "Paciente",
  professional: "Profissional",
  "family-member": "Membro da família",
  employee: "Funcionário",
  therapist: "Terapeuta",
};

/**
 * `system:role` vínculo badge. Known systems/roles render a PT-BR label
 * ("Paciente · Social Care"); an unknown pair (the backend lists are not
 * exhaustive) falls back to the raw `system:role` identifier in mono, never
 * breaking. Inactive vínculos render dashed + muted.
 */
export function M3RoleBadge({ system, role, active = true }) {
  const sysLabel = SYSTEMS[system];
  const roleLabel = ROLES[role];
  const known = sysLabel && roleLabel;
  const raw = `${system}:${role}`;
  return (
    <span
      className={["m3-role", !active ? "m3-role--inactive" : "", !known ? "m3-role--raw" : ""]
        .filter(Boolean)
        .join(" ")}
      title={raw}
      aria-label={`Vínculo ${roleLabel || role} em ${sysLabel || system}, ${active ? "ativo" : "inativo"}`}
    >
      <span className="m3-role__dot" aria-hidden="true" />
      {known ? (
        <React.Fragment>
          {roleLabel}
          <span className="m3-role__sys">· {sysLabel}</span>
        </React.Fragment>
      ) : (
        raw
      )}
    </span>
  );
}
