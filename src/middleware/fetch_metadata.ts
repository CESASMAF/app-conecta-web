import type { MiddlewareHandler } from "@hono/hono";
import type { AppEnv } from "../types.ts";

/**
 * Fetch Metadata middleware. Validates browser-sent Sec-Fetch-* headers on /api/* routes.
 *
 * - Sec-Fetch-Site: must be "same-origin" or "none" (direct navigation).
 *   Missing header is allowed (non-browser clients).
 * - X-Requested-With: "XMLHttpRequest" required on POST, PUT, DELETE to /api/*.
 *
 * Non-API routes pass through without checks.
 * Returns 403 on validation failure.
 */
export const fetchMetadata = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const path = c.req.path;

    // Only enforce on /api/* routes
    if (!path.startsWith("/api/")) {
      await next();
      return;
    }

    // Sec-Fetch-Site validation: reject cross-origin requests
    const fetchSite = c.req.header("sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
      return c.json({ error: "Forbidden: cross-origin request" }, 403);
    }

    // X-Requested-With required on mutating methods
    const method = c.req.method;
    if (method === "POST" || method === "PUT" || method === "DELETE") {
      const xrw = c.req.header("x-requested-with");
      if (xrw !== "XMLHttpRequest") {
        return c.json(
          { error: "Forbidden: missing X-Requested-With header" },
          403,
        );
      }
    }

    await next();
  };
};
