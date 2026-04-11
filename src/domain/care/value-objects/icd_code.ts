// =============================================================================
// ICDCode — Value Object (Care)
// =============================================================================
// ICD-10 code branded type. Normalization: trim + uppercase + auto-dot.
// Auto-dot: if 3+ chars and no dot, insert dot before the last character.
// Example: "A169" → "A16.9", "A16.9" → "A16.9"
// =============================================================================

import type { Brand } from "../../shared/brand.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** ICD-10 code stored as uppercase with dot notation. */
export type ICDCode = Brand<string, "ICDCode">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** ICD-001: empty input | ICD-002: invalid ICD-10 format */
export type ICDCodeError = "ICD-001" | "ICD-002";

// ---------------------------------------------------------------------------
// Normalization (module-private)
// ---------------------------------------------------------------------------

/**
 * Applies auto-dot: if 3+ chars and no dot present, inserts dot before last char.
 * e.g. "A169" → "A16.9"
 */
const autoDot = (value: string): string => {
  if (value.length >= 3 && !value.includes(".")) {
    return value.slice(0, -1) + "." + value.slice(-1);
  }
  return value;
};

/**
 * ICD-10 format: starts with a letter, followed by 1-2 digits, optionally a dot
 * and 1-2 more digits. Examples: "A1", "A16", "A16.9", "B20", "B20.0".
 */
const ICD10_FORMAT = /^[A-Z]\d{1,2}(\.\d{1,2})?$/;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates an ICDCode from a raw string.
 * Normalization: trim → uppercase → auto-dot.
 *
 * Uses `as unknown as ICDCode` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const ICDCode = (raw: string): Result<ICDCode, ICDCodeError> => {
  const trimmed = raw.trim().toUpperCase();

  // ICD-001: not empty
  if (trimmed.length === 0) {
    return err("ICD-001");
  }

  const withDot = autoDot(trimmed);

  // ICD-002: must match ICD-10 format
  if (!ICD10_FORMAT.test(withDot)) {
    return err("ICD-002");
  }

  return ok(withDot as unknown as ICDCode);
};

// ---------------------------------------------------------------------------
// Methods
// ---------------------------------------------------------------------------

/** Returns the code without dots. e.g. "A16.9" → "A169" */
export const normalized = (code: ICDCode): string =>
  (code as unknown as string).replace(/\./g, "");

/** Compares two ICDCodes by their dot-free normalized form. */
export const isEquivalent = (a: ICDCode, b: ICDCode): boolean =>
  normalized(a) === normalized(b);
