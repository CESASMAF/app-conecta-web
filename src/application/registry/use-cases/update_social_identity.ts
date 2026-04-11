// =============================================================================
// UpdateSocialIdentity — Use Case (Registry)
// =============================================================================
// Validates raw input via domain smart constructors, then proxies PUT to backend.
// Sequence: validate → proxy. No local persistence (BFF pattern).
// =============================================================================

import { PatientId, type PatientIdError } from "../../../domain/registry/value-objects/patient_id.ts";
import { LookupId, type LookupIdError } from "../../../domain/kernel/ids.ts";
import { SocialIdentity, type SocialIdentityError } from "../../../domain/registry/value-objects/social_identity.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type UpdateSocialIdentityInput = Readonly<{
  patientId: string;
  typeId: string;
  otherDescription?: string;
  isOtherType: boolean;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type UpdateSocialIdentityError =
  | PatientIdError
  | LookupIdError
  | SocialIdentityError
  | ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type UpdateSocialIdentityDeps = Readonly<{
  backendProxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case Factory
// ---------------------------------------------------------------------------

export const updateSocialIdentity = (
  deps: UpdateSocialIdentityDeps,
): UseCase<UpdateSocialIdentityInput, unknown, UpdateSocialIdentityError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientIdResult = PatientId(input.patientId);
    if (!patientIdResult.ok) return patientIdResult;

    // 2. Validate LookupId (typeId)
    const typeIdResult = LookupId(input.typeId);
    if (!typeIdResult.ok) return typeIdResult;

    // 3. Validate SocialIdentity
    const socialIdentityResult = SocialIdentity({
      typeId: typeIdResult.value,
      otherDescription: input.otherDescription,
      isOtherType: input.isOtherType,
    });
    if (!socialIdentityResult.ok) return socialIdentityResult;

    // 4. Proxy PUT to backend
    return deps.backendProxy.put(
      `/api/v1/patients/${patientIdResult.value as string}/social-identity`,
      socialIdentityResult.value,
      input.actorId,
    );
  };
