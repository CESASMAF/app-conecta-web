# Security Code Review -- Admin Hub Client
**Date**: 2026-04-11
**Reviewer**: secure-code-reviewer agent (appsec-code-reviewer skill)
**Scope**: All new admin-hub files (ViewModel, Views, Service, Entry, SSR, Routes, API)

## Summary
- Issues found: 6 (Critical: 0 | High: 1 | Medium: 3 | Low: 2 | Info: 0)
- Top 3 priorities:
  1. **[HIGH]** CPF data flows into client-side JS state (PII exposure)
  2. **[MEDIUM]** Unsafe JSON.parse of data-user attribute without try/catch
  3. **[MEDIUM]** Audit query parameters lack input validation on client service

## Positive Findings

1. **Excellent auth architecture**: `authGuard` + `adminGuard` middleware chain is correctly applied to both `/admin/*` SSR routes and `/api/admin/*` API routes in `server.ts` (lines 59-60). Role check uses `ReadonlySet` for O(1) lookup.

2. **No dangerouslySetInnerHTML anywhere**: All 21 components use JSX text content interpolation `{value}` which is auto-escaped by hono/jsx/dom. No raw HTML injection vectors.

3. **base-client.ts is well-designed**: All fetch calls include `credentials: "same-origin"` and `X-Requested-With: XMLHttpRequest` headers. Result pattern prevents thrown exceptions from leaking. 401 responses trigger redirect to login.

4. **Server-side token isolation**: The BFF pattern is correctly implemented. Access tokens, backend URLs, and client secrets never reach the browser. The proxy in `api_admin.ts` injects tokens server-side.

5. **Lookup table whitelist**: `ALLOWED_LOOKUP_TABLES` in `api_admin.ts` (line 58) prevents path traversal via `:tableName` parameter. UUID validation on all `:id` parameters prevents injection.

6. **Immutable state**: All types use `Readonly<{}>` and `readonly` arrays. Reducer produces new state via spread, no mutations.

7. **State-changing operations use proper HTTP methods**: Approvals use PUT, toggles use PATCH, creates use POST. No state changes via GET.

8. **Content-Type validation**: `api_admin.ts` validates `application/json` on mutating requests and rejects malformed JSON bodies (lines 113-131).

9. **Error messages are generic**: Error states show user-friendly messages from `strings.ts`, not stack traces or internal details.

10. **No hardcoded secrets**: No API keys, tokens, or credentials found in any reviewed file.

## Issues

### [HIGH] CPF exposed in client-side JavaScript state -- MUST_FIX

**File**: `src/client/viewmodels/admin-hub/types.ts:14`
**Category**: Data Protection / PII

**Problem**: The `PersonSummary` type includes `cpf: string` which flows through the client JS state via `adminService.listPeople()`. The CLAUDE.md rule states: "CPF/NIS/RG as JSON in JS state (rendered in SSR HTML only)" -- this is a violation. CPF values are fetched from `/api/admin/people`, stored in the reducer state as `people: readonly PersonSummary[]`, and rendered in `people-table.tsx:138` (`<td>{p.cpf}</td>`). An attacker with browser DevTools or XSS can exfiltrate all CPFs from memory.

**Before** (insecure):
```typescript
// types.ts
export type PersonSummary = Readonly<{
  id: string;
  name: string;
  cpf: string;        // <-- PII in JS state
  birthDate: string;
  roles: readonly string[];
  active: boolean;
}>;
```

**After** (secure):
```typescript
// types.ts
export type PersonSummary = Readonly<{
  id: string;
  name: string;
  cpfMasked: string;   // "***.***.***-34" -- server masks before sending
  birthDate: string;
  roles: readonly string[];
  active: boolean;
}>;
```

The BFF (`api_admin.ts`) should mask CPF before returning to the client: keep only last 2 digits visible (`***.***.**X-YZ`). If full CPF is needed for a specific admin action, fetch it on-demand via a separate endpoint that logs the access in the audit trail.

**Why it matters**: Mass PII exfiltration. If an admin session is compromised (e.g., session fixation, XSS on another page), the attacker gets all CPFs in a single API call. Brazilian LGPD (Lei Geral de Protecao de Dados) requires data minimization.

---

