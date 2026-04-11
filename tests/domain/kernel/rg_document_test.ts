import { assertEquals } from "@std/assert";
import { RGDocument, formatRG } from "../../../src/domain/kernel/rg_document.ts";

// =============================================================================
// RGDocument Smart Constructor — Happy Path
// =============================================================================

Deno.test("RGDocument - valid RG with numeric check digit returns Ok", () => {
  // digits "12345678", weights [2,3,4,5,6,7,8,9]
  // sum = 2+6+12+20+30+42+56+72 = 240, 240%11=9, check = 11-9 = 2
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "123456782");
    assertEquals(result.value.issuingState, "SP");
    assertEquals(result.value.issuingAgency, "SSP");
    assertEquals(result.value.issueDate, "2020-01-15");
  }
});

Deno.test("RGDocument - valid RG with check digit X returns Ok", () => {
  // digits "60000000", weights [2,3,4,5,6,7,8,9]
  // sum = 6*2 = 12, 12%11=1, remainder==1 → check = "X"
  const result = RGDocument({
    number: "60000000X",
    issuingState: "RJ",
    issuingAgency: "DETRAN",
    issueDate: "2019-06-20",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "60000000X");
  }
});

Deno.test("RGDocument - valid RG with check digit 0 (remainder 0) returns Ok", () => {
  // Need remainder == 0 → check = "0"
  // digits "00000000", sum = 0, 0%11=0, check = "0"
  const result = RGDocument({
    number: "000000000",
    issuingState: "MG",
    issuingAgency: "PC",
    issueDate: "2015-03-10",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "000000000");
  }
});

Deno.test("RGDocument - normalizes number: trims, uppercases, removes dots/hyphens/spaces", () => {
  const result = RGDocument({
    number: "  12.345.678-2  ",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "123456782");
  }
});

Deno.test("RGDocument - normalizes issuingState and issuingAgency", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "  sp  ",
    issuingAgency: "  ssp   sp  ",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.issuingState, "SP");
    assertEquals(result.value.issuingAgency, "SSP SP");
  }
});

// =============================================================================
// RGDocument Smart Constructor — RG-001 (number empty)
// =============================================================================

Deno.test("RGDocument - empty number returns RG-001", () => {
  const result = RGDocument({
    number: "",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-001");
  }
});

Deno.test("RGDocument - whitespace-only number returns RG-001", () => {
  const result = RGDocument({
    number: "   ",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-001");
  }
});

// =============================================================================
// RGDocument Smart Constructor — RG-002 (invalid format)
// =============================================================================

Deno.test("RGDocument - too short number returns RG-002", () => {
  const result = RGDocument({
    number: "1234567",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-002");
  }
});

Deno.test("RGDocument - too long number returns RG-002", () => {
  const result = RGDocument({
    number: "1234567890",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-002");
  }
});

Deno.test("RGDocument - letters in base digits returns RG-002", () => {
  const result = RGDocument({
    number: "1234567AB",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-002");
  }
});

// =============================================================================
// RGDocument Smart Constructor — RG-003 (wrong check digit)
// =============================================================================

Deno.test("RGDocument - wrong check digit returns RG-003", () => {
  // Valid is "123456782", using "123456789" (wrong check)
  const result = RGDocument({
    number: "123456789",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-003");
  }
});

Deno.test("RGDocument - check digit X where numeric expected returns RG-003", () => {
  // "12345678X" — expected check is 2, not X
  const result = RGDocument({
    number: "12345678X",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-003");
  }
});

// =============================================================================
// RGDocument Smart Constructor — RG-004 (invalid state)
// =============================================================================

Deno.test("RGDocument - invalid state XX returns RG-004", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "XX",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-004");
  }
});

Deno.test("RGDocument - empty state returns RG-004", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-004");
  }
});

// =============================================================================
// RGDocument Smart Constructor — RG-005 (empty agency)
// =============================================================================

Deno.test("RGDocument - empty agency returns RG-005", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-005");
  }
});

Deno.test("RGDocument - whitespace-only agency returns RG-005", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "   ",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-005");
  }
});

// =============================================================================
// RGDocument Smart Constructor — RG-006 (future issue date)
// =============================================================================

Deno.test("RGDocument - future issue date returns RG-006", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2099-12-31",
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "RG-006");
  }
});

Deno.test("RGDocument - today's date is valid (not in the future)", () => {
  const today = new Date().toISOString().slice(0, 10);
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: today,
  });
  assertEquals(result.ok, true);
});

// =============================================================================
// formatRG — Formatting
// =============================================================================

Deno.test("formatRG - formats as XXXXXXXX-X", () => {
  const result = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(formatRG(result.value), "12345678-2");
  }
});

Deno.test("formatRG - formats X check digit as XXXXXXXX-X", () => {
  const result = RGDocument({
    number: "60000000X",
    issuingState: "RJ",
    issuingAgency: "DETRAN",
    issueDate: "2019-06-20",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(formatRG(result.value), "60000000-X");
  }
});
