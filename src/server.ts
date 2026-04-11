// server.ts — Single entrypoint for the Social Care BFF.
// One Deno server. One port. One process. Hono handles everything.

import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import type { AppEnv } from "./types.ts";
import { loadConfig } from "./adapters/config/server_config.ts";
import { createSessionStore } from "./adapters/auth/session_store.ts";
import { createBFFAuthService } from "./adapters/auth/bff_service.ts";
import { createRemoteClient } from "./adapters/remote/remote_client.ts";
import { securityHeaders } from "./middleware/security_headers.ts";
import { csrf } from "./middleware/csrf.ts";
import { sessionMiddleware } from "./middleware/session.ts";
import { fetchMetadata } from "./middleware/fetch_metadata.ts";
import { authGuard } from "./middleware/auth_guard.ts";
import { healthRoutes } from "./routes/health.ts";
import { createAuthRoutes } from "./routes/auth.ts";
import { createApiRoutes } from "./routes/api.ts";

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

const config = loadConfig();
const sessionStore = createSessionStore();
const authService = createBFFAuthService(config, sessionStore);
const remoteClient = createRemoteClient(config);

const app = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Inject shared dependencies into Hono context
// ---------------------------------------------------------------------------

app.use("*", async (c, next) => {
  c.set("config", config);
  c.set("sessionStore", sessionStore);
  c.set("tokenRefresher", authService);
  await next();
});

// ---------------------------------------------------------------------------
// Middleware chain (order matters)
// securityHeaders -> serveStatic -> csrf -> session -> fetchMetadata -> authGuard
// ---------------------------------------------------------------------------

app.use("*", securityHeaders());
app.use("/static/*", serveStatic({ root: "./" }));
app.use("*", csrf());
app.use("*", sessionMiddleware());
app.use("*", fetchMetadata());
app.use("*", authGuard());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.route("/", healthRoutes);
app.route("/", createAuthRoutes(authService));
app.route("/", createApiRoutes(remoteClient));

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

Deno.serve({ port: config.port, hostname: config.host }, app.fetch);

console.log(`BFF listening on http://${config.host}:${config.port}`);
