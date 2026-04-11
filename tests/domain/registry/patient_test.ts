import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  createPatient,
  addFamilyMember,
  removeFamilyMember,
  assignPrimaryCaregiver,
  updateSocialIdentity,
  isInBoundary,
} from "../../../src/domain/registry/aggregates/patient/operations.ts";
import type { CreatePatientInput, Patient } from "../../../src/domain/registry/aggregates/patient/types.ts";
import type { FamilyMember } from "../../../src/domain/registry/entities/family_member.ts";
import { generatePatientId } from "../../../src/domain/registry/value-objects/patient_id.ts";
import { generatePersonId } from "../../../src/domain/kernel/ids.ts";
import type { LookupId, PersonId } from "../../../src/domain/kernel/ids.ts";
import { now } from "../../../src/domain/kernel/timestamp.ts";
import type { PersonalData } from "../../../src/domain/registry/value-objects/personal_data.ts";
import type { CivilDocuments } from "../../../src/domain/registry/value-objects/civil_documents.ts";
import type { Address } from "../../../src/domain/kernel/address.ts";
import type { Diagnosis } from "../../../src/domain/care/value-objects/diagnosis.ts";
import type { SocialIdentity } from "../../../src/domain/registry/value-objects/social_identity.ts";

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const prRelationshipId = crypto.randomUUID() as unknown as LookupId;
const otherRelationshipId = crypto.randomUUID() as unknown as LookupId;

const fakePersonalData: PersonalData = {
  firstName: "Maria",
  lastName: "Silva",
  motherName: "Ana Silva",
  nationality: "Brasileira",
  sex: "FEMININO",
  socialName: undefined,
  birthDate: now(),
  phone: undefined,
};

const fakeCivilDocuments: CivilDocuments = {
  cpf: "123.456.789-09" as unknown as import("../../../src/domain/kernel/cpf.ts").CPF,
  nis: undefined,
  rgDocument: undefined,
};

const fakeAddress: Address = {
  cep: undefined,
  state: "SP",
  city: "Sao Paulo",
  street: undefined,
  neighborhood: undefined,
  number: undefined,
  complement: undefined,
  residenceLocation: "URBANO",
  isShelter: false,
  isHomeless: false,
};

const fakeDiagnosis: Diagnosis = {
  id: "A01.0" as unknown as import("../../../src/domain/care/value-objects/icd_code.ts").ICDCode,
  date: now(),
  description: "Test diagnosis",
};

const makePRMember = (personId?: PersonId): FamilyMember => ({
  personId: personId ?? generatePersonId(),
  relationshipId: prRelationshipId,
  isPrimaryCaregiver: true,
  residesWithPatient: true,
  hasDisability: false,
  requiredDocuments: [],
  birthDate: now(),
});

const makeOtherMember = (personId?: PersonId): FamilyMember => ({
  personId: personId ?? generatePersonId(),
  relationshipId: otherRelationshipId,
  isPrimaryCaregiver: false,
  residesWithPatient: true,
  hasDisability: false,
  requiredDocuments: [],
  birthDate: now(),
});

const validInput = (overrides?: Partial<CreatePatientInput>): CreatePatientInput => ({
  id: generatePatientId(),
  personId: generatePersonId(),
  personalData: fakePersonalData,
  civilDocuments: fakeCivilDocuments,
  socialIdentity: undefined,
  address: fakeAddress,
  diagnoses: [fakeDiagnosis],
  familyMembers: [makePRMember()],
  cns: undefined,
  prRelationshipId,
  ...overrides,
});

const createValidPatient = (overrides?: Partial<CreatePatientInput>): Patient => {
  const result = createPatient(validInput(overrides));
  if (!result.ok) {
    // This should never happen in test setup
    throw new Error(`Test setup failed: ${result.error}`);
  }
  return result.value;
};

// ---------------------------------------------------------------------------
// createPatient Tests
// ---------------------------------------------------------------------------

describe("createPatient", () => {
  it("creates a patient with valid input", () => {
    const result = createPatient(validInput());
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.version, 0);
      assertEquals(result.value.diagnoses.length, 1);
      assertEquals(result.value.familyMembers.length, 1);
    }
  });

  it("returns PAT-001 when diagnoses are empty", () => {
    const result = createPatient(validInput({ diagnoses: [] }));
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-001");
    }
  });

  it("returns PAT-002 when no PR member exists", () => {
    const result = createPatient(
      validInput({ familyMembers: [makeOtherMember()] }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-002");
    }
  });

  it("returns PAT-002 when multiple PR members exist", () => {
    const result = createPatient(
      validInput({ familyMembers: [makePRMember(), makePRMember()] }),
    );
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-002");
    }
  });

  it("returns PAT-002 when no family members at all", () => {
    const result = createPatient(validInput({ familyMembers: [] }));
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-002");
    }
  });
});

