// =============================================================================
// Patient — Domain Events (Registry Bounded Context)
// =============================================================================
// Discriminated union of all events emitted by the Patient aggregate.
// Past-tense naming. Each event carries the minimum data needed for consumers.
// =============================================================================

import type { Patient } from "./types.ts";
import type { PatientId } from "../../value-objects/patient_id.ts";
import type { PersonId } from "../../../kernel/ids.ts";
import type { FamilyMember } from "../../entities/family_member.ts";
import type { SocialIdentity } from "../../value-objects/social_identity.ts";
import type { TimeStamp } from "../../../kernel/timestamp.ts";

// ---------------------------------------------------------------------------
// Event Union
// ---------------------------------------------------------------------------

export type PatientEvent =
  | Readonly<{
      type: "PatientRegistered";
      patient: Patient;
      at: TimeStamp;
    }>
  | Readonly<{
      type: "FamilyMemberAdded";
      patientId: PatientId;
      member: FamilyMember;
      at: TimeStamp;
    }>
  | Readonly<{
      type: "FamilyMemberRemoved";
      patientId: PatientId;
      personId: PersonId;
      at: TimeStamp;
    }>
  | Readonly<{
      type: "PrimaryCaregiverAssigned";
      patientId: PatientId;
      personId: PersonId;
      at: TimeStamp;
    }>
  | Readonly<{
      type: "SocialIdentityUpdated";
      patientId: PatientId;
      identity: SocialIdentity;
      at: TimeStamp;
    }>;
