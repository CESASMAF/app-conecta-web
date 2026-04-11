import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  base64urlEncode,
  computeChallenge,
  createBFFAuthService,
  generateVerifier,
} from "../../src/adapters/auth/bff_service.ts";
import { createSessionStore } from "../../src/adapters/auth/session_store.ts";
import type { ServerConfig } from "../../src/adapters/config/server_config.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;

const makeConfig = (overrides?: Partial<ServerConfig>): ServerConfig => ({
  port: 8081,
  host: "0.0.0.0",
  sessionTtlMinutes: 60,
  apiBaseUrl: "http://localhost:3000",
  peopleContextBaseUrl: "http://localhost:3001",
  oidc: {
    issuer: "https://auth.example.com",
    clientId: "test-client",
    clientSecret: "test-secret",
    redirectUri: "http://localhost:8081/auth/callback",
  },
  sessionSecret: "test-session-secret",
  secureCookies: false,
  ...overrides,
});

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

describe("base64urlEncode", () => {
  it("produces valid base64url output (no +, /, or =)", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    const result = base64urlEncode(bytes);
    assertEquals(BASE64URL_RE.test(result), true);
  });

  it("encodes known bytes correctly", () => {
    // "Hello" in bytes → base64 "SGVsbG8=" → base64url "SGVsbG8"
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    assertEquals(base64urlEncode(bytes), "SGVsbG8");
  });

  it("handles empty array", () => {
    const bytes = new Uint8Array([]);
    assertEquals(base64urlEncode(bytes), "");
  });
});

describe("generateVerifier", () => {
  it("returns a non-empty base64url string", () => {
    const v = generateVerifier();
    assertNotEquals(v.length, 0);
    assertEquals(BASE64URL_RE.test(v), true);
  });

  it("produces different values on successive calls", () => {
    const a = generateVerifier();
    const b = generateVerifier();
    assertNotEquals(a, b);
  });

  it("is at least 43 characters (required by PKCE spec)", () => {
    const v = generateVerifier();
    assertEquals(v.length >= 43, true);
  });
});

describe("computeChallenge", () => {
  it("produces valid base64url output", async () => {
    const verifier = generateVerifier();
    const challenge = await computeChallenge(verifier);
    assertEquals(BASE64URL_RE.test(challenge), true);
  });

  it("is deterministic for the same verifier", async () => {
    const verifier = "test-verifier-value-for-determinism";
    const a = await computeChallenge(verifier);
    const b = await computeChallenge(verifier);
    assertEquals(a, b);
  });

  it("produces different challenges for different verifiers", async () => {
    const a = await computeChallenge("verifier-aaa");
    const b = await computeChallenge("verifier-bbb");
    assertNotEquals(a, b);
  });

  it("matches known SHA-256 for empty string", async () => {
    // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    // base64url of those 32 bytes = "47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU"
    const result = await computeChallenge("");
    assertEquals(result, "47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  });
});

// ---------------------------------------------------------------------------
// Factory smoke test
// ---------------------------------------------------------------------------

describe("createBFFAuthService", () => {
  it("returns an object with login, callback, and logout methods", () => {
    const config = makeConfig();
    const store = createSessionStore();
    const service = createBFFAuthService(config, store);

    assertEquals(typeof service.login, "function");
    assertEquals(typeof service.callback, "function");
    assertEquals(typeof service.logout, "function");
  });

  it("logout deletes session and returns endSessionUrl", () => {
    const config = makeConfig();
    const store = createSessionStore();
    const service = createBFFAuthService(config, store);

    // Pre-populate a session
    const sessionId = "test-session-id";
    store.set(sessionId, {
      accessToken: "at",
      refreshToken: undefined,
      idToken: undefined,
      expiresAt: Date.now() + 3600000,
      userSub: "user1",
      userName: "Test User",
      roles: [],
    });

    assertEquals(store.get(sessionId) !== undefined, true);

    const result = service.logout(sessionId);
    assertEquals(store.get(sessionId), undefined);
    // No discovery cache yet, so endSessionUrl should be undefined
    assertEquals(result.endSessionUrl, undefined);
  });

  it("callback with invalid state returns INVALID_STATE error", async () => {
    const config = makeConfig();
    const store = createSessionStore();
    const service = createBFFAuthService(config, store);

    const result = await service.callback("some-code", "invalid-state");
    assertEquals(result.ok, false);
    if (!result.ok) {
      assertEquals(result.error, "INVALID_STATE");
    }
  });
});
