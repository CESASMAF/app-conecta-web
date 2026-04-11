import { assertEquals } from "@std/assert";
import { NIS } from "../../../src/domain/kernel/nis.ts";

// =============================================================================
// NIS Smart Constructor — Happy Path
// =============================================================================

Deno.test("NIS - valid NIS with 11 digits returns Ok", () => {
  const result = NIS("12345678901");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "12345678901" as unknown);
  }
});

Deno.test("NIS - valid NIS with surrounding spaces returns Ok", () => {
  const result = NIS(" 12345678901 ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "12345678901" as unknown);
  }
});

Deno.test("NIS - valid NIS with non-digit chars returns Ok after sanitization", () => {
  const result = NIS("123.456.789-01");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "12345678901" as unknown);
  }
});

// =============================================================================
// NIS Smart Constructor — NIS-001 (empty after trim)
// =============================================================================

Deno.test("NIS - empty string returns NIS-001", () => {
  const result = NIS("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "NIS-001");
  }
});

Deno.test("NIS - only spaces returns NIS-001", () => {
  const result = NIS("     ");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "NIS-001");
  }
});

// =============================================================================
// NIS Smart Constructor — NIS-002 (not exactly 11 digits)
// =============================================================================

Deno.test("NIS - too short (10 digits) returns NIS-002", () => {
  const result = NIS("1234567890");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "NIS-002");
  }
});

Deno.test("NIS - too long (12 digits) returns NIS-002", () => {
  const result = NIS("123456789012");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "NIS-002");
  }
});
