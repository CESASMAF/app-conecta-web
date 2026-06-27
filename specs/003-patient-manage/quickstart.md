# Quickstart — Validação da feature 003-patient-manage

Guia executável para validar a feature de **escrita** do setor Pacientes. Pré-requisito: features 001 e 002 concluídas (sessão + lista + cache de domínio).

## Pré-requisitos

```bash
bun install
# Envs (dummy em DEV/teste já em tests/setup/env.ts):
#   SOCIAL_CARE_URL  — base do social-care (ou do stub)
#   + envs OIDC da 001 (OIDC_*, SESSION_SECRET via _FILE)
```

## Desenvolvimento contra o stub (backends não sobem — Princ. VI)

```bash
# 1) Suba o stub do social-care (estendido com as 9 mutações)
STUB_PORT=4001 bun tests/support/social-care-stub.ts &

# 2) Aponte o BFF ao stub e rode o dev
SOCIAL_CARE_URL=http://localhost:4001 bun run dev
```

## Smoke tests (após login, com cookie de sessão válido)

```bash
# US1 — cadastro: corpo inválido é barrado no BFF SEM tocar o upstream (SC-002)
curl -i -X POST localhost:3000/api/patients \
  -H 'x-requested-with: XMLHttpRequest' -H 'content-type: application/json' \
  -b "$COOKIE" -d '{"personId":"","initialDiagnoses":[]}'        # -> 400 (validação), upstream intacto

# US1 — cadastro válido -> 201 {data:{id}} e paciente em WAITLISTED
curl -i -X POST localhost:3000/api/patients \
  -H 'x-requested-with: XMLHttpRequest' -H 'content-type: application/json' \
  -b "$COOKIE" -d @fixtures/patient-create.json               # -> 201

# CSRF — mutação sem X-Requested-With -> 403 (sem tocar upstream)
curl -i -X POST localhost:3000/api/patients/<id>/admit -b "$COOKIE"   # -> 403

# US2 — transição inválida tratada graciosamente (ex.: admitir um ACTIVE) -> 409 conflict
curl -i -X POST localhost:3000/api/patients/<id-ativo>/admit \
  -H 'x-requested-with: XMLHttpRequest' -b "$COOKIE"          # -> 409 (já em atendimento)

# Sem sessão -> 401 e NENHUM Bearer ao upstream
curl -i -X POST localhost:3000/api/patients/<id>/admit \
  -H 'x-requested-with: XMLHttpRequest'                        # -> 401
```

## Mapeamento Smoke → Success Criteria

- **SC-002** — corpo inválido barrado no BFF (upstream não recebe).
- **SC-005** — sem papel/sessão → negação clara (401/403), nunca dado.
- **SC-006** — `Authorization: Bearer` só outbound; **nenhum** header de ator; sem token/URL/PII no que volta ao browser.
- **SC-007** — clique repetido não duplica (ação desabilitada durante envio — `useSubmission`).
- **SC-003** — só a transição cabível é oferecida; inválida → 409 sem mudar estado.

## Gates (Definition of Done)

```bash
bunx tsc --noEmit                 # type-safety ponta a ponta (Princ. V)
bun test                          # governance + contract (BFF vs stub) + ViewModel + security
bun audit --audit-level=high      # supply-chain (ADR-0003)
bun run build                     # Nitro preset bun → .output/server/index.mjs

# Leak/LGPD (SC-006): nenhum segredo/PII no bundle do browser
grep -riE 'bearer|accessToken|SOCIAL_CARE_URL|x-actor-id|jose' .output/public && echo FALHOU || echo OK
```

## Aceite end-to-end (DEV, contra o social-care real)

Os Gherkin de cadastro/ciclo-de-vida/família passando contra o serviço encerram o incremento. **Pré-condição** (research D9): correção dos bugs de contrato conhecidos no `social-care` (header de ator em GET, serialização do relay de Outbox, decode de evento) — sem eles, o caminho real `criar → evento` não fecha, embora o frontend esteja correto contra o stub.
