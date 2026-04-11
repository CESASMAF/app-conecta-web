import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv } from "../../src/types.ts";
import { securityHeaders } from "../../src/middleware/security_headers.ts";

/** Helper: create a test app with securityHeaders middleware and a route that exposes the nonce. */
const createTestApp = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();
  app.use("*", securityHeaders());
  app.get("/test", (c) => {
    const nonce = c.get("secureHeadersNonce");
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

Deno.test("securityHeaders - sets Content-Security-Policy with nonce", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const csp = res.headers.get("Content-Security-Policy");
  assertEquals(csp !== null, true);
  assertStringIncludes(csp!, "script-src");
  assertStringIncludes(csp!, "'nonce-");
  assertStringIncludes(csp!, "default-src 'self'");
  assertStringIncludes(csp!, "frame-ancestors 'none'");
});

Deno.test("securityHeaders - CSP nonce matches nonce in context", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const body = await res.json();
  const csp = res.headers.get("Content-Security-Policy")!;
  assertEquals(csp.includes(`'nonce-${body.nonce}'`), true);
});

Deno.test("securityHeaders - nonce is unique per request", async () => {
  const app = createTestApp();
  const res1 = await app.request("/test");
  const res2 = await app.request("/test");
  const body1 = await res1.json();
  const body2 = await res2.json();
  assertEquals(body1.nonce !== body2.nonce, true);
});

Deno.test("securityHeaders - removes X-Powered-By", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  assertEquals(res.headers.get("X-Powered-By"), null);
});

Deno.test("securityHeaders - style-src allows unsafe-inline for SSR", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const csp = res.headers.get("Content-Security-Policy")!;
  assertStringIncludes(csp, "'unsafe-inline'");
});

Deno.test("securityHeaders - font-src allows external fonts", async () => {
  const app = createTestApp();
  const res = await app.request("/test");
  const csp = res.headers.get("Content-Security-Policy")!;
  assertStringIncludes(csp, "font-src");
  assertStringIncludes(csp, "https:");
});
