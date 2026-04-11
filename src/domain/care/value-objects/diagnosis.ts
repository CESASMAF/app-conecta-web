// =============================================================================
// Diagnosis — Compound Value Object (Care)
// =============================================================================
// Represents a clinical diagnosis with ICD code, date, and description.
// Validation: DIA-001 (future date), DIA-002 (year < 0), DIA-003 (empty description).
// Input takes raw strings for id/description and branded TimeStamp for date.
// =============================================================================

import type { TimeStamp } from "../../kernel/timestamp.ts";
import { type ICDCode, ICDCode as createICDCode, type ICDCodeError } from "./icd_code.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type Diagnosis = Readonly<{
  id: ICDCode;
  date: TimeStamp;
  description: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** DIA-001: date is in the future | DIA-002: year < 0 | DIA-003: empty description */
export type DiagnosisError = ICDCodeError | "DIA-001" | "DIA-002" | "DIA-003";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type DiagnosisInput = Readonly<{
  id: string;
  date: TimeStamp;
  description: string;
}>;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a Diagnosis from raw input.
 * Validation order: id (ICDCode) → date (not future, year >= 0) → description (not empty).
 */
export const Diagnosis = (input: DiagnosisInput): Result<Diagnosis, DiagnosisError> => {
  // Validate ICD code
  const icdResult = createICDCode(input.id);
  if (!icdResult.ok) {
    return icdResult;
  }

  // DIA-002: year >= 0
  const dateObj = new Date(input.date as unknown as string);
  if (dateObj.getUTCFullYear() < 0) {
    return err("DIA-002");
  }

  // DIA-001: not future
  const now = new Date();
  if (dateObj.getTime() > now.getTime()) {
    return err("DIA-001");
  }

  // DIA-003: description not empty
  const trimmedDescription = input.description.trim();
  if (trimmedDescription.length === 0) {
    return err("DIA-003");
  }

  return ok({
    id: icdResult.value,
    date: input.date,
    description: trimmedDescription,
  });
};
