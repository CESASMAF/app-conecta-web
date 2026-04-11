import { assertEquals } from "@std/assert";
import { createReferralUseCase } from "../../../src/application/protection/use-cases/create_referral.ts";
import type { CreateReferralRawInput } from "../../../src/application/protection/use-cases/create_referral.ts";
import { ok, err } from "../../../src/domain/shared/result.ts";
import type { Result } from "../../../src/domain/shared/result.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// =============================================================================
// Test Doubles
// =============================================================================

const createMockProxy = (
  postResult: Result<unknown, ProxyError> = ok({ id: "created" }),
): Readonly<{
  proxy: BackendProxy;
  calls: { path: string; body: unknown; actorId: string }[];
}> => {
  const calls: { path: string; body: unknown; actorId: string }[] = [];
  return {
    proxy: {
      get: async <T>(_path: string) =>
        ok({}) as Result<T, ProxyError>,
      post: async <T>(path: string, body: unknown, actorId: string) => {
        calls.push({ path, body, actorId });
        return postResult as Result<T, ProxyError>;
      },
      put: async <T>(_path: string, _body: unknown, _actorId: string) =>
        ok({}) as Result<T, ProxyError>,
      delete: async (_path: string, _actorId: string) =>
        ok(undefined) as Result<void, ProxyError>,
    },
    calls,
  };
};

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_UUID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const VALID_UUID_3 = "c3d4e5f6-a7b8-9012-cdef-123456789012";
const ACTOR_ID = "actor-001";

const validInput = (
  overrides?: Partial<CreateReferralRawInput>,
): CreateReferralRawInput => ({
  patientId: VALID_UUID,
  date: "2024-01-15T10:30:00.000Z",
  requestingProfessionalId: VALID_UUID_2,
  referredPersonId: VALID_UUID_3,
  destinationService: "CRAS",
  reason: "Social vulnerability requires external support",
  actorId: ACTOR_ID,
  ...overrides,
});

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("createReferral - valid input proxies to backend and returns Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
  assertEquals(calls[0]!.path, `/api/v1/patients/${VALID_UUID}/referrals`);
  assertEquals(calls[0]!.actorId, ACTOR_ID);
});

Deno.test("createReferral - passes validated referral body to proxy", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  await useCase(validInput());

  assertEquals(calls.length, 1);
  const body = calls[0]!.body as Record<string, unknown>;
  assertEquals(body.reason, "Social vulnerability requires external support");
  assertEquals(body.destinationService, "CRAS");
});

// =============================================================================
// Validation Failures — proxy must NOT be called
// =============================================================================

Deno.test("createReferral - invalid patientId returns INVALID_PATIENT_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput({ patientId: "not-valid" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
  assertEquals(calls.length, 0);
});

Deno.test("createReferral - invalid date returns INVALID_TIMESTAMP", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput({ date: "not-a-date" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_TIMESTAMP");
  assertEquals(calls.length, 0);
});

Deno.test("createReferral - invalid professionalId returns INVALID_PROFESSIONAL_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput({ requestingProfessionalId: "bad" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PROFESSIONAL_ID");
  assertEquals(calls.length, 0);
});

Deno.test("createReferral - invalid personId returns INVALID_PERSON_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput({ referredPersonId: "bad" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PERSON_ID");
  assertEquals(calls.length, 0);
});

Deno.test("createReferral - invalid destination service returns DS-001", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput({ destinationService: "INVALID" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "DS-001");
  assertEquals(calls.length, 0);
});

Deno.test("createReferral - empty reason returns REF-002", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput({ reason: "   " }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "REF-002");
  assertEquals(calls.length, 0);
});

// =============================================================================
// Proxy Failure
// =============================================================================

Deno.test("createReferral - proxy failure returns ProxyError", async () => {
  const { proxy } = createMockProxy(err("TIMEOUT"));
  const useCase = createReferralUseCase({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "TIMEOUT");
});
