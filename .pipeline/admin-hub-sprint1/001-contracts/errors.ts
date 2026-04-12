// Admin Hub — Error unions (contracts only, no implementations).

/** Errors produced by the admin guard middleware. */
export type AdminGuardError =
  | "FORBIDDEN_API"
  | "FORBIDDEN_SSR";

/** Errors produced by audit store operations. */
export type AuditStoreError =
  | "AUDIT_STORE_FULL";

/** Errors produced by admin API route operations. */
export type AdminRouteError =
  | "NO_SESSION"
  | "FORBIDDEN"
  | "MALFORMED_JSON_BODY"
  | "INVALID_REQUEST_BODY"
  | "PROXY_NETWORK_ERROR"
  | "PROXY_TIMEOUT"
  | "PROXY_UNAUTHORIZED"
  | "PROXY_SERVER_ERROR"
  | "STATS_FETCH_FAILED";

/** Union of all admin hub errors. */
export type AdminError =
  | AdminGuardError
  | AuditStoreError
  | AdminRouteError;
