// =============================================================================
// SocialBenefitsCollection — Value Object (Assessment)
// =============================================================================
// Aggregates a list of SocialBenefit items with uniqueness constraint.
// Validation: SBC-002 (duplicate benefitName — exact match after normalization).
// Computed helpers: isEmpty, count, totalAmount.
// =============================================================================

import type { SocialBenefit } from "./social_benefit.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type SocialBenefitsCollection = Readonly<{
  items: readonly SocialBenefit[];
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** SBC-002: duplicate benefitName in collection */
export type SocialBenefitsCollectionError = "SBC-002";

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Creates a SocialBenefitsCollection from already-validated SocialBenefit items.
 * Checks for duplicate benefitName (exact match — names are already normalized).
 */
export const SocialBenefitsCollection = (
  items: readonly SocialBenefit[],
): Result<SocialBenefitsCollection, SocialBenefitsCollectionError> => {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.benefitName)) {
      return err("SBC-002");
    }
    seen.add(item.benefitName);
  }

  return ok({ items });
};

// ---------------------------------------------------------------------------
// Computed Helpers (pure functions)
// ---------------------------------------------------------------------------

export const isEmpty = (collection: SocialBenefitsCollection): boolean =>
  collection.items.length === 0;

export const count = (collection: SocialBenefitsCollection): number =>
  collection.items.length;

export const totalAmount = (collection: SocialBenefitsCollection): number =>
  collection.items.reduce((sum, item) => sum + item.amount, 0);
