// =============================================================================
// Integration Test Helpers — Shared infrastructure for E2E integration tests
// =============================================================================
// Builds a fully-wired Hono app with real middleware chain and mock externals.
// =============================================================================

import { Hono } from "@hono/hono";
import type { AppEnv, Session, SessionStore, TokenRefresher } from "../../src/types.ts";
import type { ServerConfig } from "../../src/adapters/config/server_config.ts";
import type {
  BFFAuthService,
  BFFAuthError,
} from "../../src/adapters/auth/bff_service.ts";
import {
  signSessionId,
} from "../../src/adapters/auth/bff_service.ts";
import type {
  RemoteClient,
  RemoteRequestOptions,
  RemoteResponse,
  RemoteError,
} from "../../src/adapters/remote/remote_client.ts";
import type { Result } from "../../src/domain/shared/result.ts";
import { ok, err } from "../../src/domain/shared/result.ts";
import { securityHeaders } from "../../src/middleware/security_headers.ts";
import { csrf } from "../../src/middleware/csrf.ts";
import { sessionMiddleware, SESSION_COOKIE } from "../../src/middleware/session.ts";
import { fetchMetadata } from "../../src/middleware/fetch_metadata.ts";
import { authGuard } from "../../src/middleware/auth_guard.ts";
import { healthRoutes } from "../../src/routes/health.ts";
import { createAuthRoutes } from "../../src/routes/auth.ts";
import { createApiRoutes } from "../../src/routes/api.ts";

// ---------------------------------------------------------------------------
// Test Config
// ---------------------------------------------------------------------------

export const TEST_CONFIG: ServerConfig = {
  port: 8081,
  host: "0.0.0.0",
  sessionTtlMinutes: 60,
  apiBaseUrl: "http://backend:3000",
  peopleContextBaseUrl: "http://people:3001",
  oidc: {
    issuer: "https://auth.example.com",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    redirectUri: "http://localhost:8081/auth/callback",
  },
  sessionSecret: "test-session-secret-at-least-32-chars-long",
  secureCookies: false,
};

// ---------------------------------------------------------------------------
// Test Session
// ---------------------------------------------------------------------------

export const createTestSession = (overrides?: Partial<Session>): Session => ({
  accessToken: "test-access-token-abc123",
  refreshToken: "test-refresh-token-xyz789",
  idToken: undefined,
  expiresAt: Date.now() + 3_600_000,
  userSub: "user-sub-123",
  userName: "Test User",
  roles: [],
  ...overrides,
});

// ---------------------------------------------------------------------------
// Mock Session Store (wraps a real Map, with inspection)
// ---------------------------------------------------------------------------

export type TestSessionStore = SessionStore & Readonly<{
  getAll: () => ReadonlyMap<string, Session>;
  size: () => number;
}>;

export const createTestSessionStore = (): TestSessionStore => {
  const sessions = new Map<string, Session>();

  return {
    get: (id: string): Session | undefined => {
      const session = sessions.get(id);
      if (session === undefined) return undefined;
      if (Date.now() >= session.expiresAt) {
        sessions.delete(id);
        return undefined;
      }
      return session;
    },
    set: (id: string, session: Session): void => {
      sessions.set(id, session);
    },
    delete: (id: string): void => {
      sessions.delete(id);
    },
    getAll: () => sessions,
    size: () => sessions.size,
  };
};

// ---------------------------------------------------------------------------
// Mock RemoteClient
// ---------------------------------------------------------------------------

export type CapturedRequest = Readonly<{
  baseUrl: string;
  path: string;
  method: string;
  accessToken: string;
  actorId: string | undefined;
  body: unknown;
}>;

export type MockRemoteClient = Readonly<{
  client: RemoteClient;
  captured: () => readonly CapturedRequest[];
  lastCaptured: () => CapturedRequest | undefined;
  setResponse: (response: Result<RemoteResponse, RemoteError>) => void;
}>;

export const createMockRemoteClient = (
  defaultResponse?: Result<RemoteResponse, RemoteError>,
): MockRemoteClient => {
  const capturedRequests: CapturedRequest[] = [];
  let response: Result<RemoteResponse, RemoteError> = defaultResponse ??
    ok({ status: 200, headers: new Headers(), body: { id: "test-id" } });

  const client: RemoteClient = {
    fetch: async (
      options: RemoteRequestOptions,
    ): Promise<Result<RemoteResponse, RemoteError>> => {
      capturedRequests.push({
        baseUrl: options.baseUrl,
        path: options.path,
        method: options.method,
        accessToken: options.accessToken,
        actorId: options.actorId,
        body: options.body,
      });
      return response;
    },
  };

  return {
    client,
    captured: () => capturedRequests,
    lastCaptured: () => capturedRequests[capturedRequests.length - 1],
    setResponse: (r: Result<RemoteResponse, RemoteError>) => {
      response = r;
    },
  };
};

// ---------------------------------------------------------------------------
// Mock BFFAuthService
// ---------------------------------------------------------------------------

export type MockAuthServiceOptions = Readonly<{
  login?: () => Promise<Result<Readonly<{ url: string; state: string }>, BFFAuthError>>;
  callback?: (
    code: string,
    state: string,
  ) => Promise<Result<Readonly<{ sessionId: string; cookieValue: string }>, BFFAuthError>>;
  refresh?: (sessionId: string) => Promise<Result<Session, BFFAuthError>>;
  logout?: (sessionId: string) => Readonly<{ endSessionUrl: string | undefined }>;
}>;

