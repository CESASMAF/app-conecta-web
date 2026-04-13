---
title: "Server JSX uses hono/jsx, client JSX uses hono/jsx/dom — never mix"
scope: "file"
path: ["src/**/*.tsx"]
severity_min: "critical"
languages: ["typescript"]
buckets: ["architecture", "potential_issues"]
enabled: true
---

## Instructions

Hono has two separate JSX runtimes that must NEVER be mixed:

- **Server-side** (`src/views/`, `src/routes/`): must import from `hono/jsx`
- **Client-side** (`src/client/`): must import from `hono/jsx/dom`

Mixing them causes runtime errors because they produce different output types.

Flag:
- Any file in `src/client/**/*.tsx` importing from `hono/jsx` (without `/dom`)
- Any file in `src/views/**/*.tsx` or `src/routes/**/*.tsx` importing from `hono/jsx/dom`
- `render()` from `hono/jsx/dom` used in server-side code
- SSR patterns (`c.html()`, `c.render()`) used in client-side code

## Examples

### Bad example
```typescript
// src/client/views/pages/registration-page.tsx
import { useState } from "hono/jsx";  // WRONG — this is server JSX
```

### Good example
```typescript
// src/client/views/pages/registration-page.tsx
import { useState, useReducer } from "hono/jsx/dom";  // Correct — client JSX

// src/views/pages/home.tsx
import type { FC } from "hono/jsx";  // Correct — server JSX
```
