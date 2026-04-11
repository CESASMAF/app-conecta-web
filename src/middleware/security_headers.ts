import type { MiddlewareHandler } from "@hono/hono";
import type { AppEnv } from "../types.ts";

/** Generates a base64-encoded cryptographic nonce (128-bit). */
const generateNonce = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
};

/**
 * Security headers middleware. Must run FIRST in the middleware chain.
 *
 * Sets: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
 * Permissions-Policy, and Content-Security-Policy (with per-request nonce).
 *
 * The CSP nonce is stored in Hono context via `c.set("cspNonce", nonce)`
 * so that SSR layouts can inject it into `<script>` and `<style>` tags.
 */
export const securityHeaders = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const nonce = generateNonce();
    c.set("cspNonce", nonce);

    await next();

    c.header(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    c.header(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'nonce-${nonce}' 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
    );
  };
};
