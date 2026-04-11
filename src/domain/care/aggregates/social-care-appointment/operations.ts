// =============================================================================
// SocialCareAppointment — Operations (Care)
// =============================================================================
// Pure functions for creating and manipulating SocialCareAppointment aggregates.
// All functions return Result — pure, functional, no side effects.
//
// Rules:
//   SCA-001: date must not be in the future
//   SCA-002: at least one of summary or actionPlan must be non-empty after trim
//   SCA-003: summary max 500 characters
//   SCA-004: actionPlan max 2000 characters
// =============================================================================

import type { Result } from "../../../shared/result.ts";
import { ok, err } from "../../../shared/result.ts";
import type { AppointmentError } from "../../errors.ts";
import type {
  SocialCareAppointment,
  CreateAppointmentInput,
} from "./types.ts";

// ---------------------------------------------------------------------------
// Constants (module-private)
// ---------------------------------------------------------------------------

const SUMMARY_MAX_LENGTH = 500;
const ACTION_PLAN_MAX_LENGTH = 2000;

// ---------------------------------------------------------------------------
// Helpers (module-private)
// ---------------------------------------------------------------------------

/**
 * Trims a string, returns undefined if the result is empty or input is undefined.
 */
const trimOrUndefined = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

/**
 * Checks whether a TimeStamp is in the future relative to current UTC time.
 * Compares the timestamp date against Date.now() at millisecond precision.
 */
const isFutureDate = (ts: string): boolean => {
  const date = new Date(ts);
  return date.getTime() > Date.now();
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a new SocialCareAppointment from validated inputs.
 *
 * Validation order: SCA-001 -> SCA-003 -> SCA-004 -> SCA-002
 * (date first, then length checks, then presence check on trimmed values)
 */
export const createAppointment = (
  input: CreateAppointmentInput,
): Result<SocialCareAppointment, AppointmentError> => {
  // SCA-001: date must not be in the future
  if (isFutureDate(input.date as unknown as string)) {
    return err("SCA-001");
  }

  const trimmedSummary = trimOrUndefined(input.summary);
  const trimmedActionPlan = trimOrUndefined(input.actionPlan);

  // SCA-003: summary max 500 chars (only if present after trim)
  if (trimmedSummary !== undefined && trimmedSummary.length > SUMMARY_MAX_LENGTH) {
    return err("SCA-003");
  }

  // SCA-004: actionPlan max 2000 chars (only if present after trim)
  if (trimmedActionPlan !== undefined && trimmedActionPlan.length > ACTION_PLAN_MAX_LENGTH) {
    return err("SCA-004");
  }

  // SCA-002: at least one of summary or actionPlan must be non-empty
  if (trimmedSummary === undefined && trimmedActionPlan === undefined) {
    return err("SCA-002");
  }

  return ok({
    id: input.id,
    date: input.date,
    professionalInChargeId: input.professionalInChargeId,
    type: input.type,
    summary: trimmedSummary,
    actionPlan: trimmedActionPlan,
  });
};
