// =============================================================================
// PersonalData — Value Object (Registry Bounded Context)
// =============================================================================
// Compound VO representing a patient's personal identification data.
// Validation order: PD-006 -> PD-001 -> PD-002 -> PD-003 -> PD-004 -> PD-005.
// String normalization: trim + collapse whitespace (except phone: trim only).
// Optional fields become undefined if empty after normalization.
// =============================================================================

import type { TimeStamp } from "../../kernel/timestamp.ts";
import { type Result, ok, err } from "../../shared/result.ts";

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
 * PD-001: firstName empty after normalization
 * PD-002: lastName empty after normalization
 * PD-003: motherName empty after normalization
 * PD-004: nationality empty after normalization
 * PD-005: birthDate is in the future
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
// Normalization Helpers (module-private)
// ---------------------------------------------------------------------------

/** Trims and collapses consecutive whitespace into a single space. */
const trimCollapse = (raw: string): string =>
  raw.trim().replace(/\s+/g, " ");

/** Trims only. Used for phone where internal spacing may be meaningful. */
const trimOnly = (raw: string): string => raw.trim();

/** Returns undefined if string is empty after normalization, else normalized value. */
const nullIfEmpty = (
  raw: string | undefined,
  normalize: (s: string) => string,
): string | undefined => {
  if (raw === undefined) return undefined;
  const normalized = normalize(raw);
  return normalized.length === 0 ? undefined : normalized;
};

// ---------------------------------------------------------------------------
// Validation Helpers (module-private)
// ---------------------------------------------------------------------------

const VALID_SEX_VALUES: ReadonlySet<string> = new Set([
  "MASCULINO",
  "FEMININO",
  "OUTRO",
]);

const isSex = (value: string): value is Sex => VALID_SEX_VALUES.has(value);

const isFuture = (ts: TimeStamp): boolean => {
  const date = new Date(ts as unknown as string);
  return date.getTime() > Date.now();
};

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and normalizes raw input into a PersonalData value object.
 *
 * Validation order: sex -> firstName -> lastName -> motherName -> nationality -> birthDate.
 * Returns the first error encountered (fail-fast).
 */
export const PersonalData = (
  input: PersonalDataInput,
): Result<PersonalData, PersonalDataError> => {
  // PD-006: validate sex first (enum guard)
  if (!isSex(input.sex)) {
    return err("PD-006");
  }

  // Normalize required string fields
  const firstName = trimCollapse(input.firstName);
  const lastName = trimCollapse(input.lastName);
  const motherName = trimCollapse(input.motherName);
  const nationality = trimCollapse(input.nationality);

  // PD-001: firstName not empty
  if (firstName.length === 0) {
    return err("PD-001");
  }

  // PD-002: lastName not empty
  if (lastName.length === 0) {
    return err("PD-002");
  }

  // PD-003: motherName not empty
  if (motherName.length === 0) {
    return err("PD-003");
  }

  // PD-004: nationality not empty
  if (nationality.length === 0) {
    return err("PD-004");
  }

  // PD-005: birthDate not in the future
  if (isFuture(input.birthDate)) {
    return err("PD-005");
  }

  // Normalize optional fields
  const socialName = nullIfEmpty(input.socialName, trimCollapse);
  const phone = nullIfEmpty(input.phone, trimOnly);

  return ok({
    firstName,
    lastName,
    motherName,
    nationality,
    sex: input.sex,
    socialName,
    birthDate: input.birthDate,
    phone,
  });
};
