// =============================================================================
// UpdateSocialHealthSummary — Use Case
// =============================================================================
// Validates social health summary input via domain smart constructor, then
// proxies the validated data to the backend via PUT.
// Sequence: validate patientId → validate VO → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import {
  type SocialHealthSummaryInput,
  type SocialHealthSummaryError,
  SocialHealthSummary,
} from "../../../domain/assessment/value-objects/social_health_summary.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateSocialHealthSummaryDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateSocialHealthSummaryInput = Readonly<{
  patientId: string;
  data: SocialHealthSummaryInput;
  actorId: string;
}>;

export type UpdateSocialHealthSummaryError =
  | SocialHealthSummaryError
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateSocialHealthSummary = (
  deps: UpdateSocialHealthSummaryDeps,
): UseCase<UpdateSocialHealthSummaryInput, unknown, UpdateSocialHealthSummaryError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    const validated = SocialHealthSummary(input.data);
    if (!validated.ok) return validated;

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/social-health-summary`,
      validated.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
