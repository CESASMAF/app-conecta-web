---
title: "PR title must follow Conventional Commits"
scope: "pull_request"
severity_min: "high"
buckets: ["style-conventions"]
enabled: true
---

## Instructions

The PR title must follow the Conventional Commits specification used by this organization.

Valid prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ui:`, `proto:`

Breaking changes use `!` suffix: `feat!:`, `fix!:`

Rules:
- Title must start with one of the valid prefixes
- The description after the prefix should be lowercase and concise
- Scope is optional but encouraged: `feat(registry):`, `fix(assessment):`
- Valid scopes: `registry`, `assessment`, `care`, `protection`, `auth`, `middleware`, `views`, `client`, `config`

## Examples

### Bad example
```
Added patient registration page
Update search component
Fix broken login
```

### Good example
```
feat(registry): add patient registration wizard page
fix(auth): correct PKCE verifier TTL cleanup
ui(views): redesign home page layout with new tokens
chore: update deno.json dependencies
```
