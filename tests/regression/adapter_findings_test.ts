/**
 * Regression tests for adapter/infrastructure code review findings.
 * These tests are designed to FAIL before implementation (TDD red phase).
 *
 * Findings covered:
 *   B-1: CSRF middleware must exist in chain
 *   B-2: Session cookie must be HMAC-signed
 *   B-3: API proxy must validate request bodies
 *   W-I1: Session store must have bounds
 *   W-I3: id_token must validate claims
 *   W-I4: BFFAuthError includes ID_TOKEN_DECODE_FAILED
 *   W-I5: api.ts should not use unsafe casts
 *   W-I6: OIDC discovery cache must have TTL
 *   W-I7: API proxy must return 400 on malformed JSON
 *   W-A1: No unused imports in application layer
 *   I-I5: authGuard exact match for /health
 *   Middleware chain order
 */

import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv } from "../../src/types.ts";
import { authGuard } from "../../src/middleware/auth_guard.ts";

// =============================================================================
// B-1: CSRF middleware must exist in chain
// =============================================================================

Deno.test("B-1: server.ts imports and uses csrf middleware", async () => {
  const source = await Deno.readTextFile("src/server.ts");
  assertEquals(
    source.includes("csrf"),
    true,
    "server.ts must wire CSRF middleware",
  );
});

Deno.test("B-1: server.ts imports and uses serveStatic", async () => {
  const source = await Deno.readTextFile("src/server.ts");
  assertEquals(
    source.includes("serveStatic") || source.includes("serve-static") || source.includes("serve_static"),
    true,
    "server.ts must wire serveStatic",
  );
});

// =============================================================================
// B-2: Session cookie must be HMAC-signed
// =============================================================================

Deno.test("B-2: bff_service.ts uses sessionSecret for signing", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/bff_service.ts");
  assertEquals(
    source.includes("hmac") ||
      source.includes("HMAC") ||
      source.includes("sign") ||
      source.includes("crypto.subtle"),
    true,
    "Session cookies must be HMAC-signed using sessionSecret",
  );
});

// =============================================================================
// B-3: API proxy must validate request bodies
// =============================================================================

Deno.test("B-3: api.ts routes through use case validation, not blind proxy", async () => {
  const source = await Deno.readTextFile("src/routes/api.ts");
  const hasValidation = source.includes("validate") ||
    source.includes("useCase") ||
    source.includes("use-case") ||
    source.includes("use_case");
  assertEquals(
    hasValidation,
    true,
    "API proxy must validate request bodies before forwarding",
  );
});

// =============================================================================
// W-I1: Session store must have bounds
// =============================================================================

Deno.test("W-I1: session_store.ts has max entries or sweep logic", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/session_store.ts");
  const hasBounds = source.includes("MAX") ||
    source.includes("sweep") ||
    source.includes("setInterval") ||
    source.includes("limit") ||
    source.includes("maxEntries") ||
    source.includes("max_entries");
  assertEquals(
    hasBounds,
    true,
    "Session store must have memory bounds (max entries or periodic sweep)",
  );
});

// =============================================================================
// W-I3: id_token must validate claims
// =============================================================================

Deno.test("W-I3: bff_service.ts validates id_token claims (iss, aud, exp)", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/bff_service.ts");
  const validatesIss = source.includes(".iss") || source.includes("issuer");
  const validatesAud = source.includes(".aud") ||
    source.includes("audience") ||
    source.includes("client_id");
  assertEquals(
    validatesIss && validatesAud,
    true,
    "id_token must validate iss and aud claims",
  );
});

// =============================================================================
// W-I4: BFFAuthError includes ID_TOKEN_DECODE_FAILED
// =============================================================================

Deno.test("W-I4: BFFAuthError includes ID_TOKEN_DECODE_FAILED", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/bff_service.ts");
  assertEquals(
    source.includes("ID_TOKEN_DECODE_FAILED"),
    true,
    "BFFAuthError should include specific decode error variant",
  );
});

// =============================================================================
// W-I5: api.ts should not use unsafe casts
// =============================================================================

