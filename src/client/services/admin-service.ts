// Admin Service — client-side operations for admin people, audit, and stats.
// All requests go through /api/admin/* on the Hono BFF.
// Lookup operations are in lookup-admin-service.ts.

import { get, post } from "./base-client.ts";
import type { Result, ServiceError } from "./base-client.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PersonSummary = Readonly<{
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  roles: readonly string[];
  active: boolean;
}>;

export type AdminStats = Readonly<{
  people: Readonly<{ total: number }>;
  roles: Readonly<{ active: number }>;
  audit: Readonly<{ total: number }>;
}>;

export type AuditEntry = Readonly<{
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string | null;
  details: string | null;
  outcome: "SUCCESS" | "FAILURE";
}>;

export type AuditListResponse = Readonly<{
  entries: readonly AuditEntry[];
  total: number;
}>;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export const getStats = (): Promise<Result<AdminStats, ServiceError>> =>
  get<AdminStats>("/api/admin/stats");

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export const listPeople = (): Promise<
  Result<readonly PersonSummary[], ServiceError>
> => get<readonly PersonSummary[]>("/api/admin/people");

export const createPerson = (
  body: Readonly<{ name: string; cpf: string; birthDate: string }>,
): Promise<Result<Readonly<{ id: string }>, ServiceError>> =>
  post<Readonly<{ id: string }>>("/api/admin/people", body);

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export const listAudit = (
  limit: number,
  offset: number,
): Promise<Result<AuditListResponse, ServiceError>> =>
  get<AuditListResponse>(`/api/admin/audit?limit=${limit}&offset=${offset}`);
