// =============================================================================
// SocialBenefit — Value Object (Assessment)
// =============================================================================
// Represents a social benefit received by a person (e.g., BPC, Bolsa Familia).
// Normalization: benefitName is trimmed and internal whitespace collapsed.
// Validation: SB-001 (empty name after normalization), SB-002 (amount <= 0).
// =============================================================================

import type { PersonId } from "../../kernel/ids.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type SocialBenefit = Readonly<{
  benefitName: string;
  amount: number;
  beneficiaryId: PersonId;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** SB-001: benefitName empty after normalization | SB-002: amount <= 0 */
export type SocialBenefitError = "SB-001" | "SB-002";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type SocialBenefitInput = Readonly<{
  benefitName: string;
  amount: number;
  beneficiaryId: PersonId;
}>;

// ---------------------------------------------------------------------------
// Helpers (module-private)
// ---------------------------------------------------------------------------

const normalizeName = (raw: string): string =>
  raw.trim().replace(/\s+/g, " ");

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a SocialBenefit from raw input.
 * Validation order: benefitName (SB-001) -> amount (SB-002).
 */
export const SocialBenefit = (
  input: SocialBenefitInput,
): Result<SocialBenefit, SocialBenefitError> => {
  const normalizedName = normalizeName(input.benefitName);

  if (normalizedName.length === 0) {
    return err("SB-001");
  }

  if (input.amount <= 0) {
    return err("SB-002");
  }

  return ok({
    benefitName: normalizedName,
    amount: input.amount,
    beneficiaryId: input.beneficiaryId,
  });
};
