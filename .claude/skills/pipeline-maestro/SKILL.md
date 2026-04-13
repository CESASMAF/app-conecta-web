---
name: pipeline-maestro
description: >
  Orchestrates a multi-agent fail-first pipeline for TypeScript/Deno development. Coordinates
  domain-architect, test-writer, domain-modeler, application-orchestrator, viewmodel-engineer,
  view-implementer, infra-implementer, code-reviewer, ts-quality-checker and integration-validator.
  Use when the user asks to "implement a feature", "run the pipeline", "create X end-to-end",
  or any task that should go through architect -> test -> implement -> review -> validate.
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
| viewmodel-engineer | Implements reducers, state/action types, validators | src/client/presenter/ |
| view-implementer | Implements pages and components (hono/jsx/dom + hono/css) | src/client/views/ |
| infra-implementer | Implements adapters, middleware, routes, entry.tsx, services | src/adapters/ + src/routes/ + src/client/data/services/ + src/client/apps/ |
| code-reviewer | Audits architecture compliance | Review |
| ts-quality-checker | Audits TypeScript idiom quality | Review |
| secure-code-reviewer | Audits security (OWASP checklist, injection, auth, PII) | Security |
| integration-validator | Runs deno check, lint, fmt, test | Validation |

## Communication: .pipeline/<ticket>/

```
.pipeline/<ticket>/
  STATE.md                              <-- Session state (resume support)
  000-request.md                        <-- Scope, waves, classification
  000-discuss/CONTEXT.md                <-- Discuss phase output
  001-contracts/types.ts, signatures.ts, errors.ts, REPORT.md
  002-tests/*.test.ts, REPORT.md
  003-domain/*.ts, REPORT.md (with Public API)
  003-application/*.ts, REPORT.md (with Public API)
  003-presenter/*.ts, REPORT.md (with Public API)
  003-view/*.ts, REPORT.md
  003-infra/*.ts, REPORT.md
  004-code-review/REVIEW.md, round-N/
  005-ts-quality/QUALITY.md
  006-security/SECURITY-REVIEW.md
  007-integration/VALIDATION.md
  FINAL.md
```

Each agent writes REPORT.md with: Status, What I Did, Artifacts Produced, Public API (for impl agents), Notes for Next Agent, Blockers.

---

## STATE.md — Session Resume Protocol

Every pipeline ticket MUST have a `STATE.md` at the root. The maestro updates it after each phase transition.

```markdown
# Pipeline State: <ticket>

## Current Phase
phase: discuss | contracts | tests | implementation | code-review | ts-quality | security | integration | done
agent: <last agent running or completed>
status: in-progress | blocked | waiting-user | completed

## Decisions Log
<!-- Append-only. Each decision with date and rationale. -->
- [2026-04-11] Scope: kernel/CPF value object only (no aggregate)
- [2026-04-11] Wave: domain-only (no client needed)
- [2026-04-11] discuss: user confirmed CPF mask format "000.000.000-00"

## Completed Phases
- [x] 000-request (scope classified)
- [x] 000-discuss (context clarified)
- [x] 001-contracts (types defined)
- [ ] 002-tests
- [ ] 003-implementation
- [ ] 004-code-review
- [ ] 005-ts-quality
- [ ] 006-security
- [ ] 007-integration

## Blockers
<!-- Empty if none -->

## Context for Resume
<!-- What the next agent needs to know if session was interrupted -->
Last action: test-writer completed 4 test files, all RED
Next action: Start Wave 1 (domain-modeler + application-orchestrator in parallel)
Key files: .pipeline/<ticket>/002-tests/cpf.test.ts
```

### Resume Protocol
When resuming an interrupted pipeline:
1. Read `STATE.md` to understand current position
2. Read the last completed phase's `REPORT.md`
3. Continue from `Next action` — do NOT re-run completed phases
4. Update `STATE.md` immediately after resuming

---

## Discuss Phase (Step 0.5) — Before Contracts

After 000-request.md is written and BEFORE domain-architect runs, the maestro runs a **discuss phase** to surface grey areas.

### When to Discuss
- **Always** for Full Feature scope
- **Always** when 000-request has ambiguities, TODOs, or open questions
- **Skip** for well-defined atomic units (single VO with clear validation rules)

### Two Modes

