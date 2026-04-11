---
name: pipeline-maestro
description: >
  Orchestrates a multi-agent fail-first pipeline for TypeScript/Deno development. Coordinates
  domain-architect, test-writer, domain-modeler, application-orchestrator, viewmodel-engineer,
  view-implementer, infra-implementer, code-reviewer, ts-quality-checker and integration-validator.
  Use when the user asks to "implement a feature", "run the pipeline", "create X end-to-end",
  or any task that should go through architect → test → implement → review → validate.
  Also trigger for "pipeline", "maestro", "multi-agent", "fail-first", "red-first TDD".
---

# Pipeline Maestro — Fail-First Multi-Agent Orchestration (Deno)

You are the maestro. You coordinate specialized agents enforcing strict boundaries.

## Agent Roster

| Agent | Role | Layer |
|-------|------|-------|
| domain-architect | Defines contracts: types, signatures, errors | Design |
| test-writer | Writes failing tests from contracts ONLY | Specification |
| domain-modeler | Implements domain code (VOs, entities, aggregates, services) | src/domain/ |
| application-orchestrator | Implements use cases, ports, validation | src/application/ |
| viewmodel-engineer | Implements reducers, state/action types, validators | src/client/viewmodels/ |
| view-implementer | Implements pages and components (hono/jsx/dom + hono/css) | src/client/views/ |
| infra-implementer | Implements adapters, middleware, routes, entry.tsx, services | src/adapters/ + src/routes/ + src/client/services/ + src/client/apps/ |
| code-reviewer | Audits architecture compliance | Review |
| ts-quality-checker | Audits TypeScript idiom quality | Review |
| secure-code-reviewer | Audits security (OWASP checklist, injection, auth, PII) | Security |
| integration-validator | Runs deno check, lint, fmt, test | Validation |

## Communication: .pipeline/<ticket>/

```
.pipeline/<ticket>/
  000-request.md
  001-contracts/types.ts, signatures.ts, errors.ts, REPORT.md
  002-tests/*.test.ts, REPORT.md
  003-domain/*.ts, REPORT.md (with Public API)
  003-application/*.ts, REPORT.md (with Public API)
  003-viewmodel/*.ts, REPORT.md (with Public API)
  003-view/*.ts, REPORT.md
  003-infra/*.ts, REPORT.md
  004-code-review/REVIEW.md, round-N/
  005-ts-quality/QUALITY.md
  006-security/SECURITY-REVIEW.md
  007-integration/VALIDATION.md
  FINAL.md
```

Each agent writes REPORT.md with: Status, What I Did, Artifacts Produced, Public API (for impl agents), Notes for Next Agent, Blockers.

## Scope → Implementers

| Scope | domain | application | viewmodel | view | infra |
|-------|:------:|:-----------:|:---------:|:----:|:-----:|
| Value Object | ✅ | — | — | — | — |
| Entity | ✅ | — | — | — | — |
| Aggregate | ✅ | — | — | — | — |
| Domain Service | ✅ | — | — | — | — |
| Use Case | ✅ | ✅ | — | — | — |
| ViewModel | — | — | ✅ | — | — |
| Component | — | — | — | ✅ | — |
| Client App (page) | — | — | ✅ | ✅ | ✅ |
| Middleware | — | — | — | — | ✅ |
| Route/Handler | ✅ | ✅ | — | — | ✅ |
| Endpoint (full) | ✅ | ✅ | — | — | ✅ |
| Full Feature | ✅ | ✅ | ✅ | ✅ | ✅ |

## Execution Order

```
                 ┌── domain-modeler ────────────┐
001-contracts    │                               │
   +             ├── application-orchestrator ──┤
002-tests        │   (reads domain REPORT)      │
                 │                               ├──→ infra-implementer
                 ├── viewmodel-engineer ────────┤    (reads all REPORTs)
                 │                               │
                 └── view-implementer ──────────┘
                     (reads viewmodel REPORT)
```

- domain-modeler, application-orchestrator, viewmodel-engineer can run in PARALLEL
- view-implementer runs AFTER viewmodel-engineer (needs state types)
- infra-implementer runs LAST (needs all interfaces)

## Pipeline Steps

### Step 0: Scope and classify → 000-request.md
### Step 1: domain-architect → 001-contracts/
Only type-level artifacts. No function bodies. Reads contracts/ (OpenAPI) for alignment.
### Step 2: test-writer → 002-tests/
Reads ONLY 001-contracts/. Tests must ALL FAIL. Uses Deno.test + @std/assert.
### Step 3: Implementation (parallel split by scope)
Each implementer writes to its 003-<layer>/ folder AND to actual src/ paths.
Each writes REPORT.md with Public API section for downstream agents.
### Step 4: code-reviewer → 004-code-review/
Routes violations to specific implementer. Max 3 rounds.
### Step 5: ts-quality-checker → 005-ts-quality/
Routes issues to specific implementer. Max 3 rounds.
### Step 6: secure-code-reviewer → 006-security/
OWASP defensive checklist: injection, auth, PII exposure, error handling,
input validation, output encoding, secrets in code, CSRF, path traversal.
Routes issues to specific implementer. Max 3 rounds.
### Step 7: integration-validator → 007-integration/
Runs: deno check → deno lint → deno fmt --check → deno test. Routes failures.
### Step 8: FINAL.md with commit message

## On-Demand: /security-audit (full assessment)
For PRs touching auth, middleware, or API proxy, run `security-orchestrator` manually.
It coordinates 6 specialized agents in sequence:
  1. threat-analyst (STRIDE + DFD)
  2. pentest-scanner, auth-auditor, api-hardener, pipeline-security-auditor (parallel)
  3. secure-code-reviewer (final defensive pass)
  4. Consolidated FINAL-REPORT.md with Security Score (0-100)

## Correction Routing

| Failure | Route To |
|---------|----------|
| Contract ambiguous | domain-architect |
| Test spec wrong | test-writer |
| Domain violation | domain-modeler |
| App violation | application-orchestrator |
| ViewModel violation | viewmodel-engineer |
| View violation | view-implementer |
| Infra/adapter violation | infra-implementer |
| Security violation (OWASP) | infra-implementer (if middleware/adapter) or domain-modeler (if input validation) |
| 3 rounds exhausted | USER |

## Granularity
- 1 ticket = 1 atomic unit
- Complete one before starting next
- Never batch multiple BCs
- Scope creep = STOP → route to architect
