# CLAUDE.md — app-conecta-web

App único do ecossistema Conecta Raros: front + **BFF**. Navegação por papel, mobile-first.
O BFF cobre os 3 microserviços (`svc-people-context`, `svc-social-care`, `svc-analysis-bi`)
em ~55 rotas — o client nunca fala direto com serviço.

## Comandos

```bash
bun run dev          # vinxi dev
bun run build        # vinxi build
bun run start        # bun .output/server/index.mjs (produção)
bun run typecheck    # tsc --noEmit
bun test             # bun:test
bun run fonts:fetch  # baixa as fontes locais
```

## Stack

SolidStart (Vinxi · Nitro preset `bun`) + **Elysia** como BFF em `routes/api/[...path].ts`
+ Eden Treaty (client tipado) + jose (OIDC) + TypeBox (`Elysia.t`) + vanilla-extract.

**Regra-mãe: Bun-native / zero-npm-utility.** Antes de adicionar dependência, verifique se
Bun ou a stdlib já resolve. Utilitário de terceiros para o que Bun faz nativamente é rejeitado
em review.

## O BFF é uma facade view-ready (ADR-0010)

Esta é a decisão que governa o repo: **o servidor devolve dado pronto para a tela**, o client
só renderiza. Isso significa, no BFF e não no client:

- fan-out cross-service e merge dos agregados
- resolução de código → rótulo (selects de domínio)
- cálculo de quais ações/transições estão disponíveis
- degradação parcial quando um serviço upstream falha

Toda mutação devolve o agregado recomposto, para o client trocar estado sem refetch. Quando
uma rota não recompõe, ela revalida.

Superfície completa das rotas: `handbook/bff-backend-surface.md`.

**Guarda obrigatória**: rotas que falam com `svc-analysis-bi` validam `iss`/`aud` e a role
(`analyst`/`exporter`) **antes** de encaminhar — o backend pode rodar sem auth. Ver skill
`bff-guard-analysis-bi`.

Receitas: skills `bff-add-endpoint` (novo endpoint) e `bff-compose-view` (composição multi-origem).

## Identidade visual

`handbook/brand-identity.md` — marca Raros Boa Vista: roxo `#703cc0` + gradiente.
**Fonte = Atkinson** em todo o app (Poppins é só do site institucional).
Design system de referência em `handbook/doc/design-reference/` (tokens, guidelines, componentes).

## Convenções

- Testes em `bun:test`.
- Governança e ADRs em `handbook/adr/` — decisão estrutural exige ADR.
- Commits: Conventional Commits.
- Auth: o BFF encaminha `Authorization: Bearer <jwt>` aos serviços; não há header
  customizado de identidade de ator (ADR-023).
