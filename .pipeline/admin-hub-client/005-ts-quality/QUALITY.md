# TS Quality Report -- admin-hub-client

**Agent:** ts-quality-checker
**Date:** 2026-04-11
**Files reviewed:** 27

---

## Verdict: FAILED

3 blocking issues, 6 warnings.

---

## BLOCKING ISSUES

### B1. `as` casting without narrowing -- `admin-search-input.tsx:77`, `confirm-modal.tsx:184`

Both files cast event targets with `as HTMLInputElement` / `as HTMLTextAreaElement` without narrowing.

```ts
// admin-search-input.tsx:77
onInput={(e) => onChange((e.target as HTMLInputElement).value)}

// confirm-modal.tsx:184
onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
```

**Rule:** CLAUDE.md Global Rules -- "No `any` -- Use `unknown` with narrowing. If `as` casting is unavoidable, document why."
**Handbook ref:** handbook/typescript/Narrowing.md -- use type guards (`instanceof`, `in`) before accessing properties.

**Why this matters:** `e.target` is typed as `EventTarget | null` in the DOM typings. Casting directly to a concrete element type bypasses the compiler's null/type check.

**Fix (route to: view-implementer):** Either add an inline narrowing guard or add a `// cast: event.target is guaranteed to be the input element by the DOM event model` comment. The project's own CLAUDE.md mandates documenting any `as` cast.

---

### B2. `as unknown as T` pattern in `base-client.ts:45`

```ts
// base-client.ts:45
return { ok: true, value: undefined as unknown as T };
```

**Rule:** CLAUDE.md Global Rules -- "No `as any`, `as unknown as T`"
**Handbook ref:** handbook/typescript/Narrowing.md -- prefer discriminated unions over casts.

**Why this matters:** This is the exact double-cast pattern the project rules prohibit. When `T` is not `undefined`, the caller receives a lie.

**Fix (route to: infra-implementer):** The 204 handler should return a specialized `Result<void, ServiceError>` or the generic should be constrained. Since base-client.ts is a pre-existing file shared by other features, this is noted but the admin-hub code that *calls* it (admin-service.ts, lookup-admin-service.ts) is not the source of the violation.

---

### B3. `throw` in client entry -- `entry.tsx:13`

```ts
if (!root) throw new Error("Missing #admin-hub-app mount point");
```

**Rule:** CLAUDE.md Global Rules -- "`throw` is FORBIDDEN in domain and application. Allowed ONLY in adapters."
**Handbook ref:** N/A (project-specific rule).

The entry.tsx file lives under `src/client/apps/`, which is client-side code, not adapters. Per the import boundary table, client code must not throw; it should use Result or guard-and-return.

**Fix (route to: infra-implementer):** Guard with an early return or `document.getElementById` narrowing that avoids the throw.

---

## WARNINGS

### W1. `as const` on inline literals in reducer -- `reducer.ts:189,202`

```ts
{ ...request, status: "aprovado" as const }
{ ...request, status: "rejeitado" as const }
```

These `as const` casts are acceptable per CLAUDE.md ("as const is acceptable"). The string literal needs to match the discriminated union `"pendente" | "aprovado" | "rejeitado"`. No issue -- just noting for completeness. **PASSED.**

---

### W2. Duplicated types across service and viewmodel layers

`PersonSummary`, `AuditEntry`, and `LookupRequest` are defined identically in:
- `src/client/viewmodels/admin-hub/types.ts`
- `src/client/services/admin-service.ts`
- `src/client/services/lookup-admin-service.ts`

**Rule:** DRY / import hygiene. Per the import boundary table, viewmodels cannot import from services, but a shared types file under `src/client/` would be acceptable.

**Recommendation (route to: infra-implementer + viewmodel-engineer):** Extract shared DTO types to a `src/client/shared/admin-types.ts` to avoid structural drift. Not blocking because the types currently match and there is no import boundary violation.

---