### [MEDIUM] Unsafe JSON.parse without error handling in entry.tsx -- SHOULD_FIX

**File**: `src/client/apps/admin-hub/entry.tsx:17`
**Category**: Error Handling

**Problem**: `JSON.parse(userData)` is called without a try/catch. If the `data-user` attribute contains malformed JSON (e.g., due to SSR encoding issues with special characters in user names), this will throw an unhandled exception and crash the entire admin app before it renders.

**Before** (insecure):
```typescript
const userData = root.dataset.user;
const user = userData
  ? JSON.parse(userData) as Readonly<{ name: string; role: string; initials: string }>
  : { name: "Admin", role: "admin", initials: "A" };
```

**After** (secure):
```typescript
const parseUser = (raw: string | undefined): Readonly<{ name: string; role: string; initials: string }> => {
  const fallback = { name: "Admin", role: "admin", initials: "A" } as const;
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" && parsed !== null &&
      typeof parsed.name === "string" &&
      typeof parsed.role === "string" &&
      typeof parsed.initials === "string"
    ) {
      return { name: parsed.name, role: parsed.role, initials: parsed.initials };
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const user = parseUser(root.dataset.user);
```

**Why it matters**: A single malformed character in the user name (e.g., unescaped quote from OIDC provider) crashes the admin panel entirely. The narrowing also prevents prototype pollution if the parsed object contains `__proto__` keys.

---

### [MEDIUM] Audit list endpoint lacks client-side validation of limit/offset -- SHOULD_FIX

**File**: `src/client/services/admin-service.ts:71`
**Category**: Input Validation

**Problem**: `listAudit(limit, offset)` directly interpolates numeric parameters into the URL without validation. While the server-side (`api_admin.ts:722-728`) does validate and clamp these values, a compromised or buggy caller could pass `NaN`, negative numbers, or extremely large values that produce malformed URLs like `/api/admin/audit?limit=NaN&offset=-1`.

**Before**:
```typescript
export const listAudit = (
  limit: number,
  offset: number,
): Promise<Result<AuditListResponse, ServiceError>> =>
  get<AuditListResponse>(`/api/admin/audit?limit=${limit}&offset=${offset}`);
```

**After** (defense in depth):
```typescript
export const listAudit = (
  limit: number,
  offset: number,
): Promise<Result<AuditListResponse, ServiceError>> => {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 50;
  const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;
  return get<AuditListResponse>(`/api/admin/audit?limit=${safeLimit}&offset=${safeOffset}`);
};
```

**Why it matters**: Defense in depth. Server already validates, but client-side validation prevents malformed requests from hitting the network at all and makes the contract explicit.

---

### [MEDIUM] Lookup table name from client is not validated before URL interpolation -- SHOULD_FIX

**File**: `src/client/services/lookup-admin-service.ts:34`
**Category**: Input Validation

**Problem**: `listEntries(tableName)` interpolates `tableName` directly into the URL path. While the server-side has a whitelist (`ALLOWED_LOOKUP_TABLES`), a compromised or buggy client could inject path segments like `../../other-endpoint` into the URL. The `entry.tsx` hardcodes a safe whitelist at line 77-85, but `listEntries` is a public export callable from anywhere.

**Before**:
```typescript
export const listEntries = (
  tableName: string,
): Promise<Result<readonly LookupEntry[], ServiceError>> =>
  get<readonly LookupEntry[]>(`/api/admin/lookups/${tableName}`);
```

**After** (defense in depth):
```typescript
const VALID_TABLE_NAME = /^[a-z_]+$/;

export const listEntries = (
  tableName: string,
): Promise<Result<readonly LookupEntry[], ServiceError>> => {
  if (!VALID_TABLE_NAME.test(tableName)) {
    return Promise.resolve({ ok: false, error: "VALIDATION_ERROR" as ServiceError });
  }
  return get<readonly LookupEntry[]>(`/api/admin/lookups/${tableName}`);
};
```

Apply the same pattern to `createEntry`, `updateEntry`, and `toggleEntry`.

**Why it matters**: Defense in depth. The server whitelist is the real guard, but validating on the client prevents accidental misuse and reduces attack surface.

---

### [LOW] SSR admin-view.tsx uses JSON.stringify without HTML-entity encoding -- SHOULD_FIX

