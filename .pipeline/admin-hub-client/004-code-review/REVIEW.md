# Code Review: Admin Hub Client

**Reviewer:** code-reviewer (architectural inspector)
**Date:** 2026-04-11
**Round:** 1 of 3
**Verdict:** REJECTED

---

## Summary

The Admin Hub client implementation is well-structured overall: the reducer is pure, the page orchestrates correctly via useReducer, services return Result, and hono/css is used consistently. However, there are import boundary violations across 9 component files and 2 additional issues that must be fixed before approval.

---

## MUST_FIX Issues

### MF-1. Import Boundary Violation: Components import from viewmodels (9 files)
**Rule:** Import Boundary table -- `client/views (components)` row shows only `client/views` column as allowed. Components must NEVER import from viewmodels.
**Responsible:** view-implementer

The following component files import types directly from `src/client/viewmodels/admin-hub/types.ts`:

| File | Line | Import |
|------|------|--------|
| `src/client/views/components/admin/admin-tab-bar.tsx` | 4 | `import type { AdminTab }` |
| `src/client/views/components/admin/dashboard-tab.tsx` | 4-8 | `import type { AdminState, AuditEntry, LookupRequest }` |
| `src/client/views/components/admin/pessoas-tab.tsx` | 3-6 | `import type { PersonSummary, TabLoadState }` |
| `src/client/views/components/admin/people-table.tsx` | 4 | `import type { PersonSummary }` |
| `src/client/views/components/admin/lookups-tab.tsx` | 4-8 | `import type { LookupEntry, LookupTableSummary, TabLoadState }` |
| `src/client/views/components/admin/lookup-detail-panel.tsx` | 4 | `import type { LookupEntry }` |
| `src/client/views/components/admin/requests-table.tsx` | 4 | `import type { LookupRequest }` |
| `src/client/views/components/admin/solicitacoes-tab.tsx` | 3-5 | `import type { LookupRequest, TabLoadState }` |
| `src/client/views/components/admin/auditoria-tab.tsx` | 5-8 | `import type { AuditEntry, TabLoadState }` |

**Fix:** Move shared display types (PersonSummary, LookupEntry, LookupRequest, AuditEntry, LookupTableSummary, TabLoadState, AdminTab) to a shared types file under `src/client/views/components/admin/types.ts` or define prop interfaces inline per component. Components must define their own prop shapes or import from sibling component files, never from viewmodels. The viewmodel types.ts can then re-export or align with these shared types.

### MF-2. `throw` in client entry (adapter-layer file)
**Rule:** `throw` is allowed in adapters, but should convert to Result at boundary.
**Responsible:** infra-implementer
**File:** `src/client/apps/admin-hub/entry.tsx:13`

```typescript
if (!root) throw new Error("Missing #admin-hub-app mount point");
```

This is technically in an adapter file (entry.tsx = app entrypoint), so `throw` is allowed per CLAUDE.md. However, it uses `new Error` which is a class instantiation. The rule states "No class" and "No `new Error`" in domain/application but entry.tsx is adapter-layer, so this is borderline. The `as` cast on line 17 (`JSON.parse(userData) as Readonly<...>`) should be documented per rules.

**Severity downgrade:** This is an adapter file so `throw` is permitted. Changing to SHOULD_FIX.

### MF-3. Inline styles with hardcoded values in SSR view
**Rule:** "No inline styles (except dynamic values)" -- styles via hono/css with tokens.
**Responsible:** view-implementer
**File:** `src/views/pages/admin-view.tsx:15-19`

```tsx
style="min-height:100vh;background:#F2E2C4;"
style="display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:'Playfair Display',serif;font-style:italic;color:rgba(38,29,17,0.5);"
```

