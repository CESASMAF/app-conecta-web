[← Voltar para ADRs](./README.md)

# ADR-0004: Separação client (MVVM) × server (BFF/DDD) no módulo + Event Bus + Controller

- **Status:** Accepted
- **Date:** 2026-05-29 · **Atualizado:** 2026-06-12 (BFF = Elysia; fronteira = Eden treaty; client = Solid)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

[ADR-0001](./0001-vertical-modular-architecture.md) definiu o módulo vertical como
`modules/<f>/{domain,application,adapters,ui,public-api}`, tratando a feature como **um** slice DDD.
Ao detalhar a primeira feature-modelo (Auth, `specs/002-auth`), o Tech Lead explicitou uma distinção que
o layout achatado não capturava:

> **"Tudo que é front-end é client-side. A Model é só padronização client-side do que o BFF JÁ fez; o
> Repository é só uma porta pra qual API consumir. Pense em tudo que definimos pro BFF como inalterado —
> lá temos o DDD (server-side); aqui no client (FRONT) temos MVVM. Há uma clara diferença entre client e
> server."**

Forças:
- O **server-side** (BFF **Elysia**) faz orquestração real: sessão, tokens OIDC, chamada aos serviços
  (`core-api`/`people-context`/`social-care`), segurança. É onde o domínio/`Result`/ports fazem sentido (DDD).
- O **client-side** (FRONT **Solid**) **consome** o BFF (via **Eden treaty**, type-safe) e **apresenta**.
  Não redá o domínio — padroniza o retorno do BFF (Model) e orquestra a tela (MVVM).
- Times com agentes de IA precisam de uma fronteira **óbvia** entre "lógica de servidor" e "lógica de tela".
- O Tech Lead quer **Event Bus** (reatividade declarativa cross-feature) e **Controller** (estado transiente
  de form) como padrões de primeira classe.

## Decisão

Refinar a estrutura interna do módulo para **separar explicitamente client de server**, com o **Eden treaty
(→ rota Elysia) como fronteira**:

```
modules/<feature>/
├── server/   # BFF (Elysia), server-side, DDD
│   ├── domain/        # PURO: VOs, Result, regras, *.repository.port.ts, *.events.ts
│   ├── application/   # *.use-case.ts (orquestra serviços + sessão) + ports
│   └── adapters/      # *.query.fn.ts / *.service.fn.ts (handlers Elysia) + client de serviços
│                      #   + *.schema.ts (TypeBox / Elysia.t) + mappers
├── client/   # FRONT (Solid), client-side, MVVM
│   ├── data/          # *.model.ts (TypeBox/tipos do retorno do BFF) + *.repository.ts (porta → Eden treaty)
│   ├── usecase/       # *.use-case.ts (intenção de UI; opcional) — emite eventos no bus
│   ├── view-model/    # *.view-model.ts (Solid: createAsync/action + signals; {estado, ações}; assina bus)
│   └── ui/            # *.page.tsx (template burro) + *.controller.ts (form) + *.component.tsx
└── public-api/
```

- **Fronteira client↔server = o Eden treaty.** `client/` só toca `server/` **chamando** o BFF via
  `treaty<App>()` (no SSR, isomorphic — sem HTTP); nunca importa `server/domain`/`server/application`.
  (Substitui a "server function" do web/React; ver [ADR-0010](./0010-bff-orchestration-fn-naming.md).)
- **Validação por TypeBox (`Elysia.t`)** no `server/adapters` (substitui o Zod do web/React — vem com o
  Elysia, zero dep npm extra). O tipo derivado do schema flui para o client via Eden (type-safety ponta-a-ponta).
- **Dependência aponta pra dentro** em cada lado. `external/` (I/O + segredos) é server-only.
- **Event Bus** (`shared/bus`): Observer com eventos no passado; `client/usecase` emite, `view-model`
  assina. Opt-in (chamada direta é o default); handlers delegam; sem loops.
- **Controller** (`*.controller.ts`): estado transiente de form, por exceção; entrega ao ViewModel no submit.
- **MVVM (Princípio XI)**: só `*.page.tsx`/`*.component.tsx` são "burros"; `view-model`/`controller` podem
  ter estado (signals/stores do Solid).

Materializado na **constituição** (Princípios III, XI, XII) e nos **governance tests** de boundaries
(`bun:test`, não `eslint.config.js` — regra Bun-native).

## Consequências

**Positivas**
- Fronteira client/server explícita e enforçada — agentes/devs sabem onde cada coisa vive.
- Server-side (DDD) e client-side (MVVM) evoluem sem vazar um no outro; token/segredo confinados ao `server/`.
- **Eden** dá type-safety ponta-a-ponta de graça (o tipo do TypeBox chega ao client) — menos duplicação
  de tipos que o web/React (que recriava o Model em Zod).
- Event Bus + Controller dão um vocabulário reativo claro para telas (a Auth é a vitrine).

**Negativas / custos**
- Mais pastas por módulo (server/ + client/) — mais cerimônia que o layout achatado do ADR-0001.
- Risco de duplicar tipos (Model client vs domain server) — mitigado: o client `data` **reusa o tipo do
  Eden** e só adapta o que precisar, não recria regra de domínio.
- Boundaries por governance test são código a manter (vs lint declarativo) — aceito pela regra Bun-native.

**Neutras**
- O `client/usecase` é opcional (muitas telas chamam o repository direto pelo view-model).

## Alternativas consideradas

- **Layout achatado do ADR-0001** (`domain/application/adapters/ui`) — rejeitado: escondia a fronteira
  client/server que o Tech Lead considera fundamental.
- **Server function do SolidStart (`"use server"`) como fronteira** em vez do Elysia — **preterida** para o
  caso geral: o BFF é o **Elysia** (sessão/OIDC/orquestração centralizados, reuso com `people-context`);
  o `"use server"` do SolidStart fica para glue de SSR pontual. Ver [memória do spike] e [ADR-0010](./0010-bff-orchestration-fn-naming.md).
- **Zod no client/server** (como no web/React) — rejeitada pela regra **Bun-native**: TypeBox (`Elysia.t`)
  já vem com o BFF e flui via Eden.
- **Bus como CQRS/event-store** — rejeitado: reatividade simples (Observer), sem a complexidade de CQRS.

## Referências

- Refina o layout interno de [ADR-0001](./0001-vertical-modular-architecture.md).
- `.specify/memory/constitution.md` §III, §XI, §XII.
- [ADR-0009](./0009-framework-agnostic-client.md) (ViewModel puro + binding Solid) e
  [ADR-0010](./0010-bff-orchestration-fn-naming.md) (BFF Elysia como fronteira).
- `handbook/reference/framework/elysia/` (TypeBox, Eden) e `handbook/reference/framework/solidstart/`.
