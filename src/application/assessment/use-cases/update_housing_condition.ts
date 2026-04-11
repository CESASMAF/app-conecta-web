// =============================================================================
// UpdateHousingCondition — Use Case
// =============================================================================
// Validates housing condition input via domain smart constructor, then proxies
// the validated data to the backend via PUT.
// Sequence: validate patientId → validate VO → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import {
  type HousingConditionInput,
  type HousingConditionError,
  HousingCondition,
} from "../../../domain/assessment/value-objects/housing_condition.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateHousingConditionDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateHousingConditionInput = Readonly<{
  patientId: string;
  data: HousingConditionInput;
  actorId: string;
}>;

export type UpdateHousingConditionError =
  | HousingConditionError
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateHousingCondition = (
  deps: UpdateHousingConditionDeps,
): UseCase<UpdateHousingConditionInput, unknown, UpdateHousingConditionError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    const validated = HousingCondition(input.data);
    if (!validated.ok) return validated;

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/housing-condition`,
      validated.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
