import { assertEquals } from "@std/assert";
import { ok, err, type Result } from "../../../src/domain/shared/result.ts";
import { updateSocialIdentity, type UpdateSocialIdentityInput } from "../../../src/application/registry/use-cases/update_social_identity.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_LOOKUP_UUID = "c3d4e5f6-a7b8-9012-cdef-123456789012";

const validInput = (): UpdateSocialIdentityInput => ({
  patientId: VALID_UUID,
  typeId: VALID_LOOKUP_UUID,
  isOtherType: false,
  actorId: "actor-123",
});

const createMockProxy = (
  response: Result<unknown, ProxyError> = ok({ ok: true }),
): BackendProxy & { putCalls: readonly { path: string; body: unknown; actorId: string }[] } => {
  const putCalls: { path: string; body: unknown; actorId: string }[] = [];
  return {
    putCalls,
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

Deno.test("updateSocialIdentity - valid input proxies PUT to backend", async () => {
  const proxy = createMockProxy();
  const useCase = updateSocialIdentity({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(proxy.putCalls.length, 1);
  assertEquals(
    proxy.putCalls[0]?.path,
    `/api/v1/patients/${VALID_UUID}/social-identity`,
  );
  assertEquals(proxy.putCalls[0]?.actorId, "actor-123");
});

Deno.test("updateSocialIdentity - invalid patientId returns PATID-001", async () => {
  const proxy = createMockProxy();
  const useCase = updateSocialIdentity({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), patientId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PATID-001");
  assertEquals(proxy.putCalls.length, 0);
});

Deno.test("updateSocialIdentity - invalid typeId returns LID-001", async () => {
  const proxy = createMockProxy();
  const useCase = updateSocialIdentity({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), typeId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "LID-001");
  assertEquals(proxy.putCalls.length, 0);
});

Deno.test("updateSocialIdentity - isOtherType without description returns SI-001", async () => {
  const proxy = createMockProxy();
  const useCase = updateSocialIdentity({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), isOtherType: true });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "SI-001");
  assertEquals(proxy.putCalls.length, 0);
});

Deno.test("updateSocialIdentity - isOtherType with description is valid", async () => {
  const proxy = createMockProxy();
  const useCase = updateSocialIdentity({ backendProxy: proxy });
  const result = await useCase({
    ...validInput(),
    isOtherType: true,
    otherDescription: "Quilombola",
  });

  assertEquals(result.ok, true);
  assertEquals(proxy.putCalls.length, 1);
});

Deno.test("updateSocialIdentity - proxy failure returns ProxyError", async () => {
  const proxy = createMockProxy(err("VALIDATION_ERROR" as const));
  const useCase = updateSocialIdentity({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "VALIDATION_ERROR");
});
