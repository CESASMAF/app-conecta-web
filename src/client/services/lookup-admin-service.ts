// Lookup Admin Service — client-side operations for admin lookup management.
// All requests go through /api/admin/lookups/* on the Hono BFF.

import { get, patch, post, put } from "./base-client.ts";
import type { Result, ServiceError } from "./base-client.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LookupEntry = Readonly<{
  id: string;
  label: string;
  active: boolean;
}>;

export type LookupRequest = Readonly<{
  id: string;
  tableName: string;
  label: string;
  status: "pendente" | "aprovado" | "rejeitado";
  requestedBy: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}>;

// ---------------------------------------------------------------------------
// Table operations
// ---------------------------------------------------------------------------

export const listEntries = (
  tableName: string,
): Promise<Result<readonly LookupEntry[], ServiceError>> =>
  get<readonly LookupEntry[]>(`/api/admin/lookups/${tableName}`);

export const createEntry = (
  tableName: string,
  body: Readonly<{ label: string }>,
): Promise<Result<LookupEntry, ServiceError>> =>
  post<LookupEntry>(`/api/admin/lookups/${tableName}`, body);

export const updateEntry = (
  tableName: string,
  entryId: string,
  body: Readonly<{ label: string }>,
): Promise<Result<LookupEntry, ServiceError>> =>
  put<LookupEntry>(`/api/admin/lookups/${tableName}/${entryId}`, body);

export const toggleEntry = (
  tableName: string,
  entryId: string,
): Promise<Result<LookupEntry, ServiceError>> =>
  patch<LookupEntry>(`/api/admin/lookups/${tableName}/${entryId}/toggle`);

// ---------------------------------------------------------------------------
// Request operations
// ---------------------------------------------------------------------------

export const listRequests = (): Promise<
  Result<readonly LookupRequest[], ServiceError>
> => get<readonly LookupRequest[]>("/api/admin/lookups/requests");

export const createRequest = (
  body: Readonly<{ tableName: string; label: string }>,
): Promise<Result<LookupRequest, ServiceError>> =>
  post<LookupRequest>("/api/admin/lookups/requests", body);

export const approveRequest = (
  requestId: string,
): Promise<Result<LookupRequest, ServiceError>> =>
  put<LookupRequest>(`/api/admin/lookups/requests/${requestId}/approve`, {});

export const rejectRequest = (
  requestId: string,
  reviewNote: string,
): Promise<Result<LookupRequest, ServiceError>> =>
  put<LookupRequest>(`/api/admin/lookups/requests/${requestId}/reject`, {
    reviewNote,
  });
