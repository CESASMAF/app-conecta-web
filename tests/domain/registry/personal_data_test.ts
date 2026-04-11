import { assertEquals } from "@std/assert";
import { PersonalData } from "../../../src/domain/registry/value-objects/personal_data.ts";
import { TimeStamp } from "../../../src/domain/kernel/timestamp.ts";
import type { TimeStamp as TimeStampType } from "../../../src/domain/kernel/timestamp.ts";

// =============================================================================
// Helpers
// =============================================================================

const pastDate = (): TimeStampType => {
  const r = TimeStamp("2000-06-15T00:00:00.000Z");
  if (!r.ok) throw new Error("Setup failed: invalid past timestamp");
  return r.value;
};

const futureDate = (): TimeStampType => {
  const r = TimeStamp("2099-01-01T00:00:00.000Z");
  if (!r.ok) throw new Error("Setup failed: invalid future timestamp");
  return r.value;
};

// =============================================================================
// PersonalData Smart Constructor — Happy Path
// =============================================================================

Deno.test("PersonalData - valid with all fields returns Ok", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: "Mari",
    birthDate: pastDate(),
    phone: "(11) 99999-0000",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.firstName, "Maria");
    assertEquals(result.value.lastName, "Silva");
    assertEquals(result.value.motherName, "Ana Silva");
    assertEquals(result.value.nationality, "Brasileira");
    assertEquals(result.value.sex, "FEMININO");
    assertEquals(result.value.socialName, "Mari");
    assertEquals(result.value.phone, "(11) 99999-0000");
  }
});

Deno.test("PersonalData - valid minimal (no socialName, no phone) returns Ok", () => {
  const result = PersonalData({
    firstName: "Jose",
    lastName: "Santos",
    motherName: "Clara Santos",
    nationality: "Brasileira",
    sex: "MASCULINO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.socialName, undefined);
    assertEquals(result.value.phone, undefined);
  }
});

// =============================================================================
// PersonalData Smart Constructor — Error Path
// =============================================================================

Deno.test("PersonalData - empty firstName returns PD-001", () => {
  const result = PersonalData({
    firstName: "",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-001");
  }
});

Deno.test("PersonalData - empty lastName returns PD-002", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-002");
  }
});

Deno.test("PersonalData - empty motherName returns PD-003", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-003");
  }
});

Deno.test("PersonalData - empty nationality returns PD-004", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-004");
  }
});

Deno.test("PersonalData - future birthDate returns PD-005", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: futureDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-005");
  }
});

Deno.test("PersonalData - invalid sex returns PD-006", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "UNKNOWN",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-006");
  }
});

// =============================================================================
// Normalization
// =============================================================================

Deno.test("PersonalData - socialName with only spaces becomes undefined", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: "   ",
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.socialName, undefined);
  }
});

Deno.test("PersonalData - phone with only spaces becomes undefined", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: "   ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.phone, undefined);
  }
});

Deno.test("PersonalData - firstName trims and collapses whitespace", () => {
  const result = PersonalData({
    firstName: "  Maria   Clara  ",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.firstName, "Maria Clara");
  }
});

Deno.test("PersonalData - whitespace-only firstName returns PD-001", () => {
  const result = PersonalData({
    firstName: "   ",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: undefined,
  });
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.error, "PD-001");
  }
});

Deno.test("PersonalData - phone trims but does not collapse internal spaces", () => {
  const result = PersonalData({
    firstName: "Maria",
    lastName: "Silva",
    motherName: "Ana Silva",
    nationality: "Brasileira",
    sex: "FEMININO",
    socialName: undefined,
    birthDate: pastDate(),
    phone: "  (11) 99999  0000  ",
  });
  assertEquals(result.ok, true);
  if (result.ok) {
    assertEquals(result.value.phone, "(11) 99999  0000");
  }
});
