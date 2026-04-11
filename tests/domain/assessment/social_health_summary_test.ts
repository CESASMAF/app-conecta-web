import { assertEquals } from "@std/assert";
import { SocialHealthSummary } from "../../../src/domain/assessment/value-objects/social_health_summary.ts";

// =============================================================================
// Helpers
// =============================================================================

const validInput = () => ({
  requiresConstantCare: true,
  hasMobilityImpairment: false,
  functionalDependencies: ["Alimentacao", "Higiene"],
  hasRelevantDrugTherapy: true,
});

// =============================================================================
// SocialHealthSummary Smart Constructor — Happy Path
// =============================================================================

Deno.test("SocialHealthSummary - valid input returns Ok", () => {
  const result = SocialHealthSummary(validInput());
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.requiresConstantCare, true);
    assertEquals(result.value.hasMobilityImpairment, false);
    assertEquals(result.value.functionalDependencies, ["Alimentacao", "Higiene"]);
    assertEquals(result.value.hasRelevantDrugTherapy, true);
  }
});

Deno.test("SocialHealthSummary - all booleans false is valid", () => {
  const input = {
    requiresConstantCare: false,
    hasMobilityImpairment: false,
    functionalDependencies: [],
    hasRelevantDrugTherapy: false,
  };
  const result = SocialHealthSummary(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.requiresConstantCare, false);
    assertEquals(result.value.hasMobilityImpairment, false);
    assertEquals(result.value.functionalDependencies.length, 0);
    assertEquals(result.value.hasRelevantDrugTherapy, false);
  }
});

Deno.test("SocialHealthSummary - trims dependency items", () => {
  const input = {
    ...validInput(),
    functionalDependencies: ["  Alimentacao  ", "  Higiene  "],
  };
  const result = SocialHealthSummary(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.functionalDependencies, ["Alimentacao", "Higiene"]);
  }
});

Deno.test("SocialHealthSummary - removes empty items after trim", () => {
  const input = {
    ...validInput(),
    functionalDependencies: ["Alimentacao", "", "  ", "Higiene"],
  };
  const result = SocialHealthSummary(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.functionalDependencies, ["Alimentacao", "Higiene"]);
  }
});

Deno.test("SocialHealthSummary - deduplicates items", () => {
  const input = {
    ...validInput(),
    functionalDependencies: ["Alimentacao", "Higiene", "Alimentacao"],
  };
  const result = SocialHealthSummary(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.functionalDependencies, ["Alimentacao", "Higiene"]);
  }
});

Deno.test("SocialHealthSummary - deduplicates after trim", () => {
  const input = {
    ...validInput(),
    functionalDependencies: ["Alimentacao", "  Alimentacao  "],
  };
  const result = SocialHealthSummary(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.functionalDependencies, ["Alimentacao"]);
  }
});

Deno.test("SocialHealthSummary - empty array is valid", () => {
  const input = { ...validInput(), functionalDependencies: [] };
  const result = SocialHealthSummary(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.functionalDependencies.length, 0);
  }
});
