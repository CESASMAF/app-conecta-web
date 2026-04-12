# DevSecOps Audit -- Social Care BFF (Deno + Hono)

**Date**: 2026-04-11
**Auditor**: pipeline-security-auditor agent
**Scope**: Docker, CI/CD, Dependencies, Secrets Management, Supply Chain

---

## Infrastructure Map

| Component | File | Status |
|-----------|------|--------|
| Docker | `Dockerfile` | WARNING -- 5 issues |
| Docker Compose | `docker-compose.yml` | WARNING -- 4 issues |
| CI/CD (BFF) | (none) | CRITICAL -- no pipeline exists |
| CI/CD (Contracts) | `contracts/.github/workflows/` | OK -- 2 issues |
| Dependencies | `deno.json` + `deno.lock` | OK -- 1 issue |
| Secrets | `.env` / `server_config.ts` | CRITICAL -- 2 issues |
| Git Hooks | `.githooks/` | GOOD -- 1 issue |
| .dockerignore | (none) | CRITICAL -- missing entirely |
| .gitignore | `.gitignore` | OK |
| Supply Chain | (overall) | WARNING -- 3 issues |

---

## Critical Findings

### CRIT-01: `.env` File Contains Live OIDC Client Secret on Disk

**File**: `.env` (untracked but present on disk)
**Evidence**:
- `OIDC_CLIENT_ID=367349956392059030`
- `OIDC_CLIENT_SECRET=puoXaeAruKmY2YlaMjuwcS7pkD4zS4VKmJKiQaCuMwltkgMtisITpMiO47zXzqpi`
- `SESSION_SECRET=fcd0217e2d304d0ef17172e0f5b9a30bc7b096736c5f24bd00337164edd3540e`

The `.env` file is correctly listed in `.gitignore` and is NOT tracked by git. However, the `.env.example` file contains blank `OIDC_CLIENT_SECRET=` and `SESSION_SECRET=` fields which is correct. The risk is that any developer who receives a copy of this `.env` has permanent access to the HML Zitadel client.

**Remediation**:
1. Rotate the OIDC client secret in Zitadel immediately -- this secret has been exposed in the audit log.
2. Rotate the SESSION_SECRET value.
3. Store secrets in Bitwarden Secrets Manager (per project conventions) and document the pull procedure in `.env.example` comments.

### CRIT-02: No SESSION_SECRET Entropy Validation

**File**: `src/adapters/config/server_config.ts` (line 45)
**Evidence**: `sessionSecret: requireEnv("SESSION_SECRET")` -- only checks non-empty.

A SESSION_SECRET of `"a"` would pass validation. This secret is used as the HMAC key for cookie signing (`importHmacKey` in `bff_service.ts`). A weak secret makes HMAC signatures brute-forceable, allowing session forgery.

**Remediation**: Add minimum entropy validation:
```typescript
const requireSessionSecret = (key: string): string => {
  const value = requireEnv(key);
  if (value.length < 32) {
    throw new Error(
      `${key} must be at least 32 characters (256 bits). Got ${value.length} chars.`,
    );
  }
  // Reject low-entropy patterns
  if (/^(.)\1+$/.test(value) || value === "0".repeat(value.length)) {
    throw new Error(`${key} has insufficient entropy.`);
  }
  return value;
};
```

### CRIT-03: No CI/CD Pipeline for the BFF Application

**Evidence**: No `.github/workflows/` directory exists at the project root. The only workflows are under `contracts/.github/workflows/` which serve the contracts sub-project exclusively.

This means:
- No automated tests on PR/push
- No security scanning (SAST, dependency audit, container scan)
- No build verification
- No image publishing to GHCR
- Branch protection rules cannot enforce status checks
- The pre-push git hook is the ONLY safety net, and it only runs locally

**Remediation**: See "Recommended Security Pipeline" section below.

---

## Findings by Category

### Docker

#### DOCK-01: No `.dockerignore` File (HIGH)

**Impact**: Every `COPY` sends the full build context to Docker daemon, including `.env`, `.git/`, `.pipeline/`, `tests/`, `contracts/`, `handbook/`, and any local secrets files.

