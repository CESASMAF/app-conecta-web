import { assertEquals } from "@std/assert";
import { ok, err, type Result } from "../../../src/domain/shared/result.ts";
import { registerPatient, type RegisterPatientInput } from "../../../src/application/registry/use-cases/register_patient.ts";
import type { BackendProxy, ProxyError } from "../../../src/application/shared/types.ts";

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const validPersonalData = (): RegisterPatientInput["personalData"] => ({
  firstName: "Maria",
  lastName: "Silva",
  motherName: "Ana Silva",
  nationality: "Brasileira",
  sex: "FEMININO",
  socialName: undefined,
  birthDate: "2000-01-15T00:00:00.000Z" as unknown as import("../../../src/domain/kernel/timestamp.ts").TimeStamp,
  phone: undefined,
});

const validCivilDocuments = (): RegisterPatientInput["civilDocuments"] => ({
  cpf: "529.982.247-25",
});

const validAddress = (): RegisterPatientInput["address"] => ({
  state: "SP",
  city: "Sao Paulo",
  residenceLocation: "URBANO",
  isShelter: false,
});

const validDiagnoses = (): RegisterPatientInput["diagnoses"] => ([
  { icdCode: "A169", date: "2020-06-15T00:00:00.000Z", description: "Tuberculose respiratoria" },
]);

const validInput = (): RegisterPatientInput => ({
  personalData: validPersonalData(),
  civilDocuments: validCivilDocuments(),
  address: validAddress(),
  diagnoses: validDiagnoses(),
  actorId: "actor-123",
});

const createMockProxy = (
  response: Result<unknown, ProxyError> = ok({ id: "patient-1" }),
): BackendProxy & { calls: readonly { path: string; body: unknown; actorId: string }[] } => {
  const calls: { path: string; body: unknown; actorId: string }[] = [];
  return {
    calls,
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

Deno.test("registerPatient - valid input proxies to backend and returns Ok", async () => {
  const proxy = createMockProxy(ok({ id: "patient-1" }));
  const useCase = registerPatient({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, true);
  assertEquals(proxy.calls.length, 1);
  assertEquals(proxy.calls[0]?.path, "/api/v1/patients");
  assertEquals(proxy.calls[0]?.actorId, "actor-123");
});

Deno.test("registerPatient - invalid personalData (empty firstName) returns PD-001", async () => {
  const proxy = createMockProxy();
  const useCase = registerPatient({ backendProxy: proxy });
  const input = {
    ...validInput(),
    personalData: { ...validPersonalData(), firstName: "" },
  };
  const result = await useCase(input);

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "PD-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("registerPatient - invalid CPF returns CPF error", async () => {
  const proxy = createMockProxy();
  const useCase = registerPatient({ backendProxy: proxy });
  const input = {
    ...validInput(),
    civilDocuments: { cpf: "000.000.000-00" },
  };
  const result = await useCase(input);

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "CPF-004");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("registerPatient - no civil documents returns CD-001", async () => {
  const proxy = createMockProxy();
  const useCase = registerPatient({ backendProxy: proxy });
  const input = {
    ...validInput(),
    civilDocuments: {},
  };
  const result = await useCase(input);

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "CD-001");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("registerPatient - invalid address (empty state) returns ADDR-002", async () => {
  const proxy = createMockProxy();
  const useCase = registerPatient({ backendProxy: proxy });
  const input = {
    ...validInput(),
    address: { ...validAddress(), state: "" },
  };
  const result = await useCase(input);

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "ADDR-002");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("registerPatient - invalid diagnosis (empty description) returns DIA-003", async () => {
  const proxy = createMockProxy();
  const useCase = registerPatient({ backendProxy: proxy });
  const input = {
    ...validInput(),
    diagnoses: [{ icdCode: "A169", date: "2020-06-15T00:00:00.000Z", description: "" }],
  };
  const result = await useCase(input);

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "DIA-003");
  assertEquals(proxy.calls.length, 0);
});

Deno.test("registerPatient - proxy failure returns ProxyError", async () => {
  const proxy = createMockProxy(err("NETWORK_ERROR" as const));
  const useCase = registerPatient({ backendProxy: proxy });
  const result = await useCase(validInput());

  assertEquals(result.ok, false);
  if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
});

Deno.test("registerPatient - empty diagnoses array is valid", async () => {
  const proxy = createMockProxy(ok({ id: "patient-1" }));
  const useCase = registerPatient({ backendProxy: proxy });
  const input = { ...validInput(), diagnoses: [] };
  const result = await useCase(input);

  assertEquals(result.ok, true);
  assertEquals(proxy.calls.length, 1);
});
