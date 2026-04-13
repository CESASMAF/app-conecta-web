---
title: "Relative imports must include .ts/.tsx file extensions"
scope: "file"
path: ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts"]
severity_min: "high"
languages: ["typescript"]
buckets: ["potential_issues"]
enabled: true
---

## Instructions

Deno requires explicit file extensions in all relative imports. Missing extensions cause runtime errors.

Flag:
- `import ... from "./module"` (missing `.ts`)
- `import ... from "../folder/component"` (missing `.tsx` or `.ts`)
- `import ... from "./index"` (missing `.ts`)
- Any relative import (`./` or `../`) without `.ts` or `.tsx` extension

This does NOT apply to:
- Package imports (`hono`, `hono/jsx/dom`, `jsr:@std/...`)
- URL imports

## Examples

### Bad example
```typescript
import { Result } from "./shared/result";
import { PatientCard } from "../components/patient/patient-card";
```

### Good example
```typescript
import { Result } from "./shared/result.ts";
import { PatientCard } from "../components/patient/patient-card.tsx";
```
