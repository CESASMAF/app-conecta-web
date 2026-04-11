// =============================================================================
// UpdateWorkAndIncome — Use Case
// =============================================================================
// Validates work-and-income input via domain smart constructor, then proxies
// the validated data to the backend via PUT.
// Sequence: validate patientId → validate VO → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import {
  type WorkAndIncomeInput,
  type WorkAndIncomeError,
  WorkAndIncome,
} from "../../../domain/assessment/value-objects/work_and_income.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateWorkAndIncomeDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateWorkAndIncomeInput = Readonly<{
  patientId: string;
  data: WorkAndIncomeInput;
  actorId: string;
}>;

export type UpdateWorkAndIncomeError =
  | WorkAndIncomeError
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateWorkAndIncome = (
  deps: UpdateWorkAndIncomeDeps,
): UseCase<UpdateWorkAndIncomeInput, unknown, UpdateWorkAndIncomeError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    const validated = WorkAndIncome(input.data);
    if (!validated.ok) return validated;

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/work-and-income`,
      validated.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
