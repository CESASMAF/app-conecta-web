import { assertEquals, assertMatch } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv } from "../../src/types.ts";
import { securityHeaders } from "../../src/middleware/security_headers.ts";

/** Helper: create a test app with securityHeaders middleware and a route that exposes the nonce. */
const createTestApp = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();
  app.use("*", securityHeaders());
  app.get("/test", (c) => {
    const nonce = c.get("cspNonce");
    return c.json({ nonce });
  });
  return app;
};

Deno.test("securityHeaders - sets Strict-Transport-Security", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  assertEquals(
    res.headers.get("Strict-Transport-Security"),
    "max-age=63072000; includeSubDomains",
  );
});

Deno.test("securityHeaders - sets X-Content-Type-Options", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  assertEquals(res.headers.get("X-Content-Type-Options"), "nosniff");
});

Deno.test("securityHeaders - sets X-Frame-Options", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  assertEquals(res.headers.get("X-Frame-Options"), "DENY");
});

Deno.test("securityHeaders - sets Referrer-Policy", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  assertEquals(
    res.headers.get("Referrer-Policy"),
    "strict-origin-when-cross-origin",
  );
});

Deno.test("securityHeaders - sets Permissions-Policy", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  assertEquals(
    res.headers.get("Permissions-Policy"),
    "camera=(), microphone=(), geolocation=()",
  );
});

Deno.test("securityHeaders - sets Content-Security-Policy with nonce", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const csp = res.headers.get("Content-Security-Policy");

  // CSP must exist and contain a nonce directive
  assertEquals(csp !== null, true);
  assertMatch(csp!, /script-src 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  assertMatch(csp!, /style-src 'nonce-[A-Za-z0-9+/=]+' 'self'/);
  assertMatch(csp!, /default-src 'self'/);
  assertMatch(csp!, /frame-ancestors 'none'/);
  assertMatch(csp!, /base-uri 'self'/);
  assertMatch(csp!, /form-action 'self'/);
  assertMatch(csp!, /img-src 'self' data:/);
  assertMatch(csp!, /font-src 'self'/);
  assertMatch(csp!, /connect-src 'self'/);
});

Deno.test("securityHeaders - CSP nonce matches nonce in context", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const body = await res.json();
  const csp = res.headers.get("Content-Security-Policy")!;

  // The nonce exposed by the route must appear in the CSP header
  assertEquals(csp.includes(`'nonce-${body.nonce}'`), true);
});

Deno.test("securityHeaders - nonce is unique per request", async () => {
  const app = createTestApp();
  const res1 = await app.request("/test");
  const res2 = await app.request("/test");
  const body1 = await res1.json();
  const body2 = await res2.json();

  // Two requests must produce different nonces
  assertEquals(body1.nonce !== body2.nonce, true);
});

Deno.test("securityHeaders - nonce is valid base64 (16 bytes = 24 chars)", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const body = await res.json();

  // 16 bytes base64-encoded = 24 characters ending with ==
  assertMatch(body.nonce, /^[A-Za-z0-9+/]{22}==$/);
});