**File**: `src/views/pages/admin-view.tsx:14`
**Category**: Output Encoding

**Problem**: `data-user={JSON.stringify(user)}` relies on JSX attribute encoding to safely embed the JSON. Hono's JSX does HTML-encode attribute values, so this is not exploitable. However, if a user name contains characters like `</div>` or similar HTML-breaking sequences, the JSON string inside the attribute could theoretically interact with aggressive HTML parsers. This is a low-risk defense-in-depth concern.

**Before**:
```tsx
<div
  id="admin-hub-app"
  data-user={JSON.stringify(user)}
>
```

**After** (belt-and-suspenders):
```tsx
<div
  id="admin-hub-app"
  data-user={JSON.stringify(user).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")}
>
```

**Why it matters**: Hono JSX already escapes attribute values, so this is an extra safety layer. The `\\u003c` encoding prevents any edge-case where a user name like `</script>` could break out of the attribute context in unusual HTML parsers.

---

### [LOW] Rejection note not length-validated on client side -- SHOULD_FIX

**File**: `src/client/views/components/admin/confirm-modal.tsx:146-151`
**Category**: Input Validation

**Problem**: The rejection note textarea has no `maxLength` attribute. A user could paste an extremely long string (megabytes) which would be sent to the server. The server should have body size limits, but the client should enforce a reasonable cap for UX and defense.

**Before**:
```tsx
<textarea
  class={textareaStyle}
  placeholder="Motivo da rejeicao (obrigatorio)..."
  value={note}
  onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
/>
```

**After**:
```tsx
<textarea
  class={textareaStyle}
  placeholder="Motivo da rejeicao (obrigatorio)..."
  value={note}
  maxLength={500}
  onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
/>
```

**Why it matters**: Prevents unnecessarily large payloads and provides clear UX feedback about input limits.

---

## 10-Dimension Checklist Summary

| Dimension | Status | Notes |
|-----------|--------|-------|
| 1. Input Validation | SHOULD_FIX | Client services interpolate params without local validation (server validates) |
| 2. Output Encoding | PASS | JSX auto-escapes; no dangerouslySetInnerHTML; no raw HTML concatenation |
| 3. Authentication & Authorization | PASS | authGuard + adminGuard on all admin routes; session check on every API handler |
| 4. Data Protection / PII | MUST_FIX | CPF in client JS state violates CLAUDE.md rule |
| 5. SQL/NoSQL Safety | N/A | No direct DB access; proxy to backend |
| 6. Dependencies | PASS | Only hono/jsx/dom and hono/css; zero external deps |
| 7. Security Headers | PASS | X-Requested-With on all fetches; credentials: same-origin; CSP nonce in SSR |
| 8. Error Handling | SHOULD_FIX | JSON.parse without try/catch in entry.tsx |
| 9. File Operations | N/A | No file uploads or filesystem access |
| 10. CSRF Protection | PASS | State changes use POST/PUT/PATCH; SameSite cookies; X-Requested-With header |

## Tooling Recommendations

1. **Deno lint rule**: Enable `no-explicit-any` (already enforced by project rules) and consider a custom lint rule to flag `JSON.parse` without surrounding try/catch.

2. **PII scanner**: Add a pre-commit hook that greps for `cpf:` in `src/client/` type definitions and flags potential PII leakage to JS state.

3. **Content-Security-Policy reporting**: Add `report-uri` or `report-to` directive to the CSP header to catch any CSP violations in production.

4. **Rate limiting**: Consider adding rate limiting to the `/api/admin/*` endpoints to prevent audit log flooding or brute-force enumeration of people/lookups.

## Verdict

**NEEDS FIXES**

Items to address:
- **MUST_FIX**: CPF in client JS state (HIGH) -- mask on server before sending to client
- **SHOULD_FIX**: JSON.parse error handling in entry.tsx (MEDIUM)
- **SHOULD_FIX**: Client-side param validation for audit limit/offset (MEDIUM)
- **SHOULD_FIX**: Client-side table name validation in lookup service (MEDIUM)
- **SHOULD_FIX**: HTML-entity encoding in data-user attribute (LOW)
- **SHOULD_FIX**: maxLength on rejection note textarea (LOW)
