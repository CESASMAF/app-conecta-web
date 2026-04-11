import { assertEquals } from "@std/assert";
import {
  calculateEducationVulnerabilities,
  type MemberEducationData,
} from "../../../src/domain/assessment/services/education_analytics.ts";
import { TimeStamp, type TimeStamp as TimeStampType } from "../../../src/domain/kernel/timestamp.ts";

// =============================================================================
// Helpers
// =============================================================================

const unwrapTimeStamp = (raw: string): TimeStampType => {
  const r = TimeStamp(raw);
  if (!r.ok) throw new Error(`Test setup failed for TimeStamp: ${raw}`);
  return r.value;
};

const referenceDate = unwrapTimeStamp("2024-06-15T00:00:00.000Z");

/**
 * Creates a birth date that yields a specific age at referenceDate (2024-06-15).
 * Born on January 1 to avoid boundary month/day issues.
 */
const birthDateForAge = (age: number): TimeStampType =>
  unwrapTimeStamp(`${2024 - age}-01-01T00:00:00.000Z`);

const member = (
  age: number,
  attendsSchool: boolean,
  canReadWrite: boolean,
): MemberEducationData => ({
  birthDate: birthDateForAge(age),
  attendsSchool,
  canReadWrite,
});

// =============================================================================
// Tests — EducationAnalyticsService
// =============================================================================

Deno.test("calculateEducationVulnerabilities — empty array returns all zeros", () => {
  const result = calculateEducationVulnerabilities([], referenceDate);

  assertEquals(result.notInSchool_0to5, 0);
  assertEquals(result.notInSchool_6to14, 0);
  assertEquals(result.notInSchool_15to17, 0);
  assertEquals(result.illiteracy_10to17, 0);
  assertEquals(result.illiteracy_18to59, 0);
  assertEquals(result.illiteracy_60Plus, 0);
});

Deno.test("calculateEducationVulnerabilities — child age 4 not in school", () => {
  const result = calculateEducationVulnerabilities(
    [member(4, false, true)],
    referenceDate,
  );

  assertEquals(result.notInSchool_0to5, 1);
  assertEquals(result.notInSchool_6to14, 0);
});

Deno.test("calculateEducationVulnerabilities — child age 10 in school but cannot read", () => {
  const result = calculateEducationVulnerabilities(
    [member(10, true, false)],
    referenceDate,
  );

  assertEquals(result.illiteracy_10to17, 1);
  assertEquals(result.notInSchool_6to14, 0);
});

Deno.test("calculateEducationVulnerabilities — adult age 25 cannot read", () => {
  const result = calculateEducationVulnerabilities(
    [member(25, false, false)],
    referenceDate,
  );

  assertEquals(result.illiteracy_18to59, 1);
});

Deno.test("calculateEducationVulnerabilities — elder age 65 cannot read", () => {
  const result = calculateEducationVulnerabilities(
    [member(65, false, false)],
    referenceDate,
  );

  assertEquals(result.illiteracy_60Plus, 1);
});

Deno.test("calculateEducationVulnerabilities — all in school and literate returns all zeros", () => {
  const members = [
    member(3, true, true),
    member(10, true, true),
    member(16, true, true),
    member(25, true, true),
    member(65, true, true),
  ];

  const result = calculateEducationVulnerabilities(members, referenceDate);

  assertEquals(result.notInSchool_0to5, 0);
  assertEquals(result.notInSchool_6to14, 0);
  assertEquals(result.notInSchool_15to17, 0);
  assertEquals(result.illiteracy_10to17, 0);
  assertEquals(result.illiteracy_18to59, 0);
  assertEquals(result.illiteracy_60Plus, 0);
});

Deno.test("calculateEducationVulnerabilities — mixed family with multiple vulnerabilities", () => {
  const members = [
    member(4, false, true),    // notInSchool_0to5
    member(8, false, true),    // notInSchool_6to14
    member(16, false, false),  // notInSchool_15to17 + illiteracy_10to17
    member(30, true, false),   // illiteracy_18to59
    member(70, true, false),   // illiteracy_60Plus
  ];

  const result = calculateEducationVulnerabilities(members, referenceDate);

  assertEquals(result.notInSchool_0to5, 1);
  assertEquals(result.notInSchool_6to14, 1);
  assertEquals(result.notInSchool_15to17, 1);
  assertEquals(result.illiteracy_10to17, 1);
  assertEquals(result.illiteracy_18to59, 1);
  assertEquals(result.illiteracy_60Plus, 1);
});

Deno.test("calculateEducationVulnerabilities — age 10 not in school AND illiterate counted in both", () => {
  const result = calculateEducationVulnerabilities(
    [member(10, false, false)],
    referenceDate,
  );

  assertEquals(result.notInSchool_6to14, 1);
  assertEquals(result.illiteracy_10to17, 1);
});
