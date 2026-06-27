[← Voltar para ADRs](./README.md)

# ADR-0010: BFF Elysia orquestrador — uma `fn` completa por caso de uso; client não compõe; `*.query.fn` / `*.service.fn`

- **Status:** Accepted
- **Date:** 2026-06-06 · **Atualizado:** 2026-06-12 (fronteira = rota Elysia via Eden; server-state em Solid)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

O [ADR-0004](./0004-client-server-split-mvvm-ddd.md) fixou o split client × server e definiu a **borda BFF
como a única fronteira** entre os dois. O [ADR-0009](./0009-framework-agnostic-client.md) levou o client ao
mínimo: `data → view-model → ui`, núcleo puro. Faltava um princípio explícito sobre **de quem é a obrigação
de orquestrar múltiplas origens de dados**.

No web_02 o BFF é o **Elysia** (montado em `routes/api/[...path].ts`), consumido pelo client via **Eden
treaty** (type-safe; no SSR, isomorphic). O backend não é um só: o BFF fala com `social-care`,
`people-context`, `analysis-bi` (e/ou `core-api`) — recursos **separados**. Duas tensões apareceram:

1. **Quem junta as peças?** Uma tela que precisa de dados de 3 serviços não pode fazer o fan-out no client
   — ele passaria a conhecer a topologia do backend e a montar dados (viola ADR-0004/0009).
2. **A `fn` devolve OK ou devolve estado?** Uma ação como `reactivate` poderia devolver só `{ ok: true }`,
   forçando o client a refazer um GET. Isso empurra orquestração para a UI.

## Decisão

**O BFF Elysia é o guardião e o orquestrador. O client só consome `fn`s completas (via Eden) e gerencia
estado de UI.**

1. **O client nunca compõe, agrega, faz fan-out, nem conhece a topologia de backends.** Ele consome uma
   `fn` por caso de uso (uma rota Elysia, via Eden) e cuida só de estado: **server-state no `createAsync`
   do Solid** (cache/dedup do `@solidjs/router`), UI-state em signal/store/reducer. Nada de "buscar A, depois
   B, e juntar na tela".

2. **O BFF orquestra e conta a história completa.** Uma rota Elysia específica por necessidade de tela faz o
   fan-out para N serviços, mescla, normaliza (TypeBox no schema de saída) e devolve **uma resposta simples e
   completa**. Erros continuam sendo valores (`Result`, [ADR-0002](./0002-errors-as-values.md)); operações
   sem rota no backend retornam `'not-implemented'` ([ADR-0011](./0011-no-mocks-in-production.md)), nunca mock.

   ```
   [social-care | people-context | analysis-bi | … svc n]
           ↓  (BFF Elysia: fan-out · merge · normaliza · monta a história)
      *.query.fn / *.service.fn   ← rota Elysia simples e completa, por caso de uso
           ↓  (Eden treaty — type-safe; isomorphic no SSR)
      [client Solid: só consome + estado de UI (createAsync)]
   ```

3. **Comandos devolvem o estado resultante, não só `ok`.** Uma `fn` de escrita (ex.: `reactivate`) retorna
   o agregado já atualizado, para o client apenas trocar o cache — sem refetch manual.

4. **Nomenclatura por intenção** — o módulo de rota declara se lê ou se age:
   - **`*.query.fn.ts`** — leitura (sem efeito; tipicamente `GET`). Ex.: `get-contract.query.fn.ts`.
   - **`*.service.fn.ts`** — comando/escrita ou orquestração com efeito. Ex.: `create-contract.service.fn.ts`.

   Cada arquivo registra um handler na app Elysia (agrupado por `group`/plugin do módulo). As fronteiras de
   import (boundaries) continuam por **pasta** (`server/adapters`), então o sufixo é semântica + governance
   test de `throw` na borda (`bun:test`).

## Consequências

**Positivas**
- Client trivial: "view burra" ([ADR-0004](./0004-client-server-split-mvvm-ddd.md)) ganha um irmão no
  server — "client não orquestra".
- Multi-serviço fica natural: somar um backend é mudar **uma** rota Elysia, sem tocar no client.
- O nome do arquivo revela a intenção (leitura vs efeito) sem abrir o conteúdo.
- **Eden** propaga o tipo da resposta composta ao client (type-safety ponta-a-ponta) — sem redeclarar Model.

**Negativas / custos**
- O BFF concentra complexidade de orquestração — precisa de teste de composição/erro parcial (`bun:test`).
- Renomeação/registro dos handlers por intenção (`.query.fn`/`.service.fn`) e agrupamento na app Elysia.

**Neutras**
- `auth/` pode manter handlers já existentes durante a transição; o governance test aceita os sufixos.

## Adendo — quando o backend ganha um agregador

Se um serviço passa a expor um endpoint agregador (ex.: `GET /partners` unificado), o BFF **deixa de fazer
o fan-out** e faz **uma única chamada** ao agregador. **A decisão central não muda:** o BFF continua sendo o
orquestrador e o client continua sem conhecer a topologia (consome a mesma `fn`, mesmo contrato Eden). O que
muda é apenas **onde** a composição acontece (BFF vs serviço). O princípio "o client nunca compõe/agrega"
segue valendo.

