// =============================================================================
// Assessment — HealthStatus Value Object
// =============================================================================
// Data-holder VO representing the health status of a patient's family.
// No validation in the constructor — pure structural type.
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import type { LookupId } from "../../kernel/ids.ts";
import type { PatientId } from "../../registry/value-objects/patient_id.ts";

// ---------------------------------------------------------------------------
// Sub-types
// ---------------------------------------------------------------------------

/** A family member's deficiency record. */
export type Deficiency = Readonly<{
  memberId: PersonId;
  deficiencyTypeId: LookupId;
  needsConstantCare: boolean;
  responsibleCaregiverName: string | undefined;
}>;

/** A family member who is currently gestating. */
export type GestatingMember = Readonly<{
  memberId: PersonId;
  monthsGestation: number;
  startedPrenatalCare: boolean;
}>;

// ---------------------------------------------------------------------------
// Main Type
// ---------------------------------------------------------------------------

/** Health status of a patient's family unit. */
export type HealthStatus = Readonly<{
  familyId: PatientId;
  deficiencies: readonly Deficiency[];
  gestatingMembers: readonly GestatingMember[];
  constantCareNeeds: readonly PersonId[];
  foodInsecurity: boolean;
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** Creates a HealthStatus. No validation — pure structural construction. */
export const createHealthStatus = (
  params: Readonly<{
    familyId: PatientId;
    deficiencies: readonly Deficiency[];
    gestatingMembers: readonly GestatingMember[];
    constantCareNeeds: readonly PersonId[];
    foodInsecurity: boolean;
  }>,
): HealthStatus => ({
  familyId: params.familyId,
  deficiencies: params.deficiencies,
  gestatingMembers: params.gestatingMembers,
  constantCareNeeds: params.constantCareNeeds,
  foodInsecurity: params.foodInsecurity,
});
