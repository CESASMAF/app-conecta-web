import { assertEquals } from "@std/assert";
import { ok, err, type Result } from "../../../src/domain/shared/result.ts";
import { addFamilyMember, type AddFamilyMemberInput } from "../../../src/application/registry/use-cases/add_family_member.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_UUID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const VALID_UUID_3 = "c3d4e5f6-a7b8-9012-cdef-123456789012";

const validInput = (): AddFamilyMemberInput => ({
  patientId: VALID_UUID,
  personId: VALID_UUID_2,
  relationshipId: VALID_UUID_3,
  residesWithPatient: true,
  hasDisability: false,
  requiredDocuments: ["CPF", "RG"],
  birthDate: "1990-05-20T00:00:00.000Z",
  actorId: "actor-123",
});

const createMockProxy = (
  response: Result<unknown, ProxyError> = ok({ id: "member-1" }),
): BackendProxy & { calls: readonly { path: string; body: unknown; actorId: string }[] } => {
  const calls: { path: string; body: unknown; actorId: string }[] = [];
  return {
    calls,
    get: async <T>(_path: string): Promise<Result<T, ProxyError>> => {
      return ok(undefined as T);
    },
    post: async <T>(path: string, body: unknown, actorId: string): Promise<Result<T, ProxyError>> => {
      calls.push({ path, body, actorId });
      return response as Result<T, ProxyError>;
    },
    put: async <T>(_path: string, _body: unknown, _actorId: string): Promise<Result<T, ProxyError>> => {
      return ok(undefined as T);
    },
    delete: async (_path: string, _actorId: string): Promise<Result<void, ProxyError>> => {
      return ok(undefined);
    },
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

Deno.test("addFamilyMember - valid input proxies to backend and returns Ok", async () => {
  const proxy = createMockProxy();
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(proxy.calls.length, 1);
  assertEquals(proxy.calls[0]?.path, `/api/v1/patients/${VALID_UUID}/family-members`);
  assertEquals(proxy.calls[0]?.actorId, "actor-123");
});

Deno.test("addFamilyMember - invalid patientId returns PATID-001", async () => {
  const proxy = createMockProxy();
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), patientId: "not-a-uuid" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PATID-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("addFamilyMember - invalid personId returns PID-001", async () => {
  const proxy = createMockProxy();
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), personId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PID-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("addFamilyMember - invalid relationshipId returns LID-001", async () => {
  const proxy = createMockProxy();
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), relationshipId: "bad" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "LID-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("addFamilyMember - invalid birthDate returns TS error", async () => {
  const proxy = createMockProxy();
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), birthDate: "" });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "TS-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("addFamilyMember - invalid requiredDocument returns FM-001", async () => {
  const proxy = createMockProxy();
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase({ ...validInput(), requiredDocuments: ["INVALID"] });

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "FM-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("addFamilyMember - proxy failure returns ProxyError", async () => {
  const proxy = createMockProxy(err("SERVER_ERROR" as const));
  const useCase = addFamilyMember({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
});
