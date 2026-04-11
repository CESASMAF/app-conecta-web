import { assertEquals } from "@std/assert";
import {
  PatientId,
  generatePatientId,
} from "../../../src/domain/registry/value-objects/patient_id.ts";

// =============================================================================
// PatientId Smart Constructor — Happy Path
// =============================================================================

Deno.test("PatientId - valid lowercase UUID returns Ok", () => {
  const result = PatientId("550e8400-e29b-41d4-a716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("PatientId - valid uppercase UUID normalizes to lowercase", () => {
  const result = PatientId("550E8400-E29B-41D4-A716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("PatientId - UUID with leading/trailing spaces trims", () => {
  const result = PatientId("  550e8400-e29b-41d4-a716-446655440000  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

// =============================================================================
// PatientId Smart Constructor — Error Path
// =============================================================================

Deno.test("PatientId - empty string returns PATID-001", () => {
  const result = PatientId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PATID-001");
  }
});

Deno.test("PatientId - invalid format returns PATID-001", () => {
  const result = PatientId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PATID-001");
  }
});

Deno.test("PatientId - missing section returns PATID-001", () => {
  const result = PatientId("12345678-1234-1234-1234");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PATID-001");
  }
});

// =============================================================================
// Generator
// =============================================================================

Deno.test("generatePatientId - returns valid PatientId", () => {
  const id = generatePatientId();
  // Validate it round-trips through the smart constructor
  const result = PatientId(id as unknown as string);
  assertEquals(result.ok, true);
});

Deno.test("generatePatientId - generates unique ids", () => {
  const id1 = generatePatientId();
  const id2 = generatePatientId();
  assertEquals(id1 !== id2, true);
});
