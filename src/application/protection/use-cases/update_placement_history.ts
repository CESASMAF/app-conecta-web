// =============================================================================
// UpdatePlacementHistory — Use Case (Protection)
// =============================================================================
// Validates raw input via domain smart constructors, calls createPlacementHistory,
// then proxies to backend.
// Sequence: validate → domain → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import { PersonId } from "../../../domain/kernel/ids.ts";
import { TimeStamp } from "../../../domain/kernel/timestamp.ts";
import { createPlacementHistory } from "../../../domain/protection/entities/placement_history.ts";
import type { PlacementRegistry } from "../../../domain/protection/entities/placement_history.ts";
import type { PlacementError } from "../../../domain/protection/errors.ts";
import type { TimeStampError } from "../../../domain/kernel/timestamp.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";
import { defaultIdGenerator } from "../../shared/types.ts";
import type { IdGenerator } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type UpdatePlacementHistoryRawInput = Readonly<{
  patientId: string;
  individualPlacements: readonly Readonly<{
    memberId: string;
    startDate: string;
    endDate?: string;
    reason: string;
  }>[];
  collectiveSituations: Readonly<{
    homeLossReport?: string;
    thirdPartyGuardReport?: string;
  }>;
  separationChecklist: Readonly<{
    adultInPrison: boolean;
    adolescentInInternment: boolean;
  }>;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type UpdatePlacementHistoryError =
  | PlacementError
  | TimeStampError
  | ProxyError
  | "INVALID_PATIENT_ID"
  | "INVALID_PERSON_ID"
  | "INVALID_TIMESTAMP";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type UpdatePlacementHistoryDeps = Readonly<{
  proxy: BackendProxy;
  idGenerator?: IdGenerator;
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updatePlacementHistory = (
  deps: UpdatePlacementHistoryDeps,
): UseCase<UpdatePlacementHistoryRawInput, unknown, UpdatePlacementHistoryError> =>
  async (input) => {
    const generateId: IdGenerator = deps.idGenerator ?? defaultIdGenerator;
    // 1. Validate PatientId
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    // 2. Validate each placement entry
    const validatedPlacements: PlacementRegistry[] = [];
    for (const placement of input.individualPlacements) {
      const memberId = PersonId(placement.memberId);
      if (!memberId.ok) return err("INVALID_PERSON_ID");

      const startDate = TimeStamp(placement.startDate);
      if (!startDate.ok) return err("INVALID_TIMESTAMP");

      const endDate = placement.endDate !== undefined
        ? TimeStamp(placement.endDate)
        : undefined;
      if (endDate !== undefined && !endDate.ok) return err("INVALID_TIMESTAMP");

      validatedPlacements.push({
        id: generateId(),
        memberId: memberId.value,
        startDate: startDate.value,
        endDate: endDate?.ok ? endDate.value : undefined,
        reason: placement.reason,
      });
    }

    // 3. Domain — create placement history
    const history = createPlacementHistory({
      familyId: patientId.value,
      individualPlacements: validatedPlacements,
      collectiveSituations: {
        homeLossReport: input.collectiveSituations.homeLossReport,
        thirdPartyGuardReport: input.collectiveSituations.thirdPartyGuardReport,
      },
      separationChecklist: {
        adultInPrison: input.separationChecklist.adultInPrison,
        adolescentInInternment: input.separationChecklist.adolescentInInternment,
      },
    });
    if (!history.ok) return history;

    // 4. Proxy to backend
    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/placement-history`,
      history.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
