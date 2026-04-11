// Admin Hub — Function signatures (contracts only, no implementations).
// Every function is declared — no bodies, no logic.

import type { MiddlewareHandler } from "@hono/hono";
import type { Hono } from "@hono/hono";
import type { AppEnv, Session } from "../../../src/types.ts";
import type { RemoteClient } from "../../../src/adapters/remote/remote_client.ts";
import type { AuditStore, AuditEntry, AuditAppendInput, AuditListOptions, AuditListResult } from "./types.ts";

// ---------------------------------------------------------------------------
// T1: Admin Guard Middleware
// ---------------------------------------------------------------------------

/**
 * Factory for admin-guard middleware.
 * Runs AFTER authGuard (session already resolved).
 *
 * Behavior:
 * - Checks `c.get("session")?.roles` for "admin" or "owner".
 * - For `/api/admin/*`: returns 403 JSON `{ error: "Forbidden: admin role required" }`.
 * - For `/admin/*` SSR: redirects to `/` (user IS authenticated, just not admin).
 *
 * Usage:
 *   app.use("/admin/*", adminGuard());
 *   app.use("/api/admin/*", adminGuard());
 */
export declare function adminGuard(): MiddlewareHandler<AppEnv>;

// ---------------------------------------------------------------------------
// T2: Audit Store
// ---------------------------------------------------------------------------

/**
 * Factory for in-memory audit store.
 * Max 10_000 entries. FIFO eviction when full (oldest by timestamp removed first).
 * Auto-generates `id` (crypto.randomUUID) and `timestamp` (ISO string) on append.
 */
export declare function createAuditStore(): AuditStore;

// ---------------------------------------------------------------------------
// T3: Admin API Routes
// ---------------------------------------------------------------------------

/**
 * Dependencies for admin API routes factory.
 */
export type AdminRoutesDeps = Readonly<{
  remoteClient: RemoteClient;
  auditStore: AuditStore;
}>;

/**
 * Factory for admin API routes.
 * Returns a Hono sub-app mounted at /api/admin.
 *
 * Routes:
 *   GET    /api/admin/people          → proxy to people-context GET /api/v1/people
 *   GET    /api/admin/people/:id      → proxy to people-context GET /api/v1/people/:id
 *   POST   /api/admin/people          → audit + proxy to people-context POST /api/v1/people
 *   PUT    /api/admin/people/:id      → audit + proxy to people-context PUT /api/v1/people/:id
 *   DELETE /api/admin/people/:id      → audit + proxy to people-context DELETE /api/v1/people/:id
 *
 *   GET    /api/admin/people/:id/roles → proxy to people-context GET /api/v1/people/:id/roles
 *   POST   /api/admin/people/:id/roles → audit + proxy to people-context POST /api/v1/people/:id/roles
 *   PATCH  /api/admin/people/:id/roles/:roleId/deactivate → audit + proxy
 *   PATCH  /api/admin/people/:id/roles/:roleId/reactivate → audit + proxy
 *
 *   GET    /api/admin/lookups/:tableName       → proxy to social-care GET /api/v1/dominios/:tableName
 *   POST   /api/admin/lookups/:tableName       → audit + proxy to social-care POST /api/v1/dominios/:tableName
 *   PUT    /api/admin/lookups/:tableName/:id   → audit + proxy to social-care PUT /api/v1/dominios/:tableName/:id
 *   PATCH  /api/admin/lookups/:tableName/:id/approve → audit + proxy
 *   PATCH  /api/admin/lookups/:tableName/:id/reject  → audit + proxy
 *
 *   GET    /api/admin/audit           → list audit entries (local, paginated)
 *   GET    /api/admin/stats           → aggregated dashboard stats
 *
 * Mutation flow: validate body → audit.append(PENDING) → proxy → update audit outcome → respond
 * X-Actor-Id: session.userSub sent to backends on all requests.
 */
export declare function createAdminApiRoutes(deps: AdminRoutesDeps): Hono<AppEnv>;

// ---------------------------------------------------------------------------
// Helper: Role check
// ---------------------------------------------------------------------------

/**
 * Checks whether a session contains at least one admin role ("admin" | "owner").
 * Pure function, no side effects.
 */
export declare function hasAdminRole(session: Session): boolean;
