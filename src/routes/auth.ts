import { Hono } from "@hono/hono";
import { deleteCookie } from "@hono/hono/cookie";
import type { AppEnv } from "../types.ts";
import type { BFFAuthService } from "../adapters/auth/bff_service.ts";
import { SESSION_COOKIE } from "../middleware/session.ts";

/**
 * Auth routes factory — receives the BFFAuthService via dependency injection.
 *
 * Routes:
 *   GET /auth/login    — Initiates OIDC login (redirects to provider)
 *   GET /auth/callback — OIDC callback (exchanges code for session)
 *   GET /auth/logout   — Destroys session and redirects to OIDC end-session
 */
export const createAuthRoutes = (
  authService: BFFAuthService,
): Hono<AppEnv> => {
  const auth = new Hono<AppEnv>();

  // GET /auth/login — Redirect to OIDC provider
  auth.get("/auth/login", async (c) => {
    const result = await authService.login();
    if (!result.ok) {
      return c.json({ error: result.error }, 500);
    }
    return c.redirect(result.value.url);
  });

  // GET /auth/callback — OIDC callback, exchange code for session
  auth.get("/auth/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");

    if (!code || !state) {
      return c.json({ error: "Missing code or state" }, 400);
    }

    const result = await authService.callback(code, state);
    if (!result.ok) {
      return c.json({ error: result.error }, 401);
    }

    // Set session cookie via raw header (cookieValue is pre-formatted by BFFAuthService)
    c.header("Set-Cookie", result.value.cookieValue);
    return c.redirect("/");
  });

  // GET /auth/logout — Destroy session, redirect to OIDC end session
  auth.get("/auth/logout", (c) => {
    const sessionId = c.get("sessionId");
    if (sessionId) {
      const { endSessionUrl } = authService.logout(sessionId);
      deleteCookie(c, SESSION_COOKIE, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Strict",
      });
      if (endSessionUrl) {
        return c.redirect(endSessionUrl);
      }
    }
    return c.redirect("/auth/login");
  });

  return auth;
};
