// =============================================================================
// Mock OIDC Provider — Simulates Zitadel for integration testing
// =============================================================================
// A Hono app that implements Zitadel's OIDC endpoints with REAL cryptography.
// Uses Web Crypto API for RS256 JWT signing and PKCE validation.
// =============================================================================

import { Hono } from "@hono/hono";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoredAuthCode = Readonly<{
  codeChallenge: string;
  codeChallengeMethod: string;
  redirectUri: string;
  scope: string;
  clientId: string;
}>;

type MockOIDCProvider = Readonly<{
  app: Hono;
  port: number;
  /** Returns the number of token requests received. */
  tokenRequestCount: () => number;
  /** Returns the last grant_type received by the token endpoint. */
  lastGrantType: () => string | undefined;
  /** Cleanup function — call in afterAll. */
  cleanup: () => void;
}>;

// ---------------------------------------------------------------------------
// Base64url helpers
// ---------------------------------------------------------------------------

const base64urlEncode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const base64urlEncodeString = (str: string): string =>
  base64urlEncode(new TextEncoder().encode(str));

// ---------------------------------------------------------------------------
// JWT Builder (real RS256 via Web Crypto)
// ---------------------------------------------------------------------------

const buildJWT = async (
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  privateKey: CryptoKey,
): Promise<string> => {
  const headerB64 = base64urlEncodeString(JSON.stringify(header));
  const payloadB64 = base64urlEncodeString(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  const sigB64 = base64urlEncode(new Uint8Array(signature));
  return `${headerB64}.${payloadB64}.${sigB64}`;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const ISSUER_PORT = 9083;
const CLIENT_ID = "test-client-id";
const CLIENT_SECRET = "test-client-secret";

export const createMockOIDCProvider = async (): Promise<MockOIDCProvider> => {
  // Generate RSA key pair for JWT signing
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );

  const authCodes = new Map<string, StoredAuthCode>();
  const refreshTokens = new Map<string, string>(); // refreshToken -> sub
  let _tokenRequestCount = 0;
  let _lastGrantType: string | undefined;

  const issuer = `http://127.0.0.1:${ISSUER_PORT}`;

  const makeTokenPayload = (
    clientId: string,
    sub: string,
  ): Record<string, unknown> => ({
    iss: issuer,
    sub,
    aud: [clientId],
    exp: Math.floor(Date.now() / 1000) + 43200,
    iat: Math.floor(Date.now() / 1000),
    name: "Test User",
    preferred_username: "test@acdg.auth.acdgbrasil.com.br",
    email: "test@example.com",
    "urn:zitadel:iam:org:project:roles": {
      social_worker: {
        "363109883022671995": "acdg.auth.acdgbrasil.com.br",
      },
    },
  });

  const jwtHeader = { alg: "RS256", typ: "JWT", kid: "test-key-1" };

  const app = new Hono();

  // ---- Discovery ----
  app.get("/.well-known/openid-configuration", (c) =>
    c.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/v2/authorize`,
      token_endpoint: `${issuer}/oauth/v2/token`,
      userinfo_endpoint: `${issuer}/oidc/v1/userinfo`,
      end_session_endpoint: `${issuer}/oidc/v1/end_session`,
      jwks_uri: `${issuer}/oauth/v2/keys`,
      response_types_supported: ["code"],
      grant_types_supported: [
        "authorization_code",
        "refresh_token",
        "client_credentials",
      ],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: [
        "openid",
        "profile",
        "email",
        "offline_access",
        "urn:zitadel:iam:org:project:roles",
      ],
      code_challenge_methods_supported: ["S256"],
    }),
  );

  // ---- Authorize (instant login — no HTML form) ----
  app.get("/oauth/v2/authorize", (c) => {
    const responseType = c.req.query("response_type");
    const clientId = c.req.query("client_id");
    const redirectUri = c.req.query("redirect_uri");
    const scope = c.req.query("scope") ?? "";
    const state = c.req.query("state");
    const codeChallenge = c.req.query("code_challenge");
    const codeChallengeMethod = c.req.query("code_challenge_method");

    if (responseType !== "code") {
      return c.json({ error: "unsupported_response_type" }, 400);
    }
    if (!clientId || !redirectUri || !state || !codeChallenge) {
      return c.json({ error: "invalid_request" }, 400);
    }

    const code = crypto.randomUUID();
    authCodes.set(code, {
      codeChallenge,
      codeChallengeMethod: codeChallengeMethod ?? "S256",
      redirectUri,
      scope,
      clientId,
    });

    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    url.searchParams.set("state", state);
    return c.redirect(url.toString());
  });

  // ---- Token ----
  app.post("/oauth/v2/token", async (c) => {
    _tokenRequestCount++;
    const body = await c.req.parseBody();
    const grantType = body["grant_type"] as string;
    _lastGrantType = grantType;

    if (grantType === "authorization_code") {
      const code = body["code"] as string;
      const codeVerifier = body["code_verifier"] as string;
      const clientId = body["client_id"] as string;
      const clientSecret = body["client_secret"] as string;

      if (clientId !== CLIENT_ID || clientSecret !== CLIENT_SECRET) {
        return c.json({ error: "invalid_client" }, 401);
      }

      const stored = authCodes.get(code);
      if (!stored) {
        return c.json({ error: "invalid_grant", error_description: "unknown code" }, 400);
      }
      authCodes.delete(code);

      // Validate PKCE: SHA-256(code_verifier) base64url-encoded must match stored code_challenge
      const verifierHash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(codeVerifier),
      );
      const computedChallenge = base64urlEncode(new Uint8Array(verifierHash));

      if (computedChallenge !== stored.codeChallenge) {
        return c.json({ error: "invalid_grant", error_description: "PKCE mismatch" }, 400);
      }

      const sub = "367349956392059030";
      const payload = makeTokenPayload(clientId, sub);
      const accessToken = await buildJWT(jwtHeader, payload, keyPair.privateKey);
      const idToken = await buildJWT(jwtHeader, payload, keyPair.privateKey);

      const response: Record<string, unknown> = {
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 43200,
      };

      // Only issue refresh_token if offline_access scope was requested
      if (stored.scope.includes("offline_access")) {
        const refreshToken = crypto.randomUUID();
        refreshTokens.set(refreshToken, sub);
        response["refresh_token"] = refreshToken;
      }

      return c.json(response);
    }

    if (grantType === "refresh_token") {
      const refreshToken = body["refresh_token"] as string;
      const clientId = body["client_id"] as string;
      const clientSecret = body["client_secret"] as string;

      if (clientId !== CLIENT_ID || clientSecret !== CLIENT_SECRET) {
        return c.json({ error: "invalid_client" }, 401);
      }

      const sub = refreshTokens.get(refreshToken);
      if (!sub) {
        return c.json({ error: "invalid_grant" }, 400);
      }

      // Rotate refresh token
      refreshTokens.delete(refreshToken);
      const newRefreshToken = crypto.randomUUID();
      refreshTokens.set(newRefreshToken, sub);

      const payload = makeTokenPayload(clientId, sub);
      const accessToken = await buildJWT(jwtHeader, payload, keyPair.privateKey);
      const idToken = await buildJWT(jwtHeader, payload, keyPair.privateKey);

      return c.json({
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 43200,
        refresh_token: newRefreshToken,
      });
    }

    return c.json({ error: "unsupported_grant_type" }, 400);
  });

  // ---- JWKS ----
  app.get("/oauth/v2/keys", async (c) => {
    const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    return c.json({
      keys: [{ ...jwk, kid: "test-key-1", use: "sig", alg: "RS256" }],
    });
  });

  // ---- UserInfo ----
  app.get("/oidc/v1/userinfo", (c) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "invalid_token" }, 401);
    }
    return c.json({
      sub: "367349956392059030",
      name: "Test User",
      email: "test@example.com",
      preferred_username: "test@acdg.auth.acdgbrasil.com.br",
    });
  });

  // ---- End Session ----
  app.get("/oidc/v1/end_session", (c) => {
    const postLogoutUri = c.req.query("post_logout_redirect_uri");
    if (postLogoutUri) {
      return c.redirect(postLogoutUri);
    }
    return c.json({ status: "logged_out" });
  });

  // Start server
  const controller = new AbortController();
  Deno.serve(
    { port: ISSUER_PORT, signal: controller.signal, onListen: () => {} },
    app.fetch,
  );

  return {
    app,
    port: ISSUER_PORT,
    tokenRequestCount: () => _tokenRequestCount,
    lastGrantType: () => _lastGrantType,
    cleanup: () => controller.abort(),
  };
};
