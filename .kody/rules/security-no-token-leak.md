---
title: "Tokens, secrets, and backend URLs must never reach the browser"
scope: "file"
path: ["src/**/*.ts", "src/**/*.tsx"]
severity_min: "critical"
languages: ["typescript"]
buckets: ["security"]
enabled: true
---

## Instructions

The Hono BFF server is the "Iron Frontier" — the browser must NEVER see sensitive data.

Flag any pattern where these values could leak to the client:
- **JWT / Access Token** rendered in HTML, passed to client JS, or included in API responses to browser
- **Refresh Token** exposed anywhere outside the session store
- **Client Secret** hardcoded or exposed in client bundles
- **Backend URL** (`BACKEND_URL`, upstream API address) in client-side code or HTML
- **CPF/NIS/RG** as JSON in JavaScript state (these are SSR-rendered only, never in JS)
- `Deno.env.get()` in any file under `src/client/`
- Token values in `console.log()`, `console.debug()`, or any logging in production code

The session cookie must be `__Host-session` with: HttpOnly, Secure, SameSite=Strict, and Max-Age set.

## Examples

### Bad example
```typescript
// src/client/services/patient-service.ts
const API_URL = "https://internal-backend.acdg.local";  // LEAKED!
const token = localStorage.getItem("access_token");     // LEAKED!
```

### Good example
```typescript
// src/client/services/patient-service.ts
const response = await fetch("/api/patients", {
  credentials: "same-origin",
  headers: { "X-Requested-With": "XMLHttpRequest" },
});
```
