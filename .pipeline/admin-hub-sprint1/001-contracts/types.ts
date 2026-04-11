// Admin Hub — Type definitions (contracts only, no implementations).
// These types are consumed by infra-implementer to build middleware, adapter, and routes.

import type { Session } from "../../../src/types.ts";

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

/** Roles that grant access to admin routes. Subset of ZitadelRole. */
export type AdminRole = "admin" | "owner";

/** All known admin roles for guard checks. */
export const ADMIN_ROLES: readonly AdminRole[] = ["admin", "owner"] as const;

// ---------------------------------------------------------------------------
// Audit — Actions
// ---------------------------------------------------------------------------

/** Discriminated set of auditable admin actions. */
export type AuditAction =
  | "PERSON_CREATED"
  | "PERSON_DEACTIVATED"
  | "PERSON_REACTIVATED"
  | "ROLE_ASSIGNED"
  | "ROLE_DEACTIVATED"
  | "ROLE_REACTIVATED"
  | "LOOKUP_CREATED"
  | "LOOKUP_UPDATED"
  | "LOOKUP_APPROVED"
  | "LOOKUP_REJECTED";

/** Outcome of an audited operation. */
export type AuditOutcome = "SUCCESS" | "FAILURE";

// ---------------------------------------------------------------------------
// Audit — Entry
// ---------------------------------------------------------------------------

/** Immutable audit log entry. Created by the audit store on append. */
export type AuditEntry = Readonly<{
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  targetId: string;
  details: string | undefined;
  outcome: AuditOutcome;
  errorMessage: string | undefined;
}>;

/** Input for appending a new audit entry. id and timestamp are auto-generated. */
export type AuditAppendInput = Readonly<{
  actorId: string;
  actorName: string;
  action: AuditAction;
  targetId: string;
  details?: string;
  outcome: AuditOutcome;
  errorMessage?: string;
}>;

/** Pagination options for listing audit entries. */
export type AuditListOptions = Readonly<{
  limit: number;
  offset: number;
}>;

/** Paginated audit list result. */
export type AuditListResult = Readonly<{
  entries: readonly AuditEntry[];
  total: number;
}>;

// ---------------------------------------------------------------------------
// Audit — Store contract
// ---------------------------------------------------------------------------

/** In-memory append-only audit store. Max 10_000 entries with FIFO eviction. */
export type AuditStore = Readonly<{
  append: (input: AuditAppendInput) => AuditEntry;
  list: (options: AuditListOptions) => AuditListResult;
  listByActor: (actorId: string, options: AuditListOptions) => AuditListResult;
  count: () => number;
}>;

// ---------------------------------------------------------------------------
// Admin Stats — Dashboard aggregation
// ---------------------------------------------------------------------------

/** Aggregated stats returned by /api/admin/stats. */
export type AdminStats = Readonly<{
  people: Readonly<{ total: number }>;
  roles: Readonly<{ active: number }>;
  audit: Readonly<{ total: number }>;
}>;

// ---------------------------------------------------------------------------
// Extended HTTP method for RemoteClient
// ---------------------------------------------------------------------------

/** HTTP methods needed by admin routes (extends existing "GET"|"POST"|"PUT"|"DELETE"). */
export type AdminHttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// ---------------------------------------------------------------------------
// Session role check helper type
// ---------------------------------------------------------------------------

/** Predicate: does the session contain at least one admin role? */
export type HasAdminRole = (session: Session) => boolean;
