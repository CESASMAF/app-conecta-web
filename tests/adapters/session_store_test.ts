import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createSessionStore } from "../../src/adapters/auth/session_store.ts";
import type { Session } from "../../src/types.ts";

const makeSession = (overrides?: Partial<Session>): Session => ({
  accessToken: "access-token-123",
  refreshToken: "refresh-token-456",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "user-sub-789",
  userName: "Test User",
  roles: [],
  ...overrides,
});

describe("SessionStore", () => {
  it("set + get returns session", () => {
    const store = createSessionStore();
    const session = makeSession();

    store.set("sid-1", session);

    assertEquals(store.get("sid-1"), session);
  });

  it("get on expired session returns undefined and deletes it", () => {
    const store = createSessionStore();
    const expired = makeSession({ expiresAt: Date.now() - 1_000 });

    store.set("sid-expired", expired);

    assertEquals(store.get("sid-expired"), undefined);
    // Confirm it was deleted — second get also returns undefined
    assertEquals(store.get("sid-expired"), undefined);
  });

  it("get on unknown key returns undefined", () => {
    const store = createSessionStore();

    assertEquals(store.get("nonexistent"), undefined);
  });

  it("delete removes session", () => {
    const store = createSessionStore();
    const session = makeSession();

    store.set("sid-del", session);
    store.delete("sid-del");

    assertEquals(store.get("sid-del"), undefined);
  });

  it("set overwrites existing session", () => {
    const store = createSessionStore();
    const original = makeSession({ userName: "Original" });
    const updated = makeSession({ userName: "Updated" });

    store.set("sid-overwrite", original);
    store.set("sid-overwrite", updated);

    assertEquals(store.get("sid-overwrite"), updated);
  });
});
