// =============================================================================
// PlacementHistory — Entity (Protection)
// =============================================================================
// Tracks family members placed in institutional care or alternative settings.
// Rule PLC-001: if endDate provided, endDate >= startDate.
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import type { TimeStamp } from "../../kernel/timestamp.ts";
import type { PatientId } from "../../registry/value-objects/patient_id.ts";
import { type Result, ok, err } from "../../shared/result.ts";
import type { PlacementError } from "../errors.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PlacementRegistry = Readonly<{
  id: string;
  memberId: PersonId;
  startDate: TimeStamp;
  endDate: TimeStamp | undefined;
  reason: string;
}>;

export type CollectiveSituations = Readonly<{
  homeLossReport: string | undefined;
  thirdPartyGuardReport: string | undefined;
}>;

export type SeparationChecklist = Readonly<{
  adultInPrison: boolean;
  adolescentInInternment: boolean;
}>;

export type PlacementHistory = Readonly<{
  familyId: PatientId;
  individualPlacements: readonly PlacementRegistry[];
  collectiveSituations: CollectiveSituations;
  separationChecklist: SeparationChecklist;
}>;

// ---------------------------------------------------------------------------
// Input Types
// ---------------------------------------------------------------------------

export type CreatePlacementHistoryInput = Readonly<{
  familyId: PatientId;
  individualPlacements: readonly PlacementRegistry[];
  collectiveSituations: CollectiveSituations;
  separationChecklist: SeparationChecklist;
}>;

// ---------------------------------------------------------------------------
// Validation (module-private)
// ---------------------------------------------------------------------------

const validatePlacement = (
  placement: PlacementRegistry,
): Result<PlacementRegistry, PlacementError> => {
  // PLC-001: if endDate provided, endDate >= startDate
  if (placement.endDate !== undefined) {
    const start = new Date(placement.startDate as unknown as string);
    const end = new Date(placement.endDate as unknown as string);
    if (end.getTime() < start.getTime()) {
      return err("PLC-001");
    }
  }
  return ok(placement);
};

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * Creates a PlacementHistory from validated inputs.
 * Validates all individual placements against PLC-001.
 */
export const createPlacementHistory = (
  input: CreatePlacementHistoryInput,
): Result<PlacementHistory, PlacementError> => {
  // Validate each placement
  for (const placement of input.individualPlacements) {
    const result = validatePlacement(placement);
    if (!result.ok) return err(result.error);
  }

  return ok({
    familyId: input.familyId,
    individualPlacements: input.individualPlacements,
    collectiveSituations: input.collectiveSituations,
    separationChecklist: input.separationChecklist,
  });
};

/**
 * Adds a new placement to an existing PlacementHistory.
 * Validates the new placement against PLC-001.
 */
export const addPlacement = (
  history: PlacementHistory,
  placement: PlacementRegistry,
): Result<PlacementHistory, PlacementError> => {
  const validationResult = validatePlacement(placement);
  if (!validationResult.ok) return err(validationResult.error);

  return ok({
    ...history,
    individualPlacements: [...history.individualPlacements, placement],
  });
};
