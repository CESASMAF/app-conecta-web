import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Person, RegisterPersonInput } from "../../../src/domain/people/value-objects/person.ts";
import { PersonId } from "../../../src/domain/kernel/ids.ts";

describe("Person smart constructor", () => {
  const validId = PersonId("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

  it("creates a Person from valid API response", () => {
    if (!validId.ok) throw new Error("setup failed");

    const result = Person({
      id: validId.value,
      fullName: "Maria Silva",
      cpf: "12345678901",
      birthDate: "1990-05-15",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.fullName, "Maria Silva");
      assertEquals(result.value.cpf, "12345678901");
      assertEquals(result.value.birthDate, "1990-05-15");
    }
  });

  it("trims fullName whitespace", () => {
    if (!validId.ok) throw new Error("setup failed");

    const result = Person({
      id: validId.value,
      fullName: "  Maria Silva  ",
      cpf: undefined,
      birthDate: "1990-05-15",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.fullName, "Maria Silva");
    }
  });

  it("rejects empty fullName", () => {
    if (!validId.ok) throw new Error("setup failed");

    const result = Person({
      id: validId.value,
      fullName: "",
      cpf: undefined,
      birthDate: "1990-05-15",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("rejects whitespace-only fullName", () => {
    if (!validId.ok) throw new Error("setup failed");

    const result = Person({
      id: validId.value,
      fullName: "   ",
      cpf: undefined,
      birthDate: "1990-05-15",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("rejects invalid birthDate format", () => {
    if (!validId.ok) throw new Error("setup failed");

    const result = Person({
      id: validId.value,
      fullName: "Maria Silva",
      cpf: undefined,
      birthDate: "15/05/1990",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("accepts undefined cpf", () => {
    if (!validId.ok) throw new Error("setup failed");

    const result = Person({
      id: validId.value,
      fullName: "Maria Silva",
      cpf: undefined,
      birthDate: "2000-01-01",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.cpf, undefined);
    }
  });
});

describe("RegisterPersonInput smart constructor", () => {
  it("creates valid input", () => {
    const result = RegisterPersonInput({
      fullName: "João Santos",
      cpf: "98765432100",
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.fullName, "João Santos");
      assertEquals(result.value.cpf, "98765432100");
      assertEquals(result.value.birthDate, "1985-03-20");
    }
  });

  it("trims fullName", () => {
    const result = RegisterPersonInput({
      fullName: "  João Santos  ",
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.fullName, "João Santos");
    }
  });

  it("rejects empty fullName", () => {
    const result = RegisterPersonInput({
      fullName: "",
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("rejects fullName exceeding 200 chars", () => {
    const result = RegisterPersonInput({
      fullName: "A".repeat(201),
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("accepts fullName at exactly 200 chars", () => {
    const result = RegisterPersonInput({
      fullName: "A".repeat(200),
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, true);
  });

  it("rejects cpf not 11 digits", () => {
    const result = RegisterPersonInput({
      fullName: "Maria",
      cpf: "123456",
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-004");
    }
  });

  it("rejects cpf with non-digit chars", () => {
    const result = RegisterPersonInput({
      fullName: "Maria",
      cpf: "123.456.789-01",
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-004");
    }
  });

  it("accepts undefined cpf", () => {
    const result = RegisterPersonInput({
      fullName: "Maria",
      birthDate: "1985-03-20",
    });

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.cpf, undefined);
    }
  });

  it("rejects invalid birthDate format", () => {
    const result = RegisterPersonInput({
      fullName: "Maria",
      birthDate: "20-03-1985",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("rejects future birthDate", () => {
    const result = RegisterPersonInput({
      fullName: "Maria",
      birthDate: "2099-01-01",
    });

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PEO-001");
    }
  });

  it("accepts today as birthDate", () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const isoDate = `${year}-${month}-${day}`;

    const result = RegisterPersonInput({
      fullName: "Recem Nascido",
      birthDate: isoDate,
    });

    assertEquals(result.ok, true);
  });
});