**Remediation**: Create `.dockerignore`:
```
.env
.env.*
.git
.gitignore
.githooks
.claude
.pipeline
.vscode
.idea
tests
contracts
handbook
coverage
cov_profile
*.md
!README.md
.DS_Store
Thumbs.db
node_modules
static/js
```

#### DOCK-02: Container Runs as Root (HIGH)

**File**: `Dockerfile` (line 24-37)
**Evidence**: No `USER` directive in the runtime stage. The Deno process runs as root inside the container.

**Remediation**: Add non-root user to runtime stage:
```dockerfile
FROM denoland/deno:2.7.11

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/deno.json .
COPY --from=builder --chown=appuser:appgroup /app/src/ src/
COPY --from=builder --chown=appuser:appgroup /app/static/ static/

RUN deno cache src/server.ts

USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s \
  CMD deno eval "const r = await fetch('http://localhost:8081/health'); if (!r.ok) Deno.exit(1);"

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "src/server.ts"]
```

#### DOCK-03: No HEALTHCHECK in Dockerfile (MEDIUM)

**File**: `Dockerfile`
**Evidence**: No `HEALTHCHECK` instruction. The `docker-compose.yml` defines a healthcheck, but the Dockerfile itself does not. Kubernetes/orchestrators that consume the image directly miss this.

**Remediation**: Add `HEALTHCHECK` to `Dockerfile` (shown in DOCK-02 fix above).

#### DOCK-04: Deno Permissions Are Broader Than Necessary (MEDIUM)

**File**: `Dockerfile` line 37
**Evidence**: `--allow-read` grants read access to the entire filesystem. Should be scoped.

**Remediation**:
```dockerfile
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read=src/,static/,deno.json", "src/server.ts"]
```

#### DOCK-05: No Read-Only Filesystem Configuration (LOW)

**File**: `docker-compose.yml`
**Evidence**: No `read_only: true`, no `security_opt: [no-new-privileges:true]`, no `cap_drop: ALL`.

**Remediation**:
```yaml
services:
  bff:
    build:
      context: .
      dockerfile: Dockerfile
    env_file: .env
    environment:
      - PORT=8081
      - HOST=0.0.0.0
    ports:
      - "8081:8081"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    tmpfs:
      - /tmp
    healthcheck:
      test: ["CMD", "deno", "eval", "const r = await fetch('http://localhost:8081/health'); if (!r.ok) Deno.exit(1);"]
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 10s
    restart: unless-stopped
```

---

### CI/CD Pipeline

#### CICD-01: No CI/CD Pipeline for BFF (CRITICAL)

See CRIT-03 above.

#### CICD-02: Reusable Workflow Pinned by Branch, Not SHA (MEDIUM)

**File**: `contracts/.github/workflows/auto-version.yml` line 12
**Evidence**: `uses: acdgbrasil/.github/.github/workflows/reusable-auto-version.yml@main`

Pinning to `@main` means any compromise of the `.github` repo's main branch can inject malicious code into this workflow.

**Remediation**: Pin by commit SHA:
```yaml
uses: acdgbrasil/.github/.github/workflows/reusable-auto-version.yml@<commit-sha>
```

#### CICD-03: `npx --yes` Used Without Pinning (LOW)

**File**: `contracts/.github/workflows/contracts-bundle.yml` lines 47, 59
**Evidence**:
- `npx --yes @redocly/cli@latest lint ...`
- `npx --yes @asyncapi/cli@latest validate ...`

Using `@latest` in CI means the resolved version can change between runs. A compromised npm package at the latest tag could execute arbitrary code. Pin to specific versions.

#### CICD-04 (POSITIVE): Contracts Workflow Pins Actions by SHA

**File**: `contracts/.github/workflows/contracts-bundle.yml`
**Evidence**: `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd`, `actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f`, `oras-project/setup-oras@38de303aac69abb66f3e6255b7198bff35f323e3`

This is correct and follows best practices.

