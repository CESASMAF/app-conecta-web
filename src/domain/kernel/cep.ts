// =============================================================================
// CEP (Codigo de Enderecamento Postal) — Value Object
// =============================================================================
// Branded type with smart constructor, formatting, distribution kind, and
// state (UF) derivation. Validation order: CEP-001 -> CEP-002 -> CEP-003 -> CEP-004.
// =============================================================================

import type { Brand } from "../shared/brand.ts";
import { type Result, ok, err } from "../shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** CEP stored as 8 sanitized digits (no punctuation). */
export type CEP = Brand<string, "CEP">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CEPError =
  | "CEP-001"
  | "CEP-002"
  | "CEP-003"
  | "CEP-004";

// ---------------------------------------------------------------------------
// Distribution Kind
// ---------------------------------------------------------------------------

export type DistributionKind =
  | "STREET_RANGE"
  | "SPECIAL_CODES"
  | "PROMOTIONAL"
  | "POST_OFFICE_UNITS"
  | "OTHER";

// ---------------------------------------------------------------------------
// Brazilian State (UF)
// ---------------------------------------------------------------------------

export type BrazilianState =
  | "AC" | "AL" | "AM" | "AP" | "BA" | "CE" | "DF" | "ES"
  | "GO" | "MA" | "MG" | "MS" | "MT" | "PA" | "PB" | "PE"
  | "PI" | "PR" | "RJ" | "RN" | "RO" | "RR" | "RS" | "SC"
  | "SE" | "SP" | "TO";

// ---------------------------------------------------------------------------
// CEP-to-UF Range Table (module-private)
// ---------------------------------------------------------------------------
// Each entry: [min, max, UF]. Ranges are inclusive. Ordered by min ascending.
// Some UFs have split ranges (AM, GO/DF overlap handled by order).

const UF_RANGES: readonly (readonly [number, number, BrazilianState])[] = [
  [1000000, 19999999, "SP"],
  [20000000, 28999999, "RJ"],
  [29000000, 29999999, "ES"],
  [30000000, 39999999, "MG"],
  [40000000, 48999999, "BA"],
  [49000000, 49999999, "SE"],
  [50000000, 56999999, "PE"],
  [57000000, 57999999, "AL"],
  [58000000, 58999999, "PB"],
  [59000000, 59999999, "RN"],
  [60000000, 63999999, "CE"],
  [64000000, 64999999, "PI"],
  [65000000, 65999999, "MA"],
  [66000000, 68899999, "PA"],
  [68900000, 68999999, "AP"],
  [69000000, 69299999, "AM"],
  [69300000, 69389999, "RR"],
  [69400000, 69899999, "AM"],
  [69900000, 69999999, "AC"],
  [70000000, 72799999, "DF"],
  [72800000, 76799999, "GO"],
  [77000000, 77995999, "TO"],
  [78000000, 78899999, "MT"],
  [78900000, 78999999, "RO"],
  [79000000, 79999999, "MS"],
  [80000000, 87999999, "PR"],
  [88000000, 89999999, "SC"],
  [90000000, 99999999, "RS"],
] as const;

// ---------------------------------------------------------------------------
// Validation helpers (module-private)
// ---------------------------------------------------------------------------

/** Only digits, hyphens, and whitespace are allowed before sanitization. */
const ALLOWED_CHARS = /^[\d\- ]+$/;

const findUF = (numeric: number): BrazilianState | undefined => {
  for (const range of UF_RANGES) {
    const [min, max, uf] = range;
    if (numeric >= min && numeric <= max) {
      return uf;
    }
  }
  return undefined;
};

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a CEP from a raw string input.
 * On success the branded value contains 8 sanitized digits.
 *
 * Uses `as unknown as CEP` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const CEP = (raw: string): Result<CEP, CEPError> => {
  // CEP-001: empty after trim
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return err("CEP-001");
  }

  // CEP-002: invalid characters (checked BEFORE sanitization)
  if (!ALLOWED_CHARS.test(trimmed)) {
    return err("CEP-002");
  }

  // Sanitize: keep only digits
  const sanitized = trimmed.replace(/[\- ]/g, "");

  // CEP-003: must be exactly 8 digits
  if (sanitized.length !== 8) {
    return err("CEP-003");
  }

  // CEP-004: must be in a valid UF range
  const numeric = Number(sanitized);
  if (findUF(numeric) === undefined) {
    return err("CEP-004");
  }

  // Branding: `as unknown as CEP` required because the __brand phantom tag
  // has no runtime representation — only the type system tracks it.
  return ok(sanitized as unknown as CEP);
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Formats a validated CEP (8 digits) as "XXXXX-XXX". */
export const formatCEP = (cep: CEP): string => {
  // Widen branded type to base string — always safe (subtype -> supertype)
  const s = cep as string;
  return `${s.slice(0, 5)}-${s.slice(5, 8)}`;
};

// ---------------------------------------------------------------------------
// Derived Values
// ---------------------------------------------------------------------------

/** Derives the distribution kind from the last 3 digits of a validated CEP. */
export const distributionKind = (cep: CEP): DistributionKind => {
  // Widen branded type to base string — always safe (subtype -> supertype)
  const s = cep as string;
  const suffix = Number(s.slice(5, 8));

  if (suffix <= 899) return "STREET_RANGE";
  if (suffix <= 959) return "SPECIAL_CODES";
  if (suffix <= 969) return "PROMOTIONAL";
  if (suffix <= 989 || suffix === 999) return "POST_OFFICE_UNITS";
  return "OTHER";
};

/** Derives the Brazilian state (UF) from the numeric range. Returns undefined if unmapped. */
export const cepState = (cep: CEP): BrazilianState | undefined => {
  // Widen branded type to base string — always safe (subtype -> supertype)
  const numeric = Number(cep as string);
  return findUF(numeric);
};
