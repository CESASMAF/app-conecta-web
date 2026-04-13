// =============================================================================
// Person VO — Identity data from the People Context external service
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import { type Result, ok, err } from "../../shared/result.ts";
import type { PersonError } from "../errors.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Full person representation from People service. */
export type Person = Readonly<{
  id: PersonId;
  fullName: string;
  cpf: string | undefined;
  birthDate: string; // ISO "YYYY-MM-DD"
}>;

/** Lightweight person for listings/search results. */
export type PersonSummary = Readonly<{
  id: PersonId;
  fullName: string;
  cpf: string | undefined;
  birthDate: string;
}>;

/** Input for registering a new person in People service. */
export type RegisterPersonInput = Readonly<{
  fullName: string;
  cpf?: string;
  birthDate: string; // YYYY-MM-DD, must not be in the future
}>;

/** Paginated result set from People service queries. */
export type PaginatedResult<T> = Readonly<{
  data: readonly T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | undefined;
}>;

// ---------------------------------------------------------------------------
// Validation Constants
// ---------------------------------------------------------------------------

const FULL_NAME_MAX = 200;
const BIRTH_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const CPF_DIGITS_REGEX = /^\d{11}$/;

// ---------------------------------------------------------------------------
// Smart Constructors
// ---------------------------------------------------------------------------

/**
 * Validates and creates a RegisterPersonInput from raw data.
 * - fullName: 1-200 chars
 * - cpf: if provided, must be exactly 11 digits
 * - birthDate: YYYY-MM-DD format, must not be in the future
 */
export const RegisterPersonInput = (input: Readonly<{
  fullName: string;
  cpf?: string;
  birthDate: string;
}>): Result<RegisterPersonInput, PersonError> => {
  const trimmedName = input.fullName.trim();

  if (trimmedName.length === 0 || trimmedName.length > FULL_NAME_MAX) {
    return err("PEO-001");
  }

  if (input.cpf !== undefined && !CPF_DIGITS_REGEX.test(input.cpf)) {
    return err("PEO-004");
  }

  if (!BIRTH_DATE_REGEX.test(input.birthDate)) {
    return err("PEO-001");
  }

  // Validate date is a real calendar date and not in the future
  const [yearStr, monthStr, dayStr] = input.birthDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const parsed = new Date(year, month - 1, day);

  if (
    isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return err("PEO-001");
  }

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (parsed > todayDate) {
    return err("PEO-001");
  }

  return ok({
    fullName: trimmedName,
    cpf: input.cpf,
    birthDate: input.birthDate,
  });
};

/**
 * Creates a Person from an API response payload.
 * Validates fullName not empty and birthDate format.
 */
export const Person = (raw: Readonly<{
  id: PersonId;
  fullName: string;
  cpf: string | undefined;
  birthDate: string;
}>): Result<Person, PersonError> => {
  if (!raw.fullName || raw.fullName.trim().length === 0) {
    return err("PEO-001");
  }

  if (!BIRTH_DATE_REGEX.test(raw.birthDate)) {
    return err("PEO-001");
  }

  return ok({
    id: raw.id,
    fullName: raw.fullName.trim(),
    cpf: raw.cpf,
    birthDate: raw.birthDate,
  });
};
