import { assertEquals } from "@std/assert";
import {
  PersonId,
  ProfessionalId,
  LookupId,
  generatePersonId,
  generateProfessionalId,
} from "../../../src/domain/kernel/ids.ts";

// =============================================================================
// PersonId Smart Constructor — Happy Path
// =============================================================================

Deno.test("PersonId - valid lowercase UUID returns Ok", () => {
  const result = PersonId("550e8400-e29b-41d4-a716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("PersonId - valid uppercase UUID normalizes to lowercase", () => {
  const result = PersonId("550E8400-E29B-41D4-A716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("PersonId - UUID with leading/trailing spaces trims", () => {
  const result = PersonId("  550e8400-e29b-41d4-a716-446655440000  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

// =============================================================================
// PersonId Smart Constructor — Error Path
// =============================================================================

Deno.test("PersonId - empty string returns PID-001", () => {
  const result = PersonId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PID-001");
  }
});

Deno.test("PersonId - invalid format returns PID-001", () => {
  const result = PersonId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PID-001");
  }
});

Deno.test("PersonId - missing section returns PID-001", () => {
  const result = PersonId("12345678-1234-1234-1234");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PID-001");
  }
});

// =============================================================================
// ProfessionalId Smart Constructor — Happy Path
// =============================================================================

Deno.test("ProfessionalId - valid lowercase UUID returns Ok", () => {
  const result = ProfessionalId("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "a1b2c3d4-e5f6-7890-abcd-ef1234567890" as unknown);
  }
});

Deno.test("ProfessionalId - valid uppercase UUID normalizes to lowercase", () => {
  const result = ProfessionalId("A1B2C3D4-E5F6-7890-ABCD-EF1234567890");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "a1b2c3d4-e5f6-7890-abcd-ef1234567890" as unknown);
  }
});

Deno.test("ProfessionalId - UUID with spaces trims", () => {
  const result = ProfessionalId("  a1b2c3d4-e5f6-7890-abcd-ef1234567890  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "a1b2c3d4-e5f6-7890-abcd-ef1234567890" as unknown);
  }
});

// =============================================================================
// ProfessionalId Smart Constructor — Error Path
// =============================================================================

Deno.test("ProfessionalId - empty string returns PRID-001", () => {
  const result = ProfessionalId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PRID-001");
  }
});

Deno.test("ProfessionalId - invalid format returns PRID-001", () => {
  const result = ProfessionalId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PRID-001");
  }
});

Deno.test("ProfessionalId - missing section returns PRID-001", () => {
  const result = ProfessionalId("12345678-1234-1234-1234");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PRID-001");
  }
});

// =============================================================================
// LookupId Smart Constructor — Happy Path
// =============================================================================

Deno.test("LookupId - valid lowercase UUID returns Ok", () => {
  const result = LookupId("f47ac10b-58cc-4372-a567-0e02b2c3d479");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "f47ac10b-58cc-4372-a567-0e02b2c3d479" as unknown);
  }
});

Deno.test("LookupId - valid uppercase UUID normalizes to lowercase", () => {
  const result = LookupId("F47AC10B-58CC-4372-A567-0E02B2C3D479");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "f47ac10b-58cc-4372-a567-0e02b2c3d479" as unknown);
  }
});

Deno.test("LookupId - UUID with spaces trims", () => {
  const result = LookupId("  f47ac10b-58cc-4372-a567-0e02b2c3d479  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "f47ac10b-58cc-4372-a567-0e02b2c3d479" as unknown);
  }
});

// =============================================================================
// LookupId Smart Constructor — Error Path
// =============================================================================

Deno.test("LookupId - empty string returns LID-001", () => {
  const result = LookupId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "LID-001");
  }
});

Deno.test("LookupId - invalid format returns LID-001", () => {
  const result = LookupId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "LID-001");
  }
});

Deno.test("LookupId - missing section returns LID-001", () => {
  const result = LookupId("12345678-1234-1234-1234");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "LID-001");
  }
});

// =============================================================================
// Generators
// =============================================================================

Deno.test("generatePersonId - returns valid PersonId", () => {
  const id = generatePersonId();
  // Validate it round-trips through the smart constructor
  const result = PersonId(id as unknown as string);
  assertEquals(result.ok, true);
});

Deno.test("generateProfessionalId - returns valid ProfessionalId", () => {
  const id = generateProfessionalId();
  // Validate it round-trips through the smart constructor
  const result = ProfessionalId(id as unknown as string);
  assertEquals(result.ok, true);
});

Deno.test("generatePersonId - generates unique ids", () => {
  const id1 = generatePersonId();
  const id2 = generatePersonId();
  assertEquals(id1 !== id2, true);
});

Deno.test("generateProfessionalId - generates unique ids", () => {
  const id1 = generateProfessionalId();
  const id2 = generateProfessionalId();
  assertEquals(id1 !== id2, true);
});
