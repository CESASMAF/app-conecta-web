// =============================================================================
// UpdateSocialBenefits — Use Case
// =============================================================================
// Validates each SocialBenefit item, then validates the collection for
// uniqueness, then proxies the validated data to the backend via PUT.
// Sequence: validate patientId → validate each item → validate collection → proxy PUT
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { err, ok } from "../../../domain/shared/result.ts";
import { PatientId } from "../../../domain/registry/value-objects/patient_id.ts";
import {
  type SocialBenefitInput,
  type SocialBenefitError,
  type SocialBenefit,
  SocialBenefit as createSocialBenefit,
} from "../../../domain/assessment/value-objects/social_benefit.ts";
import {
  type SocialBenefitsCollectionError,
  SocialBenefitsCollection,
} from "../../../domain/assessment/value-objects/social_benefits_collection.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UpdateSocialBenefitsDeps = Readonly<{
  proxy: BackendProxy;
}>;

export type UpdateSocialBenefitsInput = Readonly<{
  patientId: string;
  data: readonly SocialBenefitInput[];
  actorId: string;
}>;

export type UpdateSocialBenefitsError =
  | SocialBenefitError
  | SocialBenefitsCollectionError
  | ProxyError
  | "INVALID_PATIENT_ID";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const updateSocialBenefits = (
  deps: UpdateSocialBenefitsDeps,
): UseCase<UpdateSocialBenefitsInput, unknown, UpdateSocialBenefitsError> =>
  async (input) => {
    const patientId = PatientId(input.patientId);
    if (!patientId.ok) return err("INVALID_PATIENT_ID");

    // Validate each individual benefit
    const validatedItems: SocialBenefit[] = [];
    for (const item of input.data) {
      const result = createSocialBenefit(item);
      if (!result.ok) return result;
      validatedItems.push(result.value);
    }

    // Validate collection (uniqueness)
    const collection = SocialBenefitsCollection(validatedItems);
    if (!collection.ok) return collection;

    return deps.proxy.put(
      `/api/v1/patients/${patientId.value}/social-benefits`,
      collection.value,
      input.actorId,
    ) as Promise<Result<unknown, ProxyError>>;
  };
