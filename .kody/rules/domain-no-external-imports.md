---
title: "Domain layer must not import external modules or adapters"
scope: "file"
path: ["src/domain/**/*.ts"]
severity_min: "critical"
languages: ["typescript"]
buckets: ["architecture"]
enabled: true
---

## Instructions

The Domain layer follows DDD strictly and must have **zero external dependencies**. Only other domain modules and Deno/TS standard library are allowed.

Flag any import from:
- **hono** or any Hono module (`hono/jsx`, `hono/css`, etc.)
- **src/adapters/**, **src/routes/**, **src/middleware/**, **src/server.ts**
- **src/application/** (domain must not depend on application)
- **src/client/** (domain must not depend on client code)
- Any npm/jsr package (no `npm:`, no `jsr:` except `jsr:@std/`)
- **fetch**, **Deno.readFile**, **Deno.env**, or any I/O API

Allowed imports:
- Other `src/domain/` modules (cross-context references)
- Deno standard library types if truly needed

This is a non-negotiable architectural boundary. Domain defines business rules and must remain portable and testable without infrastructure.

## Examples

### Bad example
```typescript
import { Hono } from "hono";
import { sessionStore } from "../adapters/auth/session_store.ts";
import type { AppState } from "../types.ts";

export type CPF = Brand<string, 'CPF'>;
```

### Good example
```typescript
import type { Brand } from "./shared/brand.ts";
import type { Result } from "./shared/result.ts";

export type CPF = Brand<string, 'CPF'>;

export const CPF = (raw: string): Result<CPF, 'INVALID_CPF'> => {
  // validation logic
};
```
