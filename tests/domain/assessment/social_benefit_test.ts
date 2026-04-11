import { assertEquals } from "@std/assert";
import { SocialBenefit } from "../../../src/domain/assessment/value-objects/social_benefit.ts";
import { generatePersonId } from "../../../src/domain/kernel/ids.ts";

// =============================================================================
// Helpers
// =============================================================================

const validInput = () => ({
  benefitName: "Bolsa Familia",
  amount: 600,
  beneficiaryId: generatePersonId(),
});

// =============================================================================
// SocialBenefit Smart Constructor — Happy Path
// =============================================================================

Deno.test("SocialBenefit - valid input returns Ok", () => {
  const input = validInput();
  const result = SocialBenefit(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.benefitName, "Bolsa Familia");
    assertEquals(result.value.amount, 600);
    assertEquals(result.value.beneficiaryId, input.beneficiaryId);
  }
});

Deno.test("SocialBenefit - trims and collapses whitespace in name", () => {
  const input = { ...validInput(), benefitName: "  Bolsa   Familia  " };
  const result = SocialBenefit(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.benefitName, "Bolsa Familia");
  }
});

Deno.test("SocialBenefit - fractional amount is valid", () => {
  const input = { ...validInput(), amount: 0.01 };
  const result = SocialBenefit(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.amount, 0.01);
  }
});

// =============================================================================
// SocialBenefit Smart Constructor — Error Path
// =============================================================================

Deno.test("SocialBenefit - empty name returns SB-001", () => {
  const input = { ...validInput(), benefitName: "" };
  const result = SocialBenefit(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SB-001");
  }
});

Deno.test("SocialBenefit - whitespace-only name returns SB-001", () => {
  const input = { ...validInput(), benefitName: "   " };
  const result = SocialBenefit(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SB-001");
  }
});

Deno.test("SocialBenefit - zero amount returns SB-002", () => {
  const input = { ...validInput(), amount: 0 };
  const result = SocialBenefit(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SB-002");
  }
});

Deno.test("SocialBenefit - negative amount returns SB-002", () => {
  const input = { ...validInput(), amount: -100 };
  const result = SocialBenefit(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SB-002");
  }
});
