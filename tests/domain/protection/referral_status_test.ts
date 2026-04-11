import { assertEquals } from "@std/assert";
import {
  ReferralStatus,
  INITIAL_REFERRAL_STATUS,
  transitionReferralStatus,
} from "../../../src/domain/protection/value-objects/referral_status.ts";

// =============================================================================
// ReferralStatus Smart Constructor — Happy Path (all 3 values)
// =============================================================================

Deno.test("ReferralStatus - PENDING returns Ok", () => {
  const result = ReferralStatus("PENDING");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "PENDING");
});

Deno.test("ReferralStatus - COMPLETED returns Ok", () => {
  const result = ReferralStatus("COMPLETED");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "COMPLETED");
});

Deno.test("ReferralStatus - CANCELLED returns Ok", () => {
  const result = ReferralStatus("CANCELLED");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "CANCELLED");
});

// =============================================================================
// ReferralStatus Smart Constructor — Error Path
// =============================================================================

Deno.test("ReferralStatus - INVALID returns RS-001", () => {
  const result = ReferralStatus("INVALID");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RS-001");
});

// =============================================================================
// Initial State
// =============================================================================

Deno.test("INITIAL_REFERRAL_STATUS - is PENDING", () => {
  assertEquals(INITIAL_REFERRAL_STATUS, "PENDING");
});

// =============================================================================
// Transitions — Valid
// =============================================================================

Deno.test("transitionReferralStatus - PENDING → COMPLETED returns Ok", () => {
  const result = transitionReferralStatus("PENDING", "COMPLETED");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "COMPLETED");
});

Deno.test("transitionReferralStatus - PENDING → CANCELLED returns Ok", () => {
  const result = transitionReferralStatus("PENDING", "CANCELLED");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value, "CANCELLED");
});

// =============================================================================
// Transitions — Invalid (terminal states)
// =============================================================================

Deno.test("transitionReferralStatus - COMPLETED → PENDING returns RS-002", () => {
  const result = transitionReferralStatus("COMPLETED", "PENDING");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RS-002");
});

Deno.test("transitionReferralStatus - CANCELLED → COMPLETED returns RS-002", () => {
  const result = transitionReferralStatus("CANCELLED", "COMPLETED");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RS-002");
});
