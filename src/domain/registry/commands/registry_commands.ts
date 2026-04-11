// =============================================================================
// Registry — Command Discriminated Union
// =============================================================================
// All commands targeting the Patient aggregate in the Registry BC.
// Each variant carries the minimum data needed for the operation.
// =============================================================================

import type { CreatePatientInput } from "../aggregates/patient/types.ts";
import type { PatientId } from "../value-objects/patient_id.ts";
import type { PersonId } from "../../kernel/ids.ts";
import type { FamilyMember } from "../entities/family_member.ts";
import type { SocialIdentity } from "../value-objects/social_identity.ts";

// ---------------------------------------------------------------------------
// Command Union
// ---------------------------------------------------------------------------

export type RegistryCommand =
  | Readonly<{ type: "RegisterPatient"; input: CreatePatientInput }>
  | Readonly<{
      type: "AddFamilyMember";
      patientId: PatientId;
      member: FamilyMember;
    }>
  | Readonly<{
      type: "RemoveFamilyMember";
      patientId: PatientId;
      personId: PersonId;
    }>
  | Readonly<{
      type: "AssignPrimaryCaregiver";
      patientId: PatientId;
      personId: PersonId;
    }>
  | Readonly<{
      type: "UpdateSocialIdentity";
      patientId: PatientId;
      identity: SocialIdentity;
    }>;
