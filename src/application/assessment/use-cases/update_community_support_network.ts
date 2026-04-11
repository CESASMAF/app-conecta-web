// =============================================================================
// UpdateCommunitySupportNetwork — Use Case
// =============================================================================
// Validates community support network input via domain smart constructor, then
// proxies the validated data to the backend via PUT.
// Sequence: validate patientId → validate VO → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import {
  type CommunitySupportNetworkInput,
  type CommunitySupportNetworkError,
  CommunitySupportNetwork,
} from "../../../domain/assessment/value-objects/community_support_network.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateCommunitySupportNetworkDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateCommunitySupportNetworkInput = Readonly<{
  patientId: string;
  data: CommunitySupportNetworkInput;
  actorId: string;
}>;

export type UpdateCommunitySupportNetworkError =
  | CommunitySupportNetworkError
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateCommunitySupportNetwork = (
  deps: UpdateCommunitySupportNetworkDeps,
): UseCase<UpdateCommunitySupportNetworkInput, unknown, UpdateCommunitySupportNetworkError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    const validated = CommunitySupportNetwork(input.data);
    if (!validated.ok) return validated;

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/community-support`,
      validated.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
