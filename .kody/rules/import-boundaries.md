---
title: "Import boundaries between layers must be respected"
scope: "file"
path: ["src/**/*.ts", "src/**/*.tsx"]
severity_min: "critical"
languages: ["typescript"]
buckets: ["architecture"]
enabled: true
---

## Instructions

This project follows strict import boundaries based on Clean Architecture + DDD. Violations break architectural integrity.

**Forbidden imports:**

| File in... | Must NOT import from... |
|---|---|
| `src/domain/` | `src/application/`, `src/adapters/`, `src/routes/`, `src/middleware/`, `src/client/`, `src/server.ts`, `src/types.ts` |
| `src/application/` | `src/adapters/`, `src/routes/`, `src/middleware/`, `src/client/`, `src/server.ts` |
| `src/client/viewmodels/` | `src/domain/`, `src/application/`, `src/adapters/`, `src/client/services/`, `src/client/views/` |
| `src/client/views/components/` | `src/domain/`, `src/application/`, `src/adapters/`, `src/client/services/`, `src/client/viewmodels/` |
| `src/client/services/` | `src/domain/`, `src/application/`, `src/adapters/`, `src/client/viewmodels/`, `src/client/views/` |

**JSX runtime boundary (critical):**
- Server code (`src/views/`, `src/routes/`): imports from `hono/jsx`
- Client code (`src/client/`): imports from `hono/jsx/dom`
- **NEVER mix** — server JSX and client JSX are different runtimes

Flag any import that crosses these boundaries.

## Examples

### Bad example
```typescript
// src/domain/registry/patient.ts
import { sessionStore } from "../../adapters/auth/session_store.ts";
import type { AppState } from "../../types.ts";
```

### Good example
```typescript
// src/domain/registry/patient.ts
import type { Result } from "../shared/result.ts";
import type { CPF } from "../kernel/cpf.ts";
```
