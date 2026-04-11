---
name: codebase-health
description: >
  Codebase health check that compares CLAUDE.md declarations vs actual code reality.
  Detects drift: folders that don't exist, import boundary violations, patterns declared
  but not followed, dead exports, missing test coverage areas.
  Trigger for: "health check", "codebase scan", "drift check", "verificar saude",
  "/codebase-health", "map codebase", "check consistency".
---

# Codebase Health Check — CLAUDE.md vs Reality

You are the codebase auditor. You compare what CLAUDE.md says the project looks like vs what it actually looks like.

## What You Check

### 1. Folder Structure Drift

Compare the `Complete Project Structure` section of CLAUDE.md against actual filesystem.

**Report:**
- Folders declared but missing
- Folders that exist but aren't declared
- Files in unexpected locations

```bash
# Scan actual structure
find src/ -type d | sort
```

Compare against CLAUDE.md tree. Flag discrepancies.

### 2. Import Boundary Violations

CLAUDE.md declares strict import boundaries:

| From \ To | domain | application | adapters | client/services | client/viewmodels | client/views |
|-----------|:------:|:-----------:|:--------:|:---------------:|:-----------------:|:------------:|
| domain | OK | X | X | X | X | X |
| application | OK | OK | X | X | X | X |
| adapters | OK | OK | OK | X | X | X |
| client/services | X | X | X | OK | X | X |
| client/viewmodels | X | X | X | X | OK | X |
| client/views (pages) | X | X | X | OK | OK | OK |
| client/views (components) | X | X | X | X | X | OK |

**Scan for violations:**
- Domain files importing from application, adapters, or client
- Application files importing from adapters or client
- Client components importing from services or viewmodels
- Client code importing from `hono/jsx` (should be `hono/jsx/dom`)
- Server code importing from `hono/jsx/dom` (should be `hono/jsx`)

### 3. Prohibited Patterns

Scan for patterns that CLAUDE.md prohibits:

| Layer | Prohibited | Grep Pattern |
|-------|-----------|--------------|
| domain/ | `throw` | `throw ` |
| domain/ | `class ` | `class \w+` |
| domain/ | `this.` | `this\.` |
| domain/ | `new Error` | `new Error` |
| domain/ | `any` type | `: any` or `as any` |
| application/ | `throw` | `throw ` |
| application/ | `class ` | `class \w+` |
| client/viewmodels/ | `fetch(` | `fetch\(` |
| client/viewmodels/ | `useEffect` | `useEffect` |
| client/views/components/ | `fetch(` | `fetch\(` |
| client/views/components/ | `useReducer` | `useReducer` |
| client/views/components/ | `useEffect` | `useEffect` |

### 4. Result Pattern Compliance

Check that exported functions in domain/ and application/ return `Result<T, E>`:
- Smart constructors should return Result
- Use cases should return Promise<Result>
- No raw `throw` in these layers

### 5. Branded Type Usage

Check that IDs and validated values in domain/kernel/ use branded types:
- Look for `type X = Brand<string, 'X'>` pattern
- Flag any raw `string` or `number` used as an ID type

### 6. Test Coverage Map

Scan test files and map which src/ modules have corresponding tests:
- List src/ modules without any test file
- List test files that import from non-existent src/ paths

### 7. Security Posture Quick Scan

- Check that `__Host-session` cookie is used (not generic `session`)
- Check that CSP nonce is generated per request
- Check that `X-Requested-With` header is validated on mutations
- Check that no tokens/secrets are hardcoded
- Check Dockerfile for non-root user, pinned base image

---

## Output Format

```markdown
# Codebase Health Report

**Date:** YYYY-MM-DD
**Score:** X/100

## Structure Drift
| Status | Item | Detail |
|--------|------|--------|
| MISSING | src/domain/analytics/ | Declared in CLAUDE.md but doesn't exist |
| EXTRA | src/utils/ | Exists but not declared in CLAUDE.md |

## Import Violations (count)
| File | Violation | Imports From |
|------|-----------|-------------|
| src/domain/kernel/cpf.ts:5 | Domain imports adapters | ../adapters/... |

## Prohibited Patterns (count)
| File:Line | Pattern | Layer Rule |
|-----------|---------|-----------|
| src/domain/registry/patient.ts:42 | throw new Error | Domain: throw forbidden |

## Result Compliance
- X/Y exported domain functions return Result
- X/Y exported use cases return Promise<Result>

## Test Coverage Map
| Module | Has Tests | Test File |
|--------|-----------|-----------|
| src/domain/kernel/cpf.ts | YES | tests/domain/cpf.test.ts |
| src/domain/registry/patient.ts | NO | — |

## Security Quick Scan
| Check | Status | Detail |
|-------|--------|--------|
| __Host-session cookie | PASS | Found in session.ts:15 |
| CSP nonce | PASS | Found in security_headers.ts:8 |
| Hardcoded secrets | PASS | None found |

## Recommendations
1. [HIGH] Fix 2 import boundary violations in domain/
2. [MEDIUM] Add tests for 3 untested domain modules
3. [LOW] Update CLAUDE.md to reflect 1 new folder
```

---

## Execution

1. Read CLAUDE.md to extract declared structure and rules
2. Scan filesystem for actual structure
3. Run grep/glob scans for each check category
4. Compare and produce report
5. Suggest fixes ranked by severity (HIGH > MEDIUM > LOW)

## When to Run

- Before starting a major feature (baseline check)
- After completing a pipeline ticket (regression check)
- Periodically (weekly or bi-weekly) to catch drift
- When onboarding new contributors (verify docs match reality)
