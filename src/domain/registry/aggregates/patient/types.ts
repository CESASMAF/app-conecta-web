// =============================================================================
// Patient — Aggregate Root Type (Registry Bounded Context)
// =============================================================================
// The Patient aggregate is the central entity of the Registry BC.
// It clusters PersonalData, CivilDocuments, SocialIdentity, Address,
// Diagnoses, FamilyMembers, and an optional CNS.
//
// version: optimistic concurrency control token.
// =============================================================================

import type { PatientId } from "../../value-objects/patient_id.ts";
import type { PersonId } from "../../../kernel/ids.ts";
import type { PersonalData } from "../../value-objects/personal_data.ts";
import type { CivilDocuments } from "../../value-objects/civil_documents.ts";
import type { SocialIdentity } from "../../value-objects/social_identity.ts";
import type { Address } from "../../../kernel/address.ts";
import type { Diagnosis } from "../../../care/value-objects/diagnosis.ts";
import type { FamilyMember } from "../../entities/family_member.ts";
import type { CNS } from "../../../kernel/cns.ts";
import type { LookupId } from "../../../kernel/ids.ts";

// ---------------------------------------------------------------------------
// Aggregate Type
// ---------------------------------------------------------------------------

export type Patient = Readonly<{
  id: PatientId;
  personId: PersonId;
  personalData: PersonalData;
  civilDocuments: CivilDocuments;
  socialIdentity: SocialIdentity | undefined;
  address: Address;
  diagnoses: readonly Diagnosis[];
  familyMembers: readonly FamilyMember[];
  cns: CNS | undefined;
  version: number;
}>;

// ---------------------------------------------------------------------------
// Create Input
// ---------------------------------------------------------------------------

export type CreatePatientInput = Readonly<{
  id: PatientId;
  personId: PersonId;
  personalData: PersonalData;
  civilDocuments: CivilDocuments;
  socialIdentity: SocialIdentity | undefined;
  address: Address;
  diagnoses: readonly Diagnosis[];
  familyMembers: readonly FamilyMember[];
  cns: CNS | undefined;
  prRelationshipId: LookupId;
}>;
