// =============================================================================
// Tests — UpdateHousingCondition Use Case
// =============================================================================

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateHousingCondition } from "../../../src/application/assessment/use-cases/update_housing_condition.ts";
import type { HousingConditionInput } from "../../../src/domain/assessment/value-objects/housing_condition.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validInput: HousingConditionInput = {
  type: "OWNED",
  wallMaterial: "MASONRY",
  numberOfRooms: 4,
  numberOfBedrooms: 2,
  numberOfBathrooms: 1,
  waterSupply: "PUBLIC_NETWORK",
  hasPipedWater: true,
  electricityAccess: "METERED_CONNECTION",
  sewageDisposal: "PUBLIC_SEWER",
  wasteCollection: "DIRECT_COLLECTION",
  accessibilityLevel: "FULLY_ACCESSIBLE",
  isInGeographicRiskArea: false,
  hasDifficultAccess: false,
  isInSocialConflictArea: false,
  hasDiagnosticObservations: false,
};

describe("UpdateHousingCondition", () => {
  it("should proxy validated housing condition data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateHousingCondition({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/housing-condition`);
    assertEquals(proxy.calls[0]!.actorId, ACTOR_ID);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateHousingCondition({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return domain error on invalid housing condition input", async () => {
    const proxy = createProxyStub();
    const useCase = updateHousingCondition({ proxy });

    const invalidData: HousingConditionInput = {
      ...validInput,
      numberOfRooms: -1,
    };

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "HC-001");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return HC-005 for invalid enum value", async () => {
    const proxy = createProxyStub();
    const useCase = updateHousingCondition({ proxy });

    const invalidData: HousingConditionInput = {
      ...validInput,
      type: "INVALID_TYPE",
    };

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "HC-005");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("NETWORK_ERROR");
    const useCase = updateHousingCondition({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  });
});
