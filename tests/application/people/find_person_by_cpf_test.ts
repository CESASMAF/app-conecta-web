import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import { findPersonByCpf } from "../../../src/application/people/use-cases/find_person_by_cpf.ts";
import type { PeopleProxy } from "../../../src/application/people/ports/people-proxy.ts";

const VALID_CPF = "529.982.247-25"; // known valid CPF

const mockProxy = (response: ReturnType<PeopleProxy["get"]>): PeopleProxy => ({
  get: () => response,
  post: () => Promise.resolve(err("SERVER_ERROR")),
});

describe("FindPersonByCpf", () => {
  it("should validate CPF and proxy lookup", async () => {
    const person = { id: "abc", fullName: "Maria", cpf: "52998224725" };
    let calledPath = "";
    const proxy: PeopleProxy = {
      get: (path) => { calledPath = path; return Promise.resolve(ok(person)); },
      post: () => Promise.resolve(err("SERVER_ERROR")),
    };

    const result = await findPersonByCpf({ peopleProxy: proxy })({ cpf: VALID_CPF });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, person);
    assertEquals(calledPath, "/api/v1/people/by-cpf/52998224725");
  });

  it("should return CPF error for invalid input", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x", fullName: "x" })));

    const result = await findPersonByCpf({ peopleProxy: proxy })({ cpf: "invalid" });

    assertEquals(result.ok, false);
    // CPF-002 for invalid characters or CPF-003 for wrong length
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockProxy(Promise.resolve(err("TIMEOUT")));

    const result = await findPersonByCpf({ peopleProxy: proxy })({ cpf: VALID_CPF });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "TIMEOUT");
  });
});
