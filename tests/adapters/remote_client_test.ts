import { assertEquals, assertExists } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import {
  createRemoteClient,
  type RemoteClient,
  type RemoteRequestOptions,
  type RemoteError,
  type RemoteResponse,
} from "../../src/adapters/remote/remote_client.ts";
import type { ServerConfig } from "../../src/adapters/config/server_config.ts";
import type { Result } from "../../src/domain/shared/result.ts";

const TEST_CONFIG: ServerConfig = {
  port: 8081,
  host: "0.0.0.0",
  sessionTtlMinutes: 60,
  apiBaseUrl: "http://localhost:3000",
  peopleContextBaseUrl: "http://localhost:3001",
  oidc: {
    issuer: "https://auth.test.com",
    clientId: "test-client",
    clientSecret: "test-secret",
    redirectUri: "http://localhost:8081/auth/callback",
  },
  sessionSecret: "test-session-secret",
  secureCookies: false,
};

const baseOptions: RemoteRequestOptions = {
  baseUrl: "http://localhost:3000",
  path: "/patients",
  method: "GET",
  accessToken: "test-token-abc",
};

// Stubs for globalThis.fetch
type FetchStub = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

let originalFetch: typeof globalThis.fetch;

const stubFetch = (fn: FetchStub): void => {
  // deno-lint-ignore no-explicit-any
  globalThis.fetch = fn as any;
};

describe("RemoteClient", () => {
  let client: RemoteClient;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    client = createRemoteClient(TEST_CONFIG);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("factory creates a client with a fetch method", () => {
    assertExists(client.fetch);
    assertEquals(typeof client.fetch, "function");
  });

  it("sends Authorization header with Bearer token", async () => {
    let capturedHeaders: HeadersInit | undefined;

    stubFetch((_url, init) => {
      capturedHeaders = init?.headers;
      return Promise.resolve(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );
    });

    await client.fetch(baseOptions);

    const headers = capturedHeaders as Record<string, string>;
    assertEquals(headers["Authorization"], "Bearer test-token-abc");
    assertEquals(headers["Content-Type"], "application/json");
    assertEquals(headers["Accept"], "application/json");
  });

  it("sends X-Actor-Id header when actorId is provided", async () => {
    let capturedHeaders: HeadersInit | undefined;

    stubFetch((_url, init) => {
      capturedHeaders = init?.headers;
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    });

    await client.fetch({ ...baseOptions, actorId: "actor-xyz" });

    const headers = capturedHeaders as Record<string, string>;
    assertEquals(headers["X-Actor-Id"], "actor-xyz");
  });

  it("does not send X-Actor-Id header when actorId is undefined", async () => {
    let capturedHeaders: HeadersInit | undefined;

    stubFetch((_url, init) => {
      capturedHeaders = init?.headers;
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    });

    await client.fetch(baseOptions);

    const headers = capturedHeaders as Record<string, string>;
    assertEquals(headers["X-Actor-Id"], undefined);
  });

  it("builds URL from baseUrl + path", async () => {
    let capturedUrl: string | undefined;

    stubFetch((url) => {
      capturedUrl = url as string;
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    });

    await client.fetch({
      ...baseOptions,
      baseUrl: "http://backend:3000",
      path: "/api/v1/patients",
    });

    assertEquals(capturedUrl, "http://backend:3000/api/v1/patients");
  });

  it("sends JSON body for POST requests", async () => {
    let capturedBody: string | undefined;
    let capturedMethod: string | undefined;

    stubFetch((_url, init) => {
      capturedBody = init?.body as string;
      capturedMethod = init?.method;
      return Promise.resolve(
        new Response(JSON.stringify({ id: "new-123" }), { status: 201 }),
      );
    });

    const body = { name: "Test Patient", cpf: "12345678901" };
    await client.fetch({
      ...baseOptions,
      method: "POST",
      body,
    });

    assertEquals(capturedMethod, "POST");
    assertEquals(capturedBody, JSON.stringify(body));
  });

  it("does not send body for GET requests", async () => {
    let capturedBody: BodyInit | null | undefined;

    stubFetch((_url, init) => {
      capturedBody = init?.body;
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    });

    await client.fetch(baseOptions);

    assertEquals(capturedBody, undefined);
  });

  it("returns ok with status, headers, and parsed JSON body on success", async () => {
    const responseData = { id: "p-1", name: "Patient One" };

    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { "X-Request-Id": "req-abc" },
        }),
      )
    );

    const result: Result<RemoteResponse, RemoteError> =
      await client.fetch(baseOptions);

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.status, 200);
      assertEquals(result.value.body, responseData);
      assertEquals(result.value.headers.get("X-Request-Id"), "req-abc");
    }
  });

  it("returns err UNAUTHORIZED on 401 response", async () => {
    stubFetch(() =>
      Promise.resolve(new Response("Unauthorized", { status: 401 }))
    );

    const result = await client.fetch(baseOptions);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "UNAUTHORIZED");
    }
  });

  it("returns err SERVER_ERROR on 500 response", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response("Internal Server Error", { status: 500 }),
      )
    );

    const result = await client.fetch(baseOptions);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SERVER_ERROR");
    }
  });

  it("returns err SERVER_ERROR on 502 response", async () => {
    stubFetch(() =>
      Promise.resolve(new Response("Bad Gateway", { status: 502 }))
    );

    const result = await client.fetch(baseOptions);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "SERVER_ERROR");
    }
  });

  it("returns err NETWORK_ERROR on fetch failure", async () => {
    stubFetch(() => Promise.reject(new TypeError("fetch failed")));

    const result = await client.fetch(baseOptions);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "NETWORK_ERROR");
    }
  });

  it("returns err TIMEOUT on AbortError", async () => {
    stubFetch(() =>
      Promise.reject(new DOMException("The operation was aborted", "AbortError"))
    );

    const result = await client.fetch(baseOptions);

    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "TIMEOUT");
    }
  });

  it("returns ok with null body when response is not valid JSON", async () => {
    stubFetch(() =>
      Promise.resolve(new Response("not-json-content", { status: 200 }))
    );

    const result = await client.fetch(baseOptions);

    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.value.status, 200);
      assertEquals(result.value.body, null);
    }
  });

  it("merges custom headers with defaults", async () => {
    let capturedHeaders: HeadersInit | undefined;

    stubFetch((_url, init) => {
      capturedHeaders = init?.headers;
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    });

    await client.fetch({
      ...baseOptions,
      headers: { "X-Custom": "custom-value" },
    });

    const headers = capturedHeaders as Record<string, string>;
    assertEquals(headers["X-Custom"], "custom-value");
    assertEquals(headers["Authorization"], "Bearer test-token-abc");
  });

  it("passes abort signal for timeout support", async () => {
    let capturedSignal: AbortSignal | undefined;

    stubFetch((_url, init) => {
      capturedSignal = init?.signal ?? undefined;
      return Promise.resolve(
        new Response(JSON.stringify({}), { status: 200 }),
      );
    });

    await client.fetch(baseOptions);

    assertExists(capturedSignal);
    assertEquals(capturedSignal!.aborted, false);
  });
});
