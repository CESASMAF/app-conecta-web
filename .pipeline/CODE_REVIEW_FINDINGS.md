# Code Review Findings — Full Codebase Audit

**Date:** 2026-04-10
**Scope:** Domain (57 files) + Application (18 files) + Adapters/Middleware/Routes (14 files)
**Total tests:** 554 passing, 0 failures

---

## Summary

| Layer | Blockers | Warnings | Info |
|-------|----------|----------|------|
| Domain | 0 | 7 | 13 |
| Application | 0 | 2 | 0 |
| Adapters/Middleware/Routes | 3 | 8 | 6 |
| **Total** | **3** | **17** | **19** |

---

## BLOCKERS (3)

### B-1: Missing CSRF middleware in chain
- **File:** `src/server.ts` line 44-47
- **Issue:** CLAUDE.md specifies: securityHeaders -> serveStatic -> csrf -> session -> fetchMetadata -> authGuard. Both `serveStatic` and `csrf` are missing. fetchMetadata partially compensates on /api/* but non-API POST routes are unprotected.
- **Fix:** Implement CSRF middleware (double-submit cookie or synchronizer token) + add serveStatic for /static/*.
- **Route to:** infra-implementer

### B-2: SESSION_SECRET loaded but never used
- **File:** `src/adapters/config/server_config.ts` line 44
- **Issue:** `sessionSecret` is required env var but never referenced. Session IDs are raw `crypto.randomUUID()` without HMAC signing. Attacker who guesses UUIDs can hijack sessions.
- **Fix:** HMAC-sign session cookie values using sessionSecret. Format: `sessionId.signature`.
- **Route to:** infra-implementer

### B-3: No domain validation on proxied request bodies
- **File:** `src/routes/api.ts` lines 45-104
- **Issue:** CLAUDE.md requires "Domain validation on ALL request bodies before proxying." The API proxy blindly forwards any JSON. Defeats the "Iron Frontier" purpose.
- **Fix:** Route-specific validation mapping API paths to domain validators, or wire through application use cases.
- **Route to:** infra-implementer + application-orchestrator

---

## WARNINGS (17)

### Domain Layer (7)

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| W-D1 | `shared/result.ts` | 38-43 | `.push()` in `combine` (mutable local) | Replace with reduce/accumulator |
| W-D2 | `kernel/address.ts` | 111 | `let validatedCep` reassignment | Extract to helper returning Result |
| W-D3 | `kernel/ids.ts` + 4 others | 42-46 | UUID regex/helpers duplicated across 5 files | Extract shared `uuid.ts` in kernel/ |
| W-D4 | `assessment/services/family_age_profile.ts` | 52-79 | `+=` mutation on local object | Use reduce/functional accumulation |
| W-D5 | `assessment/services/education_analytics.ts` | 48-81 | Same `+=` mutation pattern | Same fix as W-D4 |
| W-D6 | `care/value-objects/appointment_type.ts` | 32-38 | `readonly string[]` with `.includes()` instead of `ReadonlySet` | Use Set + .has() |
| W-D7 | `protection/entities/placement_history.ts` | 86, 106 | `as Result<never, PlacementError>` — wrong cast | Replace with `err(result.error)` |

### Application Layer (2)

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| W-A1 | `registry/use-cases/register_patient.ts` | 9-10 | `err` and `combine` imported but unused | Remove unused imports |
| W-A2 | `protection/use-cases/update_placement_history.ts` | ~90 | `crypto.randomUUID()` side effect in app layer | Move ID generation to caller or inject as dependency |

### Adapters/Middleware/Routes (8)

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| W-I1 | `adapters/auth/session_store.ts` | 8-31 | Unbounded Map, no sweep, memory leak risk | Add periodic sweep + max entries |
| W-I2 | `adapters/auth/bff_service.ts` | 292-337 | `BFFAuthError` vs `TokenRefresher` type misalignment | Align error types explicitly |
| W-I3 | `adapters/auth/bff_service.ts` | 108-115 | id_token decoded without iss/aud/exp validation | Validate claims before trusting |
| W-I4 | `adapters/auth/bff_service.ts` | 108-115 | `decodeIdTokenPayload` masks error as TOKEN_EXCHANGE_FAILED | Return specific ID_TOKEN_DECODE_FAILED |
| W-I5 | `routes/api.ts` | 71, 103 | `as object` and `as 200` unsafe casts | Remove casts, handle null body |
| W-I6 | `adapters/auth/bff_service.ts` | 153-162 | OIDC discovery cache never invalidated | Add TTL (e.g., 1 hour) |
| W-I7 | `routes/api.ts` | 22-30 | `safeParseBody` silently drops malformed JSON | Return 400 on parse failure |
| W-I8 | `server.ts` | 44-47 | Middleware chain order deviation (missing csrf/serveStatic) | Covered by B-1 |

---

## INFO (19)

### Domain (13)

| # | File | Issue |
|---|------|-------|
| I-D1 | `kernel/cns.ts:63` | `let dv` in checksum helper |
| I-D2 | `kernel/rg_document.ts:137-139` | No date format validation on issueDate (NaN passes) |
| I-D3 | `kernel/rg_document.ts:149` | issueDate not normalized to ISO format |
| I-D4 | `kernel/timestamp.ts:89,107` | `as unknown as string` for unbranding (consistent, ok) |
| I-D5 | `kernel/ids.ts:42` | UUID regex requires pre-normalized input (implicit coupling) |
| I-D6 | `registry/entities/family_member.ts:75` | Import not at top of file |
| I-D7 | `registry/aggregates/patient/operations.ts:180` | `updateSocialIdentity` returns Patient not Result (intentional) |
| I-D8 | `assessment/value-objects/health_status.ts:49` | No validation (documented exception) |
| I-D9 | `assessment/value-objects/educational_status.ts:49` | No validation (documented exception) |
| I-D10 | `care/value-objects/icd_code.ts:34` | No ICD-10 format validation (only empty check) |
| I-D11 | `protection/entities/placement_history.ts:19` | PlacementRegistry.id is plain string, not branded |
| I-D12 | `protection/aggregates/rights-violation-report/operations.ts:45-53` | Stores un-trimmed descriptionOfFact/actionsTaken |
| I-D13 | `protection/aggregates/referral/operations.ts:46` | Stores un-trimmed reason |

### Adapters (6)

| # | File | Issue |
|---|------|-------|
| I-I1 | `types.ts:9` | refreshToken as `string \| undefined` vs optional (ok with current config) |
| I-I2 | `Dockerfile:6-7` | Does not copy deno.lock (doesn't exist yet) |
| I-I3 | `Dockerfile:14` | `deno check src/**/*.ts` misses .tsx files |
| I-I4 | `adapters/auth/bff_service.ts:122` | __Host- cookie requires HTTPS (works with Caddy) |
| I-I5 | `middleware/auth_guard.ts:5-9` | `/health` prefix-matches too broadly |
| I-I6 | Various | Positive: zero throw/class/this/any, Result used everywhere, PKCE correct, session refresh robust |

---

## Positive Observations

- Zero `throw`, `class`, `this`, `any` in entire domain layer (57 files)
- Import boundaries 100% respected across all layers
- All repositories are pure `type` contracts
- All branded types use documented `as unknown as T` casts
- All imports have `.ts` extensions, all type-only imports use `import type`
- PKCE implementation is correct and robust
- Session refresh with graceful fallback is well-designed
- Cookie security (`__Host-`, HttpOnly, Secure, SameSite=Strict) is correct
