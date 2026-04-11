import { assertEquals } from "@std/assert";
import { ok, err, type Result } from "../../../src/domain/shared/result.ts";
import { removeFamilyMember, type RemoveFamilyMemberInput } from "../../../src/application/registry/use-cases/remove_family_member.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_UUID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

const validInput = (): RemoveFamilyMemberInput => ({
  patientId: VALID_UUID,
  memberId: VALID_UUID_2,
  actorId: "actor-123",
});

const createMockProxy = (
  response: Result<void, ProxyError> = ok(undefined),
): BackendProxy & { deleteCalls: readonly { path: string; actorId: string }[] } => {
  const deleteCalls: { path: string; actorId: string }[] = [];
  return {
    deleteCalls,
    post: async <T>(_path: string, _body: unknown, _actorId: string): Promise<Result<T, ProxyError>> => {
      return ok(undefined as T);
    },
    put: async <T>(_path: string, _body: unknown, _actorId: string): Promise<Result<T, ProxyError>> => {
      return ok(undefined as T);
    },
    delete: async (path: string, actorId: string): Promise<Result<void, ProxyError>> => {
      deleteCalls.push({ path, actorId });
      return response;
    },
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

Deno.test("removeFamilyMember - valid input proxies DELETE to backend", async () => {
  const proxy = createMockProxy();
  const useCase = removeFamilyMember({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(proxy.deleteCalls.length, 1);
  assertEquals(
    proxy.deleteCalls[0]?.path,
    `/api/v1/patients/${VALID_UUID}/family-members/${VALID_UUID_2}`,
  );
  assertEquals(proxy.deleteCalls[0]?.actorId, "actor-123");
});

Deno.test("removeFamilyMember - invalid patientId returns PATID-001", async () => {
  const proxy = createMockProxy();
  const useCase = removeFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), patientId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PATID-001");
  assertEquals(proxy.deleteCalls.length, 0);
});

Deno.test("removeFamilyMember - invalid memberId returns PID-001", async () => {
  const proxy = createMockProxy();
  const useCase = removeFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), memberId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PID-001");
  assertEquals(proxy.deleteCalls.length, 0);
});

Deno.test("removeFamilyMember - proxy failure returns ProxyError", async () => {
  const proxy = createMockProxy(err("TIMEOUT" as const));
  const useCase = removeFamilyMember({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "TIMEOUT");
});
