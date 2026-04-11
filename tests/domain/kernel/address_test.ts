import { assertEquals } from "@std/assert";
import { Address } from "../../../src/domain/kernel/address.ts";
import type { AddressInput } from "../../../src/domain/kernel/address.ts";

// =============================================================================
// Helper — valid full input
// =============================================================================

const validFull: AddressInput = {
  cep: "01001-000",
  state: "sp",
  city: "São Paulo",
  street: "Praça da Sé",
  neighborhood: "Sé",
  number: "1",
  complement: "Apt 10",
  residenceLocation: "URBANO",
  isShelter: false,
  isHomeless: false,
};

const validMinimal: AddressInput = {
  state: "RJ",
  city: "Rio de Janeiro",
  residenceLocation: "RURAL",
  isShelter: false,
};

// =============================================================================
// Address Smart Constructor — Happy Path
// =============================================================================

Deno.test("Address - valid address with all fields returns Ok", () => {
  const result = Address(validFull);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cep, "01001000" as unknown);
    assertEquals(result.value.state, "SP");
    assertEquals(result.value.city, "São Paulo");
    assertEquals(result.value.street, "Praça da Sé");
    assertEquals(result.value.neighborhood, "Sé");
    assertEquals(result.value.number, "1");
    assertEquals(result.value.complement, "Apt 10");
    assertEquals(result.value.residenceLocation, "URBANO");
    assertEquals(result.value.isShelter, false);
    assertEquals(result.value.isHomeless, false);
  }
});

Deno.test("Address - valid address minimal (only required fields) returns Ok", () => {
  const result = Address(validMinimal);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cep, undefined);
    assertEquals(result.value.state, "RJ");
    assertEquals(result.value.city, "Rio de Janeiro");
    assertEquals(result.value.street, undefined);
    assertEquals(result.value.neighborhood, undefined);
    assertEquals(result.value.number, undefined);
    assertEquals(result.value.complement, undefined);
    assertEquals(result.value.residenceLocation, "RURAL");
    assertEquals(result.value.isShelter, false);
    assertEquals(result.value.isHomeless, false);
  }
});

Deno.test("Address - valid address with isHomeless=true returns Ok", () => {
  const result = Address({
    state: "BA",
    city: "Salvador",
    residenceLocation: "URBANO",
    isShelter: false,
    isHomeless: true,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.isHomeless, true);
    assertEquals(result.value.state, "BA");
    assertEquals(result.value.city, "Salvador");
  }
});

// =============================================================================
// Address Smart Constructor — ADDR-001 (invalid CEP)
// =============================================================================

Deno.test("Address - invalid CEP returns ADDR-001", () => {
  const result = Address({ ...validMinimal, cep: "00000000" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-001");
  }
});

Deno.test("Address - CEP with letters returns ADDR-001", () => {
  const result = Address({ ...validMinimal, cep: "ABCDEFGH" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-001");
  }
});

// =============================================================================
// Address Smart Constructor — ADDR-002 (state empty)
// =============================================================================

Deno.test("Address - empty state returns ADDR-002", () => {
  const result = Address({ ...validMinimal, state: "" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-002");
  }
});

Deno.test("Address - whitespace-only state returns ADDR-002", () => {
  const result = Address({ ...validMinimal, state: "   " });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-002");
  }
});

// =============================================================================
// Address Smart Constructor — ADDR-003 (invalid state)
// =============================================================================

Deno.test("Address - invalid state XX returns ADDR-003", () => {
  const result = Address({ ...validMinimal, state: "XX" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-003");
  }
});

Deno.test("Address - invalid state ZZ returns ADDR-003", () => {
  const result = Address({ ...validMinimal, state: "ZZ" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-003");
  }
});

// =============================================================================
// Address Smart Constructor — ADDR-004 (city empty)
// =============================================================================

Deno.test("Address - empty city returns ADDR-004", () => {
  const result = Address({ ...validMinimal, city: "" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-004");
  }
});

Deno.test("Address - whitespace-only city returns ADDR-004", () => {
  const result = Address({ ...validMinimal, city: "   " });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-004");
  }
});

// =============================================================================
// Address Smart Constructor — ADDR-005 (invalid residenceLocation)
// =============================================================================

Deno.test("Address - invalid residenceLocation SUBURBANO returns ADDR-005", () => {
  const result = Address({ ...validMinimal, residenceLocation: "SUBURBANO" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-005");
  }
});

Deno.test("Address - invalid residenceLocation empty returns ADDR-005", () => {
  const result = Address({ ...validMinimal, residenceLocation: "" });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "ADDR-005");
  }
});

// =============================================================================
// Address Smart Constructor — isShelter preserved
// =============================================================================

Deno.test("Address - isShelter=true is preserved", () => {
  const result = Address({ ...validMinimal, isShelter: true });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.isShelter, true);
  }
});

// =============================================================================
// Address Smart Constructor — isHomeless defaults to false
// =============================================================================

Deno.test("Address - isHomeless defaults to false when omitted", () => {
  const result = Address({
    state: "MG",
    city: "Belo Horizonte",
    residenceLocation: "URBANO",
    isShelter: false,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.isHomeless, false);
  }
});

// =============================================================================
// Address Smart Constructor — Optional fields undefined
// =============================================================================

Deno.test("Address - optional fields when undefined are preserved as undefined", () => {
  const result = Address(validMinimal);
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.cep, undefined);
    assertEquals(result.value.street, undefined);
    assertEquals(result.value.neighborhood, undefined);
    assertEquals(result.value.number, undefined);
    assertEquals(result.value.complement, undefined);
  }
});

// =============================================================================
// Address Smart Constructor — Normalization
// =============================================================================

Deno.test("Address - state is trimmed and uppercased", () => {
  const result = Address({ ...validMinimal, state: "  sp  " });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.state, "SP");
  }
});

Deno.test("Address - city is trimmed and whitespace collapsed", () => {
  const result = Address({ ...validMinimal, city: "  Rio  de   Janeiro  " });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.city, "Rio de Janeiro");
  }
});

Deno.test("Address - street is trimmed and whitespace collapsed", () => {
  const result = Address({
    ...validMinimal,
    street: "  Rua   das   Flores  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.street, "Rua das Flores");
  }
});

Deno.test("Address - neighborhood is trimmed and whitespace collapsed", () => {
  const result = Address({
    ...validMinimal,
    neighborhood: "  Centro   Histórico  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.neighborhood, "Centro Histórico");
  }
});

Deno.test("Address - number is trimmed and whitespace collapsed", () => {
  const result = Address({
    ...validMinimal,
    number: "  100  A  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.number, "100 A");
  }
});

Deno.test("Address - complement is trimmed and whitespace collapsed", () => {
  const result = Address({
    ...validMinimal,
    complement: "  Bloco   B   Apt   201  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.complement, "Bloco B Apt 201");
  }
});
