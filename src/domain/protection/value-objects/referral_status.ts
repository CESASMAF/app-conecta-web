// =============================================================================
// ReferralStatus — Enum VO with state machine transitions
// =============================================================================
// Valid values: PENDING, COMPLETED, CANCELLED
// Initial state: PENDING
// Transitions: PENDING → COMPLETED, PENDING → CANCELLED
// Terminal states: COMPLETED, CANCELLED (no outgoing transitions)
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Status of a referral in its lifecycle. */
export type ReferralStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

// ---------------------------------------------------------------------------
// Error Unions
// ---------------------------------------------------------------------------

/** RS-001: invalid referral status value */
export type ReferralStatusError = "RS-001";

/** RS-002: invalid status transition */
export type ReferralStatusTransitionError = "RS-002";

// ---------------------------------------------------------------------------
// Valid Values (module-private)
// ---------------------------------------------------------------------------

const VALID_VALUES: ReadonlySet<string> = new Set([
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const);

/** Allowed transitions: maps current state → set of reachable states. */
const TRANSITIONS: ReadonlyMap<ReferralStatus, ReadonlySet<ReferralStatus>> = new Map([
  ["PENDING", new Set(["COMPLETED", "CANCELLED"] as const)],
  ["COMPLETED", new Set<ReferralStatus>()],
  ["CANCELLED", new Set<ReferralStatus>()],
]);

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a ReferralStatus from a raw string.
 * Checks membership in the valid values set.
 */
export const ReferralStatus = (raw: string): Result<ReferralStatus, ReferralStatusError> => {
  const trimmed = raw.trim();
  if (!VALID_VALUES.has(trimmed)) {
    return err("RS-001");
  }
  return ok(trimmed as ReferralStatus);
};

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

/** The initial state for every new referral. */
export const INITIAL_REFERRAL_STATUS: ReferralStatus = "PENDING";

// ---------------------------------------------------------------------------
// Transition Function
// ---------------------------------------------------------------------------

/**
 * Attempts to transition from `current` to `next` status.
 * Returns Ok(next) if the transition is allowed, or Err("RS-002") if not.
 */
export const transitionReferralStatus = (
  current: ReferralStatus,
  next: ReferralStatus,
): Result<ReferralStatus, ReferralStatusTransitionError> => {
  const allowed = TRANSITIONS.get(current);
  if (allowed === undefined || !allowed.has(next)) {
    return err("RS-002");
  }
  return ok(next);
};
