// =============================================================================
// Tests — UpdateWorkAndIncome Use Case
// =============================================================================

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateWorkAndIncome } from "../../../src/application/assessment/use-cases/update_work_and_income.ts";
import type { WorkAndIncomeInput } from "../../../src/domain/assessment/value-objects/work_and_income.ts";
import type { PersonId, LookupId } from "../../../src/domain/kernel/ids.ts";
import type { PatientId } from "../../../src/domain/registry/value-objects/patient_id.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validInput: WorkAndIncomeInput = {
  familyId: VALID_PATIENT_ID as unknown as PatientId,
  individualIncomes: [
    {
      memberId: "b2c3d4e5-f6a7-8901-bcde-f12345678901" as unknown as PersonId,
      occupationId: "c3d4e5f6-a7b8-9012-cdef-123456789012" as unknown as LookupId,
      hasWorkCard: true,
      monthlyAmount: 1500,
    },
  ],
  socialBenefits: [],
  hasRetiredMembers: false,
};

describe("UpdateWorkAndIncome", () => {
  it("should proxy validated work-and-income data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateWorkAndIncome({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/work-and-income`);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateWorkAndIncome({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return WI-001 when any monthlyAmount is negative", async () => {
    const proxy = createProxyStub();
    const useCase = updateWorkAndIncome({ proxy });

    const invalidData: WorkAndIncomeInput = {
      ...validInput,
      individualIncomes: [
        {
          memberId: "b2c3d4e5-f6a7-8901-bcde-f12345678901" as unknown as PersonId,
          occupationId: "c3d4e5f6-a7b8-9012-cdef-123456789012" as unknown as LookupId,
          hasWorkCard: true,
          monthlyAmount: -500,
        },
      ],
    };

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "WI-001");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("NETWORK_ERROR");
    const useCase = updateWorkAndIncome({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  });
});
