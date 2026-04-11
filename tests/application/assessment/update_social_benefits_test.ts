// =============================================================================
// Tests — UpdateSocialBenefits Use Case
// =============================================================================

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateSocialBenefits } from "../../../src/application/assessment/use-cases/update_social_benefits.ts";
import type { SocialBenefitInput } from "../../../src/domain/assessment/value-objects/social_benefit.ts";
import type { PersonId } from "../../../src/domain/kernel/ids.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const MEMBER_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901" as unknown as PersonId;

const validBenefits: readonly SocialBenefitInput[] = [
  { benefitName: "Bolsa Familia", amount: 300, beneficiaryId: MEMBER_ID },
  { benefitName: "BPC", amount: 1212, beneficiaryId: MEMBER_ID },
];

describe("UpdateSocialBenefits", () => {
  it("should proxy validated social benefits data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialBenefits({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validBenefits, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/social-benefits`);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialBenefits({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validBenefits, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return SB-001 when benefit name is empty", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialBenefits({ proxy });

    const invalidBenefits: readonly SocialBenefitInput[] = [
      { benefitName: "   ", amount: 300, beneficiaryId: MEMBER_ID },
    ];

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidBenefits, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SB-001");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return SB-002 when benefit amount is zero or negative", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialBenefits({ proxy });

    const invalidBenefits: readonly SocialBenefitInput[] = [
      { benefitName: "BPC", amount: 0, beneficiaryId: MEMBER_ID },
    ];

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidBenefits, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SB-002");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return SBC-002 when duplicate benefit names exist", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialBenefits({ proxy });

    const duplicateBenefits: readonly SocialBenefitInput[] = [
      { benefitName: "Bolsa Familia", amount: 300, beneficiaryId: MEMBER_ID },
      { benefitName: "Bolsa Familia", amount: 500, beneficiaryId: MEMBER_ID },
    ];

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: duplicateBenefits, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SBC-002");
    assertEquals(proxy.calls.length, 0);
  });

  it("should proxy empty benefits list successfully", async () => {
    const proxy = createProxyStub();
    const useCase = updateSocialBenefits({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: [], actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("SERVER_ERROR");
    const useCase = updateSocialBenefits({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validBenefits, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
  });
});
