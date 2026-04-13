---
title: "PR should not exceed 400 lines of diff"
scope: "pull_request"
severity_min: "medium"
buckets: ["style-conventions"]
enabled: true
---

## Instructions

PRs should be small and focused. The project enforces a **max 400 lines of diff** per PR and **max 10 files per commit**.

Flag:
- PRs with more than 400 lines of diff (additions + deletions)
- Single commits touching more than 10 files
- PRs that mix infrastructure/config changes with feature code (these must be separate PRs)
- PRs that span multiple bounded contexts simultaneously

Suggest splitting into smaller, atomic PRs when these limits are exceeded. Config-first rule: changes to shared files (`deno.json`, `Dockerfile`, `server.ts`, `types.ts`) go in a SEPARATE PR that merges BEFORE the feature code.
