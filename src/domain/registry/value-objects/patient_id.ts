// =============================================================================
// Registry — PatientId
// =============================================================================
// UUID-based branded type with smart constructor.
// Normalization: trim + lowercase. Validation: UUID regex.
// Supports auto-generation via crypto.randomUUID().
// =============================================================================

import type { Brand } from "../../shared/brand.ts";
import { type Result, ok, err } from "../../shared/result.ts";
import { normalizeUuid, isValidUuid } from "../../kernel/uuid.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** Patient identifier stored as a normalized lowercase UUID. */
export type PatientId = Brand<string, "PatientId">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** PATID-001: invalid UUID format */
export type PatientIdError = "PATID-001";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a PatientId from a raw string.
 *
 * Uses `as unknown as PatientId` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const PatientId = (raw: string): Result<PatientId, PatientIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("PATID-001");
  }
  return ok(normalized as unknown as PatientId);
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generates a new PatientId using crypto.randomUUID().
 * Always produces a valid branded PatientId (no validation needed).
 *
 * Uses `as unknown as PatientId` — see branding note above.
 */
export const generatePatientId = (): PatientId =>
  crypto.randomUUID() as unknown as PatientId;
