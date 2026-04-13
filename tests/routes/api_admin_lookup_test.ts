/**
 * Admin API Routes — Lookup Expansion Tests
 *
 * Tests the expanded lookup routes: toggle, requests CRUD, approve/reject.
 * Route ordering is critical: /lookups/requests must be before /lookups/:tableName.
 */

import { assert, assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../src/types.ts";
import { createAdminApiRoutes } from "../../src/routes/api_admin.ts";
import type {
  RemoteClient,
  RemoteRequestOptions,
} from "../../src/adapters/remote/remote_client.ts";
import { ok } from "../../src/domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TEST_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const adminSession: Session = {
  accessToken: "tok_admin",
  refreshToken: "ref_admin",
  idToken: undefined,
  expiresAt: Date.now() + 60_000,
  userSub: "admin-001",
  userName: "Admin User",
  roles: ["admin"],
};

// ---------------------------------------------------------------------------
// Mock RemoteClient
// ---------------------------------------------------------------------------

type CapturedCall = {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
};

const createMockRemoteClient = (
  responseBody: unknown = { data: "ok" },
  responseStatus = 200,
): { client: RemoteClient; calls: CapturedCall[] } => {
  const calls: CapturedCall[] = [];

  const client: RemoteClient = {
    fetch: (options: RemoteRequestOptions) => {
      calls.push({
        method: options.method,
        path: options.path,
        headers: {
          ...(options.actorId ? { "X-Actor-Id": options.actorId } : {}),
        },
        body: options.body,
      });
      return Promise.resolve(
        ok({
          status: responseStatus,
          headers: new Headers({ "content-type": "application/json" }),
          body: responseBody,
        }),
      );
    },
  };

  return { client, calls };
};

// ---------------------------------------------------------------------------
// Test App Factory
// ---------------------------------------------------------------------------

const createTestApp = (
  mockClient: RemoteClient,
): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    c.set("session", adminSession);
    c.set("sessionId", "sid_admin");
    c.set("config", {
      port: 8081,
      host: "0.0.0.0",
      sessionTtlMinutes: 60,
      apiBaseUrl: "http://social-care:3000",
      peopleContextBaseUrl: "http://people-context:3001",
      oidc: { issuer: "", clientId: "", clientSecret: "", redirectUri: "" },
      sessionSecret: "test-secret",
      secureCookies: false,
    });
    await next();
  });

  const adminRoutes = createAdminApiRoutes({
    remoteClient: mockClient,
  });

  app.route("/api/admin", adminRoutes);
  return app;
};

// =============================================================================
// Toggle Route — PATCH /lookups/:tableName/:id/toggle
// =============================================================================

