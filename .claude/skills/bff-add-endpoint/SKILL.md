---
name: "bff-add-endpoint"
description: "Receita canônica para adicionar um endpoint ao BFF do web_02 como facade view-ready (ADR-0010). Use ao cobrir qualquer endpoint dos 3 serviços no server-side. Garante que o client receba dado pronto e fique só com a tela."
user-invocable: true
---

# Adicionar um endpoint ao BFF (facade view-ready)

Passo a passo para uma rota do BFF que entrega tudo pronto à tela. Fonte da superfície: `handbook/bff-backend-surface.md`. Regras: `handbook/adr/0010` + constituição.

## 0. Classifique o endpoint
- **Leitura de tela** → rota **screen-shaped** que compõe (use a skill `bff-compose-view`). Não exponha um proxy 1:1 se a tela mostra dados de mais de uma origem/agregado.
- **Escrita** → rota `*.service.fn.ts` que **devolve o view-state recomposto** (não `204`).
- **Leitura simples de catálogo/lista** → pode ser resource-shaped (como a 002).

## 1. Client method (adapter outbound) — `src/external/<svc>-client.ts`
- `fetch` nativo + `withTimeout` + `Result<T, AppError>`. Sem axios, sem dep nova.
- **Política de ator por-serviço** (crítico):
  - social-care → só `Authorization: Bearer`. **Nunca** header de ator.
  - people-context → `Bearer` + `X-Actor-Id` = `sub` validado (mutações).
  - analysis-bi → `Bearer` sempre (após a defesa iss/aud+role).
- Se o método/cliente não existir, peça ao agente `bff-foundation`.

## 2. Schema de entrada — TypeBox (`Elysia.t`)
- Valide corpo/params no BFF **antes** de tocar o upstream (entrada inválida → 400/422 sem consumir o backend).
- Replique as regras condicionais do backend (ex.: `notes` obrigatório se `reason='other'`; descrição exigida por tipo).

## 3. Rota Elysia — `src/server/routes/<nome>.{query|service}.fn.ts`
- `requireSession` (guard 001) → 401 se ausente. Mutação passa pelo CSRF guard (`X-Requested-With`) → 403.
- Orquestra: chama o client; em leitura de tela, compõe (skill `bff-compose-view`); em escrita, relê e recompõe o fragmento que a tela precisa.
- Resposta: criação → `201 {data: <overview>, meta}`; outras mutações → `200 {data: <view-state>, meta}`; leitura → `200 {data, meta}`.
- Registre em `src/server/app.ts` (grupo do serviço).

## 4. Mapa de erro
- Traduza `PREFIXO-NNN` do serviço → `AppErrorKind` em `src/shared/http/upstream-error.ts`. O client decide por **tag**, nunca por status. Preserve o `code` para observabilidade. (Falta um prefixo? Peça ao `bff-foundation`.)

## 5. Contract test (skill implícita do `bff-contract-tester`)
Cubra: caminho feliz + view-state (não-204); validação antes do upstream (0 chamadas ao stub); 401 sem sessão (sem Bearer); CSRF 403; política de ator correta; mapa de erro → tag; sem PII/segredo em log.

## 6. Gates (Definition of Done)
`bunx tsc --noEmit` · `bun test` · `bun audit --audit-level=high` · (se tocou bundle) `bun run build` + grep anti-leak em `.output/public`.

## Checklist final "client só tela"
- [ ] O client consegue renderizar a tela com **uma** chamada a esta `fn`, sem juntar nada nem resolver rótulos.
- [ ] Nenhum código de domínio cru onde a tela mostra texto.
- [ ] Mutação devolveu o novo estado (sem refetch no client).
