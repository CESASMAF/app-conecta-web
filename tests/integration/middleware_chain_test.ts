// =============================================================================
// Integration Test: Full Middleware Chain E2E
// =============================================================================
// Tests the REAL middleware chain wired together: securityHeaders -> csrf ->
// session -> fetchMetadata -> authGuard, exercising the full request lifecycle.
// =============================================================================

import {
  assertEquals,
  assertStringIncludes,
  assertExists,
} from "@std/assert";
import { describe, it, beforeEach } from "@std/testing/bdd";
import {
  createTestApp,
  createTestSession,
  setupAuthenticatedSession,
  authenticatedRequest,
  authenticatedApiRequest,
  type TestAppContext,
} from "./test_helpers.ts";

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------

describe("Middleware Chain E2E - Security Headers", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("sets HSTS header on every response", async () => {
    const res = await ctx.app.request("/health");
    const hsts = res.headers.get("Strict-Transport-Security");
    assertExists(hsts);
    assertStringIncludes(hsts, "max-age=63072000");
    assertStringIncludes(hsts, "includeSubDomains");
  });

  it("sets X-Content-Type-Options: nosniff", async () => {
    const res = await ctx.app.request("/health");
    assertEquals(res.headers.get("X-Content-Type-Options"), "nosniff");
  });

  it("sets X-Frame-Options: DENY", async () => {
    const res = await ctx.app.request("/health");
    assertEquals(res.headers.get("X-Frame-Options"), "DENY");
  });

  it("sets CSP with nonce on every response", async () => {
    const res = await ctx.app.request("/health");
    const csp = res.headers.get("Content-Security-Policy");
    assertExists(csp);
    assertStringIncludes(csp, "script-src 'nonce-");
    assertStringIncludes(csp, "style-src 'nonce-");
    assertStringIncludes(csp, "frame-ancestors 'none'");
  });

  it("generates a unique CSP nonce per request", async () => {
    const res1 = await ctx.app.request("/health");
    const res2 = await ctx.app.request("/health");

    const csp1 = res1.headers.get("Content-Security-Policy") ?? "";
    const csp2 = res2.headers.get("Content-Security-Policy") ?? "";

    // Extract nonces
    const nonceRegex = /nonce-([A-Za-z0-9+/=]+)/;
    const nonce1 = csp1.match(nonceRegex)?.[1];
    const nonce2 = csp2.match(nonceRegex)?.[1];

    assertExists(nonce1);
    assertExists(nonce2);
    // Nonces should be different across requests
    assertEquals(nonce1 !== nonce2, true);
  });

  it("sets Referrer-Policy header", async () => {
    const res = await ctx.app.request("/health");
    assertEquals(
      res.headers.get("Referrer-Policy"),
      "strict-origin-when-cross-origin",
    );
  });

  it("sets Permissions-Policy header", async () => {
    const res = await ctx.app.request("/health");
    const pp = res.headers.get("Permissions-Policy");
    assertExists(pp);
    assertStringIncludes(pp, "camera=()");
    assertStringIncludes(pp, "microphone=()");
  });
});

// ---------------------------------------------------------------------------
// Auth Guard
// ---------------------------------------------------------------------------

describe("Middleware Chain E2E - Auth Guard", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("allows unauthenticated access to /health", async () => {
    const res = await ctx.app.request("/health");
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.status, "ok");
  });

  it("allows unauthenticated access to /ready", async () => {
    const res = await ctx.app.request("/ready");
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.status, "ok");
  });

  it("allows unauthenticated access to /auth/login", async () => {
    const res = await ctx.app.request("/auth/login");
    // Should redirect to OIDC provider, not to /auth/login
    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "auth.example.com");
  });

  it("redirects unauthenticated page requests to /auth/login", async () => {
    const res = await ctx.app.request("/dashboard");
    assertEquals(res.status, 302);
    const location = res.headers.get("Location");
    assertExists(location);
    assertStringIncludes(location, "/auth/login");
  });

  it("returns 401 for unauthenticated API requests", async () => {
    const req = new Request("http://localhost/api/v1/patients", {
      headers: {
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "Unauthorized");
  });

  it("allows authenticated requests through to route handlers", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    // Should reach the API route handler (200 from mock)
    assertEquals(res.status, 200);
  });
});

// ---------------------------------------------------------------------------
// Fetch Metadata
// ---------------------------------------------------------------------------

