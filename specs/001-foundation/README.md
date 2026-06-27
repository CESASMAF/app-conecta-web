# 001-foundation — Operação: segredos (`_FILE`) e runtime

Complemento operacional da feature. Spec/contratos em [spec.md](./spec.md) · [plan.md](./plan.md) ·
[quickstart.md](./quickstart.md). Esta página documenta **como os segredos chegam ao app** (T053) — o
contrato é o mesmo dos serviços de backend (`social-care`, `people-context`): padrão `_FILE` +
montagem em `/run/secrets`, alinhado à ADR-009 (infra) e ao ADR-0005 (sessão).

## Princípio: segredo nunca em env var crua (em prod)

O browser nunca vê segredo (BFF-boundary, Princ. I). E o **processo** também não recebe o valor do
segredo por variável de ambiente em produção — recebe o **caminho de um arquivo** que o contém. Quem
implementa: `readSecret()` em [`src/server/env.ts`](../../src/server/env.ts):

```ts
function readSecret(name: string): string | undefined {
  const filePath = process.env[`${name}_FILE`]      // 1) se <NAME>_FILE existe, lê o ARQUIVO
  if (filePath) return readFileSync(filePath, 'utf8').trim()
  return process.env[name]                            // 2) senão, cai no env cru (só dev/teste)
}
```

Regra de precedência: **`<NAME>_FILE` (arquivo) > `<NAME>` (env cru)**. Em produção o caminho `_FILE`
é o esperado; o env cru fica só para dev/smoke.

## Segredos desta fatia

| Segredo | Var de caminho (`_FILE`) | Origem em prod | O que é |
|---|---|---|---|
| `OIDC_CLIENT_SECRET` | `OIDC_CLIENT_SECRET_FILE` | `/run/secrets/oidc_client_secret` | client secret do app no Authentik (OIDC) |
| `SESSION_SECRET` | `SESSION_SECRET_FILE` | `/run/secrets/session_secret` | chave de assinatura do cookie de sessão opaco (ADR-0005) |

Não-segredos (env cru normal): `AUTHENTIK_URL`, `AUTHENTIK_APP_SLUG`, `OIDC_CLIENT_ID`, `REDIS_URL`,
`PUBLIC_BASE_URL`, `SOCIAL_CARE_URL` — ver [`.env.example`](../../.env.example).

## Fail-fast em produção

Com `NODE_ENV=production`, a ausência de qualquer segredo obrigatório faz o **boot abortar** (não sobe
servindo sem credencial). Em dev, `required()` devolve `''` para permitir smoke sem IdP real. Detalhe:
o Vite inlina `NODE_ENV=production` no bundle de prod, então `isProd` fica fixo — em prod os segredos
OIDC são realmente obrigatórios.

## Dev (Mac)

```bash
mkdir -p .secrets                                   # gitignored (ver .gitignore)
printf '%s' "<client-secret-do-authentik>" > .secrets/oidc_client_secret
printf '%s' "$(openssl rand -hex 32)"      > .secrets/session_secret
export OIDC_CLIENT_SECRET_FILE=.secrets/oidc_client_secret
export SESSION_SECRET_FILE=.secrets/session_secret
bun run dev
```

## Prod (VPS / Docker Compose — ADR-009)

Os segredos vêm do cofre (Infisical/Vaultwarden, ver `infra/platform/secrets-vault/`) e são montados
como **arquivos** em `/run/secrets/<name>` (chmod 600). Com Compose, via `secrets:`:

```yaml
services:
  web:
    image: ghcr.io/acdgbrasil/web-02:<tag>
    environment:
      OIDC_CLIENT_SECRET_FILE: /run/secrets/oidc_client_secret
      SESSION_SECRET_FILE: /run/secrets/session_secret
      AUTHENTIK_URL: https://auth.acdg-bv.org.br
      AUTHENTIK_APP_SLUG: acdg-web
      OIDC_CLIENT_ID: acdg-web
      PUBLIC_BASE_URL: https://app.acdg-bv.org.br
      REDIS_URL: redis://redis:6379
      SOCIAL_CARE_URL: http://social-care:8080
    secrets: [oidc_client_secret, session_secret]

secrets:
  oidc_client_secret: { file: ./secrets/oidc_client_secret }
  session_secret: { file: ./secrets/session_secret }
```

O contrato do app é só a **interface** (`/run/secrets/<name>`), não a implementação do cofre — cada
instância da federação pode trocar Infisical por SOPS/etc. sem tocar no código (ver memória de
governança de secrets).
