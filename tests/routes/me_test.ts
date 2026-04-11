import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../src/types.ts";
import { authGuard } from "../../src/middleware/auth_guard.ts";
import { meRoutes } from "../../src/routes/me.ts";
import { getInitials, formatRole } from "../../src/routes/me.ts";
import { getAppsForRoles } from "../../src/adapters/app-registry.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const socialWorkerSession: Session = {
  accessToken: "tok_sw",
  refreshToken: "ref_sw",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "user-sw-1",
  userName: "Maria Clara Silva",
  roles: ["social_worker"],
};

const adminSession: Session = {
  accessToken: "tok_admin",
  refreshToken: "ref_admin",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "user-admin-1",
  userName: "João Admin",
  roles: ["admin"],
};

const ownerSession: Session = {
  accessToken: "tok_owner",
  refreshToken: "ref_owner",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "user-owner-1",
  userName: "Carlos",
  roles: ["owner"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createTestApp = (session: Session | undefined): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    c.set("secureHeadersNonce", "test-nonce");
    if (session) {
      c.set("session", session);
      c.set("sessionId", "sid_test");
    } else {
      c.set("session", undefined);
      c.set("sessionId", undefined);
    }
    await next();
  });

  app.use("*", authGuard());
  app.route("/", meRoutes);

  return app;
};

// ---------------------------------------------------------------------------
// GET /api/v1/me — with session
// ---------------------------------------------------------------------------

Deno.test("GET /api/v1/me - returns 200 with user data for social_worker", async () => {
  const app = createTestApp(socialWorkerSession);
  const res = await app.request("/api/v1/me");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.data.name, "Maria Clara Silva");
  assertEquals(body.data.firstName, "Maria");
  assertEquals(body.data.initials, "MS");
  assertEquals(body.data.role, "Assistente Social");
  assertEquals(typeof body.meta.timestamp, "string");
});

Deno.test("GET /api/v1/me - returns 200 with user data for admin", async () => {
  const app = createTestApp(adminSession);
  const res = await app.request("/api/v1/me");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.data.role, "Administrador");
});

// ---------------------------------------------------------------------------
// GET /api/v1/me — without session
// ---------------------------------------------------------------------------

Deno.test("GET /api/v1/me - returns 401 without session", async () => {
  const app = createTestApp(undefined);
  const res = await app.request("/api/v1/me");
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "Unauthorized");
});

// ---------------------------------------------------------------------------
// Apps filtered correctly by role
// ---------------------------------------------------------------------------

Deno.test("GET /api/v1/me - social_worker sees social-care app", async () => {
  const app = createTestApp(socialWorkerSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  const appIds = body.data.apps.map((a: { id: string }) => a.id);
  assertEquals(appIds.includes("social-care"), true);
});

Deno.test("GET /api/v1/me - social_worker sees relatorios app", async () => {
  const app = createTestApp(socialWorkerSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  const appIds = body.data.apps.map((a: { id: string }) => a.id);
  assertEquals(appIds.includes("relatorios"), true);
});

Deno.test("GET /api/v1/me - social_worker does NOT see admin app", async () => {
  const app = createTestApp(socialWorkerSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  const appIds = body.data.apps.map((a: { id: string }) => a.id);
  assertEquals(appIds.includes("admin"), false);
});

Deno.test("GET /api/v1/me - owner does NOT see social-care app", async () => {
  const app = createTestApp(ownerSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  const appIds = body.data.apps.map((a: { id: string }) => a.id);
  assertEquals(appIds.includes("social-care"), false);
});

Deno.test("GET /api/v1/me - admin sees all apps", async () => {
  const app = createTestApp(adminSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  // admin is in requiredRoles for all apps in registry
  assertEquals(body.data.apps.length >= 4, true);
});

Deno.test("GET /api/v1/me - app entries do NOT include requiredRoles", async () => {
  const app = createTestApp(socialWorkerSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  for (const a of body.data.apps) {
    assertEquals("requiredRoles" in a, false);
  }
});

// ---------------------------------------------------------------------------
// getInitials — unit tests
// ---------------------------------------------------------------------------

Deno.test("getInitials - two-word name extracts first and last initials", () => {
  assertEquals(getInitials("Maria Silva"), "MS");
});

Deno.test("getInitials - three-word name extracts first and last initials", () => {
  assertEquals(getInitials("Maria Clara Silva"), "MS");
});

Deno.test("getInitials - single name returns first letter", () => {
  assertEquals(getInitials("Carlos"), "C");
});

Deno.test("getInitials - empty string returns ?", () => {
  assertEquals(getInitials(""), "?");
});

Deno.test("getInitials - handles extra whitespace", () => {
  assertEquals(getInitials("  Ana   Beatriz  "), "AB");
});

// ---------------------------------------------------------------------------
// formatRole — unit tests
// ---------------------------------------------------------------------------

Deno.test("formatRole - admin returns Administrador", () => {
  assertEquals(formatRole(["admin"]), "Administrador");
});

Deno.test("formatRole - social_worker returns Assistente Social", () => {
  assertEquals(formatRole(["social_worker"]), "Assistente Social");
});

Deno.test("formatRole - owner returns Gestor", () => {
  assertEquals(formatRole(["owner"]), "Gestor");
});

Deno.test("formatRole - unknown role returns Usuário", () => {
  assertEquals(formatRole(["viewer"]), "Usuário");
});

Deno.test("formatRole - admin takes priority over social_worker", () => {
  assertEquals(formatRole(["social_worker", "admin"]), "Administrador");
});

// ---------------------------------------------------------------------------
// getAppsForRoles — unit tests
// ---------------------------------------------------------------------------

Deno.test("getAppsForRoles - empty roles returns empty array", () => {
  const apps = getAppsForRoles([]);
  assertEquals(apps.length, 0);
});

Deno.test("getAppsForRoles - health_professional sees saude app", () => {
  const apps = getAppsForRoles(["health_professional"]);
  const ids = apps.map((a) => a.id);
  assertEquals(ids.includes("saude"), true);
  assertEquals(ids.includes("social-care"), false);
});

Deno.test("GET /api/v1/me - lastUsedAppId is null", async () => {
  const app = createTestApp(socialWorkerSession);
  const res = await app.request("/api/v1/me");
  const body = await res.json();
  assertEquals(body.data.lastUsedAppId, null);
});
