// Admin API routes — proxies to people-context and social-care backends.
// Mounted at /api/admin.

import { Hono } from "@hono/hono";
import type { ContentfulStatusCode } from "@hono/hono/utils/http-status";
import type { AppEnv } from "../types.ts";
import type {
  RemoteClient,
  RemoteError,
  RemoteResponse,
} from "../adapters/remote/remote_client.ts";
import type { Result } from "../domain/shared/result.ts";

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export type AdminRoutesDeps = Readonly<{
  remoteClient: RemoteClient;
}>;

// ---------------------------------------------------------------------------
// Proxy helpers (duplicated from api.ts to avoid touching stable code)
// ---------------------------------------------------------------------------

/** Wraps backend response body in { data: ... } for consistent client consumption. */
const toDataResponse = (
  body: unknown,
): Readonly<{ data: unknown }> => {
  if (body === null || body === undefined) return { data: null };
  if (typeof body === "object" && body !== null && "data" in body) {
    return body as Readonly<{ data: unknown }>;
  }
  return { data: body };
};

const isNullBodyStatus = (status: number): boolean =>
  status === 101 || status === 204 || status === 205 || status === 304;

/** Safely coerce response status to ContentfulStatusCode (same as api.ts). */
const toResponseStatus = (status: number): ContentfulStatusCode => {
  const clamped = Math.max(100, Math.min(599, status));
  // Safe: clamped is in valid HTTP range
  return clamped as ContentfulStatusCode;
};

/** Maps RemoteError to appropriate HTTP status codes. */
const ERROR_STATUS_MAP: Readonly<Record<RemoteError, ContentfulStatusCode>> = {
  UNAUTHORIZED: 401,
  SERVER_ERROR: 502,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
};

/** Allowed lookup table names — prevents path traversal via :tableName. */
const ALLOWED_LOOKUP_TABLES: ReadonlySet<string> = new Set([
  "dominio_tipo_identidade",
  "dominio_tipo_deficiencia",
  "dominio_parentesco",
  "dominio_programa_social",
  "dominio_condicao_ocupacao",
  "dominio_tipo_ingresso",
  "dominio_escolaridade",
  "dominio_tipo_beneficio",
  "dominio_efeito_condicionalidade",
  "dominio_tipo_violacao",
  "dominio_servico_vinculo",
  "dominio_tipo_medida",
  "dominio_unidade_realizacao",
]);

/** UUID v4 format regex for path parameter validation. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUuid = (value: string): boolean => UUID_RE.test(value);

/** Status value used by social-care backend for pending lookup requests. */
const PENDING_REQUEST_STATUS = "pendente";

/** Type guard for items with a `status` string field. */
type RequestItem = Readonly<{ status: string }>;

const isRequestItem = (v: unknown): v is RequestItem =>
  typeof v === "object" && v !== null && "status" in v &&
  typeof (v as Record<string, unknown>).status === "string";

/** Extracts count of pending items from a response body (array or { data: [] }). */
const extractPendingCount = (body: unknown): number => {
  if (!body || typeof body !== "object") return 0;
  const obj = body as Record<string, unknown>;
  const arr: readonly unknown[] = Array.isArray(body)
    ? body
    : "data" in obj && Array.isArray(obj.data)
    ? obj.data as unknown[]
    : [];
  return arr.filter(
    (item) => isRequestItem(item) && item.status === PENDING_REQUEST_STATUS,
  ).length;
};

