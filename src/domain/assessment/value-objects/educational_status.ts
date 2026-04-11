// =============================================================================
// Assessment — EducationalStatus Value Object
// =============================================================================
// Data-holder VO representing the educational status of a patient's family.
// No validation in the constructor — pure structural type.
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import type { LookupId } from "../../kernel/ids.ts";
import type { TimeStamp } from "../../kernel/timestamp.ts";
import type { PatientId } from "../../registry/value-objects/patient_id.ts";

// ---------------------------------------------------------------------------
// Sub-types
// ---------------------------------------------------------------------------

/** A family member's education profile. */
export type EducationProfile = Readonly<{
  memberId: PersonId;
  canReadWrite: boolean;
  attendsSchool: boolean;
  educationLevelId: LookupId;
}>;

/** An occurrence in a social/educational program. */
export type ProgramOccurrence = Readonly<{
  memberId: PersonId;
  date: TimeStamp;
  effectId: LookupId;
  isSuspensionRequested: boolean;
}>;

// ---------------------------------------------------------------------------
// Main Type
// ---------------------------------------------------------------------------

/** Educational status of a patient's family unit. */
export type EducationalStatus = Readonly<{
  familyId: PatientId;
  memberProfiles: readonly EducationProfile[];
  programOccurrences: readonly ProgramOccurrence[];
}>;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** Creates an EducationalStatus. No validation — pure structural construction. */
export const createEducationalStatus = (
  params: Readonly<{
    familyId: PatientId;
    memberProfiles: readonly EducationProfile[];
    programOccurrences: readonly ProgramOccurrence[];
  }>,
): EducationalStatus => ({
  familyId: params.familyId,
  memberProfiles: params.memberProfiles,
  programOccurrences: params.programOccurrences,
});
