import { assertEquals } from "@std/assert";
import { CPF, formatCPF, fiscalRegion } from "../../../src/domain/kernel/cpf.ts";

// =============================================================================
// CPF Smart Constructor — Happy Path
// =============================================================================

Deno.test("CPF - valid CPF with plain digits returns Ok", () => {
  const result = CPF("52998224725");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "52998224725" as unknown);
  }
});

Deno.test("CPF - valid CPF with formatting returns Ok", () => {
  const result = CPF("529.982.247-25");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "52998224725" as unknown);
  }
});

Deno.test("CPF - valid CPF with extra spaces returns Ok", () => {
  const result = CPF("  529.982.247-25  ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "52998224725" as unknown);
  }
});

// =============================================================================
// CPF Smart Constructor — CPF-001 (empty after trim)
// =============================================================================

Deno.test("CPF - empty string returns CPF-001", () => {
  const result = CPF("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-001");
  }
});

Deno.test("CPF - only spaces returns CPF-001", () => {
  const result = CPF("     ");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-001");
  }
});

// =============================================================================
// CPF Smart Constructor — CPF-002 (invalid chars outside digits/./- /ws)
// =============================================================================

Deno.test("CPF - contains letters returns CPF-002", () => {
  const result = CPF("123456789AB");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-002");
  }
});

Deno.test("CPF - contains special chars returns CPF-002", () => {
  const result = CPF("123@456#789");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-002");
  }
});

// =============================================================================
// CPF Smart Constructor — CPF-003 (not exactly 11 digits after sanitization)
// =============================================================================

Deno.test("CPF - too short (10 digits) returns CPF-003", () => {
  const result = CPF("1234567890");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-003");
  }
});

Deno.test("CPF - too long (12 digits) returns CPF-003", () => {
  const result = CPF("123456789012");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-003");
  }
});

// =============================================================================
// CPF Smart Constructor — CPF-004 (all 11 digits identical)
// =============================================================================

Deno.test("CPF - all ones returns CPF-004", () => {
  const result = CPF("11111111111");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-004");
  }
});

Deno.test("CPF - all zeros returns CPF-004", () => {
  const result = CPF("00000000000");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-004");
  }
});

// =============================================================================
// CPF Smart Constructor — CPF-005 (invalid checksum)
// =============================================================================

Deno.test("CPF - last digit wrong returns CPF-005", () => {
  const result = CPF("52998224724");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-005");
  }
});

Deno.test("CPF - last two digits wrong returns CPF-005", () => {
  const result = CPF("52998224735");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CPF-005");
  }
});

// =============================================================================
// formatCPF — Formatting a validated CPF
// =============================================================================

Deno.test("formatCPF - formats 11 digits as XXX.XXX.XXX-XX", () => {
  const result = CPF("52998224725");
  assertEquals(result.ok, true);
  if (result.ok) {
    const formatted = formatCPF(result.value);
    assertEquals(formatted, "529.982.247-25");
  }
});

// =============================================================================
// fiscalRegion — Derived value from digit at position 8
// =============================================================================

Deno.test("fiscalRegion - digit 8 is 7 returns ES, RJ", () => {
  // 52998224725 -> digit[8] = '7'
  const result = CPF("52998224725");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(fiscalRegion(result.value), "ES, RJ");
  }
});

Deno.test("fiscalRegion - digit 8 is 8 returns SP", () => {
  // 14781324851 -> digit[8] = '8'
  const result = CPF("14781324851");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(fiscalRegion(result.value), "SP");
  }
});

Deno.test("fiscalRegion - digit 8 is 0 returns RS", () => {
  // 73852146062 -> digit[8] = '0'
  const result = CPF("73852146062");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(fiscalRegion(result.value), "RS");
  }
});
