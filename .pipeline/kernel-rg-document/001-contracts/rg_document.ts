// =============================================================================
// RGDocument — Contract (001-contracts)
// =============================================================================
// Compound Value Object representing a Brazilian RG (identity card).
// NOT a branded string — it carries number, issuing state, agency, and date.
// =============================================================================

import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Validated RG document. All fields are sanitized and verified. */
export type RGDocument = Readonly<{
  number: string;       // 9 chars: 8 digits + check digit (digit or "X")
  issuingState: string; // 2-letter Brazilian state code
  issuingAgency: string; // issuing agency name (trimmed, collapsed, uppercased)
  issueDate: string;    // ISO date string "YYYY-MM-DD"
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
  | "RG-006"; // issueDate is in the future

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
// Functions
// ---------------------------------------------------------------------------

/** Smart constructor: validates and normalizes all fields. */
export declare const RGDocument: (
  input: RGDocumentInput,
) => Result<RGDocument, RGDocumentError>;

/** Formats validated RG number as "XXXXXXXX-X". */
export declare const formatRG: (doc: RGDocument) => string;
