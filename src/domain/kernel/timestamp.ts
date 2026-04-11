// =============================================================================
// TimeStamp — Value Object (Kernel)
// =============================================================================
// ISO8601 UTC datetime with milliseconds: "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
// Branded type with smart constructor, comparison, age calculation, formatting.
// Validation order: TS-001 -> TS-002.
// =============================================================================

import type { Brand } from "../shared/brand.ts";
import { type Result, ok, err } from "../shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** ISO8601 UTC datetime string stored with milliseconds. */
export type TimeStamp = Brand<string, "TimeStamp">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** TS-001: empty input | TS-002: invalid date format or value */
export type TimeStampError = "TS-001" | "TS-002";

// ---------------------------------------------------------------------------
// Validation Helpers (module-private)
// ---------------------------------------------------------------------------

/**
 * Parses a string into a Date and validates it represents a real date.
 * Returns undefined if parsing fails or produces NaN.
 */
const parseDate = (raw: string): Date | undefined => {
  const date = new Date(raw);
  return isNaN(date.getTime()) ? undefined : date;
};

/**
 * Formats a Date as ISO8601 UTC with milliseconds.
 * Uses `as unknown as TimeStamp` because the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
const brandFromDate = (date: Date): TimeStamp =>
  date.toISOString() as unknown as TimeStamp;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a TimeStamp from a raw string input.
 * On success the branded value contains an ISO8601 UTC string with millis.
 *
 * Uses `as unknown as TimeStamp` for branding because TypeScript cannot narrow
 * a plain string into a branded type — the phantom __brand tag only exists
 * at the type level and has no runtime representation.
 */
export const TimeStamp = (raw: string): Result<TimeStamp, TimeStampError> => {
  // TS-001: empty after trim
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return err("TS-001");
  }

  // TS-002: invalid date
  const date = parseDate(trimmed);
  if (date === undefined) {
    return err("TS-002");
  }

  // Normalize: re-format to guarantee millis and UTC "Z" suffix
  return ok(brandFromDate(date));
};

// ---------------------------------------------------------------------------
// Factory — Current UTC Time
// ---------------------------------------------------------------------------

/** Returns the current UTC timestamp. Always valid — no Result wrapper needed. */
export const now = (): TimeStamp => brandFromDate(new Date());

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/** Compares two timestamps by civil day in UTC (year, month, day). */
export const isSameDay = (a: TimeStamp, b: TimeStamp): boolean => {
  const dateA = new Date(a as unknown as string);
  const dateB = new Date(b as unknown as string);
  return (
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate()
  );
};

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates complete years between birth and reference timestamps.
 * If the birthday has not yet occurred in the reference year, subtracts 1.
 */
export const yearsAt = (birth: TimeStamp, reference: TimeStamp): number => {
  const b = new Date(birth as unknown as string);
  const r = new Date(reference as unknown as string);

  const years = r.getUTCFullYear() - b.getUTCFullYear();

  const monthDiff = r.getUTCMonth() - b.getUTCMonth();
  if (monthDiff < 0) return years - 1;
  if (monthDiff > 0) return years;

  // Same month — compare day
  const dayDiff = r.getUTCDate() - b.getUTCDate();
  return dayDiff < 0 ? years - 1 : years;
};

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Returns the ISO8601 string with fractional seconds.
 * Since the branded type already stores the ISO format, the operation is essentially identity.
 * Widen branded type to base string — always safe (subtype -> supertype).
 */
export const toISOString = (ts: TimeStamp): string => ts as unknown as string;
