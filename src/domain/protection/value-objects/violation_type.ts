// =============================================================================
// ViolationType — Enum VO for rights violation categories
// =============================================================================
// Valid values: NEGLECT, PSYCHOLOGICAL_VIOLENCE, PHYSICAL_VIOLENCE,
// SEXUAL_ABUSE, SEXUAL_EXPLOITATION, CHILD_LABOR, FINANCIAL_EXPLOITATION,
// DISCRIMINATION, OTHER
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Category of rights violation reported. */
export type ViolationType =
  | "NEGLECT"
  | "PSYCHOLOGICAL_VIOLENCE"
  | "PHYSICAL_VIOLENCE"
  | "SEXUAL_ABUSE"
  | "SEXUAL_EXPLOITATION"
  | "CHILD_LABOR"
  | "FINANCIAL_EXPLOITATION"
  | "DISCRIMINATION"
  | "OTHER";

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** VT-001: invalid violation type value */
export type ViolationTypeError = "VT-001";

// ---------------------------------------------------------------------------
// Valid Values (module-private)
// ---------------------------------------------------------------------------

const VALID_VALUES: ReadonlySet<string> = new Set([
  "NEGLECT",
  "PSYCHOLOGICAL_VIOLENCE",
  "PHYSICAL_VIOLENCE",
  "SEXUAL_ABUSE",
  "SEXUAL_EXPLOITATION",
  "CHILD_LABOR",
  "FINANCIAL_EXPLOITATION",
  "DISCRIMINATION",
  "OTHER",
] as const);

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a ViolationType from a raw string.
 * Checks membership in the valid values set.
 */
export const ViolationType = (raw: string): Result<ViolationType, ViolationTypeError> => {
  const trimmed = raw.trim();
  if (!VALID_VALUES.has(trimmed)) {
    return err("VT-001");
  }
  return ok(trimmed as ViolationType);
};
