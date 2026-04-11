import { assertEquals } from "@std/assert";
import { AppointmentType } from "../../../src/domain/care/value-objects/appointment_type.ts";

// =============================================================================
// AppointmentType Smart Constructor — Happy Path
// =============================================================================

Deno.test("AppointmentType - HOME_VISIT returns Ok", () => {
  const result = AppointmentType("HOME_VISIT");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "HOME_VISIT");
  }
});

Deno.test("AppointmentType - OFFICE_APPOINTMENT returns Ok", () => {
  const result = AppointmentType("OFFICE_APPOINTMENT");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "OFFICE_APPOINTMENT");
  }
});

Deno.test("AppointmentType - PHONE_CALL returns Ok", () => {
  const result = AppointmentType("PHONE_CALL");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "PHONE_CALL");
  }
});

Deno.test("AppointmentType - MULTIDISCIPLINARY returns Ok", () => {
  const result = AppointmentType("MULTIDISCIPLINARY");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "MULTIDISCIPLINARY");
  }
});

Deno.test("AppointmentType - OTHER returns Ok", () => {
  const result = AppointmentType("OTHER");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "OTHER");
  }
});

// =============================================================================
// AppointmentType Smart Constructor — Error Path
// =============================================================================

Deno.test("AppointmentType - INVALID returns APT-001", () => {
  const result = AppointmentType("INVALID");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "APT-001");
  }
});

Deno.test("AppointmentType - empty string returns APT-001", () => {
  const result = AppointmentType("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "APT-001");
  }
});

Deno.test("AppointmentType - lowercase variant returns APT-001", () => {
  const result = AppointmentType("home_visit");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "APT-001");
  }
});
