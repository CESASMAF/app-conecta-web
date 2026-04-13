import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import { findPersonById } from "../../../src/application/people/use-cases/find_person_by_id.ts";
import type { PeopleProxy } from "../../../src/application/people/ports/people-proxy.ts";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const mockProxy = (response: ReturnType<PeopleProxy["get"]>): PeopleProxy => ({
  get: () => response,
  post: () => Promise.resolve(err("SERVER_ERROR")),
});

describe("FindPersonById", () => {
  it("should validate and proxy lookup", async () => {
    const person = { id: VALID_UUID, fullName: "Carlos" };
    let calledPath = "";
    const proxy: PeopleProxy = {
      get: (path) => { calledPath = path; return Promise.resolve(ok(person)); },
      post: () => Promise.resolve(err("SERVER_ERROR")),
    };

    const result = await findPersonById({ peopleProxy: proxy })({ personId: VALID_UUID });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, person);
    assertEquals(calledPath, `/api/v1/people/${VALID_UUID}`);
  });

  it("should reject invalid PersonId", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x", fullName: "x" })));

    const result = await findPersonById({ peopleProxy: proxy })({ personId: "bad" });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "PID-001");
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockProxy(Promise.resolve(err("NETWORK_ERROR")));

    const result = await findPersonById({ peopleProxy: proxy })({ personId: VALID_UUID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  });
});
