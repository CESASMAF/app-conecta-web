import { assertEquals } from "@std/assert";
import { SocialBenefit } from "../../../src/domain/assessment/value-objects/social_benefit.ts";
import {
  SocialBenefitsCollection,
  isEmpty,
  count,
  totalAmount,
} from "../../../src/domain/assessment/value-objects/social_benefits_collection.ts";
import { generatePersonId } from "../../../src/domain/kernel/ids.ts";

// =============================================================================
// Helpers
// =============================================================================

const makeBenefit = (name: string, amount: number) => {
  const result = SocialBenefit({
    benefitName: name,
    amount,
    beneficiaryId: generatePersonId(),
  });
  if (!result.ok) throw new Error(`Test setup failed for benefit: ${name}`);
  return result.value;
};

// =============================================================================
// SocialBenefitsCollection Smart Constructor — Happy Path
// =============================================================================

Deno.test("SocialBenefitsCollection - valid items returns Ok", () => {
  const items = [
    makeBenefit("Bolsa Familia", 600),
    makeBenefit("BPC", 1412),
  ];
  const result = SocialBenefitsCollection(items);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.items.length, 2);
  }
});

Deno.test("SocialBenefitsCollection - empty array returns Ok", () => {
  const result = SocialBenefitsCollection([]);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.items.length, 0);
  }
});

Deno.test("SocialBenefitsCollection - single item returns Ok", () => {
  const items = [makeBenefit("BPC", 1412)];
  const result = SocialBenefitsCollection(items);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.items.length, 1);
  }
});

// =============================================================================
// SocialBenefitsCollection Smart Constructor — Error Path
// =============================================================================

Deno.test("SocialBenefitsCollection - duplicate name returns SBC-002", () => {
  const items = [
    makeBenefit("Bolsa Familia", 600),
    makeBenefit("Bolsa Familia", 300),
  ];
  const result = SocialBenefitsCollection(items);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SBC-002");
  }
});

// =============================================================================
// Computed Helpers
// =============================================================================

Deno.test("SocialBenefitsCollection - isEmpty returns true for empty collection", () => {
  const result = SocialBenefitsCollection([]);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(isEmpty(result.value), true);
  }
});

Deno.test("SocialBenefitsCollection - isEmpty returns false for non-empty collection", () => {
  const items = [makeBenefit("BPC", 1412)];
  const result = SocialBenefitsCollection(items);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(isEmpty(result.value), false);
  }
});

Deno.test("SocialBenefitsCollection - count returns item count", () => {
  const items = [
    makeBenefit("Bolsa Familia", 600),
    makeBenefit("BPC", 1412),
  ];
  const result = SocialBenefitsCollection(items);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(count(result.value), 2);
  }
});

Deno.test("SocialBenefitsCollection - totalAmount sums all amounts", () => {
  const items = [
    makeBenefit("Bolsa Familia", 600),
    makeBenefit("BPC", 1412),
  ];
  const result = SocialBenefitsCollection(items);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(totalAmount(result.value), 2012);
  }
});

Deno.test("SocialBenefitsCollection - totalAmount returns 0 for empty collection", () => {
  const result = SocialBenefitsCollection([]);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(totalAmount(result.value), 0);
  }
});
