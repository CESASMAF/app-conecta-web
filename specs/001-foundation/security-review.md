# Security Review — Fundação (Acesso autenticado)

**Data**: 2026-06-12 · **Escopo**: server-side / BFF de auth do `001-foundation` (`src/server`, `src/external`, `src/modules/auth/server`, `src/shared/http`, `src/middleware.ts`) · **Status**: ✅ **resolvido** (todos os achados corrigidos e validados)

> Registro da passada de segurança sobre o BFF: (1) suíte de **ataques OWASP Top 10 2025**, (2)
> **`bun audit`** (supply chain), (3) **revisão adversarial** (`/security-review`). Cada item aponta o
> teste/arquivo. Gates finais: `bun test` **60 pass / 0 fail** · `bunx tsc --noEmit` **0** ·
> `bun run build` **OK** · `bun audit` **No vulnerabilities** · smoke HTTP de produção verde.

---

## 1. OWASP Top 10 **2025** — ataques testados (todos bloqueados)

Suíte: [`tests/security/owasp.test.ts`](../../tests/security/owasp.test.ts) (27 testes).

| Categoria 2025 | Ataque tentado | Mitigação | Resultado |
|----------------|----------------|-----------|-----------|
| **A01** Broken Access Control | acesso sem sessão · sessionId forjado · CSRF · open-redirect | guard 401 · UUID opaco server-validado · CSRF · `safe-redirect` | ✅ |
| **A02** Security Misconfiguration | erro vaza stack/path? · 404 vaza internals? | envelope `{ error: { code } }` genérico · `bun:test` | ✅ |
| **A03** Software Supply Chain | deps vulneráveis | `bun audit` + override h3 + `trustedDependencies` | ✅ |
| **A04** Cryptographic Failures | token vaza ao browser? · cookies · S256 · entropia | tudo server-only · `__Host-`/HttpOnly/Secure/SameSite · PKCE S256 · UUID | ✅ |
| **A05** Injection | CRLF/response-splitting · cookie malformado | `safe-redirect` (control chars) · fail-closed | ✅ |
| **A07** Identification & Auth Failures | fixação de sessão · `state` · enumeração · logout | sessionId novo/login · OIDC state+nonce · msg genérica · revogação | ✅ |
| **A08** Integrity Failures | cookie pkce adulterado · sessão forjada | assinatura HMAC do `pkce` · UUID server-validado | ✅ |
| **A09** Logging & Alerting | correlação de incidente | `requestId` + `X-Request-Id` + log estruturado | ✅ |
| **A10** Mishandling of Exceptional Conditions *(novo)* | fail-open? · input malformado → crash? | **fail-closed** (erro IdP→502, sem sessão) · 4xx (não 5xx) | ✅ |
| **Clássicos** | clickjacking · MIME sniffing · HSTS | `frame-ancestors 'none'`+DENY · nosniff · HSTS trust-proxy | ✅ |

---

## 2. Supply chain (`bun audit`) — **A03**

Achado inicial: **8 vulnerabilidades** (1 critical, 4 high, 3 moderate).

| Pacote | Severidade | Natureza | Resolução |
|--------|-----------|----------|-----------|
| `happy-dom <20` | critical (VM escape→RCE) + 2 high | **devDependency** (testes de DOM; nunca em prod) | → `@happy-dom/global-registrator@^20.0.0` |
| `h3 <1.15.6` | high (HTTP Request Smuggling TE.TE) + path traversal | **transitivo** `vinxi→unstorage→h3` (caminho de prod) | → `overrides: { "h3": "^1.15.6" }` |

**Resultado:** `bun audit` → **No vulnerabilities found**.

---

## 3. Revisão adversarial (`/security-review`) — achados e resoluções

Suíte de regressão: [`tests/security/hardening.test.ts`](../../tests/security/hardening.test.ts) + [`tests/modules/auth/guard.test.ts`](../../tests/modules/auth/guard.test.ts).

| ID | Sev | Achado | Resolução | Teste |
|----|-----|--------|-----------|-------|
| **M1** | Médio | `lastSeenAt` só atualizava no refresh → **usuário ATIVO deslogado aos 30 min** (inatividade < access TTL) | janela de inatividade **deslizante** (`touchActivity`, throttle 60 s) | `guard.test.ts` |
| **L1** | Baixo | logout não revogava o refresh no IdP (defesa-em-profundidade) | **revogação back-channel** (`revokeToken` → `/o/revoke/`, RFC 7009, best-effort) | `hardening.test.ts` |
| **L2** | Baixo | `requestId` sempre vazio; sem log de eventos de auth | `requestId` UUID + header `X-Request-Id` + **log estruturado** (`src/shared/log.ts`) | `hardening.test.ts` |
| **L3** | Baixo | CSRF sem checagem de `Origin` | **allowlist de `Origin`** nas mutações (além de `X-Requested-With` + `SameSite=Strict`) | `hardening.test.ts` |
| **L4** | Baixo | `/api/health` expunha `runtime/stack` (fingerprint) | **minimal em prod** (`{ ok: true }`) | smoke prod |
| **L5** | Baixo | CSP `style-src 'unsafe-inline'` sempre ligado | **`style-src 'self'` em prod** (CSS estático do vanilla-extract) | `hardening.test.ts` + smoke prod |
| **L6** | Baixo | single-flight sem timeout (refresh travado vaza entrada) | **`withTimeout` (10 s)** no refresh (`src/shared/with-timeout.ts`) | `hardening.test.ts` |

---

## 4. CSP final (produção) — estrita, **zero `unsafe-inline`**

```
default-src 'self'; script-src 'self' 'nonce-<per-request>' 'strict-dynamic'; style-src 'self';
img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self' blob:;
frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```
nonce per-request (Web Crypto) injetado nos scripts de hidratação do Solid via `entry-server.tsx`;
`serialization: { mode: 'json' }` evita `unsafe-eval`. Ver [ADR-0006](../../handbook/adr/0006-security-headers-csp.md).

---

## 5. Notas honestas (delegado / pendente — **não** são furos)

- **A06 Insecure Design** e **A09 audit "rico"**: o audit trail clínico e o monitoramento são
  **centralizados no `social-care`** (ADR-008). Aqui há telemetria de acesso (logAuthEvent) + `requestId`.
- **Verificação de assinatura do `id_token`** (`jose`/JWKS): testada com fake; a verificação real exige o
  **Authentik** rodando (o `OidcClient` de produção faz `jwtVerify`).
- **Rate-limiting / brute-force**: delegado ao **IdP (Authentik)** + borda (**Caddy**).

---

## 6. Referências
- Testes: `tests/security/owasp.test.ts` · `tests/security/hardening.test.ts` · `tests/modules/auth/*`
- ADRs: [0005](../../handbook/adr/0005-auth-session-refresh-decisions.md) (auth) · [0006](../../handbook/adr/0006-security-headers-csp.md) (headers/CSP) · [0002](../../handbook/adr/0002-errors-as-values.md) · [0003](../../handbook/adr/0003-bun-supply-chain.md) (supply chain)
- OWASP Top 10 2025: https://owasp.org/Top10/2025/
