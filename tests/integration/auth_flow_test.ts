// =============================================================================
// Integration Test: Auth Flow E2E
// =============================================================================
// Tests the full auth lifecycle through the real middleware chain:
// login -> callback -> session -> logout
// =============================================================================

import {
  assertEquals,
  assertStringIncludes,
  assertExists,
} from "@std/assert";
import { describe, it, beforeEach } from "@std/testing/bdd";
import { ok, err } from "../../src/domain/shared/result.ts";
import type { BFFAuthError } from "../../src/adapters/auth/bff_service.ts";
import {
  createTestApp,
  createTestSession,
  createMockAuthService,
  setupAuthenticatedSession,
  authenticatedRequest,
  authenticatedApiRequest,
  type TestAppContext,
} from "./test_helpers.ts";

// ---------------------------------------------------------------------------
// GET /auth/login
// ---------------------------------------------------------------------------

describe("Auth Flow E2E - GET /auth/login", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("redirects to OIDC provider authorization URL", async () => {
    const res = await ctx.app.request("/auth/login");
    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "auth.example.com");
  });

  it("includes security headers on redirect response", async () => {
    const res = await ctx.app.request("/auth/login");
    assertExists(res.headers.get("Strict-Transport-Security"));
    assertExists(res.headers.get("Content-Security-Policy"));
  });

  it("returns 500 when login (OIDC discovery) fails", async () => {
    const failingAuth = createMockAuthService({
      login: async () => err("OIDC_DISCOVERY_FAILED" as BFFAuthError),
    });
    const failCtx = createTestApp({ authService: failingAuth });
    const res = await failCtx.app.request("/auth/login");
    assertEquals(res.status, 500);
    const body = await res.json();
    assertEquals(body.error, "OIDC_DISCOVERY_FAILED");
  });

  it("is accessible without authentication (public path)", async () => {
    // /auth/login should NOT redirect to /auth/login (infinite loop guard)
    const res = await ctx.app.request("/auth/login");
    // Should be a redirect to OIDC, not a 302 to /auth/login
    assertEquals(res.status, 302);
    const location = res.headers.get("Location") ?? "";
    assertEquals(location.includes("/auth/login"), false);
  });
});

// ---------------------------------------------------------------------------
// GET /auth/callback
// ---------------------------------------------------------------------------

describe("Auth Flow E2E - GET /auth/callback", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("exchanges code for tokens and redirects to /", async () => {
    const res = await ctx.app.request(
      "/auth/callback?code=auth-code-123&state=test-state",
    );
    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "/");
  });

  it("sets session cookie with correct attributes", async () => {
    const authService = createMockAuthService({
      callback: async () =>
        ok({
          sessionId: "sess-id-1",
          cookieValue:
            "__Host-session=sess-id-1.hmac-sig; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600",
        }),
    });
    const callbackCtx = createTestApp({ authService });

    const res = await callbackCtx.app.request(
      "/auth/callback?code=code-123&state=state-123",
    );
    assertEquals(res.status, 302);

    const setCookie = res.headers.get("Set-Cookie");
    assertExists(setCookie);
    assertStringIncludes(setCookie, "__Host-session=");
    assertStringIncludes(setCookie, "HttpOnly");
    assertStringIncludes(setCookie, "Secure");
    assertStringIncludes(setCookie, "SameSite=Strict");
  });

  it("returns 400 when code is missing", async () => {
    const res = await ctx.app.request("/auth/callback?state=test-state");
    assertEquals(res.status, 400);
    const body = await res.json();
    assertStringIncludes(body.error, "Missing");
  });

  it("returns 400 when state is missing", async () => {
    const res = await ctx.app.request("/auth/callback?code=auth-code-123");
    assertEquals(res.status, 400);
    const body = await res.json();
    assertStringIncludes(body.error, "Missing");
  });

  it("returns 400 when both code and state are missing", async () => {
    const res = await ctx.app.request("/auth/callback");
    assertEquals(res.status, 400);
  });

  it("returns 401 when state is invalid (PKCE mismatch)", async () => {
    const authService = createMockAuthService({
      callback: async () => err("INVALID_STATE" as BFFAuthError),
    });
    const invalidCtx = createTestApp({ authService });

    const res = await invalidCtx.app.request(
      "/auth/callback?code=code-123&state=bad-state",
    );
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "INVALID_STATE");
  });

  it("returns 401 when PKCE verifier has expired", async () => {
    const authService = createMockAuthService({
      callback: async () => err("PKCE_EXPIRED" as BFFAuthError),
    });
    const expiredCtx = createTestApp({ authService });

    const res = await expiredCtx.app.request(
      "/auth/callback?code=code-123&state=expired-state",
    );
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "PKCE_EXPIRED");
  });

  it("returns 401 when token exchange fails", async () => {
    const authService = createMockAuthService({
      callback: async () => err("TOKEN_EXCHANGE_FAILED" as BFFAuthError),
    });
    const failCtx = createTestApp({ authService });

    const res = await failCtx.app.request(
      "/auth/callback?code=bad-code&state=test-state",
    );
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "TOKEN_EXCHANGE_FAILED");
  });

  it("returns 401 when id_token decode fails", async () => {
    const authService = createMockAuthService({
      callback: async () => err("ID_TOKEN_DECODE_FAILED" as BFFAuthError),
    });
    const failCtx = createTestApp({ authService });

    const res = await failCtx.app.request(
      "/auth/callback?code=code-123&state=test-state",
    );
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "ID_TOKEN_DECODE_FAILED");
  });
});