**Mode: Questions** (default)
Ask the user targeted questions about grey areas:
- Edge cases not covered in the request
- Validation rules (format, ranges, optionality)
- Error handling preferences (what error messages, what granularity)
- Naming conventions for the specific bounded context
- UI/UX decisions if scope includes client

**Mode: Assumptions**
Analyze the codebase and 000-request, then present what you WOULD do:
```
Based on the request and existing patterns, I would:
1. CPF format: "000.000.000-00" (matching kernel/cpf.ts pattern)
2. Error union: 'INVALID_CPF_FORMAT' | 'INVALID_CPF_DIGITS'
3. No aggregate needed — this is a standalone VO
4. Tests: 5 cases (valid, invalid format, invalid digits, empty, whitespace)

Correct me on anything wrong. Otherwise I'll proceed.
```

### Output: 000-discuss/CONTEXT.md

```markdown
# Discuss Context: <ticket>

## Mode: questions | assumptions

## Decisions
- CPF accepts both masked and unmasked input → normalize internally
- Error granularity: separate FORMAT vs DIGITS errors (not generic INVALID)
- Test edge case added: CPF with all same digits (111.111.111-11) is invalid

## Open Items
<!-- Empty if all resolved -->

## User Preferences
- Prefers Portuguese error messages for domain errors
- Wants exhaustive test cases including boundary values
```

The domain-architect MUST read 000-discuss/CONTEXT.md before writing contracts.

---

## Wave Execution System

### Wave Declaration in 000-request.md

Every request MUST declare which waves are needed. This prevents running unnecessary agents.

```markdown
## Waves

### Wave 0: Design (always)
- [x] domain-architect → 001-contracts/
- [x] test-writer → 002-tests/

### Wave 1: Core Implementation (parallel)
- [x] domain-modeler
- [x] application-orchestrator
- [ ] viewmodel-engineer        ← SKIP: no client state needed
- [ ] view-implementer          ← SKIP: no UI needed

### Wave 2: Infrastructure (sequential, after Wave 1)
- [x] infra-implementer

### Wave 3: Quality Gates (sequential)
- [x] code-reviewer
- [x] ts-quality-checker
- [x] secure-code-reviewer
- [x] integration-validator
```

### Wave Profiles (shortcuts)

| Profile | Waves | Use When |
|---------|-------|----------|
| `domain-only` | Wave 0 + domain-modeler + quality gates | VO, entity, aggregate, domain service |
| `backend` | Wave 0 + domain + app + infra + quality gates | Use case, endpoint, middleware |
| `client-only` | Wave 0 + viewmodel + view + infra(services+entry only) + quality gates | Client feature with existing API |
| `full-stack` | All waves | End-to-end feature |

The maestro selects the profile based on scope classification and can override with user input from the discuss phase.

### Execution Rules
- Agents in the same wave run in **PARALLEL** (as subagents)
- A wave starts only when ALL agents in the previous wave are **completed**
- Skipped agents are marked `SKIP` in STATE.md — never spawned
- If a wave has only one agent, it runs immediately (no waiting)

---

## Scope -> Implementers

| Scope | domain | application | viewmodel | view | infra | Profile |
|-------|:------:|:-----------:|:---------:|:----:|:-----:|---------|
| Value Object | x | — | — | — | — | domain-only |
| Entity | x | — | — | — | — | domain-only |
| Aggregate | x | — | — | — | — | domain-only |
| Domain Service | x | — | — | — | — | domain-only |
| Use Case | x | x | — | — | — | backend |
| ViewModel | — | — | x | — | — | client-only |
| Component | — | — | — | x | — | client-only |
| Client App (page) | — | — | x | x | x | client-only |
| Middleware | — | — | — | — | x | backend |
| Route/Handler | x | x | — | — | x | backend |
| Endpoint (full) | x | x | — | — | x | backend |
| Full Feature | x | x | x | x | x | full-stack |

---

## Pipeline Steps

### Step 0: Scope and classify -> 000-request.md
Classify scope. Assign wave profile. Write 000-request.md with waves section.
Update STATE.md: `phase: request, status: completed`.

### Step 0.5: Discuss Phase -> 000-discuss/CONTEXT.md
Surface grey areas. Choose mode (questions or assumptions).
Output CONTEXT.md with decisions and user preferences.
Update STATE.md: `phase: discuss, status: completed`.
**Skip condition:** Atomic, well-defined scope with no ambiguity.

