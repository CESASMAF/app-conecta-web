import { assertEquals } from "@std/assert";
import { reportRightsViolation } from "../../../src/application/protection/use-cases/report_rights_violation.ts";
import type { ReportRightsViolationRawInput } from "../../../src/application/protection/use-cases/report_rights_violation.ts";
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
const ACTOR_ID = "actor-001";

const validInput = (
  overrides?: Partial<ReportRightsViolationRawInput>,
): ReportRightsViolationRawInput => ({
  patientId: VALID_UUID,
  reportDate: "2024-01-15T10:30:00.000Z",
  victimId: VALID_UUID_2,
  violationType: "NEGLECT",
  descriptionOfFact: "Observed signs of neglect during home visit",
  actorId: ACTOR_ID,
  ...overrides,
});

// =============================================================================
// Happy Path
// =============================================================================

Deno.test("reportRightsViolation - valid input proxies to backend and returns Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
  assertEquals(calls[0]!.path, `/api/v1/patients/${VALID_UUID}/violation-reports`);
  assertEquals(calls[0]!.actorId, ACTOR_ID);
});

Deno.test("reportRightsViolation - valid input with incidentDate proxies Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({
    incidentDate: "2024-01-10T08:00:00.000Z",
  }));

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
});

Deno.test("reportRightsViolation - valid input with actionsTaken proxies Ok", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({
    actionsTaken: "Reported to authorities",
  }));

  assertEquals(result.ok, true);
  assertEquals(calls.length, 1);
  const body = calls[0]!.body as Record<string, unknown>;
  assertEquals(body.actionsTaken, "Reported to authorities");
});

// =============================================================================
// Validation Failures — proxy must NOT be called
// =============================================================================

Deno.test("reportRightsViolation - invalid patientId returns INVALID_PATIENT_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({ patientId: "bad" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PATIENT_ID");
  assertEquals(calls.length, 0);
});

Deno.test("reportRightsViolation - invalid reportDate returns INVALID_TIMESTAMP", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({ reportDate: "not-a-date" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_TIMESTAMP");
  assertEquals(calls.length, 0);
});

Deno.test("reportRightsViolation - invalid incidentDate returns INVALID_TIMESTAMP", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({ incidentDate: "not-a-date" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_TIMESTAMP");
  assertEquals(calls.length, 0);
});

Deno.test("reportRightsViolation - invalid victimId returns INVALID_PERSON_ID", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({ victimId: "bad" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "INVALID_PERSON_ID");
  assertEquals(calls.length, 0);
});

Deno.test("reportRightsViolation - invalid violationType returns VT-001", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({ violationType: "INVALID" }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "VT-001");
  assertEquals(calls.length, 0);
});

Deno.test("reportRightsViolation - empty description returns RVR-003", async () => {
  const { proxy, calls } = createMockProxy();
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput({ descriptionOfFact: "   " }));

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "RVR-003");
  assertEquals(calls.length, 0);
});

// =============================================================================
// Proxy Failure
// =============================================================================

Deno.test("reportRightsViolation - proxy failure returns ProxyError", async () => {
  const { proxy } = createMockProxy(err("UNAUTHORIZED"));
  const useCase = reportRightsViolation({ proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "UNAUTHORIZED");
});
