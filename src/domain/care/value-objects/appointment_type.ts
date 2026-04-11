// =============================================================================
// AppointmentType — Simple Enum Value Object (Care)
// =============================================================================
// Represents the type of a social care appointment.
// Valid values: HOME_VISIT, OFFICE_APPOINTMENT, PHONE_CALL, MULTIDISCIPLINARY, OTHER
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type AppointmentType =
  | "HOME_VISIT"
  | "OFFICE_APPOINTMENT"
  | "PHONE_CALL"
  | "MULTIDISCIPLINARY"
  | "OTHER";

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** APT-001: invalid appointment type value */
export type AppointmentTypeError = "APT-001";

// ---------------------------------------------------------------------------
// Valid Values (module-private)
// ---------------------------------------------------------------------------

const VALID_VALUES: ReadonlySet<string> = new Set<AppointmentType>([
  "HOME_VISIT",
  "OFFICE_APPOINTMENT",
  "PHONE_CALL",
  "MULTIDISCIPLINARY",
  "OTHER",
]);

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates that the raw string is one of the valid AppointmentType members.
 */
export const AppointmentType = (raw: string): Result<AppointmentType, AppointmentTypeError> => {
  if (!VALID_VALUES.has(raw)) {
    return err("APT-001");
  }
  return ok(raw as AppointmentType);
};