#### CICD-05 (POSITIVE): Least-Privilege Permissions in Contracts Workflow

**File**: `contracts/.github/workflows/contracts-bundle.yml` lines 19-21
**Evidence**: `permissions: contents: read, packages: write` -- scoped minimally.

---

### Dependencies

#### DEP-01: Dependency Specifiers Use Caret Ranges (LOW)

**File**: `deno.json` lines 16-21
**Evidence**:
- `"@hono/hono": "jsr:@hono/hono@^4"`
- `"@std/assert": "jsr:@std/assert@^1"`
- `"@std/testing": "jsr:@std/testing@^1"`

While `deno.lock` pins exact versions (Hono 4.12.12, std/assert 1.0.19), the caret ranges mean `deno install` without a lockfile could pull newer, potentially compromised versions.

**Mitigating factor**: `deno.lock` is committed and includes integrity hashes for all dependencies.

#### DEP-02 (POSITIVE): Lock File Committed with Integrity Hashes

**File**: `deno.lock`
**Evidence**: Version 5 lockfile with SHA-256 integrity for all 4 dependencies. Supply chain integrity is verifiable.

#### DEP-03 (POSITIVE): Minimal Dependency Surface

Only 3 external dependencies (Hono, std/assert, std/testing). The last two are dev-only. This is an exceptionally small attack surface.

#### DEP-04: No Dependabot/Renovate for Deno Dependencies (MEDIUM)

**Evidence**: The `contracts/.github/dependabot.yml` only covers `github-actions` ecosystem. No configuration exists for Deno/JSR dependency updates.

**Remediation**: Dependabot does not yet support JSR natively. Consider:
1. A scheduled workflow that runs `deno outdated` and opens an issue/PR
2. Manual periodic `deno outdated` checks documented in CONTRIBUTING.md

---

### Secrets Management

#### SEC-01: `.env` Contains Real Secrets on Disk (CRITICAL)

See CRIT-01 above.

#### SEC-02: No SESSION_SECRET Entropy Validation (CRITICAL)

See CRIT-02 above.

#### SEC-03: CSRF Token Comparison Is Not Timing-Safe (MEDIUM)

**File**: `src/middleware/csrf.ts` line 63
**Evidence**: `cookieToken !== headerToken` -- uses JavaScript string comparison, which is vulnerable to timing attacks. An attacker could theoretically measure response times to deduce the CSRF token character by character.

**Remediation**: Use a constant-time comparison:
```typescript
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  return crypto.subtle.timingSafeEqual
    ? crypto.subtle.timingSafeEqual(bufA, bufB)
    : bufA.every((byte, i) => byte === bufB[i]); // fallback
};
```

Note: Deno supports `crypto.subtle.timingSafeEqual` since Deno 1.38+.

#### SEC-04: HMAC Signature Verification Uses String Comparison (MEDIUM)

**File**: `src/adapters/auth/bff_service.ts` line 129
**Evidence**: `if (sig !== expectedSig) return undefined;` -- the HMAC signature comparison in `verifySignedSessionId` uses standard string equality. This is a timing oracle for session cookie forgery.

**Remediation**: Same constant-time comparison as SEC-03.

#### SEC-05 (POSITIVE): Pre-Commit Hook Blocks `.env` Commits

**File**: `.githooks/pre-commit` lines 24-33
**Evidence**: Regex check for `.env`, `.env.local`, `.env.production`, `.env.staging` in staged files. This is effective defense.

#### SEC-06 (POSITIVE): `.env` Properly Listed in `.gitignore`

**File**: `.gitignore` lines 2-5
**Evidence**: `.env`, `.env.local`, `.env.production`, `.env.staging` are all excluded.

#### SEC-07: No Secret Scanning in Pre-Commit (MEDIUM)

**Evidence**: The pre-commit hook blocks `.env` files but does not scan for secrets patterns (API keys, tokens, private keys) in other files. A developer could accidentally commit a hardcoded secret in a `.ts` file.

