import { assertEquals } from "@std/assert";
import { Diagnosis } from "../../../src/domain/care/value-objects/diagnosis.ts";
import { TimeStamp } from "../../../src/domain/kernel/timestamp.ts";

// =============================================================================
// Helpers
// =============================================================================

/** Creates a valid past TimeStamp for test use. */
const pastTimestamp = (): ReturnType<typeof TimeStamp> =>
  TimeStamp("2023-06-15T10:30:00.000Z");

/** Creates a future TimeStamp for test use. */
const futureTimestamp = (): ReturnType<typeof TimeStamp> =>
  TimeStamp("2099-12-31T23:59:59.999Z");

// =============================================================================
// Diagnosis Smart Constructor — Happy Path
// =============================================================================

Deno.test("Diagnosis - valid input returns Ok", () => {
  const ts = pastTimestamp();
  assertEquals(ts.ok, true);
  if (!ts.ok) return;

  const result = Diagnosis({
    id: "A169",
    date: ts.value,
    description: "Tuberculosis of respiratory system",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.id, "A16.9" as unknown);
    assertEquals(result.value.description, "Tuberculosis of respiratory system");
    assertEquals(result.value.date, ts.value);
  }
});

Deno.test("Diagnosis - trims description", () => {
  const ts = pastTimestamp();
  assertEquals(ts.ok, true);
  if (!ts.ok) return;

  const result = Diagnosis({
    id: "A169",
    date: ts.value,
    description: "  Some diagnosis  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.description, "Some diagnosis");
  }
});

// =============================================================================
// Diagnosis Smart Constructor — Error Path
// =============================================================================

Deno.test("Diagnosis - invalid ICD code returns ICD-001", () => {
  const ts = pastTimestamp();
  assertEquals(ts.ok, true);
  if (!ts.ok) return;

  const result = Diagnosis({
    id: "",
    date: ts.value,
    description: "Some diagnosis",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ICD-001");
  }
});

Deno.test("Diagnosis - future date returns DIA-001", () => {
  const ts = futureTimestamp();
  assertEquals(ts.ok, true);
  if (!ts.ok) return;

  const result = Diagnosis({
    id: "A169",
    date: ts.value,
    description: "Some diagnosis",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "DIA-001");
  }
});

Deno.test("Diagnosis - empty description returns DIA-003", () => {
  const ts = pastTimestamp();
  assertEquals(ts.ok, true);
  if (!ts.ok) return;

  const result = Diagnosis({
    id: "A169",
    date: ts.value,
    description: "",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "DIA-003");
  }
});

Deno.test("Diagnosis - whitespace-only description returns DIA-003", () => {
  const ts = pastTimestamp();
  assertEquals(ts.ok, true);
  if (!ts.ok) return;

  const result = Diagnosis({
    id: "A169",
    date: ts.value,
    description: "   ",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "DIA-003");
  }
});
