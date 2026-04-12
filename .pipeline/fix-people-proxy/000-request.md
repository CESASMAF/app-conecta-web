# 000-request: Fix People Context Proxy Route Mapping

## Ticket
- **ID:** fix-people-proxy
- **Scope:** adapter/infra ONLY (route handler)
- **Complexity:** simple (2-line fix in one file)
- **BC:** people (proxy layer)

## Problem
Proxy maps `/api/people/X` → `/api/v1/X` (loses `people` segment).
Backend expects `/api/v1/people/X`.

## Fix
1. Change path transform: `/api/people` → `/api/v1/people` (not `/api/v1`)
2. Add bare route handler for `/api/people` (no wildcard) for list/create

## File
- src/routes/api.ts (lines 165, 173)

## Agents
- infra-implementer
- code-reviewer
- integration-validator
