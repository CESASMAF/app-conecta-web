import { assertEquals } from "@std/assert";
import {
  AppointmentId,
  generateAppointmentId,
} from "../../../src/domain/care/value-objects/appointment_id.ts";

// =============================================================================
// AppointmentId Smart Constructor — Happy Path
// =============================================================================

Deno.test("AppointmentId - valid lowercase UUID returns Ok", () => {
  const result = AppointmentId("550e8400-e29b-41d4-a716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("AppointmentId - valid uppercase UUID normalizes to lowercase", () => {
  const result = AppointmentId("550E8400-E29B-41D4-A716-446655440000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

Deno.test("AppointmentId - UUID with leading/trailing spaces trims", () => {
  const result = AppointmentId("  550e8400-e29b-41d4-a716-446655440000  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "550e8400-e29b-41d4-a716-446655440000" as unknown);
  }
});

// =============================================================================
// AppointmentId Smart Constructor — Error Path
// =============================================================================

Deno.test("AppointmentId - empty string returns AI-001", () => {
  const result = AppointmentId("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "AI-001");
  }
});

Deno.test("AppointmentId - invalid format returns AI-001", () => {
  const result = AppointmentId("not-a-uuid");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "AI-001");
  }
});

Deno.test("AppointmentId - missing section returns AI-001", () => {
  const result = AppointmentId("12345678-1234-1234-1234");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "AI-001");
  }
});

// =============================================================================
// Generator
// =============================================================================

Deno.test("generateAppointmentId - returns valid AppointmentId", () => {
  const id = generateAppointmentId();
  const result = AppointmentId(id as unknown as string);
  assertEquals(result.ok, true);
});

Deno.test("generateAppointmentId - generates unique ids", () => {
  const id1 = generateAppointmentId();
  const id2 = generateAppointmentId();
  assertEquals(id1 !== id2, true);
});