Deno.test("lookup routes - PATCH /lookups/:tableName/:id/toggle proxies correctly", async () => {
  const { client, calls } = createMockRemoteClient({ active: false });
  const app = createTestApp(client);

  const res = await app.request(
    `/api/admin/lookups/dominio_parentesco/${TEST_UUID}/toggle`,
    {
      method: "PATCH",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );

  assertEquals(res.status, 200);
  assert(calls.length > 0, "Should have forwarded request");
  assertEquals(calls[0]!.method, "PATCH");
  assert(
    calls[0]!.path.includes(`dominio_parentesco/${TEST_UUID}/toggle`),
    "Path must include table/id/toggle",
  );
});

Deno.test("lookup routes - PATCH toggle rejects invalid table name", async () => {
  const { client } = createMockRemoteClient();
  const app = createTestApp(client);

  const res = await app.request(
    `/api/admin/lookups/invalid_table/${TEST_UUID}/toggle`,
    {
      method: "PATCH",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );

  assertEquals(res.status, 400);
});

Deno.test("lookup routes - PATCH toggle rejects invalid UUID", async () => {
  const { client } = createMockRemoteClient();
  const app = createTestApp(client);

  const res = await app.request(
    "/api/admin/lookups/dominio_parentesco/not-a-uuid/toggle",
    {
      method: "PATCH",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );

  assertEquals(res.status, 400);
});

// =============================================================================
// Requests Routes — GET /lookups/requests
// =============================================================================

Deno.test("lookup routes - GET /lookups/requests proxies to social-care", async () => {
  const { client, calls } = createMockRemoteClient([
    { id: "r1", status: "pendente" },
  ]);
  const app = createTestApp(client);

  const res = await app.request("/api/admin/lookups/requests");

  assertEquals(res.status, 200);
  assert(calls.length > 0, "Should have forwarded request");
  assert(
    calls[0]!.path.includes("/dominios/requests"),
    "Path must include /dominios/requests",
  );
});

Deno.test("lookup routes - GET /lookups/requests is NOT captured by :tableName", async () => {
  const { client, calls } = createMockRemoteClient([]);
  const app = createTestApp(client);

  await app.request("/api/admin/lookups/requests");

  assert(calls.length > 0, "Should have forwarded request");
  // Must NOT match /api/v1/dominios/requests as a table name lookup
  assert(
    !calls[0]!.path.includes("/dominios/requests/"),
    "Should use requests endpoint, not table endpoint",
  );
  assertEquals(calls[0]!.path, "/api/v1/dominios/requests");
});

// =============================================================================
// Requests Routes — POST /lookups/requests
// =============================================================================

Deno.test("lookup routes - POST /lookups/requests proxies correctly", async () => {
  const { client } = createMockRemoteClient({ id: "req-1" }, 201);
  const app = createTestApp(client);

  const res = await app.request("/api/admin/lookups/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      tableName: "dominio_parentesco",
      label: "Novo valor",
    }),
  });

  assert(
    res.status >= 200 && res.status < 300,
    `Expected 2xx, got ${res.status}`,
  );
});

// =============================================================================
// Requests Routes — PUT /lookups/requests/:requestId/approve
// =============================================================================

Deno.test("lookup routes - PUT /lookups/requests/:id/approve proxies correctly", async () => {
  const { client, calls } = createMockRemoteClient({ approved: true });
  const app = createTestApp(client);

  const res = await app.request(
    `/api/admin/lookups/requests/${TEST_UUID}/approve`,
    {
      method: "PUT",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );

  assertEquals(res.status, 200);
  assert(calls.length > 0, "Should have forwarded request");
  assertEquals(calls[0]!.method, "PUT");
  assert(
    calls[0]!.path.includes(`/requests/${TEST_UUID}/approve`),
    "Path must include /requests/:id/approve",
  );
});

Deno.test("lookup routes - PUT approve rejects invalid UUID", async () => {
  const { client } = createMockRemoteClient();
  const app = createTestApp(client);

  const res = await app.request(
    "/api/admin/lookups/requests/not-valid/approve",
    {
      method: "PUT",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    },
  );

  assertEquals(res.status, 400);
});

// =============================================================================
// Requests Routes — PUT /lookups/requests/:requestId/reject
// =============================================================================

Deno.test("lookup routes - PUT /lookups/requests/:id/reject proxies with body", async () => {
  const { client, calls } = createMockRemoteClient({ rejected: true });
  const app = createTestApp(client);

  const res = await app.request(
    `/api/admin/lookups/requests/${TEST_UUID}/reject`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ reviewNote: "Valor duplicado" }),
    },
  );

  assertEquals(res.status, 200);
  assert(calls.length > 0, "Should have forwarded request");
  assertEquals(calls[0]!.method, "PUT");
});

Deno.test("lookup routes - PUT reject rejects invalid UUID", async () => {
  const { client } = createMockRemoteClient();
  const app = createTestApp(client);

  const res = await app.request(
    "/api/admin/lookups/requests/bad-id/reject",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ reviewNote: "test" }),
    },
  );

  assertEquals(res.status, 400);
});
