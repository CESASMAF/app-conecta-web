import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../src/types.ts";
import type { ServerConfig } from "../../src/adapters/config/server_config.ts";
import { type Result, ok, err } from "../../src/domain/shared/result.ts";
import type {
  RemoteClient,
  RemoteRequestOptions,
  RemoteResponse,
  RemoteError,
} from "../../src/adapters/remote/remote_client.ts";
import { createApiRoutes } from "../../src/routes/api.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TEST_CONFIG: ServerConfig = {
  port: 8081,
  host: "0.0.0.0",
  sessionTtlMinutes: 60,
  apiBaseUrl: "http://backend:3000",
  peopleContextBaseUrl: "http://people:3001",
  oidc: {
    issuer: "https://auth.example.com",
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri: "http://localhost:8081/auth/callback",
  },
  sessionSecret: "test-secret-value",
  secureCookies: false,
};

const TEST_SESSION: Session = {
  accessToken: "test-access-token-123",
  refreshToken: "test-refresh-token",
  idToken: undefined,
  expiresAt: Date.now() + 3600_000,
  userSub: "user-sub-123",
  userName: "Test User",
  roles: [],
};

// ---------------------------------------------------------------------------
// Mock RemoteClient
// ---------------------------------------------------------------------------

type CapturedRequest = {
  baseUrl: string;
  path: string;
  method: string;
  accessToken: string;
  actorId: string | undefined;
  body: unknown;
};

const createMockRemoteClient = (
  response: Result<RemoteResponse, RemoteError>,
): Readonly<{ client: RemoteClient; captured: () => CapturedRequest | undefined }> => {
  let capturedRequest: CapturedRequest | undefined = undefined;

  const client: RemoteClient = {
    fetch: async (
      options: RemoteRequestOptions,
    ): Promise<Result<RemoteResponse, RemoteError>> => {
      capturedRequest = {
        baseUrl: options.baseUrl,
        path: options.path,
        method: options.method,
        accessToken: options.accessToken,
        actorId: options.actorId,
        body: options.body,
      };
      return response;
    },
  };

  return { client, captured: () => capturedRequest };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const createTestApp = (
  remoteClient: RemoteClient,
  session?: Session,
): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  // Simulate middleware that sets config and session
  app.use("*", async (c, next) => {
    c.set("config", TEST_CONFIG);
    c.set("session", session);
    c.set("sessionId", session ? "test-session-id" : undefined);
    await next();
  });

  app.route("/", createApiRoutes(remoteClient));
  return app;
};

// ---------------------------------------------------------------------------
// Tests: /api/v1/*
// ---------------------------------------------------------------------------

Deno.test("GET /api/v1/patients with session - proxied successfully (200)", async () => {
  const backendBody = { data: [{ id: "p1", name: "Alice" }] };
  const { client, captured } = createMockRemoteClient(
    ok({ status: 200, headers: new Headers(), body: backendBody }),
  );

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/v1/patients");

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body, backendBody);

  const req = captured();
  assertEquals(req?.baseUrl, "http://backend:3000");
  assertEquals(req?.path, "/api/v1/patients");
  assertEquals(req?.method, "GET");
  assertEquals(req?.accessToken, "test-access-token-123");
  assertEquals(req?.body, undefined);
});

Deno.test("GET /api/v1/patients without session - returns 401", async () => {
  const { client } = createMockRemoteClient(
    ok({ status: 200, headers: new Headers(), body: {} }),
  );

  const app = createTestApp(client);
  const res = await app.request("/api/v1/patients");

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body, { error: "Unauthorized" });
});

Deno.test("POST /api/v1/patients with body - body forwarded to backend", async () => {
  const requestBody = { cpf: "12345678901", name: "Bob" };
  const backendResponse = { id: "p2", cpf: "12345678901", name: "Bob" };
  const { client, captured } = createMockRemoteClient(
    ok({ status: 201, headers: new Headers(), body: backendResponse }),
  );

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/v1/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  assertEquals(res.status, 201);
  const body = await res.json();
  assertEquals(body, backendResponse);

  const req = captured();
  assertEquals(req?.method, "POST");
  assertEquals(req?.body, requestBody);
});

Deno.test("GET /api/v1/patients - forwards X-Actor-Id header", async () => {
  const { client, captured } = createMockRemoteClient(
    ok({ status: 200, headers: new Headers(), body: { data: [] } }),
  );

  const app = createTestApp(client, TEST_SESSION);
  await app.request("/api/v1/patients", {
    headers: { "X-Actor-Id": "actor-456" },
  });

  const req = captured();
  assertEquals(req?.actorId, "actor-456");
});

// ---------------------------------------------------------------------------
// Tests: Remote errors
// ---------------------------------------------------------------------------

Deno.test("Remote error UNAUTHORIZED - returns 401", async () => {
  const { client } = createMockRemoteClient(err("UNAUTHORIZED"));

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/v1/patients");

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body, { error: "UNAUTHORIZED" });
});

Deno.test("Remote error SERVER_ERROR - returns 502", async () => {
  const { client } = createMockRemoteClient(err("SERVER_ERROR"));

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/v1/patients");

  assertEquals(res.status, 502);
  const body = await res.json();
  assertEquals(body, { error: "SERVER_ERROR" });
});

Deno.test("Remote error NETWORK_ERROR - returns 502", async () => {
  const { client } = createMockRemoteClient(err("NETWORK_ERROR"));

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/v1/patients");

  assertEquals(res.status, 502);
  const body = await res.json();
  assertEquals(body, { error: "NETWORK_ERROR" });
});

Deno.test("Remote error TIMEOUT - returns 504", async () => {
  const { client } = createMockRemoteClient(err("TIMEOUT"));

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/v1/patients");

  assertEquals(res.status, 504);
  const body = await res.json();
  assertEquals(body, { error: "TIMEOUT" });
});

// ---------------------------------------------------------------------------
// Tests: /api/people/*
// ---------------------------------------------------------------------------

Deno.test("GET /api/people/persons - proxied to people-context with /api/v1/persons path", async () => {
  const backendBody = { data: [{ id: "person-1", name: "Carol" }] };
  const { client, captured } = createMockRemoteClient(
    ok({ status: 200, headers: new Headers(), body: backendBody }),
  );

  const app = createTestApp(client, TEST_SESSION);
  const res = await app.request("/api/people/persons");

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body, backendBody);

  const req = captured();
  assertEquals(req?.baseUrl, "http://people:3001");
  assertEquals(req?.path, "/api/v1/people/persons");
  assertEquals(req?.method, "GET");
  assertEquals(req?.accessToken, "test-access-token-123");
});

Deno.test("GET /api/people/persons/123 - nested path proxied correctly", async () => {
  const { client, captured } = createMockRemoteClient(
    ok({ status: 200, headers: new Headers(), body: { id: "123" } }),
  );

  const app = createTestApp(client, TEST_SESSION);
  await app.request("/api/people/persons/123");

  const req = captured();
  assertEquals(req?.path, "/api/v1/people/persons/123");
});

Deno.test("GET /api/people/persons without session - returns 401", async () => {
  const { client } = createMockRemoteClient(
    ok({ status: 200, headers: new Headers(), body: {} }),
  );

  const app = createTestApp(client);
  const res = await app.request("/api/people/persons");

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body, { error: "Unauthorized" });
});
