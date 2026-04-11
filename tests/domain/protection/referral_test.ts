import { assertEquals } from "@std/assert";
import { createReferral, transitionStatus } from "../../../src/domain/protection/aggregates/referral/operations.ts";
import { generateReferralId } from "../../../src/domain/protection/value-objects/referral_id.ts";
import { generatePersonId, generateProfessionalId } from "../../../src/domain/kernel/ids.ts";
import { TimeStamp, now as tsNow } from "../../../src/domain/kernel/timestamp.ts";
import type { CreateReferralInput } from "../../../src/domain/protection/aggregates/referral/types.ts";
import type { DestinationService } from "../../../src/domain/protection/value-objects/destination_service.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const pastDate = (): ReturnType<typeof TimeStamp> => TimeStamp("2024-01-15T10:00:00.000Z");

const futureDate = (): ReturnType<typeof TimeStamp> => TimeStamp("2099-12-31T23:59:59.999Z");

const validInput = (): CreateReferralInput => {
  const dateResult = pastDate();
  if (!dateResult.ok) throw new Error("Test setup: invalid date");
  return {
    id: generateReferralId(),
    date: dateResult.value,
    requestingProfessionalId: generateProfessionalId(),
    referredPersonId: generatePersonId(),
    destinationService: "CRAS" as DestinationService,
    reason: "Patient needs social assistance",
  };
};

// =============================================================================
// createReferral — Happy Path
// =============================================================================

Deno.test("createReferral - valid input returns Ok with PENDING status", () => {
  const input = validInput();
  const result = createReferral(input);

  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.id, input.id);
    assertEquals(result.value.date, input.date);
    assertEquals(result.value.requestingProfessionalId, input.requestingProfessionalId);
    assertEquals(result.value.referredPersonId, input.referredPersonId);
    assertEquals(result.value.destinationService, input.destinationService);
    assertEquals(result.value.reason, input.reason);
    assertEquals(result.value.status, "PENDING");
  }
});

// =============================================================================
// createReferral — Error Paths
// =============================================================================

Deno.test("createReferral - future date returns REF-001", () => {
  const dateResult = futureDate();
  if (!dateResult.ok) throw new Error("Test setup: invalid date");
  const input: CreateReferralInput = {
    ...validInput(),
    date: dateResult.value,
  };

  const result = createReferral(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "REF-001");
});

Deno.test("createReferral - empty reason returns REF-002", () => {
  const input: CreateReferralInput = {
    ...validInput(),
    reason: "",
  };

  const result = createReferral(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "REF-002");
});

Deno.test("createReferral - whitespace-only reason returns REF-002", () => {
  const input: CreateReferralInput = {
    ...validInput(),
    reason: "   ",
  };

  const result = createReferral(input);
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "REF-002");
});

// =============================================================================
// transitionStatus — Valid Transitions
// =============================================================================

Deno.test("transitionStatus - PENDING → COMPLETED returns Ok", () => {
  const input = validInput();
  const createResult = createReferral(input);
  if (!createResult.ok) throw new Error("Test setup: create failed");

  const result = transitionStatus(createResult.value, "COMPLETED");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.status, "COMPLETED");
});

Deno.test("transitionStatus - PENDING → CANCELLED returns Ok", () => {
  const input = validInput();
  const createResult = createReferral(input);
  if (!createResult.ok) throw new Error("Test setup: create failed");

  const result = transitionStatus(createResult.value, "CANCELLED");
  assertEquals(result.ok, true);
  if (result.ok) assertEquals(result.value.status, "CANCELLED");
});

// =============================================================================
// transitionStatus — Invalid Transitions
// =============================================================================

Deno.test("transitionStatus - COMPLETED → PENDING returns REF-003", () => {
  const input = validInput();
  const createResult = createReferral(input);
  if (!createResult.ok) throw new Error("Test setup: create failed");

  const completedResult = transitionStatus(createResult.value, "COMPLETED");
  if (!completedResult.ok) throw new Error("Test setup: transition failed");

  const result = transitionStatus(completedResult.value, "PENDING");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "REF-003");
});

Deno.test("transitionStatus - CANCELLED → COMPLETED returns REF-003", () => {
  const input = validInput();
  const createResult = createReferral(input);
  if (!createResult.ok) throw new Error("Test setup: create failed");

  const cancelledResult = transitionStatus(createResult.value, "CANCELLED");
  if (!cancelledResult.ok) throw new Error("Test setup: transition failed");

  const result = transitionStatus(cancelledResult.value, "COMPLETED");
  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "REF-003");
});
