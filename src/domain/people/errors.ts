// =============================================================================
// People Context — Error Unions
// =============================================================================

/** Person-related errors */
export type PersonError =
  | "PEO-001" // validation: fullName empty or exceeds 200 chars
  | "PEO-002" // not found
  | "PEO-003" // invalid personId (UUID)
  | "PEO-004"; // invalid CPF format (not 11 digits)

/** Role-related errors */
export type RoleError =
  | "ROL-001" // validation: system or role empty
  | "ROL-002" // active role not found
  | "ROL-003" // inactive role not found
  | "ROL-004" // missing system param
  | "ROL-005"; // invalid UUID

/** Proxy errors from upstream People service */
export type ProxyError =
  | "PROXY_TIMEOUT"
  | "PROXY_UNAVAILABLE"
  | "PROXY_UNEXPECTED";