Deno.test("W-I5: api.ts does not use unsafe 'as object' cast", async () => {
  const source = await Deno.readTextFile("src/routes/api.ts");
  assertEquals(
    source.includes("as object"),
    false,
    "Should not cast body as object",
  );
});

Deno.test("W-I5: api.ts does not use unsafe 'as 200' cast", async () => {
  const source = await Deno.readTextFile("src/routes/api.ts");
  assertEquals(
    source.includes("as 200"),
    false,
    "Should not cast status as 200",
  );
});

// =============================================================================
// W-I6: OIDC discovery cache must have TTL
// =============================================================================

Deno.test("W-I6: bff_service.ts has discovery cache TTL", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/bff_service.ts");
  const hasTtl = source.includes("DISCOVERY_TTL") ||
    source.includes("discoveryExpiresAt") ||
    source.includes("discovery_ttl") ||
    source.includes("cacheExpir") ||
    source.includes("cache_ttl") ||
    source.includes("CACHE_TTL");
  assertEquals(
    hasTtl,
    true,
    "OIDC discovery cache must have a TTL for invalidation",
  );
});

// =============================================================================
// W-I7: API proxy must return 400 on malformed JSON body
// =============================================================================

Deno.test("W-I7: API proxy returns 400 on malformed JSON body", async () => {
  const { createApiRoutes } = await import("../../src/routes/api.ts");

  // Provide a stub RemoteClient that would forward blindly
  const stubRemoteClient = {
    forward: async (_method: string, _path: string, _headers: Record<string, string>, _body: unknown) => {
      return { ok: true as const, value: { status: 200, headers: {}, body: {} } };
    },
  };

  const apiRoutes = createApiRoutes(stubRemoteClient as never);
  const app = new Hono<AppEnv>();

  // Inject a fake session so authGuard passes
  app.use("*", async (c, next) => {
    c.set("session", {
      accessToken: "tok_test",
      refreshToken: "ref_test",
      idToken: undefined,
      expiresAt: Date.now() + 60_000,
      userSub: "user-123",
      userName: "Test User",
      roles: [],
    });
    c.set("sessionId", "sid_test");
    await next();
  });

  app.route("/api", apiRoutes);

  const res = await app.request("/api/v1/patients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: "this is not valid json {{{",
  });

  assertEquals(
    res.status,
    400,
    "Malformed JSON body must return 400, not be silently forwarded",
  );
});

// =============================================================================
// W-A1: No unused imports in application layer
// =============================================================================

Deno.test("W-A1: register_patient.ts has no unused imports", async () => {
  const source = await Deno.readTextFile(
    "src/application/registry/use-cases/register_patient.ts",
  );

  const importRegex = /import\s+\{([^}]+)\}/g;
  const bodyWithoutImports = source
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("import"))
    .join("\n");

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(source)) !== null) {
    const captured = match[1];
    if (!captured) continue;
    const symbols = captured
      .split(",")
      .map((s) => s.replace(/type\s+/, "").trim())
      .filter((s) => s.length > 0 && !s.startsWith("//"));

    for (const symbol of symbols) {
      // Skip renamed imports (just check the alias)
      const parts = symbol.split(" as ");
      const name = parts.length > 1 ? (parts[1] ?? "").trim() : symbol;
      assertEquals(
        bodyWithoutImports.includes(name),
        true,
        `Imported symbol '${name}' appears unused in register_patient.ts`,
      );
    }
  }
});

// =============================================================================
// I-I5: authGuard exact match for /health
// =============================================================================

Deno.test("I-I5: authGuard blocks /healthcheck (not public)", async () => {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    c.set("session", undefined);
    c.set("sessionId", undefined);
    await next();
  });

  app.use("*", authGuard());
  app.get("/healthcheck", (c) => c.json({ ok: true }));

  const res = await app.request("/healthcheck");
  // Should NOT be 200 -- only exact /health should be public
  assertEquals(
    res.status !== 200,
    true,
    "/healthcheck should not be public -- only exact /health should be",
  );
});

