import { assertEquals } from "@std/assert";
import {
  createEducationalStatus,
  type EducationProfile,
  type ProgramOccurrence,
} from "../../../src/domain/assessment/value-objects/educational_status.ts";
import { generatePersonId, LookupId, type LookupId as LookupIdType } from "../../../src/domain/kernel/ids.ts";
import { generatePatientId } from "../../../src/domain/registry/value-objects/patient_id.ts";
import { TimeStamp, type TimeStamp as TimeStampType } from "../../../src/domain/kernel/timestamp.ts";

// =============================================================================
// Helpers — branded test values
// =============================================================================

const familyId = generatePatientId();
const memberId1 = generatePersonId();
const memberId2 = generatePersonId();

const unwrapLookupId = (raw: string): LookupIdType => {
  const r = LookupId(raw);
  if (!r.ok) throw new Error(`Test setup failed for LookupId: ${raw}`);
  return r.value;
};

const unwrapTimeStamp = (raw: string): TimeStampType => {
  const r = TimeStamp(raw);
  if (!r.ok) throw new Error(`Test setup failed for TimeStamp: ${raw}`);
  return r.value;
};

const lookupId1 = unwrapLookupId("c0000000-0000-0000-0000-000000000001");
const lookupId2 = unwrapLookupId("c0000000-0000-0000-0000-000000000002");
const timestamp1 = unwrapTimeStamp("2025-06-15T10:30:00.000Z");

// =============================================================================
// EducationalStatus — Factory
// =============================================================================

Deno.test("createEducationalStatus - creates with profiles and occurrences", () => {
  const profile: EducationProfile = {
    memberId: memberId1,
    canReadWrite: true,
    attendsSchool: true,
    educationLevelId: lookupId1,
  };

  const occurrence: ProgramOccurrence = {
    memberId: memberId1,
    date: timestamp1,
    effectId: lookupId2,
    isSuspensionRequested: false,
  };

  const status = createEducationalStatus({
    familyId,
    memberProfiles: [profile],
    programOccurrences: [occurrence],
  });

  assertEquals(status.familyId, familyId);
  assertEquals(status.memberProfiles.length, 1);
  assertEquals(status.memberProfiles[0]?.memberId, memberId1);
  assertEquals(status.memberProfiles[0]?.canReadWrite, true);
  assertEquals(status.memberProfiles[0]?.attendsSchool, true);
  assertEquals(status.memberProfiles[0]?.educationLevelId, lookupId1);
  assertEquals(status.programOccurrences.length, 1);
  assertEquals(status.programOccurrences[0]?.date, timestamp1);
  assertEquals(status.programOccurrences[0]?.effectId, lookupId2);
  assertEquals(status.programOccurrences[0]?.isSuspensionRequested, false);
});

Deno.test("createEducationalStatus - creates with empty arrays", () => {
  const status = createEducationalStatus({
    familyId,
    memberProfiles: [],
    programOccurrences: [],
  });

  assertEquals(status.familyId, familyId);
  assertEquals(status.memberProfiles.length, 0);
  assertEquals(status.programOccurrences.length, 0);
});

Deno.test("createEducationalStatus - multiple profiles preserve all fields", () => {
  const profile1: EducationProfile = {
    memberId: memberId1,
    canReadWrite: true,
    attendsSchool: true,
    educationLevelId: lookupId1,
  };

  const profile2: EducationProfile = {
    memberId: memberId2,
    canReadWrite: false,
    attendsSchool: false,
    educationLevelId: lookupId2,
  };

  const status = createEducationalStatus({
    familyId,
    memberProfiles: [profile1, profile2],
    programOccurrences: [],
  });

  assertEquals(status.memberProfiles.length, 2);
  assertEquals(status.memberProfiles[0]?.canReadWrite, true);
  assertEquals(status.memberProfiles[1]?.canReadWrite, false);
  assertEquals(status.memberProfiles[1]?.attendsSchool, false);
});

Deno.test("createEducationalStatus - program occurrence with suspension requested", () => {
  const occurrence: ProgramOccurrence = {
    memberId: memberId1,
    date: timestamp1,
    effectId: lookupId1,
    isSuspensionRequested: true,
  };

  const status = createEducationalStatus({
    familyId,
    memberProfiles: [],
    programOccurrences: [occurrence],
  });

  assertEquals(status.programOccurrences[0]?.isSuspensionRequested, true);
  assertEquals(status.programOccurrences[0]?.memberId, memberId1);
});
