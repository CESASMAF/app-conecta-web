import { assertEquals } from "@std/assert";
import { calculateAgeDistribution } from "../../../src/domain/assessment/services/family_age_profile.ts";
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

// =============================================================================
// Tests — FamilyAgeProfileService
// =============================================================================

Deno.test("calculateAgeDistribution — empty array returns all zeros", () => {
  const result = calculateAgeDistribution([], referenceDate);

  assertEquals(result.range0to6, 0);
  assertEquals(result.range7to14, 0);
  assertEquals(result.range15to17, 0);
  assertEquals(result.range18to29, 0);
  assertEquals(result.range30to59, 0);
  assertEquals(result.range60to64, 0);
  assertEquals(result.range65to69, 0);
  assertEquals(result.range70Plus, 0);
  assertEquals(result.totalMembers, 0);
});

Deno.test("calculateAgeDistribution — single child age 3 goes to range0to6", () => {
  const result = calculateAgeDistribution([birthDateForAge(3)], referenceDate);

  assertEquals(result.range0to6, 1);
  assertEquals(result.totalMembers, 1);
});

Deno.test("calculateAgeDistribution — single teen age 16 goes to range15to17", () => {
  const result = calculateAgeDistribution([birthDateForAge(16)], referenceDate);

  assertEquals(result.range15to17, 1);
  assertEquals(result.totalMembers, 1);
});

Deno.test("calculateAgeDistribution — single adult age 35 goes to range30to59", () => {
  const result = calculateAgeDistribution([birthDateForAge(35)], referenceDate);

  assertEquals(result.range30to59, 1);
  assertEquals(result.totalMembers, 1);
});

Deno.test("calculateAgeDistribution — single elder age 72 goes to range70Plus", () => {
  const result = calculateAgeDistribution([birthDateForAge(72)], referenceDate);

  assertEquals(result.range70Plus, 1);
  assertEquals(result.totalMembers, 1);
});

Deno.test("calculateAgeDistribution — mixed family distributes correctly", () => {
  const birthDates = [
    birthDateForAge(3),   // range0to6
    birthDateForAge(10),  // range7to14
    birthDateForAge(16),  // range15to17
    birthDateForAge(35),  // range30to59
    birthDateForAge(62),  // range60to64
    birthDateForAge(72),  // range70Plus
  ];

  const result = calculateAgeDistribution(birthDates, referenceDate);

  assertEquals(result.range0to6, 1);
  assertEquals(result.range7to14, 1);
  assertEquals(result.range15to17, 1);
  assertEquals(result.range18to29, 0);
  assertEquals(result.range30to59, 1);
  assertEquals(result.range60to64, 1);
  assertEquals(result.range65to69, 0);
  assertEquals(result.range70Plus, 1);
  assertEquals(result.totalMembers, 6);
});

Deno.test("calculateAgeDistribution — totalMembers equals sum of all buckets", () => {
  const birthDates = [
    birthDateForAge(1),
    birthDateForAge(8),
    birthDateForAge(15),
    birthDateForAge(20),
    birthDateForAge(40),
    birthDateForAge(61),
    birthDateForAge(67),
    birthDateForAge(75),
  ];

  const result = calculateAgeDistribution(birthDates, referenceDate);

  const sum =
    result.range0to6 +
    result.range7to14 +
    result.range15to17 +
    result.range18to29 +
    result.range30to59 +
    result.range60to64 +
    result.range65to69 +
    result.range70Plus;

  assertEquals(result.totalMembers, sum);
  assertEquals(result.totalMembers, 8);
});

Deno.test("calculateAgeDistribution — boundary: exactly 7 years old goes to range7to14", () => {
  // Born exactly 7 years before reference: 2017-06-15
  const exactlySeven = unwrapTimeStamp("2017-06-15T00:00:00.000Z");
  const result = calculateAgeDistribution([exactlySeven], referenceDate);

  assertEquals(result.range7to14, 1);
  assertEquals(result.range0to6, 0);
  assertEquals(result.totalMembers, 1);
});
