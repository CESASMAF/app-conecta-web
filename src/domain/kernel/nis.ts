// =============================================================================
// NIS (Numero de Identificacao Social) — Value Object
// =============================================================================
// Branded type with smart constructor.
// Validation order: NIS-001 -> NIS-002.
// =============================================================================

import type { Brand } from "../shared/brand.ts";
import { type Result, ok, err } from "../shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** NIS stored as 11 sanitized digits (no punctuation). */
export type NIS = Brand<string, "NIS">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type NISError =
  | "NIS-001"
  | "NIS-002";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a NIS from a raw string input.
 * On success the branded value contains 11 sanitized digits.
 *
 * Uses `as unknown as NIS` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const NIS = (raw: string): Result<NIS, NISError> => {
  // NIS-001: empty after trim
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return err("NIS-001");
  }

  // Sanitize: keep only digits
  const sanitized = trimmed.replace(/\D/g, "");

  // NIS-002: must be exactly 11 digits
  if (sanitized.length !== 11) {
    return err("NIS-002");
  }

  // Branding: `as unknown as NIS` required because the __brand phantom tag
  // has no runtime representation — only the type system tracks it.
  return ok(sanitized as unknown as NIS);
};
