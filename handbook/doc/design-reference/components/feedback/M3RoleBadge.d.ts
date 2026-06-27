import * as React from "react";

/**
 * A `system:role` system-link (vínculo) badge. Known systems
 * (social-care, queue-manager, therapies, timesheet) and roles
 * (patient, professional, family-member, employee, therapist) render a PT-BR
 * label like "Paciente · Social Care". Unknown pairs — the backend's
 * KnownSystem/KnownRole lists are not exhaustive — fall back to the raw
 * `system:role` identifier in mono without breaking. Inactive links render
 * dashed and muted.
 *
 * @example
 * <M3RoleBadge system="social-care" role="patient" active />
 * <M3RoleBadge system="timesheet" role="employee" active={false} />
 */
export interface M3RoleBadgeProps {
  /** Raw system key as stored in the backend (e.g. "social-care"). */
  system: string;
  /** Raw role key as stored in the backend (e.g. "patient"). */
  role: string;
  /** Whether the SystemRole is active. Inactive → dashed + muted. Default true. */
  active?: boolean;
}

export function M3RoleBadge(props: M3RoleBadgeProps): JSX.Element;
