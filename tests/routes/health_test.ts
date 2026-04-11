import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv } from "../../src/types.ts";
import { healthRoutes } from "../../src/routes/health.ts";

/** Helper: create a test app with health routes mounted. */
const createTestApp = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();
  app.route("/", healthRoutes);
  return app;
};

Deno.test("GET /health - returns 200 with status ok", async () => {
  const app = createTestApp();
  const res = await app.request("/health");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body, { status: "ok" });
});

Deno.test("GET /ready - returns 200 with status ok and timestamp", async () => {
  const app = createTestApp();
  const res = await app.request("/ready");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.status, "ok");
  assertEquals(typeof body.timestamp, "string");
  // Verify timestamp is a valid ISO 8601 date
  const parsed = new Date(body.timestamp);
  assertEquals(isNaN(parsed.getTime()), false);
});
