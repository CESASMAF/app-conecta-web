// =============================================================================
// Tests — UpdateEducationalStatus Use Case
// =============================================================================
// No domain validation — only patientId validation and proxy behavior tested.

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { updateEducationalStatus } from "../../../src/application/assessment/use-cases/update_educational_status.ts";
import { createProxyStub, createFailingProxyStub } from "./proxy_stub.ts";

const VALID_PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const INVALID_PATIENT_ID = "not-a-uuid";
const ACTOR_ID = "actor-a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validData = {
  familyId: VALID_PATIENT_ID,
  memberProfiles: [],
  programOccurrences: [],
};

describe("UpdateEducationalStatus", () => {
  it("should proxy educational status data on valid input", async () => {
    const proxy = createProxyStub();
    const useCase = updateEducationalStatus({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validData, actorId: ACTOR_ID });

    assertEquals(result.ok, true);
    assertEquals(proxy.calls.length, 1);
    assertEquals(proxy.calls[0]!.method, "put");
    assertEquals(proxy.calls[0]!.path, `/api/v1/patients/${VALID_PATIENT_ID}/educational-status`);
    assertEquals(proxy.calls[0]!.actorId, ACTOR_ID);
  });

  it("should return INVALID_PATIENT_ID when patientId is not a valid UUID", async () => {
    const proxy = createProxyStub();
    const useCase = updateEducationalStatus({ proxy });

    const result = await useCase({ patientId: INVALID_PATIENT_ID, data: validData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
    assertEquals(proxy.calls.length, 0);
  });

  it("should return ProxyError when proxy fails", async () => {
    const proxy = createFailingProxyStub("SERVER_ERROR");
    const useCase = updateEducationalStatus({ proxy });

    const result = await useCase({ patientId: VALID_PATIENT_ID, data: validData, actorId: ACTOR_ID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
  });
});
