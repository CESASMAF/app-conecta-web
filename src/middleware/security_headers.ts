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
 * - CSP with per-request nonce for scripts (via NONCE constant)
 * - Inline styles allowed (for SSR views + external font stylesheets)
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
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https:", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://auth.acdgbrasil.com.br"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://auth.acdgbrasil.com.br"],
      objectSrc: ["'none'"],
    },

    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  });
