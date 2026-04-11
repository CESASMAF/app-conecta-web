// =============================================================================
// AssignPrimaryCaregiver — Use Case (Registry)
// =============================================================================
// Validates raw IDs via domain smart constructors, then proxies PUT to backend.
// Sequence: validate → proxy. No local persistence (BFF pattern).
// =============================================================================

import { PatientId, type PatientIdError } from "../../../domain/registry/value-objects/patient_id.ts";
import { PersonId, type PersonIdError } from "../../../domain/kernel/ids.ts";
import type { UseCase, BackendProxy, ProxyError } from "../../shared/types.ts";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type AssignPrimaryCaregiverInput = Readonly<{
  patientId: string;
  personId: string;
  actorId: string;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

export type AssignPrimaryCaregiverError =
  | PatientIdError
  | PersonIdError
  | ProxyError;

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export type AssignPrimaryCaregiverDeps = Readonly<{
  backendProxy: BackendProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case Factory
// ---------------------------------------------------------------------------

export const assignPrimaryCaregiver = (
  deps: AssignPrimaryCaregiverDeps,
): UseCase<AssignPrimaryCaregiverInput, unknown, AssignPrimaryCaregiverError> =>
  async (input) => {
    // 1. Validate PatientId
    const patientIdResult = PatientId(input.patientId);
    if (!patientIdResult.ok) return patientIdResult;

    // 2. Validate PersonId
    const personIdResult = PersonId(input.personId);
    if (!personIdResult.ok) return personIdResult;

    // 3. Proxy PUT to backend
    return deps.backendProxy.put(
      `/api/v1/patients/${patientIdResult.value as string}/primary-caregiver`,
      { personId: personIdResult.value },
      input.actorId,
    );
  };
