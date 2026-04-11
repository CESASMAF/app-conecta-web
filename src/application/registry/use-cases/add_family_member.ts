// =============================================================================
// AddFamilyMember — Use Case (Registry)
// =============================================================================
// Validates raw input via domain smart constructors, then proxies to backend.
// Sequence: validate → proxy. No local persistence (BFF pattern).
// =============================================================================

import { PatientId, type PatientIdError } from "../../../domain/registry/value-objects/patient_id.ts";
import { PersonId, LookupId, type PersonIdError, type LookupIdError } from "../../../domain/kernel/ids.ts";
import { TimeStamp, type TimeStampError } from "../../../domain/kernel/timestamp.ts";
import { createFamilyMember, type FamilyMemberError } from "../../../domain/registry/entities/family_member.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type AddFamilyMemberInput = Readonly<{
  patientId: string;
  personId: string;
  relationshipId: string;
  residesWithPatient: boolean;
  hasDisability: boolean;
  requiredDocuments: readonly string[];
  birthDate: string;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type AddFamilyMemberError =
  | PatientIdError
  | PersonIdError
  | LookupIdError
  | TimeStampError
  | FamilyMemberError
  | ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type AddFamilyMemberDeps = Readonly<{
  backendProxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case Factory
// ---------------------------------------------------------------------------

export const addFamilyMember = (
  deps: AddFamilyMemberDeps,
): UseCase<AddFamilyMemberInput, unknown, AddFamilyMemberError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientIdResult = PatientId(input.patientId);
    if (!patientIdResult.ok) return patientIdResult;

    // 2. Validate PersonId
    const personIdResult = PersonId(input.personId);
    if (!personIdResult.ok) return personIdResult;

    // 3. Validate LookupId (relationshipId)
    const relationshipIdResult = LookupId(input.relationshipId);
    if (!relationshipIdResult.ok) return relationshipIdResult;

    // 4. Validate TimeStamp (birthDate)
    const birthDateResult = TimeStamp(input.birthDate);
    if (!birthDateResult.ok) return birthDateResult;

    // 5. Validate FamilyMember entity (checks requiredDocuments)
    const memberResult = createFamilyMember({
      personId: personIdResult.value,
      relationshipId: relationshipIdResult.value,
      isPrimaryCaregiver: false,
      residesWithPatient: input.residesWithPatient,
      hasDisability: input.hasDisability,
      requiredDocuments: input.requiredDocuments,
      birthDate: birthDateResult.value,
    });
    if (!memberResult.ok) return memberResult;

    // 6. Proxy to backend
    return deps.backendProxy.post(
      `/api/v1/patients/${patientIdResult.value as string}/family-members`,
      memberResult.value,
      input.actorId,
    );
  };
