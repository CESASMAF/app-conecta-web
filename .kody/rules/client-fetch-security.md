---
title: "Client fetch must include security headers and use /api/* only"
scope: "file"
path: ["src/client/services/**/*.ts"]
severity_min: "high"
languages: ["typescript"]
buckets: ["security"]
enabled: true
---

## Instructions

All client-side HTTP requests must follow security requirements:

Flag:
- `fetch()` calls missing `credentials: "same-origin"`
- `fetch()` calls missing `X-Requested-With: XMLHttpRequest` header
- `fetch()` targeting URLs other than `/api/*` (never direct backend calls)
- `fetch()` calls outside of `src/client/services/` (services are the only place fetch exists on client)
- `XMLHttpRequest` or `axios` usage (only `fetch` via base-client)
- Hardcoded absolute URLs (e.g., `https://...`) instead of relative `/api/` paths

## Examples

### Bad example
```typescript
// src/client/views/pages/registration-page.tsx
const data = await fetch("https://backend.internal/patients");  // WRONG — fetch in page, direct backend
```

### Good example
```typescript
// src/client/services/patient-service.ts
const response = await fetch("/api/patients", {
  method: "GET",
  credentials: "same-origin",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  },
});
```
