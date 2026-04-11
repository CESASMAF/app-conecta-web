// =============================================================================
// Tests — UpdateCommunitySupportNetwork Use Case
// =============================================================================

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateCommunitySupportNetwork } from "../../../src/application/assessment/use-cases/update_community_support_network.ts";
import type { CommunitySupportNetworkInput } from "../../../src/domain/assessment/value-objects/community_support_network.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validInput: CommunitySupportNetworkInput = {
  hasRelativeSupport: true,
  hasNeighborSupport: false,
  familyConflicts: "Minor disputes over finances",
  patientParticipatesInGroups: true,
  familyParticipatesInGroups: false,
  patientHasAccessToLeisure: true,
  facesDiscrimination: false,
};

describe("UpdateCommunitySupportNetwork", () => {
  it("should proxy validated community support data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateCommunitySupportNetwork({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/community-support`);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateCommunitySupportNetwork({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return CSN-001 when familyConflicts is empty", async () => {
    const proxy = createProxyStub();
    const useCase = updateCommunitySupportNetwork({ proxy });

    const invalidData: CommunitySupportNetworkInput = { ...validInput, familyConflicts: "   " };
    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "CSN-001");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return CSN-002 when familyConflicts exceeds 300 characters", async () => {
    const proxy = createProxyStub();
    const useCase = updateCommunitySupportNetwork({ proxy });

    const invalidData: CommunitySupportNetworkInput = {
      ...validInput,
      familyConflicts: "A".repeat(301),
    };
    const result = await useCase({ patientId: VALID_PATIENT_ID, data: invalidData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "CSN-002");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("TIMEOUT");
    const useCase = updateCommunitySupportNetwork({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validInput, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "TIMEOUT");
  });
});