export const createMockAuthService = (
  overrides?: MockAuthServiceOptions,
): BFFAuthService => ({
  login: overrides?.login ??
    (async () =>
      ok({
        url: "https://auth.example.com/authorize?state=test-state",
        state: "test-state",
      })),
  callback: overrides?.callback ??
    (async () =>
      ok({
        sessionId: "new-session-id",
        cookieValue:
          "__Host-session=new-session-id.sig; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600",
      })),
  refresh: overrides?.refresh ??
    (async () => err("TOKEN_EXCHANGE_FAILED" as BFFAuthError)),
  logout: overrides?.logout ??
    (() => ({ endSessionUrl: "https://auth.example.com/end-session" })),
  verifySessionCookie: async (cookieValue: string) => {
    const dot = cookieValue.lastIndexOf(".");
    return dot === -1 ? cookieValue : cookieValue.slice(0, dot);
  },
});

// ---------------------------------------------------------------------------
// HMAC Key + Cookie Signing
// ---------------------------------------------------------------------------

let _hmacKey: CryptoKey | undefined;

export const getTestHmacKey = async (): Promise<CryptoKey> => {
  if (_hmacKey) return _hmacKey;
  const encoder = new TextEncoder();
  _hmacKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(TEST_CONFIG.sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return _hmacKey;
};

export const signTestSessionId = async (sessionId: string): Promise<string> => {
  const key = await getTestHmacKey();
  return signSessionId(sessionId, key);
};

// ---------------------------------------------------------------------------
// Full App Builder
// ---------------------------------------------------------------------------

export type TestAppContext = Readonly<{
  app: Hono<AppEnv>;
  sessionStore: TestSessionStore;
  remoteClient: MockRemoteClient;
  authService: BFFAuthService;
}>;

export const createTestApp = (opts?: {
  remoteClient?: MockRemoteClient;
  authService?: BFFAuthService;
  sessionStore?: TestSessionStore;
  config?: ServerConfig;
}): TestAppContext => {
  const config = opts?.config ?? TEST_CONFIG;
  const sessionStore = opts?.sessionStore ?? createTestSessionStore();
  const remoteClient = opts?.remoteClient ?? createMockRemoteClient();
  const authService = opts?.authService ?? createMockAuthService();

  const app = new Hono<AppEnv>();

  // Inject dependencies into context
  app.use("*", async (c, next) => {
    c.set("config", config);
    c.set("sessionStore", sessionStore);
    c.set("tokenRefresher", authService as unknown as TokenRefresher);
    await next();
  });

  // Full middleware chain (same order as server.ts)
  app.use("*", securityHeaders());
  // Skip serveStatic in tests (no filesystem)
  app.use("*", csrf());
  app.use("*", sessionMiddleware());
  app.use("*", fetchMetadata());
  app.use("*", authGuard());

  // Routes
  app.route("/", healthRoutes);
  app.route("/", createAuthRoutes(authService));
  app.route("/", createApiRoutes(remoteClient.client));

  return { app, sessionStore, remoteClient, authService };
};

// ---------------------------------------------------------------------------
// Request Builders
// ---------------------------------------------------------------------------

/**
 * Creates a request with a session cookie.
 * The session must already be in the session store.
 *
 * NOTE: The current session middleware reads the cookie value via getCookie()
 * and passes it directly to sessionStore.get(). It does NOT verify HMAC
 * signatures. Therefore, we use the plain sessionId as the cookie value
 * (matching the key under which the session is stored).
 */
export const authenticatedRequest = async (
  path: string,
  sessionId: string,
  opts?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<Request> => {
  const headers: Record<string, string> = {
    Cookie: `${SESSION_COOKIE}=${sessionId}`,
    ...(opts?.headers ?? {}),
  };

  if (opts?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return new Request(`http://localhost${path}`, {
    method: opts?.method ?? "GET",
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
};

/**
 * Creates an authenticated API request with all required security headers.
 */
export const authenticatedApiRequest = async (
  path: string,
  sessionId: string,
  opts?: {
    method?: string;
    body?: unknown;
    actorId?: string;
    headers?: Record<string, string>;
  },
): Promise<Request> => {
  const method = opts?.method ?? "GET";
  const extraHeaders: Record<string, string> = {
    "Sec-Fetch-Site": "same-origin",
    ...(opts?.headers ?? {}),
  };

  // Add X-Requested-With for mutating methods
  if (method === "POST" || method === "PUT" || method === "DELETE") {
    extraHeaders["X-Requested-With"] = "XMLHttpRequest";
  }

  if (opts?.actorId) {
    extraHeaders["X-Actor-Id"] = opts.actorId;
  }

  return authenticatedRequest(path, sessionId, {
    method,
    body: opts?.body,
    headers: extraHeaders,
  });
};

/**
 * Shorthand to set up an authenticated session and return the sessionId.
 */
export const setupAuthenticatedSession = (
  sessionStore: TestSessionStore,
  session?: Session,
): string => {
  const sessionId = "test-session-" + crypto.randomUUID().slice(0, 8);
  sessionStore.set(sessionId, session ?? createTestSession());
  return sessionId;
};
