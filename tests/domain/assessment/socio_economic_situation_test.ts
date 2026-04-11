import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  SocioEconomicSituation,
  type SocioEconomicInput,
} from "../../../src/domain/assessment/value-objects/socio_economic_situation.ts";
import {
  SocialBenefitsCollection,
  type SocialBenefitsCollection as SocialBenefitsCollectionType,
} from "../../../src/domain/assessment/value-objects/social_benefits_collection.ts";
import { SocialBenefit } from "../../../src/domain/assessment/value-objects/social_benefit.ts";
import { PersonId } from "../../../src/domain/kernel/ids.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validPersonId = (PersonId("a1b2c3d4-e5f6-7890-abcd-ef1234567890") as { ok: true; value: ReturnType<typeof PersonId> extends { ok: true; value: infer V } ? V : never }).value;

const makeEmptyCollection = (): SocialBenefitsCollectionType => {
  const result = SocialBenefitsCollection([]);
  return (result as { ok: true; value: SocialBenefitsCollectionType }).value;
};

const makeNonEmptyCollection = (): SocialBenefitsCollectionType => {
  const benefitResult = SocialBenefit({
    benefitName: "BPC",
    amount: 1412,
    beneficiaryId: validPersonId,
  });
  const benefit = (benefitResult as { ok: true; value: ReturnType<typeof SocialBenefit> extends { ok: true; value: infer V } ? V : never }).value;
  const collResult = SocialBenefitsCollection([benefit]);
  return (collResult as { ok: true; value: SocialBenefitsCollectionType }).value;
};

const makeInput = (overrides?: Partial<SocioEconomicInput>): SocioEconomicInput => ({
  totalFamilyIncome: 3000,
  incomePerCapita: 750,
  receivesSocialBenefit: false,
  socialBenefits: makeEmptyCollection(),
  mainSourceOfIncome: "Emprego formal",
  hasUnemployed: false,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SocioEconomicSituation", () => {
  it("should create a valid SocioEconomicSituation without benefits", () => {
    const result = SocioEconomicSituation(makeInput());
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.totalFamilyIncome, 3000);
      assertEquals(result.value.incomePerCapita, 750);
      assertEquals(result.value.receivesSocialBenefit, false);
      assertEquals(result.value.mainSourceOfIncome, "Emprego formal");
      assertEquals(result.value.hasUnemployed, false);
    }
  });

  it("should create a valid SocioEconomicSituation with benefits", () => {
    const result = SocioEconomicSituation(
      makeInput({
        receivesSocialBenefit: true,
        socialBenefits: makeNonEmptyCollection(),
      }),
    );
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.receivesSocialBenefit, true);
      assertEquals(result.value.socialBenefits.items.length, 1);
    }
  });

  it("should return SES-003 when totalFamilyIncome is negative", () => {
    const result = SocioEconomicSituation(
      makeInput({ totalFamilyIncome: -1 }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SES-003");
    }
  });

  it("should return SES-004 when incomePerCapita is negative", () => {
    const result = SocioEconomicSituation(
      makeInput({ incomePerCapita: -1 }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SES-004");
    }
  });

  it("should return SES-006 when incomePerCapita exceeds totalFamilyIncome", () => {
    const result = SocioEconomicSituation(
      makeInput({
        totalFamilyIncome: 1000,
        incomePerCapita: 1001,
      }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SES-006");
    }
  });

  it("should return SES-005 when mainSourceOfIncome is empty after trim", () => {
    const result = SocioEconomicSituation(
      makeInput({ mainSourceOfIncome: "   " }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SES-005");
    }
  });

  it("should return SES-001 when receivesSocialBenefit is false but has benefits", () => {
    const result = SocioEconomicSituation(
      makeInput({
        receivesSocialBenefit: false,
        socialBenefits: makeNonEmptyCollection(),
      }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SES-001");
    }
  });

  it("should return SES-002 when receivesSocialBenefit is true but no benefits", () => {
    const result = SocioEconomicSituation(
      makeInput({
        receivesSocialBenefit: true,
        socialBenefits: makeEmptyCollection(),
      }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SES-002");
    }
  });

  it("should trim mainSourceOfIncome", () => {
    const result = SocioEconomicSituation(
      makeInput({ mainSourceOfIncome: "  Trabalho informal  " }),
    );
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.mainSourceOfIncome, "Trabalho informal");
    }
  });

  it("should accept zero income values", () => {
    const result = SocioEconomicSituation(
      makeInput({
        totalFamilyIncome: 0,
        incomePerCapita: 0,
      }),
    );
    assertEquals(result.ok, true);
  });
});
