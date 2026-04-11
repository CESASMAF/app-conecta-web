import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session, SessionStore } from "../../src/types.ts";
import { sessionMiddleware, SESSION_COOKIE } from "../../src/middleware/session.ts";

/** Creates an in-memory SessionStore for testing. */
const createMockStore = (): SessionStore & { readonly _map: Map<string, Session> } => {
  const map = new Map<string, Session>();
  return {
    _map: map,
    get: (id: string): Session | undefined => map.get(id),
    set: (id: string, session: Session): void => {
      map.set(id, session);
    },
    delete: (id: string): void => {
      map.delete(id);
    },
  };
};

/** Creates a valid session that expires 1 hour from now. */
const createValidSession = (): Session => ({
  accessToken: "access-token-123",
  refreshToken: "refresh-token-456",
  idToken: undefined,
  expiresAt: Date.now() + 3_600_000,
  userSub: "user-sub-abc",
  userName: "Test User",
  roles: [],
});

/** Creates an expired session. */
const createExpiredSession = (): Session => ({
  accessToken: "expired-access-token",
  refreshToken: "expired-refresh-token",
  idToken: undefined,
  expiresAt: Date.now() - 1_000,
  userSub: "user-sub-expired",
  userName: "Expired User",
  roles: [],
});

/** Helper: create a test app with sessionMiddleware and a route that exposes session context. */
const createTestApp = (store: SessionStore): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  // Inject the session store before the session middleware (simulates server setup)
  app.use("*", async (c, next) => {
    c.set("sessionStore", store);
    c.set("tokenRefresher", { refresh: async () => ({ ok: false, error: "TOKEN_EXCHANGE_FAILED" }), verifySessionCookie: async (v: string) => v });
    await next();
  });

  app.use("*", sessionMiddleware());

  app.get("/test", (c) => {
    const session = c.get("session");
    const sessionId = c.get("sessionId");
    return c.json({ session: session ?? null, sessionId: sessionId ?? null });
  });

  return app;
};

/** Helper: build a Request with the session cookie set. */
const requestWithCookie = (path: string, sessionId: string): Request =>
  new Request(`http://localhost${path}`, {
    headers: { cookie: `${SESSION_COOKIE}=${sessionId}` },
  });

Deno.test("sessionMiddleware - valid cookie resolves session in context", async () => {
  const store = createMockStore();
  const session = createValidSession();
  store.set("sid-valid", session);

  const app = createTestApp(store);
  const res = await app.request(requestWithCookie("/test", "sid-valid"));
  const body = await res.json();

  assertEquals(res.status, 200);
  assertEquals(body.session.accessToken, "access-token-123");
  assertEquals(body.session.userSub, "user-sub-abc");
  assertEquals(body.session.userName, "Test User");
  assertEquals(body.sessionId, "sid-valid");
});

Deno.test("sessionMiddleware - no cookie sets session to null", async () => {
  const store = createMockStore();
  const app = createTestApp(store);

  const res = await app.request("/test");
  const body = await res.json();

  assertEquals(res.status, 200);
  assertEquals(body.session, null);
  assertEquals(body.sessionId, null);
});

Deno.test("sessionMiddleware - cookie present but session not in store sets undefined", async () => {
  const store = createMockStore();
  const app = createTestApp(store);

  const res = await app.request(requestWithCookie("/test", "sid-nonexistent"));
  const body = await res.json();

  assertEquals(res.status, 200);
  assertEquals(body.session, null);
  assertEquals(body.sessionId, null);
});

Deno.test("sessionMiddleware - expired session is deleted from store and context is undefined", async () => {
  const store = createMockStore();
  const expired = createExpiredSession();
  store.set("sid-expired", expired);

  const app = createTestApp(store);
  const res = await app.request(requestWithCookie("/test", "sid-expired"));
  const body = await res.json();

  assertEquals(res.status, 200);
  assertEquals(body.session, null);
  assertEquals(body.sessionId, null);
  // Verify the expired session was cleaned up from the store
  assertEquals(store.get("sid-expired"), undefined);
});

Deno.test("sessionMiddleware - SESSION_COOKIE constant is __Host-session", () => {
  assertEquals(SESSION_COOKIE, "__Host-session");
});

Deno.test("sessionMiddleware - session with refreshToken undefined is preserved", async () => {
  const store = createMockStore();
  const session: Session = {
    accessToken: "token-no-refresh",
    refreshToken: undefined,
    idToken: undefined,
    expiresAt: Date.now() + 3_600_000,
    userSub: "user-no-refresh",
    userName: "No Refresh User",
    roles: [],
  };
  store.set("sid-no-refresh", session);

  const app = createTestApp(store);
  const res = await app.request(requestWithCookie("/test", "sid-no-refresh"));
  const body = await res.json();

  assertEquals(res.status, 200);
  assertEquals(body.session.accessToken, "token-no-refresh");
  assertEquals(body.session.refreshToken, undefined); // JSON.stringify drops undefined values
  assertEquals(body.sessionId, "sid-no-refresh");
});
