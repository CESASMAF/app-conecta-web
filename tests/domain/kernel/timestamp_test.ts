import { assertEquals } from "@std/assert";
import {
  TimeStamp,
  now,
  isSameDay,
  yearsAt,
  toISOString,
} from "../../../src/domain/kernel/timestamp.ts";

// =============================================================================
// TimeStamp Smart Constructor — Happy Path
// =============================================================================

Deno.test("TimeStamp - valid ISO string with millis returns Ok", () => {
  const result = TimeStamp("2024-03-15T10:30:00.000Z");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "2024-03-15T10:30:00.000Z" as unknown);
  }
});

Deno.test("TimeStamp - valid ISO string without millis normalizes to include millis", () => {
  const result = TimeStamp("2024-03-15T10:30:00Z");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "2024-03-15T10:30:00.000Z" as unknown);
  }
});

Deno.test("TimeStamp - valid ISO string with spaces trims", () => {
  const result = TimeStamp("  2024-03-15T10:30:00.000Z  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "2024-03-15T10:30:00.000Z" as unknown);
  }
});

// =============================================================================
// TimeStamp Smart Constructor — Error Path
// =============================================================================

Deno.test("TimeStamp - empty string returns TS-001", () => {
  const result = TimeStamp("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "TS-001");
  }
});

Deno.test("TimeStamp - whitespace-only string returns TS-001", () => {
  const result = TimeStamp("   ");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "TS-001");
  }
});

Deno.test("TimeStamp - invalid date string returns TS-002", () => {
  const result = TimeStamp("not-a-date");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "TS-002");
  }
});

Deno.test("TimeStamp - invalid month 13 returns TS-002", () => {
  const result = TimeStamp("2024-13-01T00:00:00Z");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "TS-002");
  }
});

Deno.test("TimeStamp - invalid day 32 returns TS-002", () => {
  const result = TimeStamp("2024-01-32T00:00:00Z");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "TS-002");
  }
});

// =============================================================================
// now() — Factory
// =============================================================================

Deno.test("now - returns a valid TimeStamp", () => {
  const ts = now();
  // Round-trip through the smart constructor to confirm validity
  const result = TimeStamp(ts as unknown as string);
  assertEquals(result.ok, true);
});

Deno.test("now - returns string ending with Z (UTC)", () => {
  const ts = now();
  assertEquals((ts as unknown as string).endsWith("Z"), true);
});

// =============================================================================
// isSameDay
// =============================================================================

Deno.test("isSameDay - same day different times returns true", () => {
  const a = TimeStamp("2024-03-15T08:00:00.000Z");
  const b = TimeStamp("2024-03-15T22:30:00.000Z");
  if (a.ok && b.ok) {
    assertEquals(isSameDay(a.value, b.value), true);
  } else {
    throw new Error("Setup failed: invalid timestamps");
  }
});

Deno.test("isSameDay - different days returns false", () => {
  const a = TimeStamp("2024-03-15T23:59:59.999Z");
  const b = TimeStamp("2024-03-16T00:00:00.000Z");
  if (a.ok && b.ok) {
    assertEquals(isSameDay(a.value, b.value), false);
  } else {
    throw new Error("Setup failed: invalid timestamps");
  }
});

// =============================================================================
// yearsAt
// =============================================================================

Deno.test("yearsAt - 24 complete years when birthday has passed", () => {
  const birth = TimeStamp("2000-01-15T00:00:00.000Z");
  const ref = TimeStamp("2024-03-15T00:00:00.000Z");
  if (birth.ok && ref.ok) {
    assertEquals(yearsAt(birth.value, ref.value), 24);
  } else {
    throw new Error("Setup failed: invalid timestamps");
  }
});

Deno.test("yearsAt - 23 complete years when birthday not yet reached", () => {
  const birth = TimeStamp("2000-03-20T00:00:00.000Z");
  const ref = TimeStamp("2024-03-15T00:00:00.000Z");
  if (birth.ok && ref.ok) {
    assertEquals(yearsAt(birth.value, ref.value), 23);
  } else {
    throw new Error("Setup failed: invalid timestamps");
  }
});

Deno.test("yearsAt - exact birthday returns full year", () => {
  const birth = TimeStamp("2000-03-15T00:00:00.000Z");
  const ref = TimeStamp("2024-03-15T00:00:00.000Z");
  if (birth.ok && ref.ok) {
    assertEquals(yearsAt(birth.value, ref.value), 24);
  } else {
    throw new Error("Setup failed: invalid timestamps");
  }
});

Deno.test("yearsAt - same date returns 0", () => {
  const birth = TimeStamp("2024-03-15T00:00:00.000Z");
  const ref = TimeStamp("2024-03-15T00:00:00.000Z");
  if (birth.ok && ref.ok) {
    assertEquals(yearsAt(birth.value, ref.value), 0);
  } else {
    throw new Error("Setup failed: invalid timestamps");
  }
});

// =============================================================================
// toISOString
// =============================================================================

Deno.test("toISOString - preserves ISO format with millis", () => {
  const result = TimeStamp("2024-03-15T10:30:00.000Z");
  if (result.ok) {
    assertEquals(toISOString(result.value), "2024-03-15T10:30:00.000Z");
  } else {
    throw new Error("Setup failed: invalid timestamp");
  }
});

Deno.test("toISOString - normalized input preserves format", () => {
  const result = TimeStamp("2024-03-15T10:30:00Z");
  if (result.ok) {
    assertEquals(toISOString(result.value), "2024-03-15T10:30:00.000Z");
  } else {
    throw new Error("Setup failed: invalid timestamp");
  }
});
