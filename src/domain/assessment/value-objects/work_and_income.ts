// =============================================================================
// WorkAndIncome — Value Object (Assessment)
// =============================================================================
// Captures the income and employment profile of a family. Each member may have
// an individual income entry (occupation + monthly amount + work-card status).
// The aggregate also tracks social benefits and retired-member flags.
// Validation: WI-001 (some individualIncome.monthlyAmount < 0).
// =============================================================================

import type { PersonId, LookupId } from "../../kernel/ids.ts";
import type { PatientId } from "../../registry/value-objects/patient_id.ts";
import type { SocialBenefit } from "./social_benefit.ts";
import { type Result, ok, err } from "../../shared/result.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IndividualIncome = Readonly<{
  memberId: PersonId;
  occupationId: LookupId;
  hasWorkCard: boolean;
  monthlyAmount: number;
}>;

export type WorkAndIncome = Readonly<{
  familyId: PatientId;
  individualIncomes: readonly IndividualIncome[];
  socialBenefits: readonly SocialBenefit[];
  hasRetiredMembers: boolean;
}>;

// ---------------------------------------------------------------------------
// Error Union
// ---------------------------------------------------------------------------

/** WI-001: some individualIncome.monthlyAmount < 0 */
export type WorkAndIncomeError = "WI-001";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type WorkAndIncomeInput = Readonly<{
  familyId: PatientId;
  individualIncomes: readonly IndividualIncome[];
  socialBenefits: readonly SocialBenefit[];
  hasRetiredMembers: boolean;
}>;

// ---------------------------------------------------------------------------
// Smart Constructor
// ---------------------------------------------------------------------------

/**
 * Validates and creates a WorkAndIncome value object.
 * Validation: every individualIncome.monthlyAmount must be >= 0 (WI-001).
 */
export const WorkAndIncome = (
  input: WorkAndIncomeInput,
): Result<WorkAndIncome, WorkAndIncomeError> => {
  for (const income of input.individualIncomes) {
    if (income.monthlyAmount < 0) {
      return err("WI-001");
    }
  }

  return ok({
    familyId: input.familyId,
    individualIncomes: input.individualIncomes,
    socialBenefits: input.socialBenefits,
    hasRetiredMembers: input.hasRetiredMembers,
  });
};
