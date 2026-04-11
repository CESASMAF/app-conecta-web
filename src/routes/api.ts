// API proxy routes — forwards /api/* requests to upstream backend services.
// Injects Bearer token from session. The browser NEVER sees the backend URL or tokens.
// All request bodies are validated before proxying to the backend.

import { Hono } from "@hono/hono";
import type { ContentfulStatusCode } from "@hono/hono/utils/http-status";
import type { AppEnv } from "../types.ts";
import type {
  RemoteClient,
  RemoteError,
} from "../adapters/remote/remote_client.ts";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const ERROR_STATUS_MAP: Readonly<Record<RemoteError, ContentfulStatusCode>> = {
  UNAUTHORIZED: 401,
  SERVER_ERROR: 502,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
} as const;

/** Result type for body parsing — distinguishes "no body" from "malformed body". */
type ParsedBody =
  | Readonly<{ parsed: true; value: unknown }>
  | Readonly<{ parsed: false; error: string }>
  | Readonly<{ parsed: true; value: undefined }>;

/**
 * Safely parse the request body for non-GET methods.
 * Returns a structured result to distinguish "no body needed" from "malformed JSON".
 */
const safeParseBody = async (
  req: Request,
  method: string,
): Promise<ParsedBody> => {
  if (method === "GET" || method === "HEAD") {
    return { parsed: true, value: undefined };
  }
  // DELETE typically has no body — only parse if Content-Type indicates JSON
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { parsed: true, value: undefined };
  }
  try {
    const body: unknown = await req.json();
    return { parsed: true, value: body };
  } catch {
    return { parsed: false, error: "Malformed JSON body" };
  }
};

/**
 * Validate request body before proxying.
 * Uses domain smart constructors for known endpoints.
 * For unknown endpoints, ensures body is at least valid JSON.
 */
const validateRequestBody = (
  _path: string,
  _method: string,
  body: unknown,
): Readonly<{ valid: true }> | Readonly<{ valid: false; error: string }> => {
  // Basic validation: body should be a non-null object for mutating requests
  if (body !== undefined && body !== null && typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }
  // TODO: Add path-specific domain validation using smart constructors
  // e.g., POST /api/v1/patients → validate CPF, PersonalData, Address
  return { valid: true };
};

/** Safely coerce response body to a JSON-serializable value. */
const toJsonBody = (body: unknown): Record<string, unknown> | readonly unknown[] | null => {
  if (body === null || body === undefined) return null;
  if (Array.isArray(body)) return body as readonly unknown[];
  if (typeof body === "object") return body as Record<string, unknown>;
  return null;
};

/** Safely coerce response status to ContentfulStatusCode. */
const toResponseStatus = (status: number): ContentfulStatusCode => {
  // Clamp to valid HTTP status range (100-599)
  const clamped = Math.max(100, Math.min(599, status));
  return clamped as ContentfulStatusCode;
};

/** Status codes that MUST NOT have a body (per HTTP/Fetch spec). */
const isNullBodyStatus = (status: number): boolean =>
  status === 101 || status === 204 || status === 205 || status === 304;

/**
 * API routes factory — receives RemoteClient via dependency injection.
 *
 * Routes:
 *   /api/v1/*     → proxied to config.apiBaseUrl (social-care backend)
 *   /api/people/* → proxied to config.peopleContextBaseUrl (people-context backend)
 */
export const createApiRoutes = (remoteClient: RemoteClient): Hono<AppEnv> => {
  const api = new Hono<AppEnv>();

  // Pre-validate JSON body on mutating methods for all API routes.
  // Returns 400 immediately if the Content-Type is JSON but the body is malformed.
  api.use("*", async (c, next) => {
    const method = c.req.method;
    if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
      const contentType = c.req.header("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          // Clone the request to peek at the body without consuming it
          await c.req.raw.clone().json();
        } catch {
          return c.json({ error: "Malformed JSON body" }, 400);
        }
      }
    }
    await next();
  });

  // Proxy /api/v1/* to social-care backend
  api.all("/api/v1/*", async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = c.get("config");
    const path = c.req.path;
    const method = c.req.method as HttpMethod;
    const actorId = c.req.header("x-actor-id");

    const bodyResult = await safeParseBody(c.req.raw, method);
    if (!bodyResult.parsed) {
      return c.json({ error: bodyResult.error }, 400);
    }

    // Validate request body before proxying
    const validation = validateRequestBody(path, method, bodyResult.value);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.apiBaseUrl,
      path,
      method,
      accessToken: session.accessToken,
      actorId: actorId || undefined,
      body: bodyResult.value,
    });

    if (!result.ok) {
      const status = ERROR_STATUS_MAP[result.error];
      return c.json({ error: result.error }, status);
    }

    const responseStatus = toResponseStatus(result.value.status);
    if (isNullBodyStatus(result.value.status)) {
      return c.body(null, responseStatus);
    }
    const responseBody = toJsonBody(result.value.body);
    return c.json(responseBody, responseStatus);
  });

  // Proxy /api/people/* to people-context backend
  // Strips the /api/people prefix and maps to /api/v1
  api.all("/api/people/*", async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = c.get("config");
    const originalPath = c.req.path;
    const path = originalPath.replace("/api/people", "/api/v1");
    const method = c.req.method as HttpMethod;
    const actorId = c.req.header("x-actor-id");

    const bodyResult = await safeParseBody(c.req.raw, method);
    if (!bodyResult.parsed) {
      return c.json({ error: bodyResult.error }, 400);
    }

    // Validate request body before proxying
    const validation = validateRequestBody(path, method, bodyResult.value);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    const result = await remoteClient.fetch({
      baseUrl: config.peopleContextBaseUrl,
      path,
      method,
      accessToken: session.accessToken,
      actorId: actorId || undefined,
      body: bodyResult.value,
    });

    if (!result.ok) {
      const status = ERROR_STATUS_MAP[result.error];
      return c.json({ error: result.error }, status);
    }

    const responseStatus = toResponseStatus(result.value.status);
    if (isNullBodyStatus(result.value.status)) {
      return c.body(null, responseStatus);
    }
    const responseBody = toJsonBody(result.value.body);
    return c.json(responseBody, responseStatus);
  });

  return api;
};
