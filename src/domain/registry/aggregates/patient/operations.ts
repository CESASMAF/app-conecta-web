// =============================================================================
// Patient — Aggregate Operations (Registry Bounded Context)
// =============================================================================
// Pure functions that enforce Patient aggregate invariants.
// Every mutation returns a new Patient copy via spread (no mutation).
//
// Invariants enforced:
//   PAT-001: diagnoses cannot be empty at creation
//   PAT-002: exactly one PR in family members
//   PAT-003: no duplicate member by personId
//   PAT-004: no second PR when adding member
//   PAT-005: member must exist for removal/promotion
// =============================================================================

import type { Patient, CreatePatientInput } from "./types.ts";
import type { FamilyMember } from "../../entities/family_member.ts";
import type { SocialIdentity } from "../../value-objects/social_identity.ts";
import type { PersonId } from "../../../kernel/ids.ts";
import type { LookupId } from "../../../kernel/ids.ts";
import type { PatientError } from "../../errors.ts";
import { type Result, ok, err } from "../../../shared/result.ts";

// ---------------------------------------------------------------------------
// Helpers (module-private)
// ---------------------------------------------------------------------------

const countPR = (
  members: readonly FamilyMember[],
  prRelationshipId: LookupId,
): number =>
  members.filter((m) => m.relationshipId === prRelationshipId).length;

const hasMember = (
  members: readonly FamilyMember[],
  personId: PersonId,
): boolean => members.some((m) => m.personId === personId);

// ---------------------------------------------------------------------------
// createPatient
// ---------------------------------------------------------------------------

/**
 * Creates a new Patient aggregate from validated input.
 * Enforces PAT-001 (non-empty diagnoses) and PAT-002 (exactly one PR).
 */
export const createPatient = (
  input: CreatePatientInput,
): Result<Patient, PatientError> => {
  // PAT-001: diagnoses cannot be empty
  if (input.diagnoses.length === 0) {
    return err("PAT-001");
  }

  // PAT-002: exactly one PR
  const prCount = countPR(input.familyMembers, input.prRelationshipId);
  if (prCount !== 1) {
    return err("PAT-002");
  }

  return ok({
    id: input.id,
    personId: input.personId,
    personalData: input.personalData,
    civilDocuments: input.civilDocuments,
    socialIdentity: input.socialIdentity,
    address: input.address,
    diagnoses: input.diagnoses,
    familyMembers: input.familyMembers,
    cns: input.cns,
    version: 0,
  });
};

// ---------------------------------------------------------------------------
// addFamilyMember
// ---------------------------------------------------------------------------

/**
 * Adds a family member to the Patient aggregate.
 * Enforces PAT-003 (no duplicate personId) and PAT-004 (no second PR).
 *
 * prRelationshipId is needed to detect PR role.
 */
export const addFamilyMember = (
  patient: Patient,
  member: FamilyMember,
  prRelationshipId: LookupId,
): Result<Patient, PatientError> => {
  // PAT-003: no duplicate by personId
  if (hasMember(patient.familyMembers, member.personId)) {
    return err("PAT-003");
  }

  // PAT-004: no second PR
  const currentPRCount = countPR(patient.familyMembers, prRelationshipId);
  const newIsPR = member.relationshipId === prRelationshipId;
  if (newIsPR && currentPRCount >= 1) {
    return err("PAT-004");
  }

  return ok({
    ...patient,
    familyMembers: [...patient.familyMembers, member],
  });
};

// ---------------------------------------------------------------------------
// removeFamilyMember
// ---------------------------------------------------------------------------

/**
 * Removes a family member by personId.
 * Enforces PAT-005 (member must exist) and PAT-002 (PR must remain after removal).
 *
 * prRelationshipId is needed to verify PR invariant post-removal.
 */
export const removeFamilyMember = (
  patient: Patient,
  personId: PersonId,
  prRelationshipId: LookupId,
): Result<Patient, PatientError> => {
  // PAT-005: member must exist
  if (!hasMember(patient.familyMembers, personId)) {
    return err("PAT-005");
  }

  const remaining = patient.familyMembers.filter(
    (m) => m.personId !== personId,
  );

  // PAT-002: must still have exactly one PR after removal
  const prCount = countPR(remaining, prRelationshipId);
  if (prCount !== 1) {
    return err("PAT-002");
  }

  return ok({
    ...patient,
    familyMembers: remaining,
  });
};

// ---------------------------------------------------------------------------
// assignPrimaryCaregiver
// ---------------------------------------------------------------------------

/**
 * Assigns a family member as primary caregiver.
 * Enforces PAT-005 (member must exist).
 * Unsets isPrimaryCaregiver on all other members, sets it on the target.
 */
export const assignPrimaryCaregiver = (
  patient: Patient,
  personId: PersonId,
): Result<Patient, PatientError> => {
  // PAT-005: member must exist
  if (!hasMember(patient.familyMembers, personId)) {
    return err("PAT-005");
  }

  const updated = patient.familyMembers.map((m) => ({
    ...m,
    isPrimaryCaregiver: m.personId === personId,
  }));

  return ok({
    ...patient,
    familyMembers: updated,
  });
};

// ---------------------------------------------------------------------------
// updateSocialIdentity
// ---------------------------------------------------------------------------

/**
 * Updates the patient's social identity.
 * No invariant to enforce — always succeeds.
 */
export const updateSocialIdentity = (
  patient: Patient,
  identity: SocialIdentity,
): Patient => ({
  ...patient,
  socialIdentity: identity,
});

// ---------------------------------------------------------------------------
// isInBoundary
// ---------------------------------------------------------------------------

/**
 * Checks if a person belongs to the aggregate boundary.
 * A person is in boundary if they are the patient themselves or a family member.
 * Used for PAT-006 (referrals) and PAT-007 (violations).
 */
export const isInBoundary = (
  patient: Patient,
  personId: PersonId,
): boolean =>
  patient.personId === personId ||
  hasMember(patient.familyMembers, personId);
