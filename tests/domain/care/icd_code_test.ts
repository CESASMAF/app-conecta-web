import { assertEquals } from "@std/assert";
import {
  ICDCode,
  normalized,
  isEquivalent,
} from "../../../src/domain/care/value-objects/icd_code.ts";

// =============================================================================
// ICDCode Smart Constructor — Happy Path
// =============================================================================

Deno.test("ICDCode - 'A169' auto-dots to 'A16.9'", () => {
  const result = ICDCode("A169");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "A16.9" as unknown);
  }
});

Deno.test("ICDCode - 'A16.9' stays as 'A16.9'", () => {
  const result = ICDCode("A16.9");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "A16.9" as unknown);
  }
});

Deno.test("ICDCode - lowercase normalizes to uppercase", () => {
  const result = ICDCode("a169");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "A16.9" as unknown);
  }
});

Deno.test("ICDCode - trims whitespace", () => {
  const result = ICDCode("  A169  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "A16.9" as unknown);
  }
});

Deno.test("ICDCode - short code (2 chars) no auto-dot", () => {
  const result = ICDCode("A1");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "A1" as unknown);
  }
});

// =============================================================================
// ICDCode Smart Constructor — Error Path
// =============================================================================

Deno.test("ICDCode - empty string returns ICD-001", () => {
  const result = ICDCode("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ICD-001");
  }
});

Deno.test("ICDCode - whitespace only returns ICD-001", () => {
  const result = ICDCode("   ");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ICD-001");
  }
});

// =============================================================================
// Methods
// =============================================================================

Deno.test("normalized - removes dots from ICDCode", () => {
  const result = ICDCode("A16.9");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(normalized(result.value), "A169");
  }
});

Deno.test("isEquivalent - 'A169' and 'A16.9' are equivalent", () => {
  const r1 = ICDCode("A169");
  const r2 = ICDCode("A16.9");
  assertEquals(r1.ok, true);
  assertEquals(r2.ok, true);
  if (r1.ok && r2.ok) {
    assertEquals(isEquivalent(r1.value, r2.value), true);
  }
});

Deno.test("isEquivalent - different codes are not equivalent", () => {
  const r1 = ICDCode("A169");
  const r2 = ICDCode("B200");
  assertEquals(r1.ok, true);
  assertEquals(r2.ok, true);
  if (r1.ok && r2.ok) {
    assertEquals(isEquivalent(r1.value, r2.value), false);
  }
});
