// =============================================================================
// EducationAnalyticsService — Pure functions for education vulnerability analysis.
// =============================================================================
// Pure functions only — no side effects. Domain service receives data, returns computed
// values. Uses yearsAt from kernel/timestamp for age calculation.
// =============================================================================

import type { TimeStamp } from "../../kernel/timestamp.ts";
import { yearsAt } from "../../kernel/timestamp.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemberEducationData = Readonly<{
  birthDate: TimeStamp;
  attendsSchool: boolean;
  canReadWrite: boolean;
}>;

export type EducationVulnerabilities = Readonly<{
  notInSchool_0to5: number;
  notInSchool_6to14: number;
  notInSchool_15to17: number;
  illiteracy_10to17: number;
  illiteracy_18to59: number;
  illiteracy_60Plus: number;
}>;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const emptyVulnerabilities: EducationVulnerabilities = {
  notInSchool_0to5: 0,
  notInSchool_6to14: 0,
  notInSchool_15to17: 0,
  illiteracy_10to17: 0,
  illiteracy_18to59: 0,
  illiteracy_60Plus: 0,
};

/** Determines which not-in-school bucket an age falls into, if any. */
const notInSchoolBucket = (age: number): keyof EducationVulnerabilities | undefined => {
  if (age >= 0 && age <= 5) return "notInSchool_0to5";
  if (age >= 6 && age <= 14) return "notInSchool_6to14";
  if (age >= 15 && age <= 17) return "notInSchool_15to17";
  return undefined;
};

/** Determines which illiteracy bucket an age falls into, if any. */
const illiteracyBucket = (age: number): keyof EducationVulnerabilities | undefined => {
  if (age >= 10 && age <= 17) return "illiteracy_10to17";
  if (age >= 18 && age <= 59) return "illiteracy_18to59";
  if (age >= 60) return "illiteracy_60Plus";
  return undefined;
};

/**
 * Calculates education vulnerabilities from family members' education data.
 * A member can be counted in multiple categories (e.g., age 10 not in school
 * AND illiterate counts in both notInSchool_6to14 and illiteracy_10to17).
 */
export const calculateEducationVulnerabilities = (
  members: readonly MemberEducationData[],
  referenceDate: TimeStamp,
): EducationVulnerabilities =>
  members.reduce<EducationVulnerabilities>((acc, member) => {
    const age = yearsAt(member.birthDate, referenceDate);
    const schoolBucket = !member.attendsSchool ? notInSchoolBucket(age) : undefined;
    const litBucket = !member.canReadWrite ? illiteracyBucket(age) : undefined;

    const afterSchool = schoolBucket !== undefined
      ? { ...acc, [schoolBucket]: acc[schoolBucket] + 1 }
      : acc;

    return litBucket !== undefined
      ? { ...afterSchool, [litBucket]: afterSchool[litBucket] + 1 }
      : afterSchool;
  }, emptyVulnerabilities);
