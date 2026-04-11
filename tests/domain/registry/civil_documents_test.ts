import { assertEquals } from "@std/assert";
import { CivilDocuments } from "../../../src/domain/registry/value-objects/civil_documents.ts";
import { CPF } from "../../../src/domain/kernel/cpf.ts";
import { NIS } from "../../../src/domain/kernel/nis.ts";
import { RGDocument } from "../../../src/domain/kernel/rg_document.ts";

// =============================================================================
// Test Helpers — create pre-validated branded types
// =============================================================================

const validCPF = () => {
  const r = CPF("52998224725");
  if (!r.ok) throw new Error("test setup: invalid CPF");
  return r.value;
};

const validNIS = () => {
  const r = NIS("12345678901");
  if (!r.ok) throw new Error("test setup: invalid NIS");
  return r.value;
};

const validRG = () => {
  // digits "12345678", check digit = 2
  const r = RGDocument({
    number: "123456782",
    issuingState: "SP",
    issuingAgency: "SSP",
    issueDate: "2020-01-15",
  });
  if (!r.ok) throw new Error("test setup: invalid RGDocument");
  return r.value;
};

// =============================================================================
// CivilDocuments — Happy Path
// =============================================================================

Deno.test("CivilDocuments - all three present returns Ok", () => {
  const result = CivilDocuments({
    cpf: validCPF(),
    nis: validNIS(),
    rgDocument: validRG(),
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cpf !== undefined, true);
    assertEquals(result.value.nis !== undefined, true);
    assertEquals(result.value.rgDocument !== undefined, true);
  }
});

Deno.test("CivilDocuments - only CPF returns Ok", () => {
  const result = CivilDocuments({ cpf: validCPF() });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cpf !== undefined, true);
    assertEquals(result.value.nis, undefined);
    assertEquals(result.value.rgDocument, undefined);
  }
});

Deno.test("CivilDocuments - only NIS returns Ok", () => {
  const result = CivilDocuments({ nis: validNIS() });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cpf, undefined);
    assertEquals(result.value.nis !== undefined, true);
    assertEquals(result.value.rgDocument, undefined);
  }
});

Deno.test("CivilDocuments - only RGDocument returns Ok", () => {
  const result = CivilDocuments({ rgDocument: validRG() });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cpf, undefined);
    assertEquals(result.value.nis, undefined);
    assertEquals(result.value.rgDocument !== undefined, true);
  }
});

Deno.test("CivilDocuments - CPF + NIS returns Ok", () => {
  const result = CivilDocuments({
    cpf: validCPF(),
    nis: validNIS(),
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cpf !== undefined, true);
    assertEquals(result.value.nis !== undefined, true);
    assertEquals(result.value.rgDocument, undefined);
  }
});

// =============================================================================
// CivilDocuments — Error Path
// =============================================================================

Deno.test("CivilDocuments - none present returns CD-001", () => {
  const result = CivilDocuments({});
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "CD-001");
  }
});
