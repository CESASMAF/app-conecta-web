// Admin Hub — Type definitions for audit store and admin operations.

// ---------------------------------------------------------------------------
// Audit — Actions
// ---------------------------------------------------------------------------

export type AuditAction =
  | "PERSON_CREATED"
  | "PERSON_UPDATED"
  | "PERSON_DEACTIVATED"
  | "PERSON_REACTIVATED"
  | "ROLE_ASSIGNED"
  | "ROLE_DEACTIVATED"
  | "ROLE_REACTIVATED"
  | "LOOKUP_CREATED"
  | "LOOKUP_UPDATED"
  | "LOOKUP_TOGGLED"
  | "LOOKUP_APPROVED"
  | "LOOKUP_REJECTED"
  | "LOOKUP_REQUEST_CREATED"
  | "LOOKUP_REQUEST_APPROVED"
  | "LOOKUP_REQUEST_REJECTED";

export type AuditOutcome = "SUCCESS" | "FAILURE";

// ---------------------------------------------------------------------------
// Audit — Entry (discriminated on outcome for type safety)
// ---------------------------------------------------------------------------

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

/** Input for appending: FAILURE requires errorMessage, SUCCESS forbids it. */
export type AuditAppendInput =
  | Readonly<{
    actorId: string;
    actorName: string;
    action: AuditAction;
    targetId: string;
    details?: string;
    outcome: "SUCCESS";
  }>
  | Readonly<{
    actorId: string;
    actorName: string;
    action: AuditAction;
    targetId: string;
    details?: string;
    outcome: "FAILURE";
    errorMessage: string;
  }>;

// ---------------------------------------------------------------------------
// Audit — Pagination
// ---------------------------------------------------------------------------

export type AuditListOptions = Readonly<{
  limit: number;
  offset: number;
}>;

export type AuditListResult = Readonly<{
  entries: readonly AuditEntry[];
  total: number;
}>;

// ---------------------------------------------------------------------------
// Audit — Store contract
// ---------------------------------------------------------------------------

export type AuditStore = Readonly<{
  append: (input: AuditAppendInput) => AuditEntry;
  list: (options: AuditListOptions) => AuditListResult;
  listByActor: (actorId: string, options: AuditListOptions) => AuditListResult;
  count: () => number;
}>;
