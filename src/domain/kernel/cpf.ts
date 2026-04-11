// =============================================================================
// CPF (Cadastro de Pessoa Fisica) — Value Object
// =============================================================================
// Branded type with smart constructor, formatting, and fiscal region derivation.
// Validation order: CPF-001 -> CPF-002 -> CPF-003 -> CPF-004 -> CPF-005.
// =============================================================================

import type { Brand } from "../shared/brand.ts";
import { type Result, ok, err } from "../shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** CPF stored as 11 sanitized digits (no punctuation). */
export type CPF = Brand<string, "CPF">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CPFError =
  | "CPF-001"
  | "CPF-002"
  | "CPF-003"
  | "CPF-004"
  | "CPF-005";

// ---------------------------------------------------------------------------
// Fiscal Region
// ---------------------------------------------------------------------------

export type FiscalRegion =
  | "RS"
  | "DF, GO, MS, MT, TO"
  | "AC, AM, AP, PA, RO, RR"
  | "CE, MA, PI"
  | "AL, PB, PE, RN"
  | "BA, SE"
  | "MG"
  | "ES, RJ"
  | "SP"
  | "PR, SC";

// Indexed by digit at position 8. Defined as const tuple for exhaustive lookup.
const FISCAL_REGIONS: readonly FiscalRegion[] = [
  "RS",
  "DF, GO, MS, MT, TO",
  "AC, AM, AP, PA, RO, RR",
  "CE, MA, PI",
  "AL, PB, PE, RN",
  "BA, SE",
  "MG",
  "ES, RJ",
  "SP",
  "PR, SC",
] as const;

// ---------------------------------------------------------------------------
// Validation helpers (module-private)
// ---------------------------------------------------------------------------

/** Only digits, dots, hyphens, and spaces are allowed before sanitization. */
const ALLOWED_CHARS = /^[\d.\- ]+$/;

const computeCheckDigit = (digits: readonly number[], weights: readonly number[]): number => {
  const sum = weights.reduce((acc, w, i) => acc + (digits[i] ?? 0) * w, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

const FIRST_WEIGHTS: readonly number[] = [10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const SECOND_WEIGHTS: readonly number[] = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2] as const;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a CPF from a raw string input.
 * On success the branded value contains 11 sanitized digits.
 *
 * Uses `as unknown as CPF` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const CPF = (raw: string): Result<CPF, CPFError> => {
  // CPF-001: empty after trim
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return err("CPF-001");
  }

  // CPF-002: invalid characters (checked BEFORE sanitization)
  if (!ALLOWED_CHARS.test(trimmed)) {
    return err("CPF-002");
  }

  // Sanitize: keep only digits
  const sanitized = trimmed.replace(/[\.\- ]/g, "");

  // CPF-003: must be exactly 11 digits
  if (sanitized.length !== 11) {
    return err("CPF-003");
  }

  // CPF-004: all digits identical
  if (sanitized[0] !== undefined && sanitized.split("").every((d) => d === sanitized[0])) {
    return err("CPF-004");
  }

  // CPF-005: checksum validation
  const digits: readonly number[] = sanitized.split("").map(Number);

  const first = computeCheckDigit(digits, FIRST_WEIGHTS);
  if (first !== digits[9]) {
    return err("CPF-005");
  }

  const second = computeCheckDigit(digits, SECOND_WEIGHTS);
  if (second !== digits[10]) {
    return err("CPF-005");
  }

  // Branding: `as unknown as CPF` required because the __brand phantom tag
  // has no runtime representation — only the type system tracks it.
  return ok(sanitized as unknown as CPF);
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Formats a validated CPF (11 digits) as "XXX.XXX.XXX-XX". */
export const formatCPF = (cpf: CPF): string => {
  // Widen branded type to base string — always safe (subtype → supertype)
  const s = cpf as string;
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9, 11)}`;
};

// ---------------------------------------------------------------------------
// Derived Value
// ---------------------------------------------------------------------------

/** Extracts the fiscal region from the digit at position 8 of a validated CPF. */
export const fiscalRegion = (cpf: CPF): FiscalRegion => {
  // Widen branded type to base string — always safe (subtype → supertype)
  const digit = Number((cpf as string)[8]);
  const region = FISCAL_REGIONS[digit];
  // digit is guaranteed 0-9 for a validated CPF; guard satisfies noUncheckedIndexedAccess
  if (region === undefined) {
    return FISCAL_REGIONS[0]!;
  }
  return region;
};