// ---------------------------------------------------------------------------
// addFamilyMember Tests
// ---------------------------------------------------------------------------

describe("addFamilyMember", () => {
  it("adds a family member successfully", () => {
    const patient = createValidPatient();
    const newMember = makeOtherMember();
    const result = addFamilyMember(patient, newMember, prRelationshipId);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.familyMembers.length, 2);
    }
  });

  it("returns PAT-003 for duplicate personId", () => {
    const sharedId = generatePersonId();
    const prMember = makePRMember(sharedId);
    const patient = createValidPatient({ familyMembers: [prMember] });
    const duplicate = makeOtherMember(sharedId);
    const result = addFamilyMember(patient, duplicate, prRelationshipId);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-003");
    }
  });

  it("returns PAT-004 for second PR member", () => {
    const patient = createValidPatient();
    const secondPR = makePRMember();
    const result = addFamilyMember(patient, secondPR, prRelationshipId);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-004");
    }
  });

  it("does not mutate the original patient", () => {
    const patient = createValidPatient();
    const originalLength = patient.familyMembers.length;
    addFamilyMember(patient, makeOtherMember(), prRelationshipId);
    assertEquals(patient.familyMembers.length, originalLength);
  });
});

// ---------------------------------------------------------------------------
// removeFamilyMember Tests
// ---------------------------------------------------------------------------

describe("removeFamilyMember", () => {
  it("removes a non-PR member successfully", () => {
    const otherMember = makeOtherMember();
    const patient = createValidPatient({
      familyMembers: [makePRMember(), otherMember],
    });
    const result = removeFamilyMember(patient, otherMember.personId, prRelationshipId);
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.familyMembers.length, 1);
    }
  });

  it("returns PAT-005 for non-existent member", () => {
    const patient = createValidPatient();
    const unknownId = generatePersonId();
    const result = removeFamilyMember(patient, unknownId, prRelationshipId);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-005");
    }
  });

  it("returns PAT-002 when removing the only PR", () => {
    const prMember = makePRMember();
    const patient = createValidPatient({
      familyMembers: [prMember, makeOtherMember()],
    });
    const result = removeFamilyMember(patient, prMember.personId, prRelationshipId);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-002");
    }
  });
});

// ---------------------------------------------------------------------------
// assignPrimaryCaregiver Tests
// ---------------------------------------------------------------------------

describe("assignPrimaryCaregiver", () => {
  it("assigns a new primary caregiver", () => {
    const otherMember = makeOtherMember();
    const patient = createValidPatient({
      familyMembers: [makePRMember(), otherMember],
    });

    const result = assignPrimaryCaregiver(patient, otherMember.personId);
    assertEquals(result.ok, true);
    if (result.ok) {
      const newCaregiver = result.value.familyMembers.find(
        (m) => m.personId === otherMember.personId,
      );
      assertEquals(newCaregiver?.isPrimaryCaregiver, true);

      // All others should be unset
      const others = result.value.familyMembers.filter(
        (m) => m.personId !== otherMember.personId,
      );
      for (const m of others) {
        assertEquals(m.isPrimaryCaregiver, false);
      }
    }
  });

  it("returns PAT-005 for non-existent member", () => {
    const patient = createValidPatient();
    const unknownId = generatePersonId();
    const result = assignPrimaryCaregiver(patient, unknownId);
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "PAT-005");
    }
  });
});

// ---------------------------------------------------------------------------
// updateSocialIdentity Tests
// ---------------------------------------------------------------------------

describe("updateSocialIdentity", () => {
  it("returns new patient with updated identity", () => {
    const patient = createValidPatient();
    const identity: SocialIdentity = {
      typeId: crypto.randomUUID() as unknown as LookupId,
      otherDescription: undefined,
    };

    const updated = updateSocialIdentity(patient, identity);
    assertEquals(updated.socialIdentity, identity);
    assertEquals(updated.id, patient.id);
    // Original unchanged
    assertEquals(patient.socialIdentity, undefined);
  });
});

// ---------------------------------------------------------------------------
// isInBoundary Tests
// ---------------------------------------------------------------------------

describe("isInBoundary", () => {
  it("returns true for the patient's own personId", () => {
    const patientPersonId = generatePersonId();
    const patient = createValidPatient({ personId: patientPersonId });
    assertEquals(isInBoundary(patient, patientPersonId), true);
  });

  it("returns true for a family member's personId", () => {
    const member = makeOtherMember();
    const patient = createValidPatient({
      familyMembers: [makePRMember(), member],
    });
    assertEquals(isInBoundary(patient, member.personId), true);
  });

  it("returns false for an unknown personId", () => {
    const patient = createValidPatient();
    const unknownId = generatePersonId();
    assertEquals(isInBoundary(patient, unknownId), false);
  });
});
