import { assertEquals } from "@std/assert";
import { createAppointment } from "../../../src/domain/care/aggregates/social-care-appointment/operations.ts";
import { generateAppointmentId } from "../../../src/domain/care/value-objects/appointment_id.ts";
import { generateProfessionalId } from "../../../src/domain/kernel/ids.ts";
import { now, TimeStamp } from "../../../src/domain/kernel/timestamp.ts";
import type { CreateAppointmentInput } from "../../../src/domain/care/aggregates/social-care-appointment/types.ts";
import type { AppointmentType } from "../../../src/domain/care/value-objects/appointment_type.ts";

// =============================================================================
// Helpers
// =============================================================================

const pastDate = (): ReturnType<typeof TimeStamp> =>
  TimeStamp("2024-01-15T10:30:00.000Z");

const futureDate = (): ReturnType<typeof TimeStamp> =>
  TimeStamp("2099-12-31T23:59:59.000Z");

const validInput = (
  overrides?: Partial<{
    summary: string;
    actionPlan: string;
    dateStr: string;
  }>,
): CreateAppointmentInput => {
  const dateResult = overrides?.dateStr
    ? TimeStamp(overrides.dateStr)
    : pastDate();
  if (!dateResult.ok) {
    // Should never happen with our test dates — guard for type safety
    return undefined as unknown as CreateAppointmentInput;
  }
  return {
    id: generateAppointmentId(),
    date: dateResult.value,
    professionalInChargeId: generateProfessionalId(),
    type: "HOME_VISIT" as AppointmentType,
    summary: overrides?.summary,
    actionPlan: overrides?.actionPlan,
  };
};

// =============================================================================
// createAppointment — Happy Path
// =============================================================================

Deno.test("createAppointment - valid input with summary and actionPlan returns Ok", () => {
  const input = validInput({ summary: "Patient evaluation", actionPlan: "Follow up in 2 weeks" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.summary, "Patient evaluation");
    assertEquals(result.value.actionPlan, "Follow up in 2 weeks");
  }
});

Deno.test("createAppointment - valid input with only summary returns Ok", () => {
  const input = validInput({ summary: "Patient evaluation" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.summary, "Patient evaluation");
    assertEquals(result.value.actionPlan, undefined);
  }
});

Deno.test("createAppointment - valid input with only actionPlan returns Ok", () => {
  const input = validInput({ actionPlan: "Schedule next visit" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.summary, undefined);
    assertEquals(result.value.actionPlan, "Schedule next visit");
  }
});

Deno.test("createAppointment - trims summary and actionPlan whitespace", () => {
  const input = validInput({
    summary: "  Trimmed summary  ",
    actionPlan: "  Trimmed plan  ",
  });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.summary, "Trimmed summary");
    assertEquals(result.value.actionPlan, "Trimmed plan");
  }
});

Deno.test("createAppointment - empty string summary with valid actionPlan returns Ok with summary undefined", () => {
  const input = validInput({ summary: "", actionPlan: "Valid plan" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.summary, undefined);
    assertEquals(result.value.actionPlan, "Valid plan");
  }
});

Deno.test("createAppointment - whitespace-only summary with valid actionPlan returns Ok with summary undefined", () => {
  const input = validInput({ summary: "   ", actionPlan: "Valid plan" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.summary, undefined);
    assertEquals(result.value.actionPlan, "Valid plan");
  }
});

Deno.test("createAppointment - preserves all fields on Ok", () => {
  const input = validInput({ summary: "Note", actionPlan: "Plan" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.id, input.id);
    assertEquals(result.value.date, input.date);
    assertEquals(result.value.professionalInChargeId, input.professionalInChargeId);
    assertEquals(result.value.type, input.type);
  }
});

// =============================================================================
// createAppointment — Error Path
// =============================================================================

Deno.test("createAppointment - future date returns SCA-001", () => {
  const futureDateResult = futureDate();
  assertEquals(futureDateResult.ok, true);
  if (!futureDateResult.ok) return;

  const input: CreateAppointmentInput = {
    id: generateAppointmentId(),
    date: futureDateResult.value,
    professionalInChargeId: generateProfessionalId(),
    type: "OFFICE_APPOINTMENT" as AppointmentType,
    summary: "Some summary",
  };
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-001");
  }
});

Deno.test("createAppointment - neither summary nor actionPlan returns SCA-002", () => {
  const input = validInput();
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-002");
  }
});

Deno.test("createAppointment - both undefined summary and actionPlan returns SCA-002", () => {
  const dateResult = pastDate();
  if (!dateResult.ok) return;

  const input: CreateAppointmentInput = {
    id: generateAppointmentId(),
    date: dateResult.value,
    professionalInChargeId: generateProfessionalId(),
    type: "PHONE_CALL" as AppointmentType,
    summary: undefined,
    actionPlan: undefined,
  };
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-002");
  }
});

Deno.test("createAppointment - both empty strings returns SCA-002", () => {
  const input = validInput({ summary: "", actionPlan: "" });
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-002");
  }
});

Deno.test("createAppointment - both whitespace-only strings returns SCA-002", () => {
  const input = validInput({ summary: "   ", actionPlan: "   " });
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-002");
  }
});

Deno.test("createAppointment - summary over 500 chars returns SCA-003", () => {
  const longSummary = "a".repeat(501);
  const input = validInput({ summary: longSummary, actionPlan: "Valid plan" });
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-003");
  }
});

Deno.test("createAppointment - summary exactly 500 chars returns Ok", () => {
  const summary = "a".repeat(500);
  const input = validInput({ summary, actionPlan: "Valid plan" });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
});

Deno.test("createAppointment - actionPlan over 2000 chars returns SCA-004", () => {
  const longPlan = "b".repeat(2001);
  const input = validInput({ summary: "Valid summary", actionPlan: longPlan });
  const result = createAppointment(input);
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "SCA-004");
  }
});

Deno.test("createAppointment - actionPlan exactly 2000 chars returns Ok", () => {
  const plan = "b".repeat(2000);
  const input = validInput({ summary: "Valid summary", actionPlan: plan });
  const result = createAppointment(input);
  assertEquals(result.ok, true);
});
