import { assertEquals, assertStringIncludes } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../src/types.ts";
import { authGuard } from "../../src/middleware/auth_guard.ts";
import { pageRoutes } from "../../src/routes/pages.tsx";

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
 * Helper: build a test app with page routes.
 * When `injectSession` is true, simulates an authenticated user.
 * Always injects a secureHeadersNonce to satisfy the views.
 */
const createTestApp = (injectSession: boolean): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  // Inject secureHeadersNonce (simulates securityHeaders middleware)
  app.use("*", async (c, next) => {
    c.set("secureHeadersNonce", "test-nonce-abc123");
    if (injectSession) {
      c.set("session", validSession);
      c.set("sessionId", "sid_abc");
    } else {
      c.set("session", undefined);
      c.set("sessionId", undefined);
    }
    await next();
  });

  app.use("*", authGuard());
  app.route("/", pageRoutes);

  return app;
};

// ---------- Redirect ----------

Deno.test("GET / - with session redirects to /hub", async () => {
  const app = createTestApp(true);
  const res = await app.request("/");
  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/hub");
});

Deno.test("GET / - without session renders landing page", async () => {
  const app = createTestApp(false);
  const res = await app.request("/");
  assertEquals(res.status, 200);
  const html = await res.text();
  assertEquals(html.includes("auth-hub-app"), true);
});

// ---------- Login page (public, SSR-only) ----------

Deno.test("GET /login - returns 200 without session (public)", async () => {
  const app = createTestApp(false);
  const res = await app.request("/login");
  assertEquals(res.status, 200);
  const html = await res.text();
  assertStringIncludes(html, "Conecta");
});

Deno.test("GET /login - has no script tags (SSR-only)", async () => {
  const app = createTestApp(false);
  const res = await app.request("/login");
  const html = await res.text();
  // The login page should not have module script tags for client apps
  assertEquals(html.includes('type="module" src="/static/js/'), false);
});

Deno.test("GET /login - includes font links", async () => {
  const app = createTestApp(false);
  const res = await app.request("/login");
  const html = await res.text();
  assertStringIncludes(html, "fonts.googleapis.com");
  assertStringIncludes(html, "fontshare.com");
});

// ---------- Protected pages (with session) ----------

Deno.test("GET /social-care - returns 200 with session", async () => {
  const app = createTestApp(true);
  const res = await app.request("/social-care");
  assertEquals(res.status, 200);
  const html = await res.text();
  assertStringIncludes(html, "social-care-app");
});

Deno.test("GET /social-care - includes CSP nonce in script tags", async () => {
  const app = createTestApp(true);
  const res = await app.request("/social-care");
  const html = await res.text();
  assertStringIncludes(html, 'nonce="test-nonce-abc123"');
  assertStringIncludes(html, "/static/js/social-care.js");
});

Deno.test("GET /social-care - includes font links", async () => {
  const app = createTestApp(true);
  const res = await app.request("/social-care");
  const html = await res.text();
  assertStringIncludes(html, "fonts.googleapis.com");
  assertStringIncludes(html, "Playfair+Display");
});

Deno.test("GET /patient-registration - returns 200 with session", async () => {
  const app = createTestApp(true);
  const res = await app.request("/patient-registration");
  assertEquals(res.status, 200);
  const html = await res.text();
  assertStringIncludes(html, "registration-app");
  assertStringIncludes(html, "/static/js/registration.js");
});

Deno.test("GET /family-composition/test-uuid - returns 200 with session", async () => {
  const app = createTestApp(true);
  const res = await app.request("/family-composition/test-uuid");
  assertEquals(res.status, 200);
  const html = await res.text();
  assertStringIncludes(html, "family-app");
  assertStringIncludes(html, 'data-patient-id="test-uuid"');
  assertStringIncludes(html, "/static/js/family-composition.js");
});

// ---------- Protected pages (without session) ----------

Deno.test("GET /social-care - redirects to /auth/login without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/social-care");
  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/auth/login");
});

Deno.test("GET /patient-registration - redirects to /auth/login without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/patient-registration");
  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/auth/login");
});

Deno.test("GET /family-composition/abc - redirects to /auth/login without session", async () => {
  const app = createTestApp(false);
  const res = await app.request("/family-composition/abc");
  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/auth/login");
});
