// =============================================================================
// Tests — UpdateSocialHealthSummary Use Case
// =============================================================================

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateSocialHealthSummary } from "../../../src/application/assessment/use-cases/update_social_health_summary.ts";
import type { SocialHealthSummaryInput } from "../../../src/domain/assessment/value-objects/social_health_summary.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validInput: SocialHealthSummaryInput = {
  requiresConstantCare: true,
  hasMobilityImpairment: false,
  functionalDependencies: ["Bathing", "Medication management"],
  hasRelevantDrugTherapy: true,
};

describe("UpdateSocialHealthSummary", () => {
  it("should proxy validated social health summary data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialHealthSummary({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/social-health-summary`);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialHealthSummary({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should handle empty functionalDependencies (normalization removes empties)", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialHealthSummary({ proxy });

    const emptyDepsInput: SocialHealthSummaryInput = {
      ...validInput,
      functionalDependencies: [],
    };

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: emptyDepsInput, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("VALIDATION_ERROR");
    const useCase = updateSocialHealthSummary({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "VALIDATION_ERROR");
  });
});
