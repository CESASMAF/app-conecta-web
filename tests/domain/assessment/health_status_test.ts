import { assertEquals } from "@std/assert";
import {
  createHealthStatus,
  type Deficiency,
  type GestatingMember,
} from "../../../src/domain/assessment/value-objects/health_status.ts";
import { generatePersonId, LookupId, type LookupId as LookupIdType } from "../../../src/domain/kernel/ids.ts";
import { generatePatientId } from "../../../src/domain/registry/value-objects/patient_id.ts";

// =============================================================================
// Helpers — branded test values
// =============================================================================

const familyId = generatePatientId();
const memberId1 = generatePersonId();
const memberId2 = generatePersonId();

const unwrapLookupId = (raw: string): LookupIdType => {
  const r = LookupId(raw);
  if (!r.ok) throw new Error(`Test setup failed for LookupId: ${raw}`);
  return r.value;
};

const lookupId1 = unwrapLookupId("c0000000-0000-0000-0000-000000000001");

// =============================================================================
// HealthStatus — Factory
// =============================================================================

Deno.test("createHealthStatus - creates with all fields populated", () => {
  const deficiency: Deficiency = {
    memberId: memberId1,
    deficiencyTypeId: lookupId1,
    needsConstantCare: true,
    responsibleCaregiverName: "Maria Silva",
  };

  const gestating: GestatingMember = {
    memberId: memberId2,
    monthsGestation: 6,
    startedPrenatalCare: true,
  };

  const status = createHealthStatus({
    familyId,
    deficiencies: [deficiency],
    gestatingMembers: [gestating],
    constantCareNeeds: [memberId1],
    foodInsecurity: true,
  });

  assertEquals(status.familyId, familyId);
  assertEquals(status.deficiencies.length, 1);
  assertEquals(status.deficiencies[0]?.memberId, memberId1);
  assertEquals(status.deficiencies[0]?.needsConstantCare, true);
  assertEquals(status.deficiencies[0]?.responsibleCaregiverName, "Maria Silva");
  assertEquals(status.gestatingMembers.length, 1);
  assertEquals(status.gestatingMembers[0]?.monthsGestation, 6);
  assertEquals(status.gestatingMembers[0]?.startedPrenatalCare, true);
  assertEquals(status.constantCareNeeds.length, 1);
  assertEquals(status.foodInsecurity, true);
});

Deno.test("createHealthStatus - creates with empty arrays", () => {
  const status = createHealthStatus({
    familyId,
    deficiencies: [],
    gestatingMembers: [],
    constantCareNeeds: [],
    foodInsecurity: false,
  });

  assertEquals(status.familyId, familyId);
  assertEquals(status.deficiencies.length, 0);
  assertEquals(status.gestatingMembers.length, 0);
  assertEquals(status.constantCareNeeds.length, 0);
  assertEquals(status.foodInsecurity, false);
});

Deno.test("createHealthStatus - deficiency with undefined caregiver name", () => {
  const deficiency: Deficiency = {
    memberId: memberId1,
    deficiencyTypeId: lookupId1,
    needsConstantCare: false,
    responsibleCaregiverName: undefined,
  };

  const status = createHealthStatus({
    familyId,
    deficiencies: [deficiency],
    gestatingMembers: [],
    constantCareNeeds: [],
    foodInsecurity: false,
  });

  assertEquals(status.deficiencies[0]?.responsibleCaregiverName, undefined);
  assertEquals(status.deficiencies[0]?.needsConstantCare, false);
});

Deno.test("createHealthStatus - multiple deficiencies and gestating members", () => {
  const def1: Deficiency = {
    memberId: memberId1,
    deficiencyTypeId: lookupId1,
    needsConstantCare: true,
    responsibleCaregiverName: "Ana",
  };
  const def2: Deficiency = {
    memberId: memberId2,
    deficiencyTypeId: lookupId1,
    needsConstantCare: false,
    responsibleCaregiverName: undefined,
  };

  const gest: GestatingMember = {
    memberId: memberId2,
    monthsGestation: 3,
    startedPrenatalCare: false,
  };

  const status = createHealthStatus({
    familyId,
    deficiencies: [def1, def2],
    gestatingMembers: [gest],
    constantCareNeeds: [memberId1, memberId2],
    foodInsecurity: true,
  });

  assertEquals(status.deficiencies.length, 2);
  assertEquals(status.gestatingMembers.length, 1);
  assertEquals(status.constantCareNeeds.length, 2);
});

Deno.test("createHealthStatus - gestating member preserves all fields", () => {
  const gest: GestatingMember = {
    memberId: memberId1,
    monthsGestation: 9,
    startedPrenatalCare: true,
  };

  const status = createHealthStatus({
    familyId,
    deficiencies: [],
    gestatingMembers: [gest],
    constantCareNeeds: [],
    foodInsecurity: false,
  });

  assertEquals(status.gestatingMembers[0]?.memberId, memberId1);
  assertEquals(status.gestatingMembers[0]?.monthsGestation, 9);
  assertEquals(status.gestatingMembers[0]?.startedPrenatalCare, true);
});
