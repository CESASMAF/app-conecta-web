// =============================================================================
// SocioEconomicSituation — Value Object (Assessment)
// =============================================================================
// Captures the overall socio-economic profile of a family: total income,
// per-capita income, benefit flags, main income source, and unemployment flag.
// Validation (fail-first order):
//   SES-003: totalFamilyIncome < 0
//   SES-004: incomePerCapita < 0
//   SES-006: incomePerCapita > totalFamilyIncome
//   SES-005: mainSourceOfIncome empty after trim
//   SES-001: receivesSocialBenefit == false BUT socialBenefits is NOT empty
//   SES-002: receivesSocialBenefit == true BUT socialBenefits IS empty
// =============================================================================

import {
  type SocialBenefitsCollection,
  isEmpty,
} from "./social_benefits_collection.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export type SocioEconomicSituation = Readonly<{
  totalFamilyIncome: number;
  incomePerCapita: number;
  receivesSocialBenefit: boolean;
  socialBenefits: SocialBenefitsCollection;
  mainSourceOfIncome: string;
  hasUnemployed: boolean;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/**
 * SES-001: receivesSocialBenefit false but socialBenefits not empty
 * SES-002: receivesSocialBenefit true but socialBenefits empty
 * SES-003: totalFamilyIncome < 0
 * SES-004: incomePerCapita < 0
 * SES-005: mainSourceOfIncome empty after trim
 * SES-006: incomePerCapita > totalFamilyIncome
 */
export type SocioEconomicError =
  | "SES-001"
  | "SES-002"
  | "SES-003"
  | "SES-004"
  | "SES-005"
  | "SES-006";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type SocioEconomicInput = Readonly<{
  totalFamilyIncome: number;
  incomePerCapita: number;
  receivesSocialBenefit: boolean;
  socialBenefits: SocialBenefitsCollection;
  mainSourceOfIncome: string;
  hasUnemployed: boolean;
}>;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a SocioEconomicSituation.
 * Normalizes mainSourceOfIncome (trim).
 * Validation order follows fail-first as specified above.
 */
export const SocioEconomicSituation = (
  input: SocioEconomicInput,
): Result<SocioEconomicSituation, SocioEconomicError> => {
  // SES-003: totalFamilyIncome < 0
  if (input.totalFamilyIncome < 0) {
    return err("SES-003");
  }

  // SES-004: incomePerCapita < 0
  if (input.incomePerCapita < 0) {
    return err("SES-004");
  }

  // SES-006: incomePerCapita > totalFamilyIncome
  if (input.incomePerCapita > input.totalFamilyIncome) {
    return err("SES-006");
  }

  // SES-005: mainSourceOfIncome empty after trim
  const trimmedSource = input.mainSourceOfIncome.trim();
  if (trimmedSource.length === 0) {
    return err("SES-005");
  }

  // SES-001: receivesSocialBenefit == false BUT socialBenefits is NOT empty
  if (!input.receivesSocialBenefit && !isEmpty(input.socialBenefits)) {
    return err("SES-001");
  }

  // SES-002: receivesSocialBenefit == true BUT socialBenefits IS empty
  if (input.receivesSocialBenefit && isEmpty(input.socialBenefits)) {
    return err("SES-002");
  }

  return ok({
    totalFamilyIncome: input.totalFamilyIncome,
    incomePerCapita: input.incomePerCapita,
    receivesSocialBenefit: input.receivesSocialBenefit,
    socialBenefits: input.socialBenefits,
    mainSourceOfIncome: trimmedSource,
    hasUnemployed: input.hasUnemployed,
  });
};
