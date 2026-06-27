# Phase 1 — Quickstart: validar a Fundação (Acesso autenticado)

Guia **runnable** para provar a fatia ponta-a-ponta. Não contém implementação — só pré-requisitos,
comandos e resultados esperados. Detalhes em [plan.md](./plan.md) ·
[contracts/auth-bff.md](./contracts/auth-bff.md) · [data-model.md](./data-model.md).

## Pré-requisitos
- **Bun 1.4+** (`bun --version`).
- Um **IdP Authentik** acessível com um cliente OIDC registrado para este app (redirect URI
  `…/api/auth/callback`). Para smoke local sem IdP real, use envs dummy (valida boot/erros, não o
  callback completo).
- Segredos via padrão `_FILE` (ver abaixo).

## Setup
```bash
cd web_02
bun install                      # linker isolated + globalStore (bunfig.toml), trustedDependencies: ["esbuild"]
# segredos (exemplo local; em prod vêm de /run/secrets via Infisical/Vaultwarden):
printf '%s' "<client-secret>" > .secrets/oidc_client_secret
printf '%s' "$(openssl rand -hex 32)" > .secrets/session_secret
export OIDC_CLIENT_SECRET_FILE=.secrets/oidc_client_secret
export SESSION_SECRET_FILE=.secrets/session_secret
export AUTHENTIK_URL=https://auth.acdg-bv.org.br AUTHENTIK_APP_SLUG=acdg-web
export OIDC_CLIENT_ID=acdg-web
```

## Dev
```bash
bun run dev                      # Vinxi dev (SolidStart + Elysia montado); FOUC em dev é esperado (ADR-0007)
```

## Build de produção (runtime sem node_modules — ADR-0003)
```bash
bun run build                    # Nitro preset bun -> .output/server/index.mjs (deps empacotadas)
bun .output/server/index.mjs     # roda SEM node_modules
```

## Smoke tests (mapeados aos Success Criteria)
> `J` = jar de cookies; rode contra o server de produção com envs OIDC setadas.
```bash
# 1) health do BFF (Elysia vivo)
curl -s localhost:3000/api/health            # -> { ok:true, runtime:"bun", stack:"solidstart+elysia" }   [spike ✅]

# 2) /me sem sessão -> 401            (SC-003/contrato AUTH-001)
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/api/me      # -> 401   [spike ✅]

# 3) login -> 302 p/ o IdP com PKCE   (US1 / D3)
curl -s -i -c J localhost:3000/api/auth/login | grep -iE 'location:|set-cookie: pkce'
#   -> Location: https://auth…/authorize?…code_challenge=…&code_challenge_method=S256
#   -> Set-Cookie: pkce=…; HttpOnly; Secure; SameSite=Lax            [spike ✅]

# 4) CSRF: logout sem X-Requested-With -> 403; com -> 200   (FR/ADR-0005)
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/auth/logout                       # -> 403  [spike ✅]
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'X-Requested-With: fetch' localhost:3000/api/auth/logout  # -> 200  [spike ✅]

# 5) fail-fast de prod: sem as envs OIDC, o server NÃO sobe (500 no boot)    [spike ✅]
```

## Gate de segurança (SC-004) — nenhum token no browser
```bash
# o HTML/JS entregue NÃO pode conter token/Bearer/segredo/URL de backend:
curl -s localhost:3000/ | grep -iE 'bearer|accessToken|refreshToken|client_secret|AUTHENTIK_URL' && echo 'FALHOU' || echo 'OK (nada vazou)'
```

## Gates de qualidade (CI / local)
```bash
bunx tsc --noEmit                # type-safety ponta a ponta (Princ. V)
bun test                         # puro (bun:test) + DOM (happy-dom) + governance (boundaries, no-mocks)
bun audit --audit-level=high     # supply-chain (ADR-0003)
```

## O que ESTA fatia prova (Definition of Done de validação)
- US1: login OIDC+PKCE → shell autenticado (`/me` 200 com `userId`/`groups`).
- US2: área protegida sem sessão → redirect a login → retorna ao destino saneado.
- US3: logout revoga a sessão (reuso da sessão antiga → 401).
- US4: renovação invisível (single-flight) dentro do TTL; expirada → reautenticar.
- Gates: `tsc` limpo, `bun test` verde (incl. governance), SC-004 (nada vaza), prod fail-fast.

> Pendência (precisa de IdP real): callback completo code→token→sessão + `jwtVerify` do `id_token`.
> O resto foi validado no spike de 2026-06-12 (ver marcações `[spike ✅]`).
