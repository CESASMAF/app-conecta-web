import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ok, err } from "../../../src/domain/shared/result.ts";
import { searchPeople } from "../../../src/application/people/use-cases/search_people.ts";
import type { PeopleProxy } from "../../../src/application/people/ports/people-proxy.ts";

const mockProxy = (response: ReturnType<PeopleProxy["get"]>): PeopleProxy => ({
  get: () => response,
  post: () => Promise.resolve(err("SERVER_ERROR")),
});

describe("SearchPeople", () => {
  it("should proxy search with all params", async () => {
    const expected = { items: [{ id: "1", fullName: "Ana" }], nextCursor: "abc" };
    let calledPath = "";
    const proxy: PeopleProxy = {
      get: (path) => { calledPath = path; return Promise.resolve(ok(expected)); },
      post: () => Promise.resolve(err("SERVER_ERROR")),
    };

    const result = await searchPeople({ peopleProxy: proxy })({
      search: "Ana",
      limit: 10,
      cursor: "xyz",
    });

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, expected);
    assertEquals(calledPath.includes("search=Ana"), true);
    assertEquals(calledPath.includes("limit=10"), true);
    assertEquals(calledPath.includes("cursor=xyz"), true);
  });

  it("should proxy search with no params", async () => {
    const expected = { items: [], nextCursor: undefined };
    const proxy = mockProxy(Promise.resolve(ok(expected)));

    const result = await searchPeople({ peopleProxy: proxy })({});

    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, expected);
  });

  it("should return proxy error on failure", async () => {
    const proxy = mockProxy(Promise.resolve(err("NETWORK_ERROR")));

    const result = await searchPeople({ peopleProxy: proxy })({ search: "test" });

    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  });
});
