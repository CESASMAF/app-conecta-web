import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import { assignRole } from "../../../src/application/people/use-cases/assign_role.ts";
import type { PeopleProxy } from "../../../src/application/people/ports/people-proxy.ts";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const mockProxy = (response: ReturnType<PeopleProxy["post"]>): PeopleProxy => ({
  get: () => Promise.resolve(err("SERVER_ERROR")),
  post: () => response,
});

describe("AssignRole", () => {
  it("should validate and proxy role assignment", async () => {
    const output = { id: "role-id" };
    let calledPath = "";
    const proxy: PeopleProxy = {
      get: () => Promise.resolve(err("SERVER_ERROR")),
      post: (path, _body, _actorId) => { calledPath = path; return Promise.resolve(ok(output)); },
    };

    const result = await assignRole({ peopleProxy: proxy })({
      personId: VALID_UUID,
      system: "social-care",
      role: "professional",
      actorId: "actor-1",
    });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, output);
    assertEquals(calledPath, `/api/v1/people/${VALID_UUID}/roles`);
  });

  it("should reject invalid PersonId", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await assignRole({ peopleProxy: proxy })({
      personId: "not-a-uuid",
      system: "social-care",
      role: "professional",
      actorId: "actor-1",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "PID-001");
  });

  it("should reject empty system", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await assignRole({ peopleProxy: proxy })({
      personId: VALID_UUID,
      system: "  ",
      role: "professional",
      actorId: "actor-1",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "EMPTY_SYSTEM");
  });

  it("should reject empty role", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await assignRole({ peopleProxy: proxy })({
      personId: VALID_UUID,
      system: "social-care",
      role: "",
      actorId: "actor-1",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "EMPTY_ROLE");
  });

  it("should reject empty actorId", async () => {
    const proxy = mockProxy(Promise.resolve(ok({ id: "x" })));

    const result = await assignRole({ peopleProxy: proxy })({
      personId: VALID_UUID,
      system: "social-care",
      role: "professional",
      actorId: "",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "EMPTY_ACTOR_ID");
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockProxy(Promise.resolve(err("UNAUTHORIZED")));

    const result = await assignRole({ peopleProxy: proxy })({
      personId: VALID_UUID,
      system: "social-care",
      role: "professional",
      actorId: "actor-1",
    });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "UNAUTHORIZED");
  });
});