describe("Middleware Chain E2E - Fetch Metadata", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("blocks cross-origin API requests", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedRequest("/api/v1/patients", sessionId, {
      headers: {
        "Sec-Fetch-Site": "cross-site",
      },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 403);
    const body = await res.json();
    assertStringIncludes(body.error, "cross-origin");
  });

  it("allows same-origin API requests", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);
  });

  it("allows requests without Sec-Fetch-Site header (non-browser clients)", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedRequest("/api/v1/patients", sessionId, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    // No Sec-Fetch-Site header, should pass through
    const res = await ctx.app.request(req);
    assertEquals(res.status, 200);
  });

  it("requires X-Requested-With on POST to /api/*", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedRequest("/api/v1/patients", sessionId, {
      method: "POST",
      body: { name: "test" },
      headers: {
        "Sec-Fetch-Site": "same-origin",
        // Missing X-Requested-With
      },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 403);
    const body = await res.json();
    assertStringIncludes(body.error, "X-Requested-With");
  });

  it("requires X-Requested-With on PUT to /api/*", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedRequest("/api/v1/patients/123", sessionId, {
      method: "PUT",
      body: { name: "test" },
      headers: {
        "Sec-Fetch-Site": "same-origin",
        // Missing X-Requested-With
      },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 403);
  });

  it("requires X-Requested-With on DELETE to /api/*", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedRequest(
      "/api/v1/patients/123/family-members/456",
      sessionId,
      {
        method: "DELETE",
        headers: {
          "Sec-Fetch-Site": "same-origin",
          // Missing X-Requested-With
        },
      },
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 403);
  });

  it("does not enforce fetch metadata on non-API routes", async () => {
    // /health should pass without any fetch metadata headers
    const res = await ctx.app.request("/health");
    assertEquals(res.status, 200);
  });
});

// ---------------------------------------------------------------------------
// CSRF
// ---------------------------------------------------------------------------

describe("Middleware Chain E2E - CSRF", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("sets CSRF cookie on GET requests", async () => {
    const res = await ctx.app.request("/health");
    const setCookieHeader = res.headers.get("Set-Cookie");
    // CSRF cookie should be set
    assertExists(setCookieHeader);
    assertStringIncludes(setCookieHeader, "__Host-csrf=");
  });

  it("does not require CSRF on API POST requests (uses fetch metadata instead)", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
      {
        method: "POST",
        body: { name: "test" },
      },
    );
    const res = await ctx.app.request(req);
    // API routes skip CSRF validation per middleware design
    // Should pass through to the API handler
    assertEquals(res.status !== 403, true);
  });
});

// ---------------------------------------------------------------------------
// Session Resolution
// ---------------------------------------------------------------------------

describe("Middleware Chain E2E - Session Resolution", () => {
  let ctx: TestAppContext;

  beforeEach(() => {
    ctx = createTestApp();
  });

  it("resolves session from signed cookie and makes it available to routes", async () => {
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    // If session resolved correctly, the API route should proxy (200)
    assertEquals(res.status, 200);
    // Verify the mock remote client received the correct access token
    const captured = ctx.remoteClient.lastCaptured();
    assertExists(captured);
    assertEquals(captured.accessToken, "test-access-token-abc123");
  });

  it("returns 401 for API request with unknown session ID in cookie", async () => {
    // Use a session ID that is not in the session store
    const req = new Request("http://localhost/api/v1/patients", {
      headers: {
        Cookie: `__Host-session=nonexistent-session-id`,
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });

  it("returns 401 for API request with expired session", async () => {
    const expiredSession = createTestSession({
      expiresAt: Date.now() - 1000, // expired 1 second ago
      refreshToken: undefined,
    });
    const sessionId = "expired-session-id";
    ctx.sessionStore.set(sessionId, expiredSession);

    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
  });

  it("redirects page request with expired session to /auth/login", async () => {
    const expiredSession = createTestSession({
      expiresAt: Date.now() - 1000,
      refreshToken: undefined,
    });
    const sessionId = "expired-session-id";
    ctx.sessionStore.set(sessionId, expiredSession);

    const req = await authenticatedRequest("/dashboard", sessionId);
    const res = await ctx.app.request(req);
    assertEquals(res.status, 302);
    assertStringIncludes(res.headers.get("Location") ?? "", "/auth/login");
  });
});

// ---------------------------------------------------------------------------
// Full Chain Order Verification
// ---------------------------------------------------------------------------

describe("Middleware Chain E2E - Full Chain Execution", () => {
  it("security headers are present even on 401 responses", async () => {
    const ctx = createTestApp();
    const req = new Request("http://localhost/api/v1/patients", {
      headers: {
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 401);
    // Security headers should still be set
    assertExists(res.headers.get("Strict-Transport-Security"));
    assertExists(res.headers.get("X-Content-Type-Options"));
    assertExists(res.headers.get("X-Frame-Options"));
    assertExists(res.headers.get("Content-Security-Policy"));
  });

  it("security headers are present even on 403 responses", async () => {
    const ctx = createTestApp();
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedRequest("/api/v1/patients", sessionId, {
      headers: { "Sec-Fetch-Site": "cross-site" },
    });
    const res = await ctx.app.request(req);
    assertEquals(res.status, 403);
    assertExists(res.headers.get("Strict-Transport-Security"));
    assertExists(res.headers.get("Content-Security-Policy"));
  });

  it("access token is never exposed in response headers or body on error", async () => {
    const ctx = createTestApp();
    const sessionId = setupAuthenticatedSession(ctx.sessionStore);
    const req = await authenticatedApiRequest(
      "/api/v1/patients",
      sessionId,
    );
    const res = await ctx.app.request(req);
    const responseText = await res.text();
    // The access token should never appear in any response
    assertEquals(responseText.includes("test-access-token-abc123"), false);
    // Check response headers too
    for (const [_key, value] of res.headers.entries()) {
      assertEquals(value.includes("test-access-token-abc123"), false);
    }
  });
});