// ---------------------------------------------------------------------------
// GET /auth/logout
// ---------------------------------------------------------------------------

describe("Auth Flow E2E - GET /auth/logout", () => {
  it("redirects to OIDC end_session_endpoint when session exists", async () => {
    const authService = createMockAuthService({
      logout: () => ({
        endSessionUrl: "https://auth.example.com/end-session?post_logout_redirect_uri=http://localhost",
      }),
    });
    const ctx = createTestApp({ authService });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedRequest("/auth/logout", sessionId);
    const res = await ctx.app.request(req);

    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "end-session");
  });

  it("clears session cookie on logout", async () => {
    const ctx = createTestApp();
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedRequest("/auth/logout", sessionId);
    const res = await ctx.app.request(req);

    const setCookie = res.headers.get("Set-Cookie");
    assertExists(setCookie);
    assertStringIncludes(setCookie, "__Host-session=");
  });

  it("redirects to /auth/login when no end_session_endpoint available", async () => {
    const authService = createMockAuthService({
      logout: () => ({ endSessionUrl: undefined }),
    });
    const ctx = createTestApp({ authService });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);

    const req = await authenticatedRequest("/auth/logout", sessionId);
    const res = await ctx.app.request(req);

    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "/auth/login");
  });

  it("redirects to /auth/login when no session exists", async () => {
    const ctx = createTestApp();
    const res = await ctx.app.request("/auth/logout");

    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "/auth/login");
  });
});

// ---------------------------------------------------------------------------
// Session Refresh (automatic token refresh)
// ---------------------------------------------------------------------------

describe("Auth Flow E2E - Session Refresh", () => {
  it("uses existing session when token is still valid and not near expiry", async () => {
    const ctx = createTestApp();
    const session = createTestSession({
      expiresAt: Date.now() + 3_600_000, // 1 hour out
    });
    const sessionId = setupAuthenticatedSession(ctx.sessionStore, session);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);

    // Verify the original token was used
    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.accessToken, session.accessToken);
  });

  it("clears session when token is expired and no refresh token", async () => {
    const ctx = createTestApp();
    const expiredSession = createTestSession({
      expiresAt: Date.now() - 1_000,
      refreshToken: undefined,
    });
    const sessionId = "expired-no-refresh";
    ctx.sessionStore.set(sessionId, expiredSession);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });
});
