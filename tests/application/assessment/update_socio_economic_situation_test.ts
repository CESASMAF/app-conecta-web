// =============================================================================
// Tests — UpdateSocioEconomicSituation Use Case
// =============================================================================

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateSocioEconomicSituation } from "../../../src/application/assessment/use-cases/update_socio_economic_situation.ts";
import type { SocioEconomicInput } from "../../../src/domain/assessment/value-objects/socio_economic_situation.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validInput: SocioEconomicInput = {
  totalFamilyIncome: 3000,
  incomePerCapita: 750,
  receivesSocialBenefit: false,
  socialBenefits: { items: [] },
  mainSourceOfIncome: "Employment",
  hasUnemployed: false,
};

describe("UpdateSocioEconomicSituation", () => {
  it("should proxy validated socio-economic data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocioEconomicSituation({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/socio-economic`);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocioEconomicSituation({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return SES-003 when totalFamilyIncome is negative", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocioEconomicSituation({ proxy });

    const invalidData: SocioEconomicInput = { ...validInput, totalFamilyIncome: -100 };
    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SES-003");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return SES-005 when mainSourceOfIncome is empty", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocioEconomicSituation({ proxy });

    const invalidData: SocioEconomicInput = { ...validInput, mainSourceOfIncome: "   " };
    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SES-005");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("UNAUTHORIZED");
    const useCase = updateSocioEconomicSituation({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "UNAUTHORIZED");
  });
});