### W3. `sortByStatus` uses `Record<string, number>` instead of discriminated key -- `requests-table.tsx:149`

```ts
const order: Record<string, number> = { pendente: 0, aprovado: 1, rejeitado: 2 };
```

Should use `Record<LookupRequest["status"], number>` for exhaustiveness safety. If a new status is added, the current code silently falls through to the `?? 3` fallback.

**Handbook ref:** handbook/typescript/Narrowing.md -- exhaustive checks prevent silent variant swallowing.
**Route to: view-implementer.**

---

### W4. No exhaustive `never` check in `TabSkeleton` conditional rendering -- `tab-skeleton.tsx:107-111`

```ts
{variant === "dashboard" && <DashboardSkeleton />}
{variant === "table" && <TableSkeleton />}
{variant === "grid" && <GridSkeleton />}
```

This renders nothing if a new variant is added to the union. A switch with `default: never` would catch this at compile time.

**Handbook ref:** handbook/typescript/Narrowing.md -- "Exhaustiveness checking" section.
**Route to: view-implementer.**

---

### W5. Hardcoded inline style in SSR view -- `admin-view.tsx:16-19`

```tsx
style="min-height:100vh;background:#F2E2C4;"
style="display:flex;justify-content:center;..."
```

CLAUDE.md states: "No inline styles (except dynamic values)." These are static values and should use hono/css tokens. However, this is an SSR loading shell that gets replaced on hydration, so impact is minimal.

**Route to: view-implementer.**

---

### W6. `interface` used instead of `type` for component props -- multiple files

CLAUDE.md states: "Every type is `Readonly<{}>`, every operation is a standalone function." While `interface` with `readonly` modifiers is functionally equivalent, the convention calls for `type` aliases. Found in all 21 component files and the page file.

This is a stylistic consistency issue. The interfaces do use `readonly` on all properties, which satisfies the immutability requirement. Not blocking because the behavioral guarantee (immutability) is met.

**Route to: view-implementer + viewmodel-engineer** for future alignment.

---

## PASSED DIMENSIONS

| Dimension | Status | Notes |
|-----------|--------|-------|
| Type narrowing | PASS (with B1 caveat) | Result.ok checked before .value/.error in entry.tsx and all service callers |
| Generics | PASS | Appropriately constrained in base-client; inference used correctly in components |
| Null safety | PASS | No `!` non-null assertions found; `??` used for defaults (e.g., `e.details ?? "-"`) |
| Union discrimination | PASS (with W3, W4 caveats) | Actions use `type` field; reducer switch is exhaustive (all cases covered, no default) |
| Readonly patterns | PASS | All state types use `Readonly<{}>`, all arrays use `readonly T[]` |
| Import hygiene | PASS | All imports use `import type` for type-only imports; `.ts`/`.tsx` extensions present on all relative imports |
| Deno-specific | PASS | File extensions included; hono/css and hono/jsx/dom used via import map (not bare node specifiers) |
| JSX boundary | PASS | Client code uses `hono/jsx/dom`; SSR view uses `@hono/hono/jsx` |
| `as const` usage | PASS | Only used for narrowing string literals in reducer (acceptable per rules) |
| No `class`/`this` | PASS | Zero classes or `this` references in all 27 files |
| No `throw` in domain/app | PASS (client layer) | Only throw is in entry.tsx (B3) which is client/apps layer |

---

## Summary

The admin-hub implementation demonstrates strong TypeScript discipline overall. The Readonly patterns, discriminated union actions, import type usage, and Result-based service layer are all well-executed. The three blocking issues are relatively minor fixes -- two undocumented `as` casts and one `throw` in client code.

**Blocking fixes required before merge:**
1. Document or eliminate `as HTMLInputElement`/`as HTMLTextAreaElement` casts (view-implementer)
2. Address `as unknown as T` in base-client.ts 204 handler (infra-implementer, pre-existing)
3. Remove `throw` from entry.tsx or justify it as adapter-layer code (infra-implementer)