// =============================================================================
// Middleware chain order
// =============================================================================

Deno.test("Middleware chain: server.ts has correct order (security < csrf < session < fetch < auth)", async () => {
  const source = await Deno.readTextFile("src/server.ts");

  const securityIdx = source.indexOf("securityHeaders");
  const csrfIdx = source.indexOf("csrf");
  const sessionIdx = source.indexOf("sessionMiddleware") !== -1
    ? source.indexOf("sessionMiddleware")
    : source.indexOf("session");
  const fetchIdx = source.indexOf("fetchMetadata");
  const authIdx = source.indexOf("authGuard");

  // All must exist
  assertEquals(securityIdx > -1, true, "securityHeaders must be in chain");
  assertEquals(csrfIdx > -1, true, "csrf must be in chain");
  assertEquals(sessionIdx > -1, true, "session middleware must be in chain");
  assertEquals(fetchIdx > -1, true, "fetchMetadata must be in chain");
  assertEquals(authIdx > -1, true, "authGuard must be in chain");

  // Order: security < csrf < session < fetch < auth
  assertEquals(
    securityIdx < csrfIdx,
    true,
    "securityHeaders must come before csrf",
  );
  assertEquals(
    csrfIdx < sessionIdx,
    true,
    "csrf must come before session",
  );
  assertEquals(
    sessionIdx < fetchIdx,
    true,
    "session must come before fetchMetadata",
  );
  assertEquals(
    fetchIdx < authIdx,
    true,
    "fetchMetadata must come before authGuard",
  );
});

// =============================================================================
// Additional regression: Session cookie name must be __Host-session
// =============================================================================

Deno.test("Session cookie uses __Host- prefix (secure binding)", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/session_store.ts");
  assertEquals(
    source.includes("__Host-session"),
    true,
    "Session cookie must use __Host-session name for secure binding",
  );
});

// =============================================================================
// Additional regression: PKCE verifiers must have TTL and max entries
// =============================================================================

Deno.test("PKCE verifiers have TTL enforcement", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/bff_service.ts");
  const hasPkceTtl = source.includes("PKCE_TTL") ||
    source.includes("pkce_ttl") ||
    source.includes("verifierExpir") ||
    (source.includes("pkce") && source.includes("5 * 60"));
  assertEquals(
    hasPkceTtl,
    true,
    "PKCE verifiers must have a TTL (5 min max)",
  );
});

Deno.test("PKCE verifiers have max entries cap", async () => {
  const source = await Deno.readTextFile("src/adapters/auth/bff_service.ts");
  const hasMaxPkce = source.includes("MAX_PKCE") ||
    source.includes("max_pkce") ||
    source.includes("1000") ||
    (source.includes("pkce") && source.includes("max"));
  assertEquals(
    hasMaxPkce,
    true,
    "PKCE verifiers must cap at 1000 entries max",
  );
});

// =============================================================================
// PENTEST-1: fetchMetadata must NOT limit X-Requested-With to mutating methods
// =============================================================================

Deno.test("PENTEST-1: fetch_metadata.ts does not restrict X-Requested-With to only POST/PUT/DELETE", async () => {
  const source = await Deno.readTextFile("src/middleware/fetch_metadata.ts");
  const hasMutatingOnlyCheck = source.includes('"POST" || method === "PUT" || method === "DELETE"') ||
    source.includes("POST") && source.includes("PUT") && source.includes("DELETE") &&
    source.includes("x-requested-with") && !source.includes("// ALL methods");
  // The fix removes the method-specific check entirely — XRW is required on all /api/* methods
  const hasMethodGateForXrw = /if\s*\(\s*method\s*===\s*"POST"\s*\|\|\s*method\s*===\s*"PUT"\s*\|\|\s*method\s*===\s*"DELETE"\s*\)/.test(source);
  assertEquals(
    hasMethodGateForXrw,
    false,
    "X-Requested-With must be required on ALL /api/* methods, not just POST/PUT/DELETE (pentest finding)",
  );
});
