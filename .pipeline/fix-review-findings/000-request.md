# 000-request: Fix All Review Findings (Copilot + Security + Code Review + Health)

## Scope
Fix all findings from 4 review sources on PR #26. No new features, no behavior changes — cleanup only.

## Classification
- **Type:** Fix + Cleanup
- **Profile:** view + infra (no domain, no application, no viewmodel logic changes)
- **Complexity:** Medium (22 findings, mostly 1-5 line fixes per file)

## Consolidated Findings (22 total)

### Group A — Security (1 MEDIUM)
| ID | File | Fix |
|----|------|-----|
| SEC-01 | `src/server.ts:51` | Move prototypes serveStatic AFTER securityHeaders() |

### Group B — Dead Code / Unused (7 LOW)
| ID | File | Fix |
|----|------|-----|
| DEAD-01 | `src/routes/api_admin.ts:35` | Remove unused `toJsonBody` |
| DEAD-02 | `src/client/views/components/registration/step-specificities.tsx:3` | Remove unused `cx` import |
| DEAD-03 | `src/client/views/components/registration/step-documents.tsx:76` | Remove unused `hasGlobalError` |
| DEAD-04 | `src/client/views/components/registration/step-documents.tsx:25` | Remove unused `fullCol` |
| DEAD-05 | `src/client/views/components/family/family-nav-bar.tsx:7` | Remove unused `lastName`, `weight` imports |
| DEAD-06 | `PROMPT-DAVI.md` (root) | Delete — duplicate of `prototypes/PROMPT-DAVI.md` |
| DEAD-07 | `src/adapters/admin/` | Verify if empty dir, delete if so |

### Group C — Bug Fixes (3 HIGH/MEDIUM)
| ID | File | Fix |
|----|------|-----|
| BUG-01 | `src/client/views/components/admin/dashboard-tab.tsx:31` | `radius.sm` does not exist — use correct token key |
| BUG-02 | `src/client/views/components/registration/step-specificities.tsx:121` | Wire textarea to state (onInput + value) |
| BUG-03 | `src/client/views/components/family/confirm-dialog.tsx:132` | Add `type="button"` to prevent accidental form submit |

### Group D — Portuguese Accents Lost (3 MEDIUM)
| ID | File | Fix |
|----|------|-----|
| I18N-01 | `src/client/views/components/landing/landing-tagline.tsx:21` | Restore accents: assistencia→assistência, gestao→gestão |
| I18N-02 | `src/client/views/components/landing/landing-footer.tsx:20` | Restore accents |
| I18N-03 | `src/client/views/components/landing/landing-screen.tsx:47` | Restore accent in aria-label: Pagina→Página |

### Group E — Style/CSS Cleanup (3 LOW)
| ID | File | Fix |
|----|------|-----|
| CSS-01 | `src/client/views/components/family/family-table.tsx:41` | Simplify always-true ternary in margin-bottom |
| CSS-02 | `src/client/views/components/family/family-nav-bar.tsx:20` | Simplify always-true ternary in margin-bottom |
| CSS-03 | `src/views/pages/landing-view.tsx:9-12` | Replace inline hardcoded styles with token values (SSR) |

### Group F — CLAUDE.md Drift (5 items)
| ID | Fix |
|----|-----|
| DOC-01 | Remove declared folders: domain/analytics, domain/people, application/people, adapters/infrastructure, client/views/components/search |
| DOC-02 | Add undeclared folders: components/redirect, components/hub, components/landing, viewmodels/auth-hub, adapters/admin, application/*/validation |

## Waves

### Wave 0: Design (skip — no contracts needed, these are fixes)

### Wave 1: Implementation (parallel by layer)
- [x] infra-implementer → SEC-01, DEAD-01, DEAD-06, DEAD-07
- [x] view-implementer → DEAD-02..05, BUG-01..03, I18N-01..03, CSS-01..02

### Wave 2: SSR + Docs
- [x] view-implementer → CSS-03 (landing-view.tsx, SSR context)
- [x] docs → DOC-01, DOC-02 (CLAUDE.md update)

### Wave 3: Quality Gates
- [x] integration-validator → deno check + lint + fmt + test
