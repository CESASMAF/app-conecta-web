// =============================================================================
// CommunitySupportNetwork — Value Object
// =============================================================================
// Captures the social support structure around a patient and their family,
// including relational support, group participation, leisure access, and
// discrimination indicators. Used in the Assessment bounded context.
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// CommunitySupportNetwork Type
// ---------------------------------------------------------------------------

export type CommunitySupportNetwork = Readonly<{
  hasRelativeSupport: boolean;
  hasNeighborSupport: boolean;
  familyConflicts: string;
  patientParticipatesInGroups: boolean;
  familyParticipatesInGroups: boolean;
  patientHasAccessToLeisure: boolean;
  facesDiscrimination: boolean;
}>;

// ---------------------------------------------------------------------------
// Input Type
// ---------------------------------------------------------------------------

export type CommunitySupportNetworkInput = Readonly<{
  hasRelativeSupport: boolean;
  hasNeighborSupport: boolean;
  familyConflicts: string;
  patientParticipatesInGroups: boolean;
  familyParticipatesInGroups: boolean;
  patientHasAccessToLeisure: boolean;
  facesDiscrimination: boolean;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type CommunitySupportNetworkError =
  | "CSN-001" // familyConflicts is empty or whitespace-only
  | "CSN-002"; // familyConflicts exceeds 300 characters

// ---------------------------------------------------------------------------
// Constants (module-private)
// ---------------------------------------------------------------------------

const MAX_FAMILY_CONFLICTS_LENGTH = 300;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a CommunitySupportNetwork from raw input.
 *
 * The familyConflicts field is trimmed before validation and storage.
 * It must not be empty or whitespace-only (CSN-001), and must not exceed
 * 300 characters after trimming (CSN-002).
 */
export const CommunitySupportNetwork = (
  input: CommunitySupportNetworkInput,
): Result<CommunitySupportNetwork, CommunitySupportNetworkError> => {
  const trimmedConflicts = input.familyConflicts.trim();

  if (trimmedConflicts.length === 0) return err("CSN-001");
  if (trimmedConflicts.length > MAX_FAMILY_CONFLICTS_LENGTH) return err("CSN-002");

  return ok({
    hasRelativeSupport: input.hasRelativeSupport,
    hasNeighborSupport: input.hasNeighborSupport,
    familyConflicts: trimmedConflicts,
    patientParticipatesInGroups: input.patientParticipatesInGroups,
    familyParticipatesInGroups: input.familyParticipatesInGroups,
    patientHasAccessToLeisure: input.patientHasAccessToLeisure,
    facesDiscrimination: input.facesDiscrimination,
  });
};
