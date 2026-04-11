# 000-request: Harden fetchMetadata middleware (pentest findings)

## Ticket
- **ID:** fix-fetch-metadata-security
- **Scope:** middleware (infra) + regression tests
- **Complexity:** simple
- **Severity:** MEDIA (Finding 1), BAIXA (Finding 2)

## Findings
1. Sec-Fetch-Site cross-site allowed on GET /api/* → data leak (CPF, names)
2. X-Requested-With not required on GET /api/* → weaker defense-in-depth

## Fix
- Extend Sec-Fetch-Site blocking to ALL methods on /api/*
- Extend X-Requested-With requirement to ALL methods on /api/*
- Add behavioral + static regression tests

## Files
- src/middleware/fetch_metadata.ts (fix)
- tests/middleware/fetch_metadata_test.ts (behavioral regression)
- tests/regression/adapter_findings_test.ts (static regression)

## Agents
- infra-implementer, code-reviewer, integration-validator
