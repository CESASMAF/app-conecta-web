import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv, Session, SessionStore } from "../../src/types.ts";
import type {
  BFFAuthService,
  BFFAuthError,
} from "../../src/adapters/auth/bff_service.ts";
import type { Result } from "../../src/domain/shared/result.ts";
import { ok, err } from "../../src/domain/shared/result.ts";
import { createAuthRoutes } from "../../src/routes/auth.ts";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Creates a mock BFFAuthService with configurable return values. */
const createMockAuthService = (overrides?: {
  login?: () => Promise<
    Result<Readonly<{ url: string; state: string }>, BFFAuthError>
  >;
  callback?: (
    code: string,
    state: string,
  ) => Promise<
    Result<
      Readonly<{ sessionId: string; cookieValue: string }>,
      BFFAuthError
    >
  >;
  refresh?: (sessionId: string) => Promise<Result<Session, BFFAuthError>>;
  logout?: (
    sessionId: string,
  ) => Readonly<{ endSessionUrl: string | undefined }>;
}): BFFAuthService => ({
  login: overrides?.login ??
    (async () =>
      ok({
        url: "https://idp.example.com/authorize?state=abc123",
        state: "abc123",
      })),
  callback: overrides?.callback ??
    (async () =>
      ok({
        sessionId: "session-id-1",
        cookieValue:
          "__Host-session=session-id-1; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600",
      })),
  refresh: overrides?.refresh ?? (async (_sessionId: string) => err("TOKEN_EXCHANGE_FAILED" as BFFAuthError)),
  verifySessionCookie: async (cookieValue: string) => cookieValue.split(".")[0],
  logout: overrides?.logout ?? ((_sessionId: string) => ({ endSessionUrl: "https://idp.example.com/end-session" })),
});

/** Creates an in-memory SessionStore for testing. */
const createTestSessionStore = (): SessionStore => {
  const store = new Map<string, Session>();
  return {
    get: (id: string) => store.get(id),
    set: (id: string, session: Session) => {
      store.set(id, session);
    },
    delete: (id: string) => {
      store.delete(id);
    },
  };
};

/** Creates a test app with auth routes and optional context variables. */
const createTestApp = (
  authService: BFFAuthService,
  opts?: {
    sessionId?: string;
    session?: Session;
  },
): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();

  // Middleware to set context variables (simulating what session middleware does)
  app.use("*", async (c, next) => {
    c.set("sessionStore", createTestSessionStore());
    c.set("tokenRefresher", { refresh: async () => err("TOKEN_EXCHANGE_FAILED" as BFFAuthError), verifySessionCookie: async (v: string) => v.split(".")[0] });
    c.set("session", opts?.session ?? undefined);
    c.set("sessionId", opts?.sessionId ?? undefined);
    c.set("cspNonce", "test-nonce");
    await next();
  });

  const authRoutes = createAuthRoutes(authService);
  app.route("/", authRoutes);
  return app;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

Deno.test("GET /auth/login - redirects to OIDC provider when login succeeds", async () => {
  const authService = createMockAuthService();
  const app = createTestApp(authService);

  const res = await app.request("/auth/login", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(
    res.headers.get("Location"),
    "https://idp.example.com/authorize?state=abc123",
  );
});

Deno.test("GET /auth/login - returns 500 when login fails", async () => {
  const authService = createMockAuthService({
    login: async () => err("OIDC_DISCOVERY_FAILED"),
  });
  const app = createTestApp(authService);

  const res = await app.request("/auth/login");

  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "OIDC_DISCOVERY_FAILED");
});

Deno.test("GET /auth/callback - returns 400 when code is missing", async () => {
  const authService = createMockAuthService();
  const app = createTestApp(authService);

  const res = await app.request("/auth/callback?state=abc123");

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "Missing code or state");
});

Deno.test("GET /auth/callback - returns 400 when state is missing", async () => {
  const authService = createMockAuthService();
  const app = createTestApp(authService);

  const res = await app.request("/auth/callback?code=authcode123");

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "Missing code or state");
});

Deno.test("GET /auth/callback - returns 400 when both code and state are missing", async () => {
  const authService = createMockAuthService();
  const app = createTestApp(authService);

  const res = await app.request("/auth/callback");

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "Missing code or state");
});

Deno.test("GET /auth/callback - sets cookie and redirects on success", async () => {
  const authService = createMockAuthService();
  const app = createTestApp(authService);

  const res = await app.request(
    "/auth/callback?code=authcode123&state=abc123",
    { redirect: "manual" },
  );

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/");

  const setCookie = res.headers.get("Set-Cookie");
  assertEquals(
    setCookie,
    "__Host-session=session-id-1; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600",
  );
});

Deno.test("GET /auth/callback - returns 401 when callback fails with INVALID_STATE", async () => {
  const authService = createMockAuthService({
    callback: async () => err("INVALID_STATE"),
  });
  const app = createTestApp(authService);

  const res = await app.request(
    "/auth/callback?code=authcode123&state=bad-state",
  );

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "INVALID_STATE");
});

Deno.test("GET /auth/callback - returns 401 when callback fails with TOKEN_EXCHANGE_FAILED", async () => {
  const authService = createMockAuthService({
    callback: async () => err("TOKEN_EXCHANGE_FAILED"),
  });
  const app = createTestApp(authService);

  const res = await app.request(
    "/auth/callback?code=authcode123&state=abc123",
  );

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.error, "TOKEN_EXCHANGE_FAILED");
});

Deno.test("GET /auth/logout - with session, deletes cookie and redirects to end session URL", async () => {
  const session: Session = {
    accessToken: "tok",
    refreshToken: undefined,
    idToken: undefined,
    expiresAt: Date.now() + 3600_000,
    userSub: "user-1",
    userName: "Test User",
    roles: [],
  };
  const authService = createMockAuthService();
  const app = createTestApp(authService, {
    sessionId: "session-id-1",
    session,
  });

  const res = await app.request("/auth/logout", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(
    res.headers.get("Location"),
    "https://idp.example.com/end-session",
  );

  // Cookie should be deleted (Set-Cookie with Max-Age=0 or empty value)
  const setCookie = res.headers.get("Set-Cookie");
  assertEquals(typeof setCookie, "string");
  assertEquals(setCookie!.includes("__Host-session"), true);
});

Deno.test("GET /auth/logout - with session but no end session URL, redirects to /auth/login", async () => {
  const session: Session = {
    accessToken: "tok",
    refreshToken: undefined,
    idToken: undefined,
    expiresAt: Date.now() + 3600_000,
    userSub: "user-1",
    userName: "Test User",
    roles: [],
  };
  const authService = createMockAuthService({
    logout: (_sessionId: string) => ({ endSessionUrl: undefined }),
  });
  const app = createTestApp(authService, {
    sessionId: "session-id-1",
    session,
  });

  const res = await app.request("/auth/logout", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/auth/login");
});

Deno.test("GET /auth/logout - without session, redirects to /auth/login", async () => {
  const authService = createMockAuthService();
  const app = createTestApp(authService);

  const res = await app.request("/auth/logout", { redirect: "manual" });

  assertEquals(res.status, 302);
  assertEquals(res.headers.get("Location"), "/auth/login");
});
