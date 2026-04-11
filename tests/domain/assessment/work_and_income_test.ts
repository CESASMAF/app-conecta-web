import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  WorkAndIncome,
  type WorkAndIncomeInput,
  type IndividualIncome,
} from "../../../src/domain/assessment/value-objects/work_and_income.ts";
import { PersonId, LookupId } from "../../../src/domain/kernel/ids.ts";
import { PatientId } from "../../../src/domain/registry/value-objects/patient_id.ts";
import { SocialBenefit } from "../../../src/domain/assessment/value-objects/social_benefit.ts";
import { ok, err } from "../../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validPersonId = (PersonId("a1b2c3d4-e5f6-7890-abcd-ef1234567890") as { ok: true; value: ReturnType<typeof PersonId> extends { ok: true; value: infer V } ? V : never }).value;
const validLookupId = (LookupId("b2c3d4e5-f6a7-8901-bcde-f12345678901") as { ok: true; value: ReturnType<typeof LookupId> extends { ok: true; value: infer V } ? V : never }).value;
const validPatientId = (PatientId("c3d4e5f6-a7b8-9012-cdef-123456789012") as { ok: true; value: ReturnType<typeof PatientId> extends { ok: true; value: infer V } ? V : never }).value;

const makeIncome = (overrides?: Partial<IndividualIncome>): IndividualIncome => ({
  memberId: validPersonId,
  occupationId: validLookupId,
  hasWorkCard: true,
  monthlyAmount: 1500,
  ...overrides,
});

const makeBenefit = () => {
  const result = SocialBenefit({
    benefitName: "Bolsa Familia",
    amount: 300,
    beneficiaryId: validPersonId,
  });
  return (result as { ok: true; value: ReturnType<typeof SocialBenefit> extends { ok: true; value: infer V } ? V : never }).value;
};

const makeInput = (overrides?: Partial<WorkAndIncomeInput>): WorkAndIncomeInput => ({
  familyId: validPatientId,
  individualIncomes: [makeIncome()],
  socialBenefits: [makeBenefit()],
  hasRetiredMembers: false,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WorkAndIncome", () => {
  it("should create a valid WorkAndIncome", () => {
    const result = WorkAndIncome(makeInput());
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.familyId, validPatientId);
      assertEquals(result.value.individualIncomes.length, 1);
      assertEquals(result.value.socialBenefits.length, 1);
      assertEquals(result.value.hasRetiredMembers, false);
    }
  });

  it("should return WI-001 when monthlyAmount is negative", () => {
    const result = WorkAndIncome(
      makeInput({
        individualIncomes: [makeIncome({ monthlyAmount: -100 })],
      }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "WI-001");
    }
  });

  it("should accept zero monthlyAmount", () => {
    const result = WorkAndIncome(
      makeInput({
        individualIncomes: [makeIncome({ monthlyAmount: 0 })],
      }),
    );
    assertEquals(result.ok, true);
  });

  it("should accept empty individualIncomes array", () => {
    const result = WorkAndIncome(
      makeInput({ individualIncomes: [] }),
    );
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.individualIncomes.length, 0);
    }
  });

  it("should preserve all fields correctly", () => {
    const income = makeIncome({ monthlyAmount: 2500, hasWorkCard: false });
    const result = WorkAndIncome(
      makeInput({
        individualIncomes: [income],
        hasRetiredMembers: true,
      }),
    );
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.individualIncomes[0]?.monthlyAmount, 2500);
      assertEquals(result.value.individualIncomes[0]?.hasWorkCard, false);
      assertEquals(result.value.hasRetiredMembers, true);
    }
  });

  it("should return WI-001 if any income in the list is negative", () => {
    const result = WorkAndIncome(
      makeInput({
        individualIncomes: [
          makeIncome({ monthlyAmount: 1000 }),
          makeIncome({ monthlyAmount: -1 }),
          makeIncome({ monthlyAmount: 500 }),
        ],
      }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "WI-001");
    }
  });
});