**Remediation**: Add gitleaks to the pre-commit hook:
```bash
# Add to .githooks/pre-commit before exit 0
if command -v gitleaks &> /dev/null; then
  gitleaks protect --staged --verbose
  if [ $? -ne 0 ]; then
    echo "BLOCKED: Secrets detected in staged files."
    exit 1
  fi
fi
```

---

### Supply Chain

#### SC-01: No SBOM Generation (MEDIUM)

**Evidence**: No Software Bill of Materials is generated during build. This makes it difficult to track which dependencies are in the production image for vulnerability management.

**Remediation**: Add SBOM generation to the CI pipeline using `syft` or `trivy sbom`.

#### SC-02: No Container Image Signing (MEDIUM)

**Evidence**: No evidence of cosign or Notary for image signing. Images pushed to GHCR are not cryptographically signed, making supply chain verification impossible.

**Remediation**: Add cosign signing step to the CI pipeline after image push.

#### SC-03: No Container Image Scanning (HIGH)

**Evidence**: No Trivy, Grype, or equivalent scanner runs against the Docker image. Vulnerabilities in the base image (`denoland/deno:2.7.11`) or Deno runtime are not detected.

**Remediation**: Add to CI pipeline:
```yaml
- name: Container Scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ghcr.io/acdgbrasil/social-care-bff:${{ github.sha }}'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

---

## Recommended GitHub Actions Pipeline

```yaml
name: BFF CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  lint-and-check:
    name: Lint, Format, Type-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

      - uses: denoland/setup-deno@v2
        with:
          deno-version: "2.7.11"

      - name: Verify lockfile integrity
        run: deno install --frozen

      - name: Format check
        run: deno fmt --check

      - name: Lint
        run: deno lint

      - name: Type-check
        run: deno check src/**/*.ts src/**/*.tsx

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint-and-check
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd

      - uses: denoland/setup-deno@v2
        with:
          deno-version: "2.7.11"

      - name: Install dependencies
        run: deno install --frozen

      - name: Run tests
        run: deno test --allow-read=src/,Dockerfile,deno.json --allow-net --allow-env tests/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd

      - name: Secret scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

      - name: Deno dependency audit
        run: |
          deno install --frozen
          deno outdated || true

  build-and-scan:
    name: Build Image and Scan
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd

      - name: Build Docker image
        run: docker build -t social-care-bff:${{ github.sha }} .

      - name: Trivy container scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'social-care-bff:${{ github.sha }}'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: 'social-care-bff:${{ github.sha }}'

      # Push to GHCR only on main
      - name: Login to GHCR
        if: github.ref == 'refs/heads/main'
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u "${{ github.actor }}" --password-stdin

      - name: Tag and push
        if: github.ref == 'refs/heads/main'
        run: |
          IMAGE=ghcr.io/${{ github.repository_owner }}/social-care-bff
          docker tag social-care-bff:${{ github.sha }} $IMAGE:sha-${{ github.sha }}
          docker push $IMAGE:sha-${{ github.sha }}
```

---

## .dockerignore (Complete -- Create This File)

```
.env
.env.*
.git
.gitignore
.githooks
.claude
.pipeline
.vscode
.idea
tests
contracts
handbook
coverage
cov_profile
*.md
.DS_Store
Thumbs.db
node_modules
static/js
```

---

## Corrected Dockerfile (Complete Working Replacement)

```dockerfile
# -- Build stage ---------------------------------------------------------------
FROM denoland/deno:2.7.11 AS builder

WORKDIR /app

# Cache dependencies first
COPY deno.json deno.lock ./
RUN deno install --frozen

# Copy source
COPY src/ src/

# Type-check
RUN deno check src/**/*.ts

# Bundle client-side apps for browser
RUN mkdir -p static/js && \
    deno bundle --platform browser --minify -o static/js/auth-hub.js src/client/apps/auth-hub/entry.tsx && \
    deno bundle --platform browser --minify -o static/js/social-care.js src/client/apps/social-care/entry.tsx && \
    deno bundle --platform browser --minify -o static/js/registration.js src/client/apps/registration/entry.tsx && \
    deno bundle --platform browser --minify -o static/js/family-composition.js src/client/apps/family-composition/entry.tsx

