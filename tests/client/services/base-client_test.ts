import { assertEquals } from "@std/assert";
import { del, get, getWithMeta, post, put } from "../../../src/client/services/base-client.ts";

// Helper to mock fetch
const mockFetch = (
  response: Response | (() => Promise<Response>),
): () => void => {
  const original = globalThis.fetch;
  globalThis.fetch = typeof response === "function"
    ? response as unknown as typeof fetch
    : (async () => response) as unknown as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
};

// Helper to mock location
const mockLocation = (): Readonly<{ getHref: () => string; restore: () => void }> => {
  const original = globalThis.location;
  let href = "";
  Object.defineProperty(globalThis, "location", {
    value: { href: "" },
    writable: true,
    configurable: true,
  });
  return {
    getHref: () => (globalThis.location as unknown as { href: string }).href,
    restore: () => {
      Object.defineProperty(globalThis, "location", {
        value: original,
        writable: true,
        configurable: true,
      });
    },
  };
};

Deno.test("get - returns Ok with data on 200", async () => {
  const restore = mockFetch(
    new Response(JSON.stringify({ data: { id: "123" } }), { status: 200 }),
  );
  try {
    const result = await get<{ id: string }>("/api/test");
    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value.id, "123");
  } finally {
    restore();
  }
});

Deno.test("get - returns NOT_FOUND on 404", async () => {
  const restore = mockFetch(
    new Response(null, { status: 404 }),
  );
  try {
    const result = await get("/api/missing");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NOT_FOUND");
  } finally {
    restore();
  }
});

Deno.test("get - returns FORBIDDEN on 403", async () => {
  const restore = mockFetch(
    new Response(null, { status: 403 }),
  );
  try {
    const result = await get("/api/forbidden");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "FORBIDDEN");
  } finally {
    restore();
  }
});

Deno.test("get - returns SERVER_ERROR on 500", async () => {
  const restore = mockFetch(
    new Response(null, { status: 500 }),
  );
  try {
    const result = await get("/api/error");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
  } finally {
    restore();
  }
});

Deno.test("get - returns NETWORK_ERROR on fetch failure", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() => Promise.reject(new Error("Network down"))) as unknown as typeof fetch;
  try {
    const result = await get("/api/unreachable");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

Deno.test("get - 401 triggers redirect and returns UNAUTHORIZED", async () => {
  const loc = mockLocation();
  const restore = mockFetch(
    new Response(null, { status: 401 }),
  );
  try {
    const result = await get("/api/auth-required");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "UNAUTHORIZED");
    assertEquals(loc.getHref(), "/auth/login");
  } finally {
    restore();
    loc.restore();
  }
});

Deno.test("get - 204 returns Ok with undefined value", async () => {
  const restore = mockFetch(
    new Response(null, { status: 204 }),
  );
  try {
    const result = await get<void>("/api/no-content");
    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value, undefined);
  } finally {
    restore();
  }
});

Deno.test("post - returns Ok on 201", async () => {
  const restore = mockFetch(
    new Response(JSON.stringify({ data: { id: "new-1" } }), { status: 201 }),
  );
  try {
    const result = await post<{ id: string }>("/api/v1/patients", {
      name: "Test",
    });
    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value.id, "new-1");
  } finally {
    restore();
  }
});

Deno.test("post - returns VALIDATION_ERROR on 422", async () => {
  const restore = mockFetch(
    new Response(JSON.stringify({ error: true, reason: "Invalid CPF" }), {
      status: 422,
    }),
  );
  try {
    const result = await post("/api/v1/patients", { cpf: "invalid" });
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "VALIDATION_ERROR");
  } finally {
    restore();
  }
});

Deno.test("post - returns NETWORK_ERROR on fetch failure", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() => Promise.reject(new Error("timeout"))) as unknown as typeof fetch;
  try {
    const result = await post("/api/v1/patients", {});
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "NETWORK_ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

Deno.test("put - returns Ok on 200", async () => {
  const restore = mockFetch(
    new Response(JSON.stringify({ data: { updated: true } }), { status: 200 }),
  );
  try {
    const result = await put<{ updated: boolean }>("/api/v1/patients/1", {
      name: "Updated",
    });
    assertEquals(result.ok, true);
    if (result.ok) assertEquals(result.value.updated, true);
  } finally {
    restore();
  }
});

Deno.test("del - returns Ok on 204", async () => {
  const restore = mockFetch(
    new Response(null, { status: 204 }),
  );
  try {
    const result = await del("/api/v1/patients/1/family-members/2");
    assertEquals(result.ok, true);
  } finally {
    restore();
  }
});

Deno.test("getWithMeta - extracts data and meta", async () => {
  const responseBody = {
    data: [{ patientId: "p1", fullName: "Test" }],
    meta: {
      timestamp: "2024-01-01T00:00:00Z",
      pageSize: 20,
      totalCount: 1,
      hasMore: false,
      nextCursor: null,
    },
  };
  const restore = mockFetch(
    new Response(JSON.stringify(responseBody), { status: 200 }),
  );
  try {
    const result = await getWithMeta<readonly { patientId: string }[]>(
      "/api/v1/patients",
    );
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.data.length, 1);
      assertEquals(result.value.meta.totalCount, 1);
      assertEquals(result.value.meta.hasMore, false);
      assertEquals(result.value.meta.nextCursor, null);
    }
  } finally {
    restore();
  }
});

Deno.test("getWithMeta - returns error on failure status", async () => {
  const restore = mockFetch(
    new Response(null, { status: 500 }),
  );
  try {
    const result = await getWithMeta("/api/v1/patients");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
  } finally {
    restore();
  }
});

Deno.test("get - sends correct headers", async () => {
  let capturedHeaders: Headers | undefined;
  const original = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({ data: null }), { status: 200 });
  }) as unknown as typeof fetch;
  try {
    await get("/api/test");
    assertEquals(capturedHeaders?.get("Content-Type"), "application/json");
    assertEquals(capturedHeaders?.get("X-Requested-With"), "XMLHttpRequest");
  } finally {
    globalThis.fetch = original;
  }
});

Deno.test("post - sends credentials same-origin", async () => {
  let capturedInit: RequestInit | undefined;
  const original = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    capturedInit = init;
    return new Response(JSON.stringify({ data: null }), { status: 200 });
  }) as unknown as typeof fetch;
  try {
    await post("/api/test", { foo: "bar" });
    assertEquals(capturedInit?.credentials, "same-origin");
    assertEquals(capturedInit?.method, "POST");
    assertEquals(capturedInit?.body, JSON.stringify({ foo: "bar" }));
  } finally {
    globalThis.fetch = original;
  }
});

Deno.test("get - returns SERVER_ERROR on invalid JSON", async () => {
  const restore = mockFetch(
    new Response("not json", { status: 200, headers: { "Content-Type": "text/plain" } }),
  );
  try {
    const result = await get("/api/broken");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "SERVER_ERROR");
  } finally {
    restore();
  }
});