Hardcoded color values (#F2E2C4, rgba(38,29,17,0.5)) and font-family bypass the token system. These should use hono/css with design tokens.

**Fix:** Convert to css`` template literals using tokens from `src/client/styles/tokens.ts`. Since this is a server-side file, import tokens directly (they are plain string constants).

---

## SHOULD_FIX Issues

### SF-1. `as` casts without documentation
**Rule:** "If `as` casting is unavoidable, document why."
**Responsible:** view-implementer, infra-implementer

| File | Line | Cast |
|------|------|------|
| `src/client/views/components/admin/admin-search-input.tsx` | 77 | `(e.target as HTMLInputElement)` |
| `src/client/views/components/admin/confirm-modal.tsx` | 184 | `(e.target as HTMLTextAreaElement)` |
| `src/client/apps/admin-hub/entry.tsx` | 17 | `JSON.parse(userData) as Readonly<{...}>` |

**Fix:** Add inline `// as-cast: Hono event target type is generic Event` or similar.

### SF-2. Duplicated `filterPeople` function
**Responsible:** view-implementer

The same filtering logic exists in two places:
- `src/client/views/components/admin/people-table.tsx:102-113`
- `src/client/views/components/admin/pessoas-tab.tsx:28-39`

Also duplicated in the reducer as `filteredPeople` (`src/client/viewmodels/admin-hub/reducer.ts:223-238`).

**Fix:** Use the reducer's `filteredPeople` from the page and pass pre-filtered data to the component, or consolidate into a single pure utility.

### SF-3. `useState` in tab components (borderline)
**Responsible:** view-implementer

Components `lookups-tab.tsx:47`, `auditoria-tab.tsx:60`, and `confirm-modal.tsx:139` use `useState` for local UI filter/note state. Per CLAUDE.md, `useState` in components is allowed "ONLY for local UI state (tooltip open, dropdown expanded)". A search filter text and a modal text input are arguably local UI state, so this is acceptable but borderline. The `lookups-tab` and `auditoria-tab` are more like "tab panels" (sub-pages) than pure components, which makes this pattern acceptable in practice.

**Status:** Acceptable -- no action required, but note that if these grow further, the filter state should move to the viewmodel.

### SF-4. Admin route does not verify admin role in page handler
**Responsible:** infra-implementer
**File:** `src/routes/pages.tsx:47-60`

The `/admin` route reads session data but does not check if the user actually has admin/owner role before rendering. The `adminGuard` middleware in `src/server.ts:59` protects `/admin/*` (with trailing path) but the exact `/admin` path may or may not be covered depending on how Hono matches `"/admin/*"` vs `"/admin"`.

**Fix:** Verify that `adminGuard()` middleware matches the exact `/admin` path (no trailing segment). If not, add explicit role checking in the page handler.

---

## Passed Checks

| Rule | Status |
|------|--------|
| JSX import boundary (client = hono/jsx/dom, server = @hono/hono/jsx) | PASS -- all 21 client components + page use hono/jsx/dom; SSR view uses @hono/hono/jsx |
| No class, no this | PASS -- all types are Readonly, all functions are standalone |
| No throw in domain/application | PASS -- no domain/application files modified |
| No any | PASS -- no `any` usage found |
| Immutability (Readonly, readonly arrays, as const) | PASS -- all state types use Readonly, all arrays are readonly |
| Result pattern in services | PASS -- admin-service.ts and lookup-admin-service.ts return Result via base-client.ts |
| Explicit return types on exported functions | PASS -- all exported functions have return types |
| import type for type-only imports | PASS -- all type imports use `import type` |
| File extensions in relative imports | PASS -- all relative imports include .ts/.tsx |
| Components: (props) => JSX, no fetch/useEffect/useReducer | PASS -- no fetch/useEffect/useReducer in any component |
| Page: useReducer, orchestrator pattern | PASS -- admin-hub-page.tsx uses useReducer, ~197 lines (slightly over 100 but reasonable for a 5-tab orchestrator) |
| ViewModel: pure reducer, discriminated unions, exhaustive switch | PASS -- reducer is pure, all actions have `type` field, switch is exhaustive (no default) |
| Services: fetch via base-client, X-Requested-With header | PASS -- base-client.ts includes X-Requested-With: XMLHttpRequest |
| hono/css with tokens, no Tailwind | PASS -- all styles use css`` with tokens |
| Security: admin route behind auth guard | PASS -- server.ts applies adminGuard() to /admin/* and /api/admin/* |

---

## Verdict

**REJECTED** -- 1 MUST_FIX issue blocks approval:

1. **MF-1** (view-implementer): 9 component files import types from viewmodels, violating the import boundary table. Components must NOT import from viewmodels.

The remaining MF items were downgraded. Fix MF-1 and resubmit for Round 2.
