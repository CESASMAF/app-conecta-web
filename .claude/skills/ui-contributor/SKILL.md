---
name: ui-contributor
description: >
  Safety guardrails for UI/UX contributors. Enforces scope restrictions,
  branch workflow, and prevents regressions. Trigger automatically when
  the user mentions: design, UI, UX, visual, layout, estilo, cor, fonte,
  componente visual, melhorar tela, ajustar visual.
---

# UI Contributor — Safety Guardrails

You are assisting a UI/UX contributor. Follow these rules STRICTLY.

## Scope — What You CAN Modify

| Directory | What's there |
|-----------|-------------|
| `src/client/views/components/` | JSX components (props → JSX) |
| `src/client/views/pages/` | Page orchestrators |
| `src/client/styles/tokens.ts` | Design tokens (colors, fonts, spacing) |
| `src/client/styles/base.ts` | Composable CSS styles |
| `src/views/` | SSR page templates |
| `static/` | Static assets (images, icons) |

## Scope — What You MUST NOT Modify

| Directory | Why |
|-----------|-----|
| `src/domain/` | Business logic — breaks if changed |
| `src/application/` | Use cases — breaks API behavior |
| `src/adapters/` | Auth, session, proxy — security critical |
| `src/middleware/` | Security headers, CSRF — security critical |
| `src/routes/api.ts` | API proxy — breaks data flow |
| `src/routes/auth.ts` | OIDC auth — breaks login |
| `src/server.ts` | Server wiring — breaks everything |
| `src/types.ts` | Shared types — breaks everything |
| `tests/` (existing) | Existing tests — causes regressions |

If the user asks to change something outside scope, say:
> "Essa mudança afeta o backend/auth/domínio. Precisa ser feita pelo desenvolvedor backend. Posso ajudar apenas com a parte visual."

## Workflow — ALWAYS Follow

1. **Check current branch:** `git branch --show-current`
   - If on `main` → CREATE a branch first: `git checkout -b ui/<description>`
   - NEVER commit on main

2. **Before making changes:** Read the relevant component/page to understand current state

3. **Make changes** only within allowed scope

4. **After changes:** Run `deno test tests/client/` to verify viewmodel tests still pass

5. **Commit** with descriptive message: `git commit -m "ui: <what changed>"`

6. **Build bundles:** `deno task build`

7. **Push:** `git push -u origin ui/<description>`

## Styling Rules

- Import tokens from `src/client/styles/tokens.ts` — NEVER hardcode hex colors
- Use `css` from `hono/css` — NEVER use Tailwind or inline `style=""` with raw values
- Follow the font guide: Satoshi (UI), Playfair (decorative italic), Erode (inputs)
- Responsive: use `breakpoint` values from tokens
- Animations: follow `.claude/skills/view-expert/references/animations.md`

## Component Rules

- Components are `(props) => JSX` — no fetch, no useReducer, no useEffect
- useState ONLY for local UI (tooltip open, dropdown expanded)
- If > 50 lines JSX → break into subcomponents
- Import from `hono/jsx/dom` (client) — NEVER from `hono/jsx` (server)

## If Tests Fail

If `deno test` fails after your changes:
1. **Do NOT modify the test** to make it pass
2. **Revert your change** and try a different approach
3. The tests protect the app from breaking — they are correct

## Checklist Before Committing

- [ ] On a `ui/*` branch (not main)
- [ ] Only modified files in allowed scope
- [ ] No hardcoded colors (use tokens)
- [ ] `deno test tests/client/` passes
- [ ] `deno task build` succeeds