/** Extracts a numeric `total` from a remote response body, defaulting to 0. */
const extractTotal = (
  result: Result<RemoteResponse, RemoteError>,
): number => {
  if (!result.ok || !result.value.body) return 0;
  const body = result.value.body;
  if (Array.isArray(body)) return body.length;
  if (
    typeof body === "object" &&
    body !== null &&
    "total" in body &&
    typeof (body as Record<string, unknown>).total === "number"
  ) {
    // Safe: narrowed via typeof check above
    return (body as Record<string, unknown>).total as number;
  }
  return 0;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export const createAdminApiRoutes = (
  deps: AdminRoutesDeps,
): Hono<AppEnv> => {
  const { remoteClient } = deps;
  const admin = new Hono<AppEnv>();

  // --- Validate JSON body on mutating methods ---
  admin.use("*", async (c, next) => {
    const method = c.req.method;
    if (
      method === "POST" ||
      method === "PUT" ||
      method === "DELETE" ||
      method === "PATCH"
    ) {
      const contentType = c.req.header("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          await c.req.raw.clone().json();
        } catch {
          return c.json({ error: "Malformed JSON body" }, 400);
        }
      }
    }
    await next();
  });

  // =========================================================================
  // People Routes (proxy → people-context)
  // =========================================================================

  // GET /people — list
  admin.get("/people", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: "/api/v1/people",
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // GET /people/:id — detail
  admin.get("/people/:id", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const personId = c.req.param("id");
    if (!isValidUuid(personId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: `/api/v1/people/${personId}`,
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // POST /people — register
  admin.post("/people", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: "/api/v1/people",
      method: "POST",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PUT /people/:id — update
  admin.put("/people/:id", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const personId = c.req.param("id");
    if (!isValidUuid(personId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: `/api/v1/people/${personId}`,
      method: "PUT",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // =========================================================================
  // Role Routes (proxy → people-context)
  // =========================================================================

  // GET /people/:id/roles — list roles
  admin.get("/people/:id/roles", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const personId = c.req.param("id");
    if (!isValidUuid(personId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: `/api/v1/people/${personId}/roles`,
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // POST /people/:id/roles — assign role
  admin.post("/people/:id/roles", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const personId = c.req.param("id");
    if (!isValidUuid(personId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: `/api/v1/people/${personId}/roles`,
      method: "POST",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PUT /people/:id/roles/:roleId/deactivate
  admin.put("/people/:id/roles/:roleId/deactivate", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const personId = c.req.param("id");
    const roleId = c.req.param("roleId");
    if (!isValidUuid(personId) || !isValidUuid(roleId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: `/api/v1/people/${personId}/roles/${roleId}/deactivate`,
      method: "PUT",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PUT /people/:id/roles/:roleId/reactivate
  admin.put("/people/:id/roles/:roleId/reactivate", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const personId = c.req.param("id");
    const roleId = c.req.param("roleId");
    if (!isValidUuid(personId) || !isValidUuid(roleId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: `/api/v1/people/${personId}/roles/${roleId}/reactivate`,
      method: "PUT",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // =========================================================================
  // Lookup Request Routes (proxy → social-care /api/v1/dominios/requests)
  // MUST be registered BEFORE /lookups/:tableName to prevent "requests"
  // being captured as a :tableName parameter.
  // =========================================================================

  // GET /lookups/requests — list pending requests
  admin.get("/lookups/requests", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: "/api/v1/dominios/requests",
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // POST /lookups/requests — create a new lookup request
  admin.post("/lookups/requests", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: "/api/v1/dominios/requests",
      method: "POST",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PUT /lookups/requests/:requestId/approve — approve a lookup request
  admin.put("/lookups/requests/:requestId/approve", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const requestId = c.req.param("requestId");
    if (!isValidUuid(requestId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: `/api/v1/dominios/requests/${requestId}/approve`,
      method: "PUT",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PUT /lookups/requests/:requestId/reject — reject a lookup request
  admin.put("/lookups/requests/:requestId/reject", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const requestId = c.req.param("requestId");
    if (!isValidUuid(requestId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: `/api/v1/dominios/requests/${requestId}/reject`,
      method: "PUT",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // =========================================================================
  // Lookup Table Routes (proxy → social-care /api/v1/dominios/)
  // =========================================================================

  // GET /lookups/:tableName — list entries
  admin.get("/lookups/:tableName", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const tableName = c.req.param("tableName");
    if (!ALLOWED_LOOKUP_TABLES.has(tableName)) {
      return c.json({ error: "Invalid lookup table name" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: `/api/v1/dominios/${tableName}`,
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // POST /lookups/:tableName — create entry
  admin.post("/lookups/:tableName", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const tableName = c.req.param("tableName");
    if (!ALLOWED_LOOKUP_TABLES.has(tableName)) {
      return c.json({ error: "Invalid lookup table name" }, 400);
    }

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: `/api/v1/dominios/${tableName}`,
      method: "POST",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PUT /lookups/:tableName/:id — update entry
  admin.put("/lookups/:tableName/:id", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const tableName = c.req.param("tableName");
    const entryId = c.req.param("id");
    if (!ALLOWED_LOOKUP_TABLES.has(tableName)) {
      return c.json({ error: "Invalid lookup table name" }, 400);
    }
    if (!isValidUuid(entryId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const body: unknown = await c.req.json();

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: `/api/v1/dominios/${tableName}/${entryId}`,
      method: "PUT",
      accessToken: session.accessToken,
      actorId: session.userSub,
      body,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // PATCH /lookups/:tableName/:id/toggle — toggle active/inactive
  admin.patch("/lookups/:tableName/:id/toggle", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");
    const tableName = c.req.param("tableName");
    const entryId = c.req.param("id");
    if (!ALLOWED_LOOKUP_TABLES.has(tableName)) {
      return c.json({ error: "Invalid lookup table name" }, 400);
    }
    if (!isValidUuid(entryId)) {
      return c.json({ error: "Invalid ID format" }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: `/api/v1/dominios/${tableName}/${entryId}/toggle`,
      method: "PATCH",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    if (!result.ok) {
      return c.json(
        { error: result.error, message: `Upstream service error: ${result.error}` },
        ERROR_STATUS_MAP[result.error],
      );
    }
    if (isNullBodyStatus(result.value.status)) return c.body(null, 204);
    return c.json(
      toDataResponse(result.value.body),
      toResponseStatus(result.value.status),
    );
  });

  // =========================================================================
  // Stats Route (aggregated dashboard data)
  // =========================================================================

  admin.get("/stats", async (c) => {
    const session = c.get("session");
    if (!session) return c.json({ error: "Unauthorized" }, 401);
    const config = c.get("config");

    // Fetch people count from people-context
    const peopleResult = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: "/api/v1/people?limit=0",
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    const peopleTotal = extractTotal(peopleResult);

    // Fetch active roles from people-context
    const rolesResult = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path: "/api/v1/roles?active=true",
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    const rolesActive = extractTotal(rolesResult);

    // Fetch pending lookup requests from social-care backend
    const requestsResult = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path: "/api/v1/dominios/requests",
      method: "GET",
      accessToken: session.accessToken,
      actorId: session.userSub,
    });

    const pendingCount = requestsResult.ok && requestsResult.value.body
      ? extractPendingCount(requestsResult.value.body)
      : 0;

    return c.json({
      data: {
        totalPeople: peopleTotal,
        activeRoles: rolesActive,
        pendingRequests: pendingCount,
        recentAuditCount: 0,
        health: (peopleResult.ok && rolesResult.ok) ? "ok" as const : "partial" as const,
      },
    });
  });

  return admin;
};
