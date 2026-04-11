// =============================================================================
// UpdateEducationalStatus — Use Case
// =============================================================================
// No domain validation — EducationalStatus is a pure structural factory.
// Sequence: validate patientId → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateEducationalStatusDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateEducationalStatusInput = Readonly<{
  patientId: string;
  data: unknown;
  actorId: string;
}>;

export type UpdateEducationalStatusError =
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateEducationalStatus = (
  deps: UpdateEducationalStatusDeps,
): UseCase<UpdateEducationalStatusInput, unknown, UpdateEducationalStatusError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/educational-status`,
      input.data,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
