import { assertEquals } from "@std/assert";
import { registerAppointment } from "../../../src/application/care/use-cases/register_appointment.ts";
import type { RegisterAppointmentRawInput } from "../../../src/application/care/use-cases/register_appointment.ts";
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
const ACTOR_ID = "actor-001";

const validInput = (
  overrides?: Partial<RegisterAppointmentRawInput>,
): RegisterAppointmentRawInput => ({
  patientId: VALID_UUID,
  date: "2024-01-15T10:30:00.000Z",
  professionalInChargeId: VALID_UUID_2,
  type: "HOME_VISIT",
  summary: "Patient evaluation",
  actorId: ACTOR_ID,
  ...overrides,
});

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("registerAppointment - valid input proxies to backend and returns Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
  assertEquals(calls[0]!.path.startsWith(`/api/v1/patients/${VALID_UUID}/appointments`), true);
  assertEquals(calls[0]!.actorId, ACTOR_ID);
});

Deno.test("registerAppointment - passes validated appointment body to proxy", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  await useCase(validInput({ summary: "Note", actionPlan: "Plan" }));

  assertEquals(calls.length, 1);
  const body = calls[0]!.body as Record<string, unknown>;
  assertEquals(body.summary, "Note");
  assertEquals(body.actionPlan, "Plan");
  assertEquals(body.type, "HOME_VISIT");
});

// =============================================================================
// Validation Failures — proxy must NOT be called
// =============================================================================

Deno.test("registerAppointment - invalid patientId returns INVALID_PATIENT_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput({ patientId: "not-a-uuid" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
  assertEquals(calls.length, 0);
});

Deno.test("registerAppointment - invalid date returns INVALID_TIMESTAMP", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput({ date: "not-a-date" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_TIMESTAMP");
  assertEquals(calls.length, 0);
});

Deno.test("registerAppointment - invalid professionalId returns INVALID_PROFESSIONAL_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput({ professionalInChargeId: "bad-id" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PROFESSIONAL_ID");
  assertEquals(calls.length, 0);
});

Deno.test("registerAppointment - invalid appointment type returns APT-001", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput({ type: "INVALID_TYPE" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "APT-001");
  assertEquals(calls.length, 0);
});

Deno.test("registerAppointment - domain error SCA-002 when no summary or actionPlan", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput({ summary: undefined, actionPlan: undefined }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "SCA-002");
  assertEquals(calls.length, 0);
});

// =============================================================================
// Proxy Failure
// =============================================================================

Deno.test("registerAppointment - proxy failure returns ProxyError", async () => {
  const { proxy } = createMockProxy(err("NETWORK_ERROR"));
  const useCase = registerAppointment({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
});
