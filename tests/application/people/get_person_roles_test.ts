import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import { getPersonRoles } from "../../../src/application/people/use-cases/get_person_roles.ts";
import type { PeopleProxy } from "../../../src/application/people/ports/people-proxy.ts";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const mockProxy = (response: ReturnType<PeopleProxy["get"]>): PeopleProxy => ({
  get: () => response,
  post: () => Promise.resolve(err("SERVER_ERROR")),
});

describe("GetPersonRoles", () => {
  it("should validate and proxy roles fetch", async () => {
    const roles = [{ id: "r1", system: "social-care", role: "admin", active: true }];
    let calledPath = "";
    const proxy: PeopleProxy = {
      get: (path) => { calledPath = path; return Promise.resolve(ok(roles)); },
      post: () => Promise.resolve(err("SERVER_ERROR")),
    };

    const result = await getPersonRoles({ peopleProxy: proxy })({ personId: VALID_UUID });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, roles);
    assertEquals(calledPath, `/api/v1/people/${VALID_UUID}/roles`);
  });

  it("should include active filter in query", async () => {
    let calledPath = "";
    const proxy: PeopleProxy = {
      get: (path) => { calledPath = path; return Promise.resolve(ok([])); },
      post: () => Promise.resolve(err("SERVER_ERROR")),
    };

    await getPersonRoles({ peopleProxy: proxy })({ personId: VALID_UUID, active: true });

    assertEquals(calledPath.includes("active=true"), true);
  });

  it("should reject invalid PersonId", async () => {
    const proxy = mockProxy(Promise.resolve(ok([])));

    const result = await getPersonRoles({ peopleProxy: proxy })({ personId: "bad" });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "PID-001");
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockProxy(Promise.resolve(err("TIMEOUT")));

    const result = await getPersonRoles({ peopleProxy: proxy })({ personId: VALID_UUID });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "TIMEOUT");
  });
});
