import { assertEquals } from "@std/assert";
import {
  CEP,
  formatCEP,
  distributionKind,
  cepState,
} from "../../../src/domain/kernel/cep.ts";

// =============================================================================
// CEP Smart Constructor — Happy Path
// =============================================================================

Deno.test("CEP - valid CEP with plain digits returns Ok", () => {
  const result = CEP("01001000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "01001000" as unknown);
  }
});

Deno.test("CEP - valid CEP with hyphen formatting returns Ok", () => {
  const result = CEP("01001-000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "01001000" as unknown);
  }
});

Deno.test("CEP - valid CEP with spaces and hyphen returns Ok", () => {
  const result = CEP(" 01001-000 ");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value, "01001000" as unknown);
  }
});

// =============================================================================
// CEP Smart Constructor — CEP-001 (empty after trim)
// =============================================================================

Deno.test("CEP - empty string returns CEP-001", () => {
  const result = CEP("");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-001");
  }
});

Deno.test("CEP - only spaces returns CEP-001", () => {
  const result = CEP("     ");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-001");
  }
});

// =============================================================================
// CEP Smart Constructor — CEP-002 (invalid characters)
// =============================================================================

Deno.test("CEP - contains letter returns CEP-002", () => {
  const result = CEP("0100A000");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-002");
  }
});

Deno.test("CEP - contains special chars returns CEP-002", () => {
  const result = CEP("01001@00");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-002");
  }
});

// =============================================================================
// CEP Smart Constructor — CEP-003 (not exactly 8 digits)
// =============================================================================

Deno.test("CEP - too short (7 digits) returns CEP-003", () => {
  const result = CEP("0100100");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-003");
  }
});

Deno.test("CEP - too long (9 digits) returns CEP-003", () => {
  const result = CEP("010010001");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-003");
  }
});

// =============================================================================
// CEP Smart Constructor — CEP-004 (invalid UF range)
// =============================================================================

Deno.test("CEP - all zeros (00000000) returns CEP-004", () => {
  const result = CEP("00000000");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-004");
  }
});

Deno.test("CEP - range gap (69390000) returns CEP-004", () => {
  // 69390000-69399999 is between RR and AM ranges
  const result = CEP("69390000");
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CEP-004");
  }
});

// =============================================================================
// formatCEP — Formatting a validated CEP
// =============================================================================

Deno.test("formatCEP - formats 8 digits as XXXXX-XXX", () => {
  const result = CEP("01001000");
  assertEquals(result.ok, true);
  if (result.ok) {
    const formatted = formatCEP(result.value);
    assertEquals(formatted, "01001-000");
  }
});

// =============================================================================
// distributionKind — Derived value from last 3 digits
// =============================================================================

Deno.test("distributionKind - suffix 000 returns STREET_RANGE", () => {
  const result = CEP("01001000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(distributionKind(result.value), "STREET_RANGE");
  }
});

Deno.test("distributionKind - suffix 900 returns SPECIAL_CODES", () => {
  const result = CEP("01001900");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(distributionKind(result.value), "SPECIAL_CODES");
  }
});

Deno.test("distributionKind - suffix 960 returns PROMOTIONAL", () => {
  const result = CEP("01001960");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(distributionKind(result.value), "PROMOTIONAL");
  }
});

Deno.test("distributionKind - suffix 970 returns POST_OFFICE_UNITS", () => {
  const result = CEP("01001970");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(distributionKind(result.value), "POST_OFFICE_UNITS");
  }
});

Deno.test("distributionKind - suffix 999 returns POST_OFFICE_UNITS", () => {
  const result = CEP("01001999");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(distributionKind(result.value), "POST_OFFICE_UNITS");
  }
});

Deno.test("distributionKind - suffix 990 returns OTHER", () => {
  const result = CEP("01001990");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(distributionKind(result.value), "OTHER");
  }
});

// =============================================================================
// cepState — Derived UF from numeric range
// =============================================================================

Deno.test("cepState - 01001000 returns SP", () => {
  const result = CEP("01001000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "SP");
  }
});

Deno.test("cepState - 90000000 returns RS", () => {
  const result = CEP("90000000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "RS");
  }
});

Deno.test("cepState - 20000000 returns RJ", () => {
  const result = CEP("20000000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "RJ");
  }
});

Deno.test("cepState - 40000000 returns BA", () => {
  const result = CEP("40000000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "BA");
  }
});

Deno.test("cepState - 69000000 returns AM", () => {
  const result = CEP("69000000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "AM");
  }
});

Deno.test("cepState - 69300000 returns RR", () => {
  const result = CEP("69300000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "RR");
  }
});

Deno.test("cepState - 70000000 returns DF", () => {
  const result = CEP("70000000");
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(cepState(result.value), "DF");
  }
});
