// =============================================================================
// RemoveFamilyMember — Use Case (Registry)
// =============================================================================
// Validates raw IDs via domain smart constructors, then proxies DELETE to backend.
// Sequence: validate → proxy. No local persistence (BFF pattern).
// =============================================================================

import { PatientId, type PatientIdError } from "../../../domain/registry/value-objects/patient_id.ts";
import { PersonId, type PersonIdError } from "../../../domain/kernel/ids.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type RemoveFamilyMemberInput = Readonly<{
  patientId: string;
  memberId: string;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type RemoveFamilyMemberError =
  | PatientIdError
  | PersonIdError
  | ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type RemoveFamilyMemberDeps = Readonly<{
  backendProxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case Factory
// ---------------------------------------------------------------------------

export const removeFamilyMember = (
  deps: RemoveFamilyMemberDeps,
): UseCase<RemoveFamilyMemberInput, void, RemoveFamilyMemberError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientIdResult = PatientId(input.patientId);
    if (!patientIdResult.ok) return patientIdResult;

    // 2. Validate PersonId (memberId)
    const memberIdResult = PersonId(input.memberId);
    if (!memberIdResult.ok) return memberIdResult;

    // 3. Proxy DELETE to backend
    return deps.backendProxy.delete(
      `/api/v1/patients/${patientIdResult.value as string}/family-members/${memberIdResult.value as string}`,
      input.actorId,
    );
  };
