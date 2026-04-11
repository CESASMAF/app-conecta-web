import { assertEquals } from "@std/assert";
import { ok, err, type Result } from "../../../src/domain/shared/result.ts";
import { assignPrimaryCaregiver, type AssignPrimaryCaregiverInput } from "../../../src/application/registry/use-cases/assign_primary_caregiver.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_UUID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

const validInput = (): AssignPrimaryCaregiverInput => ({
  patientId: VALID_UUID,
  personId: VALID_UUID_2,
  actorId: "actor-123",
});

const createMockProxy = (
  response: Result<unknown, ProxyError> = ok({ ok: true }),
): BackendProxy & { putCalls: readonly { path: string; body: unknown; actorId: string }[] } => {
  const putCalls: { path: string; body: unknown; actorId: string }[] = [];
  return {
    putCalls,
    get: async <T>(_path: string): Promise<Result<T, ProxyError>> => {
      return ok(undefined as T);
    },
    post: async <T>(_path: string, _body: unknown, _actorId: string): Promise<Result<T, ProxyError>> => {
      return ok(undefined as T);
    },
    put: async <T>(path: string, body: unknown, actorId: string): Promise<Result<T, ProxyError>> => {
      putCalls.push({ path, body, actorId });
      return response as Result<T, ProxyError>;
    },
    delete: async (_path: string, _actorId: string): Promise<Result<void, ProxyError>> => {
      return ok(undefined);
    },
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

Deno.test("assignPrimaryCaregiver - valid input proxies PUT to backend", async () => {
  const proxy = createMockProxy();
  const useCase = assignPrimaryCaregiver({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(proxy.putCalls.length, 1);
  assertEquals(
    proxy.putCalls[0]?.path,
    `/api/v1/patients/${VALID_UUID}/primary-caregiver`,
  );
  assertEquals(proxy.putCalls[0]?.actorId, "actor-123");
});

Deno.test("assignPrimaryCaregiver - invalid patientId returns PATID-001", async () => {
  const proxy = createMockProxy();
  const useCase = assignPrimaryCaregiver({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), patientId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PATID-001");
  assertEquals(proxy.putCalls.length, 0);
});

Deno.test("assignPrimaryCaregiver - invalid personId returns PID-001", async () => {
  const proxy = createMockProxy();
  const useCase = assignPrimaryCaregiver({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), personId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PID-001");
  assertEquals(proxy.putCalls.length, 0);
});

Deno.test("assignPrimaryCaregiver - proxy failure returns ProxyError", async () => {
  const proxy = createMockProxy(err("UNAUTHORIZED" as const));
  const useCase = assignPrimaryCaregiver({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "UNAUTHORIZED");
});
