// HousingAnalyticsService — Pure functions for housing density calculations.
// Pure functions only — no side effects. Domain service receives data, returns computed values.

/**
 * Calculates bedroom occupancy density.
 * memberCount = max(totalFamilyMembers, 1), bedroomCount = max(numberOfBedrooms, 1).
 */
export const density = (
  totalFamilyMembers: number,
  numberOfBedrooms: number,
): number => {
  const memberCount = Math.max(totalFamilyMembers, 1);
  const bedroomCount = Math.max(numberOfBedrooms, 1);
  return memberCount / bedroomCount;
};

/**
 * Returns true when density exceeds 3.0 (strictly greater than).
 */
export const isOvercrowded = (
  totalFamilyMembers: number,
  numberOfBedrooms: number,
): boolean => density(totalFamilyMembers, numberOfBedrooms) > 3.0;
