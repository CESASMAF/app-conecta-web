// =============================================================================
// Kernel IDs — PersonId, ProfessionalId, LookupId
// =============================================================================
// UUID-based branded types with smart constructors.
// Normalization: trim + lowercase. Validation: UUID v4-compatible regex.
// PersonId and ProfessionalId support auto-generation via crypto.randomUUID().
// =============================================================================

import type { Brand } from "../shared/brand.ts";
import { type Result, ok, err } from "../shared/result.ts";
import { normalizeUuid, isValidUuid } from "./uuid.ts";

// ---------------------------------------------------------------------------
// Branded Types
// ---------------------------------------------------------------------------

/** Person identifier stored as a normalized lowercase UUID. */
export type PersonId = Brand<string, "PersonId">;

/** Professional identifier stored as a normalized lowercase UUID. */
export type ProfessionalId = Brand<string, "ProfessionalId">;

/** Lookup table identifier stored as a normalized lowercase UUID. */
export type LookupId = Brand<string, "LookupId">;

// ---------------------------------------------------------------------------
// Error Unions
// ---------------------------------------------------------------------------

/** PID-001: invalid UUID format */
export type PersonIdError = "PID-001";

/** PRID-001: invalid UUID format */
export type ProfessionalIdError = "PRID-001";

/** LID-001: invalid UUID format */
export type LookupIdError = "LID-001";

// ---------------------------------------------------------------------------
// Smart Constructors
// ---------------------------------------------------------------------------

/**
 * Validates and creates a PersonId from a raw string.
 *
 * Uses `as unknown as PersonId` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const PersonId = (raw: string): Result<PersonId, PersonIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("PID-001");
  }
  return ok(normalized as unknown as PersonId);
};

/**
 * Validates and creates a ProfessionalId from a raw string.
 *
 * Uses `as unknown as ProfessionalId` for branding because TypeScript cannot
 * narrow a plain string into a branded type — the phantom __brand tag only
 * exists at the type level and has no runtime representation.
 */
export const ProfessionalId = (raw: string): Result<ProfessionalId, ProfessionalIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("PRID-001");
  }
  return ok(normalized as unknown as ProfessionalId);
};

/**
 * Validates and creates a LookupId from a raw string.
 *
 * Uses `as unknown as LookupId` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const LookupId = (raw: string): Result<LookupId, LookupIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("LID-001");
  }
  return ok(normalized as unknown as LookupId);
};

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

/**
 * Generates a new PersonId using crypto.randomUUID().
 * Always produces a valid branded PersonId (no validation needed).
 *
 * Uses `as unknown as PersonId` — see branding note above.
 */
export const generatePersonId = (): PersonId =>
  crypto.randomUUID() as unknown as PersonId;

/**
 * Generates a new ProfessionalId using crypto.randomUUID().
 * Always produces a valid branded ProfessionalId (no validation needed).
 *
 * Uses `as unknown as ProfessionalId` — see branding note above.
 */
export const generateProfessionalId = (): ProfessionalId =>
  crypto.randomUUID() as unknown as ProfessionalId;
