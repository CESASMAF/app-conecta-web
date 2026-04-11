// =============================================================================
// Referral — Aggregate Operations (Protection)
// =============================================================================
// Pure functions for creating and mutating Referral aggregates.
// Rules:
//   REF-001: date must not be in the future
//   REF-002: reason must not be empty
//   REF-003: invalid status transition (delegates to transitionReferralStatus)
// =============================================================================

import { type Result, ok, err } from "../../../shared/result.ts";
import { now as tsNow } from "../../../kernel/timestamp.ts";
import { INITIAL_REFERRAL_STATUS, transitionReferralStatus } from "../../value-objects/referral_status.ts";
import type { ReferralStatus } from "../../value-objects/referral_status.ts";
import type { ReferralError } from "../../errors.ts";
import type { Referral, CreateReferralInput } from "./types.ts";

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new Referral aggregate.
 * Validates REF-001 (date not in future) and REF-002 (reason not empty).
 * Status is always INITIAL_REFERRAL_STATUS (PENDING).
 */
export const createReferral = (
  input: CreateReferralInput,
): Result<Referral, ReferralError> => {
  // REF-001: date must not be in the future
  const currentTime = new Date(tsNow() as unknown as string);
  const inputDate = new Date(input.date as unknown as string);
  if (inputDate.getTime() > currentTime.getTime()) {
    return err("REF-001");
  }

  // REF-002: reason must not be empty
  if (input.reason.trim().length === 0) {
    return err("REF-002");
  }

  return ok({
    id: input.id,
    date: input.date,
    requestingProfessionalId: input.requestingProfessionalId,
    referredPersonId: input.referredPersonId,
    destinationService: input.destinationService,
    reason: input.reason.trim(),
    status: INITIAL_REFERRAL_STATUS,
  });
};

// ---------------------------------------------------------------------------
// Status Transition
// ---------------------------------------------------------------------------

/**
 * Transitions a referral to a new status.
 * Delegates to transitionReferralStatus for state machine validation.
 * Maps RS-002 to REF-003.
 */
export const transitionStatus = (
  referral: Referral,
  newStatus: ReferralStatus,
): Result<Referral, ReferralError> => {
  const transitionResult = transitionReferralStatus(referral.status, newStatus);
  if (!transitionResult.ok) {
    return err("REF-003");
  }

  return ok({
    ...referral,
    status: transitionResult.value,
  });
};
