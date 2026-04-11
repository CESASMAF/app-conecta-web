import { assertEquals } from "@std/assert";
import { CommunitySupportNetwork } from "../../../src/domain/assessment/value-objects/community_support_network.ts";
import type { CommunitySupportNetworkInput } from "../../../src/domain/assessment/value-objects/community_support_network.ts";

// =============================================================================
// Helper — valid input
// =============================================================================

const validInput: CommunitySupportNetworkInput = {
  hasRelativeSupport: true,
  hasNeighborSupport: false,
  familyConflicts: "Occasional disputes over caregiving responsibilities",
  patientParticipatesInGroups: true,
  familyParticipatesInGroups: false,
  patientHasAccessToLeisure: true,
  facesDiscrimination: false,
};

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("CommunitySupportNetwork - valid input returns Ok with all fields preserved", () => {
  const result = CommunitySupportNetwork(validInput);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.hasRelativeSupport, true);
    assertEquals(result.value.hasNeighborSupport, false);
    assertEquals(result.value.familyConflicts, "Occasional disputes over caregiving responsibilities");
    assertEquals(result.value.patientParticipatesInGroups, true);
    assertEquals(result.value.familyParticipatesInGroups, false);
    assertEquals(result.value.patientHasAccessToLeisure, true);
    assertEquals(result.value.facesDiscrimination, false);
  }
});

Deno.test("CommunitySupportNetwork - familyConflicts is trimmed", () => {
  const result = CommunitySupportNetwork({
    ...validInput,
    familyConflicts: "  some conflict  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.familyConflicts, "some conflict");
  }
});

Deno.test("CommunitySupportNetwork - familyConflicts exactly 300 chars returns Ok", () => {
  const text = "A".repeat(300);
  const result = CommunitySupportNetwork({
    ...validInput,
    familyConflicts: text,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.familyConflicts.length, 300);
  }
});

Deno.test("CommunitySupportNetwork - all booleans true is valid", () => {
  const result = CommunitySupportNetwork({
    ...validInput,
    hasRelativeSupport: true,
    hasNeighborSupport: true,
    patientParticipatesInGroups: true,
    familyParticipatesInGroups: true,
    patientHasAccessToLeisure: true,
    facesDiscrimination: true,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.hasRelativeSupport, true);
    assertEquals(result.value.hasNeighborSupport, true);
    assertEquals(result.value.patientParticipatesInGroups, true);
    assertEquals(result.value.familyParticipatesInGroups, true);
    assertEquals(result.value.patientHasAccessToLeisure, true);
    assertEquals(result.value.facesDiscrimination, true);
  }
});

// =============================================================================
// CSN-001 — familyConflicts is empty or whitespace-only
// =============================================================================

Deno.test("CommunitySupportNetwork - empty string returns CSN-001", () => {
  const result = CommunitySupportNetwork({
    ...validInput,
    familyConflicts: "",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CSN-001");
  }
});

Deno.test("CommunitySupportNetwork - whitespace-only returns CSN-001", () => {
  const result = CommunitySupportNetwork({
    ...validInput,
    familyConflicts: "   ",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CSN-001");
  }
});

Deno.test("CommunitySupportNetwork - tabs and newlines only returns CSN-001", () => {
  const result = CommunitySupportNetwork({
    ...validInput,
    familyConflicts: "\t\n  \r\n",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CSN-001");
  }
});

// =============================================================================
// CSN-002 — familyConflicts exceeds 300 characters
// =============================================================================

Deno.test("CommunitySupportNetwork - 301 chars returns CSN-002", () => {
  const text = "A".repeat(301);
  const result = CommunitySupportNetwork({
    ...validInput,
    familyConflicts: text,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CSN-002");
  }
});
