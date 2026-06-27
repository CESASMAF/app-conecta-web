[← Voltar para ADRs](./README.md)

# ADR-0001: Arquitetura vertical-modular (modules/shared/external + public-api)

- **Status:** Accepted — layout interno do módulo **refinado por [ADR-0004](./0004-client-server-split-mvvm-ddd.md)** (split client/server)
- **Date:** 2026-05-29 · **Atualizado:** 2026-06-12 (stack web_02: SolidStart + Elysia + Bun; regra Bun-native)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

O `handbook/arquiteture.md` descrevia uma estrutura `features/` + `lib/` + `server/` +
`components/ui/`. Ao iniciar o web_02 do zero, surgiu a pergunta: **qual layout de pastas adotar?**

Restrições/forças:
- O backend `core-api` é um **modular monolith** (ADR-0006 do core-api): `src/modules/<m>/` com
  `domain/application/adapters/public-api/`, `shared/` e cross-módulo **só via `public-api`**.
- Times com **agentes de IA** vão mexer no código — previsibilidade e fronteiras explícitas reduzem erro.
- Desejo de **paridade de mental model** front↔back (mesmo vocabulário, mesma forma de isolar módulos).
- **SolidStart** não impõe layout além de `src/routes/` (file-based router do `@solidjs/router`); o BFF
  **Elysia** entra como catch-all em `src/routes/api/[...path].ts` (composition root, fora da matriz de camadas).

## Decisão

Adotar **arquitetura vertical-modular espelhando o core-api**:

```
src/modules/<módulo>/{domain, application, adapters, ui, public-api}
src/shared/   (cross-cutting PURO: primitives, http, ports, utils, ui)
src/external/ (adapters de I/O real + segredos: core-api client, config, session)
```

- Cada módulo expõe um **`public-api/`** — único ponto pelo qual outro módulo o importa.
- Fronteiras **enforçadas por governance test em `bun:test`** (não há `eslint-plugin-boundaries`; a regra
  Bun-native troca o plugin npm por um teste que varre `src/` — ver [ADR-0011](./0011-no-mocks-in-production.md)
  para o mesmo padrão): `domain` puro; `external` nunca importa módulos; um módulo nunca importa internals
  de outro (só `public-api`/`shared`/`external`). Violação = teste **vermelho** em `bun test`.
- Materializado na **constituição** (§III + §"Technology Constraints") e no harness de testes de arquitetura.

## Consequências

**Positivas**
- Cada módulo é extraível/testável isoladamente; acoplamento entre módulos não apodrece silenciosamente.
- Mesmo contrato do backend → menos carga cognitiva para quem transita front↔back.
- Agentes de IA têm fronteiras verificáveis (o `bun test` reprova violação, não é convenção opcional).
- Enforcement **sem dependência npm** (sem plugin ESLint): o próprio runtime de teste do Bun garante.

**Negativas / custos**
- Mais cerimônia (cada módulo tem `public-api`); diverge do exemplo "cru" do SolidStart.
- Diverge do `handbook/arquiteture.md` original — exigiu nota de divergência (feita).
- Governance test de boundaries é código a manter (vs regra declarativa de lint) — aceito pela regra Bun-native.

**Neutras**
- `routes/` (inclui `routes/api/[...path].ts` = mount do Elysia), `app.tsx`, `entry-*.tsx`, `app.config.ts`
  ficam **fora** da matriz de camadas (composition root / framework glue).

## Alternativas consideradas

- **Manter `features/lib/server` do handbook** — rejeitada: perde a paridade com o core-api e o
  conceito de `public-api`/`external` que o P.O. quis como padrão de isolamento.
- **Layout "cru" do SolidStart** (tudo em `routes/` + libs soltas) — rejeitada: sem fronteiras,
  não serve a um ERP multi-módulo com vários autores/agentes.
- **`eslint-plugin-boundaries`** (como no web/React) — rejeitada pela regra **Bun-native/zero-npm**:
  substituído por governance test em `bun:test`.

## Referências

- `.specify/memory/constitution.md` §III e §"Technology Constraints & Stack"
- `tests/architecture/boundaries.test.ts` (governance test — substitui o `eslint-plugin-boundaries`)
- `core-api/handbook/architecture/adr/0006-modular-monolith-core-api.md` (modelo)
- `handbook/arquiteture.md` (nota de divergência no topo de "Estrutura de pastas")
- [ADR-0011](./0011-no-mocks-in-production.md) — mesmo padrão de enforcement por governance test (Bun-native).
