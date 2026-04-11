import { assertEquals } from "@std/assert";
import { updatePlacementHistory } from "../../../src/application/protection/use-cases/update_placement_history.ts";
import type { UpdatePlacementHistoryRawInput } from "../../../src/application/protection/use-cases/update_placement_history.ts";
import { ok, err } from "../../../src/domain/shared/result.ts";
import type { Result } from "../../../src/domain/shared/result.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// =============================================================================
// Test Doubles
// =============================================================================

const createMockProxy = (
  putResult: Result<unknown, ProxyError> = ok({ id: "updated" }),
): Readonly<{
  proxy: BackendProxy;
  calls: { method: string; path: string; body: unknown; actorId: string }[];
}> => {
  const calls: { method: string; path: string; body: unknown; actorId: string }[] = [];
  return {
    proxy: {
      post: async <T>(path: string, body: unknown, actorId: string) => {
        calls.push({ method: "POST", path, body, actorId });
        return ok({}) as Result<T, ProxyError>;
      },
      put: async <T>(path: string, body: unknown, actorId: string) => {
        calls.push({ method: "PUT", path, body, actorId });
        return putResult as Result<T, ProxyError>;
      },
      delete: async (path: string, actorId: string) => {
        calls.push({ method: "DELETE", path, body: undefined, actorId });
        return ok(undefined) as Result<void, ProxyError>;
      },
    },
    calls,
  };
};

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_UUID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const ACTOR_ID = "actor-001";

const validInput = (
  overrides?: Partial<UpdatePlacementHistoryRawInput>,
): UpdatePlacementHistoryRawInput => ({
  patientId: VALID_UUID,
  individualPlacements: [
    {
      memberId: VALID_UUID_2,
      startDate: "2024-01-01T00:00:00.000Z",
      reason: "Court order",
    },
  ],
  collectiveSituations: {},
  separationChecklist: {
    adultInPrison: false,
    adolescentInInternment: false,
  },
  actorId: ACTOR_ID,
  ...overrides,
});

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("updatePlacementHistory - valid input proxies via PUT and returns Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
  assertEquals(calls[0]!.method, "PUT");
  assertEquals(calls[0]!.path, `/api/v1/patients/${VALID_UUID}/placement-history`);
  assertEquals(calls[0]!.actorId, ACTOR_ID);
});

Deno.test("updatePlacementHistory - placement with endDate succeeds", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({
    individualPlacements: [
      {
        memberId: VALID_UUID_2,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-06-01T00:00:00.000Z",
        reason: "Temporary placement ended",
      },
    ],
  }));

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
});

Deno.test("updatePlacementHistory - empty placements list succeeds", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({ individualPlacements: [] }));

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
});

// =============================================================================
// Validation Failures — proxy must NOT be called
// =============================================================================

Deno.test("updatePlacementHistory - invalid patientId returns INVALID_PATIENT_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({ patientId: "bad" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
  assertEquals(calls.length, 0);
});

Deno.test("updatePlacementHistory - invalid memberId returns INVALID_PERSON_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({
    individualPlacements: [
      { memberId: "bad", startDate: "2024-01-01T00:00:00.000Z", reason: "Test" },
    ],
  }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PERSON_ID");
  assertEquals(calls.length, 0);
});

Deno.test("updatePlacementHistory - invalid startDate returns INVALID_TIMESTAMP", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({
    individualPlacements: [
      { memberId: VALID_UUID_2, startDate: "not-a-date", reason: "Test" },
    ],
  }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_TIMESTAMP");
  assertEquals(calls.length, 0);
});

Deno.test("updatePlacementHistory - invalid endDate returns INVALID_TIMESTAMP", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({
    individualPlacements: [
      {
        memberId: VALID_UUID_2,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "not-a-date",
        reason: "Test",
      },
    ],
  }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_TIMESTAMP");
  assertEquals(calls.length, 0);
});

Deno.test("updatePlacementHistory - endDate before startDate returns PLC-001", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput({
    individualPlacements: [
      {
        memberId: VALID_UUID_2,
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-01-01T00:00:00.000Z",
        reason: "Invalid range",
      },
    ],
  }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PLC-001");
  assertEquals(calls.length, 0);
});

// =============================================================================
// Proxy Failure
// =============================================================================

Deno.test("updatePlacementHistory - proxy failure returns ProxyError", async () => {
  const { proxy } = createMockProxy(err("SERVER_ERROR"));
  const useCase = updatePlacementHistory({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
});
