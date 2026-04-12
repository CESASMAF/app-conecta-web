// =============================================================================
// TimeStamp — Contract (001-contracts)
// =============================================================================
// Defines the public API surface for the TimeStamp kernel Value Object.
// Implementation MUST match these signatures exactly.
// =============================================================================

import type { Brand } from "../../../src/domain/shared/brand.ts";
import type { Result } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Branded Type
// ---------------------------------------------------------------------------

/** ISO8601 UTC datetime string with milliseconds: "yyyy-MM-dd'T'HH:mm:ss.SSSZ" */
export type TimeStamp = Brand<string, "TimeStamp">;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** TS-001: empty/null input | TS-002: invalid date format or value */
export type TimeStampError = "TS-001" | "TS-002";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Parses and validates a raw string as an ISO8601 UTC timestamp.
 * Normalizes to include milliseconds if absent.
 * Returns branded TimeStamp on success.
 */
export declare const TimeStamp: (raw: string) => Result<TimeStamp, TimeStampError>;

// ---------------------------------------------------------------------------
// Factory — Current UTC Time
// ---------------------------------------------------------------------------

/**
 * Returns the current UTC timestamp. Always valid — no Result needed.
 */
export declare const now: () => TimeStamp;

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/**
 * Compares two timestamps by civil day in UTC (year, month, day).
 */
export declare const isSameDay: (a: TimeStamp, b: TimeStamp) => boolean;

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates complete years between birth and reference timestamps.
 * If the birthday has not yet occurred in the reference year, subtracts 1.
 */
export declare const yearsAt: (birth: TimeStamp, reference: TimeStamp) => number;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Returns the ISO8601 string with fractional seconds: "yyyy-MM-ddTHH:mm:ss.SSSZ".
 * Since the branded type already stores this format, this is essentially identity.
 */
export declare const toISOString: (ts: TimeStamp) => string;
