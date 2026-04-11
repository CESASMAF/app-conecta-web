import { assertEquals } from "@std/assert";
import {
  ReferralId,
  generateReferralId,
} from "../../../src/domain/protection/value-objects/referral_id.ts";

// =============================================================================
// ReferralId Smart Constructor — Happy Path
// =============================================================================

Deno.test("ReferralId - valid lowercase UUID returns Ok", () => {
  const result = ReferralId("550e8400-e29b-41d4-a716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("ReferralId - valid uppercase UUID normalizes to lowercase", () => {
  const result = ReferralId("550E8400-E29B-41D4-A716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("ReferralId - UUID with leading/trailing spaces trims", () => {
  const result = ReferralId("  550e8400-e29b-41d4-a716-446655440000  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

// =============================================================================
// ReferralId Smart Constructor — Error Path
// =============================================================================

Deno.test("ReferralId - empty string returns RI-001", () => {
  const result = ReferralId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RI-001");
  }
});

Deno.test("ReferralId - invalid format returns RI-001", () => {
  const result = ReferralId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RI-001");
  }
});

// =============================================================================
// Generator
// =============================================================================

Deno.test("generateReferralId - returns valid ReferralId", () => {
  const id = generateReferralId();
  const result = ReferralId(id as unknown as string);
  assertEquals(result.ok, true);
});
