import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import { registerPerson } from "../../../src/application/people/use-cases/register_person.ts";
import type { PeopleProxy } from "../../../src/application/people/ports/people-proxy.ts";

const VALID_CPF = "529.982.247-25";

const mockProxy = (response: ReturnType<PeopleProxy["post"]>): PeopleProxy => ({
  get: () => Promise.resolve(err("SERVER_ERROR")),
  post: () => response,
});

describe("RegisterPerson", () => {
  it("should validate and proxy registration", async () => {
    const output = { id: "new-id" };
    let calledBody: unknown = null;
    const proxy: PeopleProxy = {
      get: () => Promise.resolve(err("SERVER_ERROR")),
      post: (_path, body, _actorId) => { calledBody = body; return Promise.resolve(ok(output)); },
    };

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "Joao Silva",
      cpf: VALID_CPF,
      birthDate: "1990-01-15",
      actorId: "actor-123",
    });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, output);
    assertEquals((calledBody as Record<string, unknown>).fullName, "Joao Silva");
  });

  it("should reject empty fullName", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "   ",
      birthDate: "1990-01-15",
      actorId: "actor-123",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "EMPTY_FULL_NAME");
  });

  it("should reject fullName over 200 chars", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "A".repeat(201),
      birthDate: "1990-01-15",
      actorId: "actor-123",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "FULL_NAME_TOO_LONG");
  });

  it("should reject invalid CPF when provided", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "Ana",
      cpf: "000.000.000-00",
      birthDate: "1990-01-15",
      actorId: "actor-123",
    });

    assertEquals(result.ok, false);
    // CPF-004: all digits identical
    if (!result.ok) assertEquals(result.error, "CPF-004");
  });

  it("should reject invalid birthDate", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "Ana",
      birthDate: "not-a-date",
      actorId: "actor-123",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "INVALID_BIRTH_DATE");
  });

  it("should reject future birthDate", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "Ana",
      birthDate: "2099-01-15",
      actorId: "actor-123",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "FUTURE_BIRTH_DATE");
  });

  it("should reject empty actorId", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "Ana",
      birthDate: "1990-01-15",
      actorId: "  ",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "EMPTY_ACTOR_ID");
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockProxy(Promise.resolve(err("NETWORK_ERROR")));

    const result = await registerPerson({ peopleProxy: proxy })({
      fullName: "Ana",
      birthDate: "1990-01-15",
      actorId: "actor-123",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  });
});
