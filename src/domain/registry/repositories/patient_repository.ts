// =============================================================================
// PatientRepository — Repository Contract (Registry Bounded Context)
// =============================================================================
// Type-only contract. Implementations live in src/adapters/.
// Uses Result for all operations — no exceptions cross the boundary.
// =============================================================================

import type { Patient } from "../aggregates/patient/types.ts";
import type { PatientId } from "../value-objects/patient_id.ts";
import type { PersonId } from "../../kernel/ids.ts";
import type { Result } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Repository Type
// ---------------------------------------------------------------------------

export type PatientRepository = Readonly<{
  findById: (id: PatientId) => Promise<Result<Patient, "NOT_FOUND">>;
  save: (patient: Patient) => Promise<Result<void, "CONFLICT">>;
  findByPersonId: (
    personId: PersonId,
  ) => Promise<Result<Patient, "NOT_FOUND">>;
}>;
