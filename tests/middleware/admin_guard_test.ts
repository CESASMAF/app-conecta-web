/**
 * Admin Guard Middleware — Tests for adminGuard() middleware.
 * Validates role-based access control for admin/owner roles.
 */

import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../src/types.ts";
import { adminGuard } from "../../src/middleware/admin_guard.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseSession: Session = {
  accessToken: "tok_test",
  refreshToken: "ref_test",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "user-123",
  userName: "Test User",
  roles: [],
};

const adminSession: Session = {
  ...baseSession,
  roles: ["admin"],
};

const ownerSession: Session = {
  ...baseSession,
  roles: ["owner"],
};

const socialWorkerSession: Session = {
  ...baseSession,
  roles: ["social_worker"],
};

const multiRoleSession: Session = {
  ...baseSession,
  roles: ["social_worker", "admin"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a Hono test app with adminGuard applied.
 * Injects the given session via a preceding middleware (simulating authGuard).
 */
const createAdminTestApp = (session: Session | undefined): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  // Simulate authGuard having already resolved the session
  app.use("*", async (c, next) => {
    c.set("session", session);
    c.set("sessionId", session ? "sid_test" : undefined);
    await next();
  });

  // Apply admin guard on admin routes
  app.use("/admin/*", adminGuard());
  app.use("/api/admin/*", adminGuard());

  // Test handlers
  app.get("/admin/page", (c) => c.text("admin page"));
  app.get("/api/admin/test", (c) => c.json({ ok: true }));
  app.post("/api/admin/test", (c) => c.json({ ok: true }));

  return app;
};

// =============================================================================
// API routes: /api/admin/* returns 403 JSON when no admin role
// =============================================================================

Deno.test("adminGuard - GET /api/admin/test with no admin role returns 403 JSON", async () => {
  const app = createAdminTestApp(socialWorkerSession);
  const res = await app.request("/api/admin/test");

  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: admin role required");
});

Deno.test("adminGuard - POST /api/admin/test with no admin role returns 403 JSON", async () => {
  const app = createAdminTestApp(socialWorkerSession);
  const res = await app.request("/api/admin/test", { method: "POST" });

  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: admin role required");
});

Deno.test("adminGuard - /api/admin/test with empty roles returns 403 JSON", async () => {
  const app = createAdminTestApp(baseSession);
  const res = await app.request("/api/admin/test");

  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: admin role required");
});

// =============================================================================
// API routes: admin/owner roles pass through
// =============================================================================

Deno.test("adminGuard - /api/admin/test with admin role returns 200", async () => {
  const app = createAdminTestApp(adminSession);
  const res = await app.request("/api/admin/test");

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.ok, true);
});

Deno.test("adminGuard - /api/admin/test with owner role returns 200", async () => {
  const app = createAdminTestApp(ownerSession);
  const res = await app.request("/api/admin/test");

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.ok, true);
});

Deno.test("adminGuard - /api/admin/test with multi-role (includes admin) returns 200", async () => {
  const app = createAdminTestApp(multiRoleSession);
  const res = await app.request("/api/admin/test");

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.ok, true);
});

// =============================================================================
// SSR routes: /admin/* redirects to / when no admin role
// =============================================================================

Deno.test("adminGuard - GET /admin/page with no admin role redirects to /", async () => {
  const app = createAdminTestApp(socialWorkerSession);
  const res = await app.request("/admin/page", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/");
});

Deno.test("adminGuard - GET /admin/page with empty roles redirects to /", async () => {
  const app = createAdminTestApp(baseSession);
  const res = await app.request("/admin/page", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/");
});

// =============================================================================
// SSR routes: admin/owner roles pass through
// =============================================================================

Deno.test("adminGuard - GET /admin/page with admin role returns 200", async () => {
  const app = createAdminTestApp(adminSession);
  const res = await app.request("/admin/page");

  assertEquals(res.status, 200);
  const body = await res.text();
  assertEquals(body, "admin page");
});

Deno.test("adminGuard - GET /admin/page with owner role returns 200", async () => {
  const app = createAdminTestApp(ownerSession);
  const res = await app.request("/admin/page");

  assertEquals(res.status, 200);
  const body = await res.text();
  assertEquals(body, "admin page");
});

// =============================================================================
// Edge: undefined session (authGuard should block before, but guard anyway)
// =============================================================================

Deno.test("adminGuard - /api/admin/test with undefined session returns 403", async () => {
  const app = createAdminTestApp(undefined);
  const res = await app.request("/api/admin/test");

  assertEquals(res.status, 403);
});

Deno.test("adminGuard - /admin/page with undefined session redirects to /", async () => {
  const app = createAdminTestApp(undefined);
  const res = await app.request("/admin/page", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/");
});
