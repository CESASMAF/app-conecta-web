// =============================================================================
// PersonalData — Contract (Registry Bounded Context)
// =============================================================================
// Compound Value Object representing a patient's personal data.
// All string fields normalize: trim + collapse whitespace (except phone: trim only).
// Optional fields become undefined if empty after normalization.
// =============================================================================

import type { TimeStamp } from "../../../src/domain/kernel/timestamp.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Sex = "MASCULINO" | "FEMININO" | "OUTRO";

export type PersonalData = Readonly<{
  firstName: string;
  lastName: string;
  motherName: string;
  nationality: string;
  sex: Sex;
  socialName: string | undefined;
  birthDate: TimeStamp;
  phone: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/**
 * PD-001: firstName empty
 * PD-002: lastName empty
 * PD-003: motherName empty
 * PD-004: nationality empty
 * PD-005: birthDate in the future
 * PD-006: invalid sex value
 */
export type PersonalDataError =
  | "PD-001"
  | "PD-002"
  | "PD-003"
  | "PD-004"
  | "PD-005"
  | "PD-006";

// ---------------------------------------------------------------------------
// Raw Input
// ---------------------------------------------------------------------------

export type PersonalDataInput = Readonly<{
  firstName: string;
  lastName: string;
  motherName: string;
  nationality: string;
  sex: string;
  socialName: string | undefined;
  birthDate: TimeStamp;
  phone: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Smart Constructor Signature
// ---------------------------------------------------------------------------

export type PersonalDataConstructor = (
  input: PersonalDataInput,
) => Result<PersonalData, PersonalDataError>;
