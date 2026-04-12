import { assertEquals } from "@std/assert";
import { Hono } from "@hono/hono";
import type { AppEnv } from "../../src/types.ts";
import { fetchMetadata } from "../../src/middleware/fetch_metadata.ts";

/** Helper: create a test app with fetchMetadata middleware and catch-all routes. */
const createTestApp = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>();
  app.use("*", fetchMetadata());
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.get("/api/patients", (c) => c.json({ patients: [] }));
  app.post("/api/patients", (c) => c.json({ created: true }, 201));
  app.put("/api/patients/:id", (c) => c.json({ updated: true }));
  app.delete("/api/patients/:id", (c) => c.json({ deleted: true }));
  return app;
};

Deno.test("fetchMetadata - non-API route passes through", async () => {
  const app = createTestApp();
  const res = await app.request("/health");
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.status, "ok");
});

Deno.test("fetchMetadata - API GET with same-origin + X-Requested-With passes", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients", {
    headers: {
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
  });
  assertEquals(res.status, 200);
});

Deno.test("fetchMetadata - API GET with cross-site returns 403 (Sec-Fetch)", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients", {
    headers: {
      "sec-fetch-site": "cross-site",
      "x-requested-with": "XMLHttpRequest",
    },
  });
  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: cross-origin request");
});

Deno.test("fetchMetadata - API GET without Sec-Fetch-Site but with XRW returns 403 (missing XRW)", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients");
  assertEquals(res.status, 403);
});

Deno.test("fetchMetadata - API GET without X-Requested-With returns 403", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients", {
    headers: { "sec-fetch-site": "same-origin" },
  });
  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: missing X-Requested-With header");
});

Deno.test("fetchMetadata - API GET with Sec-Fetch-Site none + XRW passes", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients", {
    headers: {
      "sec-fetch-site": "none",
      "x-requested-with": "XMLHttpRequest",
    },
  });
  assertEquals(res.status, 200);
});

Deno.test("fetchMetadata - API POST with X-Requested-With passes", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients", {
    method: "POST",
    headers: {
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
  });
  assertEquals(res.status, 201);
});

Deno.test("fetchMetadata - API POST without X-Requested-With returns 403", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" },
  });
  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: missing X-Requested-With header");
});

Deno.test("fetchMetadata - API DELETE without X-Requested-With returns 403", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients/123", {
    method: "DELETE",
    headers: { "sec-fetch-site": "same-origin" },
  });
  assertEquals(res.status, 403);
  const body = await res.json();
  assertEquals(body.error, "Forbidden: missing X-Requested-With header");
});

Deno.test("fetchMetadata - API PUT with X-Requested-With passes", async () => {
  const app = createTestApp();
  const res = await app.request("/api/patients/123", {
    method: "PUT",
    headers: {
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
  });
  assertEquals(res.status, 200);
});
