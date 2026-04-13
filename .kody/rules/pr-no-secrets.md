---
title: "No secrets or credentials in code"
scope: "pull_request"
severity_min: "critical"
buckets: ["security"]
enabled: true
---

## Instructions

Secrets, credentials, and sensitive configuration must never be committed to the repository.

Flag:
- Hardcoded API keys, tokens, passwords, or client secrets
- `.env` files (`.env.example` with placeholder values is OK)
- Private keys or certificates
- JWT tokens (even expired ones)
- Database connection strings with credentials
- Hardcoded backend URLs (should come from `Deno.env.get()` in server-side config only)
- `Deno.env.get()` calls in client-side code (`src/client/`)
- Zitadel client secrets (the app uses PKCE, no client secret needed)

Allowed:
- `.env.example` with placeholder values
- Public JWKS URLs, issuer URLs
- `Deno.env.get()` in `src/adapters/config/server_config.ts`
