import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../src/types.ts";
import { authGuard } from "../../src/middleware/auth_guard.ts";

/** A valid session fixture. */
const validSession: Session = {
  accessToken: "tok_test",
  refreshToken: "ref_test",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "user-123",
  userName: "Test User",
  roles: [],
};

/**
 * Helper: build a Hono app for auth-guard tests.
 *
 * When `injectSession` is true a preceding middleware sets a valid session on
 * the context — simulating what `sessionMiddleware` would do in production.
 */
const createTestApp = (
  injectSession: boolean,
): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  if (injectSession) {
    app.use("*", async (c, next) => {
      c.set("session", validSession);
      c.set("sessionId", "sid_abc");
      await next();
    });
  } else {
    app.use("*", async (c, next) => {
      c.set("session", undefined);
      c.set("sessionId", undefined);
      await next();
    });
  }

  app.use("*", authGuard());

  // Catch-all route so that requests that pass through the guard have a handler.
  app.all("/*", (c) => c.json({ ok: true }));

  return app;
};

// ---------- Public paths ----------

Deno.test("authGuard - /health passes through without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/health");
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
});

Deno.test("authGuard - /auth/login passes through without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/auth/login");
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
});

Deno.test("authGuard - /static/style.css passes through without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/static/style.css");
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
});

Deno.test("authGuard - /ready passes through without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/ready");
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
});

// ---------- Protected paths without session ----------

Deno.test("authGuard - page request without session redirects to /auth/login", async () => {
  const app = createTestApp(false);
  const res = await app.request("/dashboard", { redirect: "manual" });
  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/auth/login");
});

Deno.test("authGuard - API request without session returns 401 JSON", async () => {
  const app = createTestApp(false);
  const res = await app.request("/api/patients");
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "Unauthorized");
});

// ---------- Protected paths with valid session ----------

Deno.test("authGuard - page request with session passes through", async () => {
  const app = createTestApp(true);
  const res = await app.request("/dashboard");
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
});

Deno.test("authGuard - API request with session passes through", async () => {
  const app = createTestApp(true);
  const res = await app.request("/api/patients");
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
});
