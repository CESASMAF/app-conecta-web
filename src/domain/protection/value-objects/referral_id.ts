// =============================================================================
// ReferralId — Branded UUID identifier for Referral aggregate
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

/** Referral identifier stored as a normalized lowercase UUID. */
export type ReferralId = Brand<string, "ReferralId">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** RI-001: invalid UUID format */
export type ReferralIdError = "RI-001";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a ReferralId from a raw string.
 *
 * Uses `as unknown as ReferralId` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const ReferralId = (raw: string): Result<ReferralId, ReferralIdError> => {
  const normalized = normalizeUuid(raw);
  if (!isValidUuid(normalized)) {
    return err("RI-001");
  }
  return ok(normalized as unknown as ReferralId);
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generates a new ReferralId using crypto.randomUUID().
 * Always produces a valid branded ReferralId (no validation needed).
 *
 * Uses `as unknown as ReferralId` — see branding note above.
 */
export const generateReferralId = (): ReferralId =>
  crypto.randomUUID() as unknown as ReferralId;
