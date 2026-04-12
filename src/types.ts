// AppState — Hono context variables available in all handlers/middleware.
// These are set by middleware and consumed by routes.

import type { ServerConfig } from "./adapters/config/server_config.ts";

/** Zitadel project roles. */
export type ZitadelRole = "social_worker" | "owner" | "admin";

/** Session data stored server-side. The browser only sees an opaque session ID. */
export type Session = Readonly<{
  accessToken: string;
  refreshToken: string | undefined;
  idToken: string | undefined;
  expiresAt: number;
  userSub: string;
  userName: string;
  roles: readonly string[];
}>;

/** SessionStore contract — adapter implements this. */
export type SessionStore = Readonly<{
  get: (sessionId: string) => Session | undefined;
  set: (sessionId: string, session: Session) => void;
  delete: (sessionId: string) => void;
}>;

/** Error variants for token refresh operations. Matches BFFAuthError in adapter layer. */
export type TokenRefreshError =
  | "OIDC_DISCOVERY_FAILED"
  | "TOKEN_EXCHANGE_FAILED"
  | "ID_TOKEN_DECODE_FAILED"
  | "INVALID_STATE"
  | "PKCE_EXPIRED"
  | "USERINFO_FAILED";

/** Contract for refreshing tokens + verifying session cookies — implemented by BFFAuthService. */
export type TokenRefresher = Readonly<{
  refresh: (sessionId: string) => Promise<import("./domain/shared/result.ts").Result<Session, TokenRefreshError>>;
  verifySessionCookie: (cookieValue: string) => Promise<string | undefined>;
}>;

/** Hono Variables — accessible via c.get("key") / c.set("key", value). */
export type AppVariables = {
  config: ServerConfig;
  sessionStore: SessionStore;
  tokenRefresher: TokenRefresher;
  session: Session | undefined;
  sessionId: string | undefined;
  secureHeadersNonce: string; // from hono/secure-headers NONCE
};

/** Hono Env type for the entire app. */
export type AppEnv = {
  Variables: AppVariables;
};
