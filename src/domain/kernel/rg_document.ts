// =============================================================================
// RGDocument — Value Object
// =============================================================================
// Compound value object representing a Brazilian RG (identity card).
// Carries number (with check digit), issuing state, agency, and issue date.
// Validation order: RG-001 -> RG-002 -> RG-003 -> RG-004 -> RG-005 -> RG-006.
// =============================================================================

import { type Result, ok, err } from "../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Validated RG document. All fields are sanitized and verified. */
export type RGDocument = Readonly<{
  number: string;        // 9 chars: 8 digits + check digit (digit or "X")
  issuingState: string;  // 2-letter Brazilian state code
  issuingAgency: string; // issuing agency name (trimmed, collapsed, uppercased)
  issueDate: string;     // ISO date string "YYYY-MM-DD"
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type RGDocumentError =
  | "RG-001"  // number is empty after trim
  | "RG-002"  // number does not match ^[0-9]{8}[0-9X]$ after normalization
  | "RG-003"  // check digit validation failed
  | "RG-004"  // issuingState is not a valid Brazilian state
  | "RG-005"  // issuingAgency is empty after trim
  | "RG-006"  // issueDate is in the future
  | "RG-007"; // issueDate is not a valid date

// ---------------------------------------------------------------------------
// Raw Input
// ---------------------------------------------------------------------------

export type RGDocumentInput = Readonly<{
  number: string;
  issuingState: string;
  issuingAgency: string;
  issueDate: string;
}>;

// ---------------------------------------------------------------------------
// Constants (module-private)
// ---------------------------------------------------------------------------

const BRAZILIAN_STATES: ReadonlySet<string> = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

/** Regex for normalized RG number: 8 digits + 1 digit or X. */
const RG_FORMAT = /^[0-9]{8}[0-9X]$/;

/** Weights for check digit calculation. */
const WEIGHTS: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9] as const;

// ---------------------------------------------------------------------------
// Validation helpers (module-private)
// ---------------------------------------------------------------------------

const computeCheckDigit = (baseDigits: string): string => {
  const sum = WEIGHTS.reduce((acc, w, i) => {
    const digit = Number(baseDigits[i]);
    return acc + digit * w;
  }, 0);
  const remainder = sum % 11;
  if (remainder === 0) return "0";
  if (remainder === 1) return "X";
  return String(11 - remainder);
};

const normalizeNumber = (raw: string): string =>
  raw.trim().toUpperCase().replace(/[.\- ]/g, "");

const normalizeState = (raw: string): string =>
  raw.trim().toUpperCase();

const normalizeAgency = (raw: string): string =>
  raw.trim().replace(/\s+/g, " ").toUpperCase();

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates an RGDocument from raw input.
 * Validation order: RG-001 → RG-002 → RG-003 → RG-004 → RG-005 → RG-006.
 */
export const RGDocument = (
  input: RGDocumentInput,
): Result<RGDocument, RGDocumentError> => {
  // --- Number validation ---

  // RG-001: number empty after normalization
  const normalizedNumber = normalizeNumber(input.number);
  if (normalizedNumber.length === 0) {
    return err("RG-001");
  }

  // RG-002: format check
  if (!RG_FORMAT.test(normalizedNumber)) {
    return err("RG-002");
  }

  // RG-003: check digit validation
  const baseDigits = normalizedNumber.slice(0, 8);
  const providedCheck = normalizedNumber[8];
  const expectedCheck = computeCheckDigit(baseDigits);
  if (providedCheck !== expectedCheck) {
    return err("RG-003");
  }

  // --- State validation ---

  // RG-004: valid Brazilian state
  const normalizedState = normalizeState(input.issuingState);
  if (!BRAZILIAN_STATES.has(normalizedState)) {
    return err("RG-004");
  }

  // --- Agency validation ---

  // RG-005: agency not empty
  const normalizedAgency = normalizeAgency(input.issuingAgency);
  if (normalizedAgency.length === 0) {
    return err("RG-005");
  }

  // --- Date validation ---

  // RG-007: issueDate must be a valid date (parse YYYY-M-D or YYYY-MM-DD)
  const dateParts = input.issueDate.trim().split("-");
  if (dateParts.length !== 3) return err("RG-007");
  const [yearStr, monthStr, dayStr] = dateParts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return err("RG-007");
  if (month < 1 || month > 12 || day < 1 || day > 31) return err("RG-007");
  const issueDate = new Date(Date.UTC(year, month - 1, day));
  // Verify round-trip: reject dates like Feb 30 that silently overflow
  if (
    issueDate.getUTCFullYear() !== year ||
    issueDate.getUTCMonth() !== month - 1 ||
    issueDate.getUTCDate() !== day
  ) {
    return err("RG-007");
  }

  // Normalize to YYYY-MM-DD (zero-padded, UTC)
  const normalizedDate = issueDate.toISOString().slice(0, 10);

  // RG-006: issue date not in the future (compare in UTC)
  const todayUtc = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  if (issueDate.getTime() > todayUtc.getTime()) {
    return err("RG-006");
  }

  return ok({
    number: normalizedNumber,
    issuingState: normalizedState,
    issuingAgency: normalizedAgency,
    issueDate: normalizedDate,
  });
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Formats a validated RG number as "XXXXXXXX-X" (8 chars + hyphen + check). */
export const formatRG = (doc: RGDocument): string =>
  `${doc.number.slice(0, 8)}-${doc.number.slice(8)}`;
