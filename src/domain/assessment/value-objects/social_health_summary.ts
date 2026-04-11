// =============================================================================
// SocialHealthSummary — Value Object (Assessment)
// =============================================================================
// Captures a summary of a patient's health and functional status.
// Normalization: functionalDependencies items are trimmed, empties removed,
// and duplicates eliminated.
// Validation: SHS-001 (any item empty after trim — checked after normalization).
// =============================================================================

import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type SocialHealthSummary = Readonly<{
  requiresConstantCare: boolean;
  hasMobilityImpairment: boolean;
  functionalDependencies: readonly string[];
  hasRelevantDrugTherapy: boolean;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** SHS-001: functionalDependencies item is empty after trim */
export type SocialHealthSummaryError = "SHS-001";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type SocialHealthSummaryInput = Readonly<{
  requiresConstantCare: boolean;
  hasMobilityImpairment: boolean;
  functionalDependencies: readonly string[];
  hasRelevantDrugTherapy: boolean;
}>;

// ---------------------------------------------------------------------------
// Helpers (module-private)
// ---------------------------------------------------------------------------

/**
 * Normalizes functional dependencies:
 * 1. Trim each item
 * 2. Remove empty items
 * 3. Deduplicate (preserving first occurrence order)
 */
const normalizeDependencies = (items: readonly string[]): readonly string[] => {
  const trimmed = items.map((s) => s.trim());
  const nonEmpty = trimmed.filter((s) => s.length > 0);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of nonEmpty) {
    if (!seen.has(item)) {
      seen.add(item);
      unique.push(item);
    }
  }
  return unique;
};

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a SocialHealthSummary from raw input.
 * Normalizes functionalDependencies (trim, remove empty, deduplicate).
 * SHS-001 fires if any item remains empty after normalization (safety net).
 */
export const SocialHealthSummary = (
  input: SocialHealthSummaryInput,
): Result<SocialHealthSummary, SocialHealthSummaryError> => {
  const normalized = normalizeDependencies(input.functionalDependencies);

  // Safety net: verify no empty items after normalization
  for (const item of normalized) {
    if (item.length === 0) {
      return err("SHS-001");
    }
  }

  return ok({
    requiresConstantCare: input.requiresConstantCare,
    hasMobilityImpairment: input.hasMobilityImpairment,
    functionalDependencies: normalized,
    hasRelevantDrugTherapy: input.hasRelevantDrugTherapy,
  });
};
