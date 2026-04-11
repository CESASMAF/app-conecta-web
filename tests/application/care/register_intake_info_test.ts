import { assertEquals } from "@std/assert";
import { registerIntakeInfo } from "../../../src/application/care/use-cases/register_intake_info.ts";
import type { RegisterIntakeInfoRawInput } from "../../../src/application/care/use-cases/register_intake_info.ts";
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
  overrides?: Partial<RegisterIntakeInfoRawInput>,
): RegisterIntakeInfoRawInput => ({
  patientId: VALID_UUID,
  ingressTypeId: VALID_UUID_2,
  serviceReason: "Social vulnerability assessment",
  linkedSocialPrograms: [
    { programId: VALID_UUID_3, observation: "Active participant" },
  ],
  actorId: ACTOR_ID,
  ...overrides,
});

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("registerIntakeInfo - valid input proxies to backend and returns Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerIntakeInfo({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
  assertEquals(calls[0]!.path, `/api/v1/patients/${VALID_UUID}/intake-info`);
  assertEquals(calls[0]!.actorId, ACTOR_ID);
});

Deno.test("registerIntakeInfo - passes validated ingress info to proxy", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerIntakeInfo({ proxy });
  await useCase(validInput());

  assertEquals(calls.length, 1);
  const body = calls[0]!.body as Record<string, unknown>;
  assertEquals(body.serviceReason, "Social vulnerability assessment");
});

// =============================================================================
// Validation Failures — proxy must NOT be called
// =============================================================================

Deno.test("registerIntakeInfo - invalid patientId returns INVALID_PATIENT_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerIntakeInfo({ proxy });
  const result = await useCase(validInput({ patientId: "not-valid" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
  assertEquals(calls.length, 0);
});

Deno.test("registerIntakeInfo - invalid ingressTypeId returns INVALID_LOOKUP_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerIntakeInfo({ proxy });
  const result = await useCase(validInput({ ingressTypeId: "bad-id" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_LOOKUP_ID");
  assertEquals(calls.length, 0);
});

Deno.test("registerIntakeInfo - invalid programId returns INVALID_LOOKUP_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerIntakeInfo({ proxy });
  const result = await useCase(validInput({
    linkedSocialPrograms: [{ programId: "bad-id" }],
  }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_LOOKUP_ID");
  assertEquals(calls.length, 0);
});

Deno.test("registerIntakeInfo - empty service reason returns ING-001", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerIntakeInfo({ proxy });
  const result = await useCase(validInput({ serviceReason: "   " }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "ING-001");
  assertEquals(calls.length, 0);
});

// =============================================================================
// Proxy Failure
// =============================================================================

Deno.test("registerIntakeInfo - proxy failure returns ProxyError", async () => {
  const { proxy } = createMockProxy(err("SERVER_ERROR"));
  const useCase = registerIntakeInfo({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
});