### Step 1: domain-architect -> 001-contracts/
Only type-level artifacts. No function bodies. Reads contracts/ (OpenAPI) for alignment.
MUST read 000-discuss/CONTEXT.md if it exists.
Update STATE.md: `phase: contracts, status: completed`.

### Step 2: test-writer -> 002-tests/
Reads ONLY 001-contracts/. Tests must ALL FAIL. Uses Deno.test + @std/assert.
Update STATE.md: `phase: tests, status: completed`.

### Step 3: Implementation (Wave 1 + Wave 2)
**Wave 1 (parallel):** Active implementers from wave profile run simultaneously.
Each writes to its 003-<layer>/ folder AND to actual src/ paths.
Each writes REPORT.md with Public API section for downstream agents.
**Wave 2 (after Wave 1):** infra-implementer reads ALL previous REPORTs.
Update STATE.md: `phase: implementation, status: completed`.

### Step 4: code-reviewer -> 004-code-review/
Routes violations to specific implementer. Max 3 rounds.
Update STATE.md after each round.

### Step 5: ts-quality-checker -> 005-ts-quality/
Routes issues to specific implementer. Max 3 rounds.

### Step 6: secure-code-reviewer -> 006-security/
OWASP defensive checklist: injection, auth, PII exposure, error handling,
input validation, output encoding, secrets in code, CSRF, path traversal.
Routes issues to specific implementer. Max 3 rounds.

### Step 7: integration-validator -> 007-integration/
Runs: deno check -> deno lint -> deno fmt --check -> deno test. Routes failures.

### Step 8: FINAL.md with commit message
Update STATE.md: `phase: done, status: completed`.

---

## Fresh Context Protocol

Each implementer agent MUST be spawned with **only the context it needs**, not the accumulated session. The maestro constructs a focused prompt per agent:

### Context Loading Rules

| Agent | Loads | Never Loads |
|-------|-------|-------------|
| domain-architect | 000-request.md, 000-discuss/CONTEXT.md, contracts/ (OpenAPI) | Any 003-* REPORTs |
| test-writer | 001-contracts/ | Any 003-* REPORTs, src/ |
| domain-modeler | 001-contracts/, 002-tests/ (domain tests only) | 003-application/, 003-presenter/, 003-view/ |
| application-orchestrator | 001-contracts/, 002-tests/ (app tests only), 003-domain/REPORT.md | 003-presenter/, 003-view/, 003-infra/ |
| viewmodel-engineer | 001-contracts/, 002-tests/ (viewmodel tests only) | 003-domain/, 003-application/, 003-view/ |
| view-implementer | 001-contracts/, 002-tests/ (view tests only), 003-presenter/REPORT.md | 003-domain/, 003-application/, 003-infra/ |
| infra-implementer | 001-contracts/, 002-tests/ (infra tests only), ALL 003-*/REPORT.md | 003-* implementation files |
| code-reviewer | ALL src/ changes, CLAUDE.md rules | .pipeline/ implementation drafts |
| ts-quality-checker | ALL src/ changes | .pipeline/ implementation drafts |
| secure-code-reviewer | ALL src/ changes, especially adapters/middleware/routes | .pipeline/ implementation drafts |
| integration-validator | None (runs deno commands) | .pipeline/ |

### Prompt Template for Implementers

When spawning an implementer, the maestro MUST structure the prompt as:

```
You are {agent-name}. Read your skill at .claude/skills/{skill}/SKILL.md.

## Your Mission
{what to build, from 000-request.md}

## Contracts (from 001-contracts/)
{paste or reference the relevant type definitions}

## Tests You Must Pass (from 002-tests/)
{paste or reference the relevant test file names}

## Upstream API (from 003-*/REPORT.md — only if applicable)
{paste the Public API section from the upstream agent's REPORT}

## Decisions (from 000-discuss/CONTEXT.md)
{paste relevant decisions}

Write to: .pipeline/<ticket>/003-{layer}/ AND src/{layer}/
Produce REPORT.md with Public API section when done.
```

This ensures each agent starts FRESH with minimal, focused context — preventing context rot on large tickets.

---

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
- Scope creep = STOP -> route to architect
