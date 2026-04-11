// =============================================================================
// ViolationReportId — Branded UUID identifier for RightsViolationReport
// =============================================================================
// Normalization: trim + lowercase. Validation: UUID regex.
// Supports auto-generation via crypto.randomUUID().
// =============================================================================

import type { Brand } from "../../shared/brand.ts";
import { type Result, ok, err } from "../../shared/result.ts";
import { normalizeUuid, isValidUuid } from "../../kernel/uuid.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** Violation report identifier stored as a normalized lowercase UUID. */
export type ViolationReportId = Brand<string, "ViolationReportId">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** VRI-001: invalid UUID format */
export type ViolationReportIdError = "VRI-001";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a ViolationReportId from a raw string.
 *
 * Uses `as unknown as ViolationReportId` for branding because TypeScript cannot
 * narrow a plain string into a branded type — the phantom __brand tag only
 * exists at the type level and has no runtime representation.
 */
export const ViolationReportId = (raw: string): Result<ViolationReportId, ViolationReportIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("VRI-001");
  }
  return ok(normalized as unknown as ViolationReportId);
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generates a new ViolationReportId using crypto.randomUUID().
 * Always produces a valid branded ViolationReportId (no validation needed).
 *
 * Uses `as unknown as ViolationReportId` — see branding note above.
 */
export const generateViolationReportId = (): ViolationReportId =>
  crypto.randomUUID() as unknown as ViolationReportId;
