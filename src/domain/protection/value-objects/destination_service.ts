// =============================================================================
// DestinationService — Enum VO for referral destination services
// =============================================================================
// Valid values: CRAS, CREAS, HEALTH_CARE, EDUCATION, LEGAL, OTHER
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Destination service for a referral. */
export type DestinationService =
  | "CRAS"
  | "CREAS"
  | "HEALTH_CARE"
  | "EDUCATION"
  | "LEGAL"
  | "OTHER";

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** DS-001: invalid destination service value */
export type DestinationServiceError = "DS-001";

// ---------------------------------------------------------------------------
// Valid Values (module-private)
// ---------------------------------------------------------------------------

const VALID_VALUES: ReadonlySet<string> = new Set([
  "CRAS",
  "CREAS",
  "HEALTH_CARE",
  "EDUCATION",
  "LEGAL",
  "OTHER",
] as const);

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a DestinationService from a raw string.
 * Checks membership in the valid values set.
 */
export const DestinationService = (raw: string): Result<DestinationService, DestinationServiceError> => {
  const trimmed = raw.trim();
  if (!VALID_VALUES.has(trimmed)) {
    return err("DS-001");
  }
  return ok(trimmed as DestinationService);
};
