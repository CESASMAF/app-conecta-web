import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  createFamilyMember,
  type FamilyMemberInput,
} from "../../../src/domain/registry/entities/family_member.ts";
import { generatePersonId } from "../../../src/domain/kernel/ids.ts";
import { now } from "../../../src/domain/kernel/timestamp.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validLookupId = crypto.randomUUID() as unknown as import("../../../src/domain/kernel/ids.ts").LookupId;

const validInput = (): FamilyMemberInput => ({
  personId: generatePersonId(),
  relationshipId: validLookupId,
  isPrimaryCaregiver: false,
  residesWithPatient: true,
  hasDisability: false,
  requiredDocuments: ["RG", "CPF"],
  birthDate: now(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FamilyMember entity", () => {
  it("creates a valid family member", () => {
    const result = createFamilyMember(validInput());
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.residesWithPatient, true);
      assertEquals(result.value.isPrimaryCaregiver, false);
    }
  });

  it("deduplicates required documents", () => {
    const input = { ...validInput(), requiredDocuments: ["RG", "CPF", "RG", "CPF", "CPF"] };
    const result = createFamilyMember(input);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.requiredDocuments, ["CPF", "RG"]);
    }
  });

  it("sorts required documents alphabetically", () => {
    const input = { ...validInput(), requiredDocuments: ["TE", "CN", "CTPS", "RG", "CPF"] };
    const result = createFamilyMember(input);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.requiredDocuments, ["CN", "CPF", "CTPS", "RG", "TE"]);
    }
  });

  it("returns FM-001 for invalid document value", () => {
    const input = { ...validInput(), requiredDocuments: ["RG", "INVALID"] };
    const result = createFamilyMember(input);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "FM-001");
    }
  });

  it("accepts empty required documents array", () => {
    const input = { ...validInput(), requiredDocuments: [] as string[] };
    const result = createFamilyMember(input);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.requiredDocuments, []);
    }
  });
});
