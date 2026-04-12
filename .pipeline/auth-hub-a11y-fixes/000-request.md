# 000-request: Auth Hub A11y + Design Fixes

## Ticket
- **ID:** auth-hub-a11y-fixes
- **Scope:** view + styles ONLY
- **Complexity:** simple (targeted edits, no new components)
- **BC:** N/A (cross-cutting UI layer)

## Findings (9)

### Critical (3)
1. Font double-quoting in tokens.ts — fonts don't load
2. Container missing width:100% — layout shrinks on desktop
3. Button touch target <44px on mobile — WCAG 2.5.5 fail

### Major (4)
4. textMuted contrast 3.5:1 — WCAG 1.4.3 fail
5. Footer contrast 3.8:1 — WCAG 1.4.3 fail
6. Logout button contrast 3.5:1 — WCAG 1.4.3 fail
7. Hub null user flash — returns null instead of spinner

### Minor (2)
8. Hardcoded rgba colors — should use tokens/alpha()
9. Recent card arrow contrast 3.2:1 — WCAG 1.4.11 fail (covered by #8)

## Agents Required
- view-implementer (all changes)
- code-reviewer (audit)
- ts-quality-checker (audit)
- integration-validator (deno test + build)

## Files to Modify (8)
1. src/client/styles/tokens.ts
2. src/client/styles/auth-hub.ts
3. src/client/views/components/landing/landing-button.tsx
4. src/client/views/components/landing/landing-footer.tsx
5. src/client/views/components/landing/landing-tagline.tsx
6. src/client/views/components/hub/hub-screen.tsx
7. src/client/views/components/hub/hub-header.tsx
8. src/client/views/components/hub/recent-app-card.tsx
