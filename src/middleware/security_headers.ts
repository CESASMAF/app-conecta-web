// Security headers middleware using Hono's built-in secureHeaders.
// Uses NONCE constant for automatic CSP nonce generation.
// Nonce available via c.get("secureHeadersNonce") in routes.

import { secureHeaders as honoSecureHeaders, NONCE } from "@hono/hono/secure-headers";
import type { SecureHeadersVariables } from "@hono/hono/secure-headers";

// Re-export the Variables type for AppEnv integration
export type { SecureHeadersVariables };

/**
 * Security headers middleware using Hono's built-in implementation.
 *
 * Configured with:
 * - CSP with per-request nonce for scripts AND styles (via NONCE constant)
 * - Nonce + unsafe-inline fallback for styles (CSP3 browsers ignore unsafe-inline
 *   when nonce is present; older browsers use unsafe-inline as fallback)
 * - External fonts from Google Fonts and Fontshare
 * - Strict transport security, frame denial, referrer policy
 * - Permissions policy restricting camera, microphone, geolocation
 */
export const securityHeaders = () =>
  honoSecureHeaders({
    // Override defaults
    strictTransportSecurity: "max-age=63072000; includeSubDomains",
    xFrameOptions: "DENY",
    referrerPolicy: "strict-origin-when-cross-origin",
    crossOriginEmbedderPolicy: false,

    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: [NONCE, "'strict-dynamic'"],
      scriptSrcElem: [NONCE, "'strict-dynamic'"],
      styleSrc: [NONCE, "'unsafe-inline'"],
      styleSrcElem: [NONCE, "'unsafe-inline'", "'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
    },

    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  });
