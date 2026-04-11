// =============================================================================
// CNS (Cartao Nacional de Saude) — Value Object
// =============================================================================
// Compound VO: number (15 sanitized digits) + cpf (branded) + optional qrCode.
// Validation order: CNS-001 -> CNS-002 -> CNS-003 -> CNS-005.
//
// Cross-validation CVD-002 (CNS.cpf == CivilDocuments.cpf) is enforced at a
// higher level (CivilDocuments or Patient aggregate), not here.
// =============================================================================

import type { CPF } from "./cpf.ts";
import { type Result, ok, err } from "../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** CNS stored as compound object with 15 sanitized digits. */
export type CNS = Readonly<{
  number: string;
  cpf: CPF;
  qrCode: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CNSError = "CNS-001" | "CNS-002" | "CNS-003" | "CNS-005";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

type CNSInput = Readonly<{
  number: string;
  cpf: CPF;
  qrCode?: string;
}>;

// ---------------------------------------------------------------------------
// Checksum helpers (module-private)
// ---------------------------------------------------------------------------

const PIS_WEIGHTS: readonly number[] = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5] as const;

const PROVISORIO_WEIGHTS: readonly number[] = [
  15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
] as const;

const VALID_FIRST_DIGITS: ReadonlySet<string> = new Set(["1", "2", "7", "8", "9"]);

const DEFINITIVO_FIRST_DIGITS: ReadonlySet<string> = new Set(["1", "2"]);

const weightedSum = (digits: readonly number[], weights: readonly number[]): number =>
  weights.reduce((acc, w, i) => acc + (digits[i] ?? 0) * w, 0);

/** Definitivo (PIS-based) checksum — first digit 1 or 2. */
const isValidDefinitivo = (sanitized: string, digits: readonly number[]): boolean => {
  const pisDigits = digits.slice(0, 11);
  const sum = weightedSum(pisDigits, PIS_WEIGHTS);
  const resto = sum % 11;
  let dv = 11 - resto;

  if (dv === 11) {
    dv = 0;
  }

  if (dv === 10) {
    const sum2 = sum + 2;
    const resto2 = sum2 % 11;
    const dv2 = 11 - resto2;
    const expected = sanitized.slice(0, 11) + "001" + String(dv2);
    return sanitized === expected;
  }

  const expected = sanitized.slice(0, 11) + "000" + String(dv);
  return sanitized === expected;
};

/** Provisorio checksum — first digit 7, 8, or 9. */
const isValidProvisorio = (digits: readonly number[]): boolean => {
  const sum = weightedSum(digits, PROVISORIO_WEIGHTS);
  return sum % 11 === 0;
};

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a CNS from raw input.
 * On success the number field contains 15 sanitized digits.
 */
export const CNS = (input: CNSInput): Result<CNS, CNSError> => {
  // CNS-001: empty after trim
  const trimmed = input.number.trim();
  if (trimmed.length === 0) {
    return err("CNS-001");
  }

  // Normalize: keep only digits
  const sanitized = trimmed.replace(/\D/g, "");

  // CNS-002: must be exactly 15 digits
  if (sanitized.length !== 15) {
    return err("CNS-002");
  }

  // CNS-003: first digit must be 1, 2, 7, 8, or 9
  const firstDigit = sanitized[0];
  if (firstDigit === undefined || !VALID_FIRST_DIGITS.has(firstDigit)) {
    return err("CNS-003");
  }

  // CNS-005: checksum
  const digits: readonly number[] = sanitized.split("").map(Number);

  const checksumValid = DEFINITIVO_FIRST_DIGITS.has(firstDigit)
    ? isValidDefinitivo(sanitized, digits)
    : isValidProvisorio(digits);

  if (!checksumValid) {
    return err("CNS-005");
  }

  // Normalize optional qrCode
  const qrCode = input.qrCode !== undefined ? input.qrCode.trim() : undefined;
  const normalizedQrCode = qrCode === "" ? undefined : qrCode;

  return ok({
    number: sanitized,
    cpf: input.cpf,
    qrCode: normalizedQrCode,
  });
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Formats a validated CNS number as "XXX XXXX XXXX XXXX". */
export const formatCNS = (cns: CNS): string => {
  const n = cns.number;
  return `${n.slice(0, 3)} ${n.slice(3, 7)} ${n.slice(7, 11)} ${n.slice(11, 15)}`;
};
