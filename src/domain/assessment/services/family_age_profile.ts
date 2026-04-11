// =============================================================================
// FamilyAgeProfileService — Pure functions for family age distribution.
// =============================================================================
// Pure functions only — no side effects. Domain service receives data, returns computed
// values. Uses yearsAt from kernel/timestamp for age calculation.
// =============================================================================

import type { TimeStamp } from "../../kernel/timestamp.ts";
import { yearsAt } from "../../kernel/timestamp.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgeDistribution = Readonly<{
  range0to6: number;
  range7to14: number;
  range15to17: number;
  range18to29: number;
  range30to59: number;
  range60to64: number;
  range65to69: number;
  range70Plus: number;
  totalMembers: number;
}>;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const emptyDistribution: AgeDistribution = {
  range0to6: 0,
  range7to14: 0,
  range15to17: 0,
  range18to29: 0,
  range30to59: 0,
  range60to64: 0,
  range65to69: 0,
  range70Plus: 0,
  totalMembers: 0,
};

/** Maps an age to the corresponding bucket key. */
const ageToBucket = (age: number): keyof Omit<AgeDistribution, "totalMembers"> => {
  if (age <= 6) return "range0to6";
  if (age <= 14) return "range7to14";
  if (age <= 17) return "range15to17";
  if (age <= 29) return "range18to29";
  if (age <= 59) return "range30to59";
  if (age <= 64) return "range60to64";
  if (age <= 69) return "range65to69";
  return "range70Plus";
};

/**
 * Calculates age distribution from family member birth dates.
 * Each birth date is bucketed into the appropriate age range using
 * yearsAt(birthDate, referenceDate).
 */
export const calculateAgeDistribution = (
  birthDates: readonly TimeStamp[],
  referenceDate: TimeStamp,
): AgeDistribution =>
  birthDates.reduce<AgeDistribution>((dist, bd) => {
    const age = yearsAt(bd, referenceDate);
    const bucket = ageToBucket(age);
    return { ...dist, [bucket]: dist[bucket] + 1, totalMembers: dist.totalMembers + 1 };
  }, emptyDistribution);