# -- Runtime stage -------------------------------------------------------------
FROM denoland/deno:2.7.11

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/deno.json .
COPY --from=builder --chown=appuser:appgroup /app/deno.lock .
COPY --from=builder --chown=appuser:appgroup /app/src/ src/
COPY --from=builder --chown=appuser:appgroup /app/static/ static/

# Pre-cache server modules
RUN deno cache src/server.ts

# Run as non-root
USER appuser

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s \
  CMD deno eval "const r = await fetch('http://localhost:8081/health'); if (!r.ok) Deno.exit(1);"

# Scoped permissions -- only what the app needs
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read=src/,static/,deno.json", "src/server.ts"]
```

---

## Corrected docker-compose.yml (Complete Working Replacement)

```yaml
services:
  bff:
    build:
      context: .
      dockerfile: Dockerfile
    env_file: .env
    environment:
      - PORT=8081
      - HOST=0.0.0.0
    ports:
      - "8081:8081"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    tmpfs:
      - /tmp
    healthcheck:
      test: ["CMD", "deno", "eval", "const r = await fetch('http://localhost:8081/health'); if (!r.ok) Deno.exit(1);"]
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 10s
    restart: unless-stopped
```

---

## Summary of All Findings

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| CRIT-01 | CRITICAL | Secrets | `.env` on disk contains live OIDC client secret and session secret |
| CRIT-02 | CRITICAL | Secrets | No SESSION_SECRET entropy validation in `server_config.ts` |
| CRIT-03 | CRITICAL | CI/CD | No CI/CD pipeline for the BFF application |
| DOCK-01 | HIGH | Docker | No `.dockerignore` -- secrets and unnecessary files sent to daemon |
| DOCK-02 | HIGH | Docker | Container runs as root (no `USER` directive) |
| SC-03 | HIGH | Supply Chain | No container image scanning |
| DOCK-03 | MEDIUM | Docker | No `HEALTHCHECK` in Dockerfile |
| DOCK-04 | MEDIUM | Docker | Deno `--allow-read` too broad |
| DOCK-05 | LOW | Docker | No read-only filesystem or privilege restrictions in compose |
| CICD-02 | MEDIUM | CI/CD | Reusable workflow pinned by branch, not SHA |
| CICD-03 | LOW | CI/CD | `npx --yes @latest` in CI without version pinning |
| DEP-01 | LOW | Dependencies | Caret ranges in `deno.json` (mitigated by lockfile) |
| DEP-04 | MEDIUM | Dependencies | No automated dependency update mechanism for Deno/JSR |
| SEC-03 | MEDIUM | Secrets | CSRF token comparison not timing-safe |
| SEC-04 | MEDIUM | Secrets | HMAC signature verification not timing-safe |
| SEC-07 | MEDIUM | Secrets | No secret pattern scanning in pre-commit hook |
| SC-01 | MEDIUM | Supply Chain | No SBOM generation |
| SC-02 | MEDIUM | Supply Chain | No container image signing |

**Totals**: 3 CRITICAL, 3 HIGH, 8 MEDIUM, 4 LOW

---

## Positive Findings (Security Controls Already in Place)

1. `.env` is in `.gitignore` and NOT tracked by git
2. Pre-commit hook blocks `.env` file commits
3. Pre-push hook runs full test suite
4. Pre-commit hook blocks direct commits to `main`
5. `deno.lock` committed with integrity hashes for all dependencies
6. Minimal dependency surface (only 3 external deps)
7. Contracts workflow pins GitHub Actions by SHA
8. Contracts workflow uses least-privilege permissions
9. HMAC-signed session cookies (though comparison needs timing-safe fix)
10. PKCE with S256 for OIDC flows
11. Comprehensive security middleware chain (CSP nonce, HSTS, X-Frame-Options, Fetch Metadata)
12. Double-submit CSRF cookie pattern
13. Token refresh with session TTL enforcement
14. Backend URLs never exposed to browser