## Amendamento (2026-06-12) — realização na feature 002 (navegação de pacientes)

Primeiro consumo real de um backend (`social-care`) materializou o padrão de orquestração:

1. **Adapter outbound** `src/external/social-care-client.ts` — porta `SocialCareClient` + impl `fetch`
   nativo (Princ. IV; sem axios), Bearer do `session.accessToken`, timeout (`withTimeout`), **erros como
   valor** (`Result<T, AppError>` via `toUpstreamError`). `baseUrl` injetável → testável. Composto em
   `AppDeps` e fakeado nos contract tests. Os 5xx do `social-care` mapeiam para `dependencyUnavailable`
   (distinto de `idpUnavailable`).
2. **Transporte SSR client↔BFF = server function** (`modules/<f>/server/*.fn.ts`, `"use server"`) que chama
   a rota Elysia via **`app.handle('/api/...', {cookie})`** — exatamente o "**glue de SSR pontual**" já
   previsto neste ADR. Mantém `~/server/app` fora do bundle do browser (Princ. I), sem hop HTTP nem
   cookie-forward manual, espelhando o `getCurrentUserFn` da feature 001. A rota Elysia segue sendo a
   **fronteira e a orquestração** (requireSession + Bearer + adapter + envelope + mapa de erro).
3. **Tipos de DTO compartilhados** em `src/shared/domain/` (não em `modules/`), pois o adapter (`external/`)
   não pode importar `modules/` (boundary). Re-exportados pelos `client/data/` dos módulos.
4. **Teste sem o backend de pé**: porta fakeada (contract tests) + stub HTTP (`tests/support/social-care-stub.ts`,
   `Bun.serve`) — fixtures em `tests/`, **nunca** mock em `src/` ([ADR-0011](./0011-no-mocks-in-production.md)).

## Amendamento (2026-06-25) — feature 003 (escrita) reforça o princípio: BFF como facade view-ready

Gabriel (Tech Lead) reforçou que o BFF deve ser tratado como **área própria de composição e facades**: o
máximo possível de cross-service e de montagem acontece no BFF, de modo que o client receba dados **"prontos
para a tela"** e só gerencie estado de UI (loading/erro/input). Isso **reafirma os §§1–3 acima** e fixa três
práticas para **toda** feature (materializadas na `003-patient-manage`):

1. **Endpoints orientados a TELA, não a recurso (screen-shaped).** Uma rota por necessidade de tela compõe
   tudo o que aquela tela mostra. Ex.: `GET /api/patients/:id/overview` devolve, numa resposta, cabeçalho +
   situação + **transições de ciclo de vida disponíveis** + núcleo familiar + identidade social — fan-out
   cross-service (`social-care` agora; `people-context`/`analysis-bi` quando entrarem) **mesclado no BFF**. O
   client não chama N serviços nem junta nada.

2. **Resolução de domínio→rótulo no servidor.** Códigos de catálogo (parentesco, tipo de identidade,
   localização…) são resolvidos para **rótulos exibíveis no BFF**, durante a composição; o client recebe o
   texto pronto. O **cache de catálogos do client** (feature 002) segue servindo **apenas** para popular
   selects de formulário (input), **não** para resolver exibição.

3. **Mutação devolve o view-state recomposto, não `204`.** Reafirma o §3: cada comando (admit, discharge,
   add-member, …) relê da fonte de verdade e devolve o **fragmento view-ready** que a tela precisa (ex.:
   `admit` → cabeçalho do paciente recomposto com a nova situação e as novas transições). O client **troca o
   estado** com o retorno — **sem refetch/revalidate manual**. Continua valendo Princ. VI / [ADR-0011](./0011-no-mocks-in-production.md)
   (sem dado fabricado): quem releu e recompôs foi o servidor.

> **Correção registrada:** a 1ª versão da spec 003 previa mutações `204` + `revalidate` no client — isso
> **contrariava o §3** e foi corrigida para "mutação devolve view-state" **antes** da implementação. A feature
> 002 (resource-shaped 1:1, sem composição) foi aceitável por haver um único serviço e telas simples; a
> partir da 003, telas com múltiplas origens usam **endpoints screen-shaped** por padrão.

## Alternativas consideradas

- **Client faz o fan-out** — rejeitada: acopla a UI à topologia do backend e fere ADR-0004/0009.
- **Server function do SolidStart (`"use server"`) como BFF** — preterida: o BFF é o **Elysia** (orquestração
  e auth centralizadas, reuso com `people-context`); o `"use server"` fica para glue de SSR pontual.
- **Mock/placeholder enquanto o backend não tem rota** — rejeitada: viola [ADR-0002](./0002-errors-as-values.md);
  usamos `'not-implemented'` ([ADR-0011](./0011-no-mocks-in-production.md)).

## Referências

- [ADR-0002](./0002-errors-as-values.md) (erros como valores), [ADR-0004](./0004-client-server-split-mvvm-ddd.md)
  (split + Eden como fronteira), [ADR-0009](./0009-framework-agnostic-client.md) (client mínimo).
- `handbook/reference/framework/elysia/` (`group`/plugin, TypeBox, Eden treaty) — orquestração no BFF.
- Integração cross-serviço: `social-care` (fonte de verdade), `people-context`, `analysis-bi`.
