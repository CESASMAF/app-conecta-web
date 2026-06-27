# Implementation Plan: Interface Web People-Context (front + BFF)

**Branch**: `002-people-context-web` | **Date**: 2026-06-12 | **Spec**: [spec.fe.md](./spec.fe.md)

**Input**: Feature specification em `web_02/handbook/doc/people-context/spec.fe.md`

## Summary

Interface web do registro de identidade ACDG: cadastro e busca de pessoas (com deduplicação por CPF e soft-delete), gestão de vínculos `system:role` (SystemRole) e gestão de acesso ao IdP (provisão de login Authentik — inclusive retroativa após 207 —, password reset, desativar/reativar e erasure LGPD), consumindo a API do `people-context` exclusivamente através do BFF (Elysia). O browser nunca vê token nem URL de backend — toda chamada outbound sai de handlers Elysia ([`*.query.fn.ts` / `*.service.fn.ts`](../../adr/0010-bff-orchestration-fn-naming.md)) que injetam `Authorization: Bearer <jwt>` e `X-Actor-Id` (= `JWT.sub` da sessão) e validam input/output com TypeBox na borda. O módulo é vertical (`src/modules/people-context/`), com client [MVVM framework-agnóstico](../../adr/0009-framework-agnostic-client.md) (ViewModel puro + binding Solid + Command) e design system atômico só-tokens (vanilla-extract). Prontidão do contrato em [api-readiness.fe.md](./api-readiness.fe.md); tasks em [tasks.md](./tasks.md).

## Technical Context

**Language/Version**: TypeScript estrito (sem `any` implícito; `tsc --noEmit` limpo como gate) · Bun (runtime + PM + test)
**Meta-framework**: SolidStart (Solid · Vinxi · Nitro preset `bun`) · `@solidjs/router` (rotas file-based em `src/routes/`)
**Server-state**: Solid nativo — `createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router` · **Validação**: TypeBox (`Elysia.t`, vem com Elysia) · **UI**: Solid (JSX do Solid)
**Design System**: vanilla-extract (zero-runtime), tokens-only (`vars.*`) — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) · tokens em [design-tokens.fe.md](./design-tokens.fe.md)
**Testes**: `bun:test` (puro: domain/application/view-model/data) + `bun:test` + happy-dom (DOM: page/component/binding)
**Storage**: N/A no front — estado remoto via `createAsync`/`query` do Solid; sessão/token server-only (cookie HttpOnly + Elysia middleware)
**Target Platform**: navegador moderno + BFF Elysia (SolidStart, Nitro preset `bun`), atrás do Caddy na VPS ACDG-BV
**Project Type**: web app (front + BFF unificado, módulos verticais)
**Performance Goals**: lista de pessoas p95 < 1 s @ 20 itens/página (cursor-based); busca por CPF (lookup direto `GET /people/by-cpf/:cpf`) < 500 ms; ações de acesso IdP (deactivate/login/reset) com feedback < 2 s
**Constraints**: token e `PEOPLE_CONTEXT_API_URL` nunca no browser (Princ. I); `X-Actor-Id` injetado só no BFF, nunca aceito do client; UI nunca lê status HTTP (só `AppError.kind`); CPF enviado sem máscara (11 dígitos), datas em ISO 8601 `YYYY-MM-DD`, exibição em `dd/MM/yyyy` via `Intl`; link de password reset **nunca** chega ao front (viaja só no evento NATS — a UI mostra apenas "solicitação enviada"); erasure exige dupla confirmação e role `superadmin`
**Scale/Scope**: ~5 fluxos de tela (lista/busca, cadastro, ficha da pessoa com abas Cadastro · Vínculos · Acesso, discovery de vínculos por sistema, ações de acesso/IdP) · 15 rotas Elysia de BFF (`*.query.fn.ts` / `*.service.fn.ts`) · 2 agregados (Person, SystemRole)

## Constitution Check

*GATE: passar antes da Fase 0. Re-checar após a Fase 1.* Princípios I–VI de [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) (web_02, v1.0.0).

| Princípio | Aderência | Nota |
|---|---|---|
| I. BFF-Orchestrated Boundary | ✓ | browser só fala com rotas Elysia (Eden treaty); Bearer + `X-Actor-Id` injetados no BFF; `PEOPLE_CONTEXT_API_URL` server-only — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) |
| II. Errors as Values | ✓ | `Result<T,E>` em domain/application/data; `throw` só na borda do `createAsync` do Solid (→ `<ErrorBoundary>`); 207 modelado como variante de sucesso (`created-idp-pending`), não como erro — [ADR-0002](../../adr/0002-errors-as-values.md) |
| III. Vertical-Modular · Client (MVVM) × Server (DDD) | ✓ | módulo vertical `src/modules/people-context/`; cross-módulo (ex.: `auth`, `social-care`) só via `public-api`; ViewModel puro (`*.view-model.ts`) + binding Solid (`*.binding.ts`) + Command; governance tests em `bun:test` — [ADR-0001](../../adr/0001-vertical-modular-architecture.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md) |
| IV. Bun-Native / Zero-NPM-Utility | ✓ | `bun:test` (não `node:test`/Vitest); fakes/in-memory em vez de MSW; TypeBox (`Elysia.t`) em vez de Zod; governance tests em vez de ESLint-boundaries; `.woff2` self-host em vez de `@fontsource` — [ADR-0003](../../adr/0003-bun-supply-chain.md) |
| V. Strict TS & End-to-End Type Safety | ✓ | branded types (`PersonId`, `Cpf` MOD-11 + anti-repdigit, `RoleId`, `IsoDateString`); estado de acesso como union `'no-login' \| 'provisioned' \| 'idp-pending'` com switch exaustivo; Eden propaga o tipo do schema Elysia ao client sem redeclarar Model — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) |
| VI. Honesty in Production (No Mocks) | ✓ | sem MSW em `src/`; fakes apenas em `tests/`; operação sem rota retorna `'not-implemented'` como valor — [ADR-0011](../../adr/0011-no-mocks-in-production.md) |

## Project Structure

### Documentation (this feature)

```text
web_02/handbook/doc/people-context/
├── discovery.fe.md           # Fase 0 (elicitação)
├── spec.fe.md                # o quê
├── api-readiness.fe.md       # prontidão do contrato people-context (17 rotas)
├── domain.fe.md              # agregados Person/SystemRole (citação ACDG)
├── adr.fe.md                 # decisões frontend
├── metrics.fe.md             # NFRs
├── plan.md                   # visão core-api do contrato
├── plan.fe.md                # este arquivo
├── tasks.md                  # tasks por user story
└── design-tokens.fe.md       # tokens (Atomic Design 00-interface-inventory … 07-governance)
```

### Source Code (módulo vertical — espelha `auth`/`contracts`)

```text
src/modules/people-context/
├── server/                                  # BFF · DDD · onde o token vive
│   ├── domain/                              #   PURO: branded VOs (PersonId, Cpf, RoleId, IsoDateString),
│   │   │                                    #   Result, errors (AppError por código PEO/ROL/IDP/AUTH), ports
│   │   ├── person.ts · errors.ts · ports.ts
│   ├── application/                         #   use-cases (commands/queries) — sem throw
│   │   ├── list-people.ts · get-person.ts · register-person.ts · update-person.ts
│   │   ├── manage-roles.ts                  #   assign/deactivate/reactivate/query
│   │   └── manage-access.ts                 #   provision login, password reset, (de/re)activate, erasure
│   └── adapters/                            #   ★ fronteira Elysia (ADR-0010)
│       ├── people-context.client.ts         #   HTTP client → people-context (Bearer + X-Actor-Id + envelope + AppError)
│       ├── envelope.schema.ts               #   TypeBox de { data, meta } / erro { success:false, error } / 207 warnings / meta paginada
│       ├── person.schema.ts · role.schema.ts
│       ├── people.query.fn.ts               #   queries: listPeople, getPerson, getPersonByCpf
│       ├── person-commands.service.fn.ts    #   createPerson, updatePerson
│       ├── roles.service.fn.ts              #   assignRole, listPersonRoles, deactivateRole, reactivateRole, queryRoles
│       └── access.service.fn.ts             #   provisionLogin, requestPasswordReset, deactivatePerson,
│                                            #   reactivatePerson, erasePerson
├── client/                                  # FRONT · MVVM · agnóstico (ADR-0009) — feature-first FLAT
│   ├── data/                                #   person.model.ts, role.model.ts (TypeBox) + *.repository.ts
│   │   │                                    #   (porta → rota Elysia via Eden) + events/
│   ├── domain/                              #   helpers puros: máscara CPF, datas ISO ↔ dd/MM/yyyy, idade
│   ├── person-list/                         #   *.view-model.ts (puro) + *.binding.ts + *.page.tsx (Solid; busca nome/CPF + cursor)
│   ├── person-registration/                 #   cadastro (com opção "criar login") + *.service.fn.ts + tratamento 207
│   ├── person-record/                       #   ficha da pessoa (abas Cadastro · Vínculos · Acesso) + edição
│   ├── role-management/                     #   vínculos da pessoa + discovery por sistema (GET /roles)
│   └── access-management/                   #   provisão retroativa, password reset, (de/re)ativação, erasure
└── public-api/index.ts                      # ★ único import externo
```

**Structure Decision**: módulo vertical único `src/modules/people-context/` espelhando os módulos `auth`/`contracts` já existentes; as features do client agrupam-se por comportamento (camada = sufixo do arquivo) e as 15 rotas autenticadas viram pares schema + handler Elysia no `server/adapters/`, separados em leitura (`people.query.fn.ts`), cadastro (`person-commands.service.fn.ts`), vínculos (`roles.service.fn.ts`) e acesso/IdP (`access.service.fn.ts`). Rotas SolidStart em `src/routes/people/` importam apenas de `public-api/index.ts`.

## Rotas BFF (Elysia) & Contratos *(a fronteira — Princípio I)*

> As "server functions" do stack anterior tornaram-se **rotas Elysia** consumidas pelo client via **Eden treaty** ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)). A nomenclatura de arquivo muda de `*.server-fn.ts` para `*.query.fn.ts` (leituras) / `*.service.fn.ts` (escritas); o contrato de entrada e saída é idêntico.

| Handler Elysia (`*.query.fn.ts` / `*.service.fn.ts`) | Tipo | Input (TypeBox) | Output | core-api consumido |
|---|---|---|---|---|
| `listPeople` | query | `listPeopleInput` (search?, cursor?, limit 1–100 default 20) | `Result`→ lista `Person[]` + meta paginação (`pageSize`, `totalCount`, `hasMore`, `nextCursor`) | `GET /api/v1/people` |
| `getPerson` | query | `personIdSchema` (UUID) | `Result`→ `Person` | `GET /api/v1/people/:personId` |
| `getPersonByCpf` | query | `cpfSchema` (`^\d{11}$`) | `Result`→ `Person` | `GET /api/v1/people/by-cpf/:cpf` |
| `createPerson` | mutation | `createPersonInput` (fullName 1–200, cpf?, birthDate ISO, email?, createLogin?, initialPassword? min 8; `createLogin` exige email) | `Result`→ `{ kind: 'created', id } \| { kind: 'created-idp-pending', id }` (201 vs **207** com `warnings: [{ code: 'IDP-001' }]`) | `POST /api/v1/people` |
| `updatePerson` | mutation | `updatePersonInput` (fullName, cpf?, birthDate, email? — omitido preserva via COALESCE) | `Result`→ void (204) | `PUT /api/v1/people/:personId` |
| `deactivatePerson` | mutation | `personIdSchema` | `Result`→ void (204; 409 `PEO-005`; 502 `IDP-002`) | `PUT /api/v1/people/:personId/deactivate` |
| `reactivatePerson` | mutation | `personIdSchema` | `Result`→ void (204; 409 `PEO-006`; 502 `IDP-003`) | `PUT /api/v1/people/:personId/reactivate` |
| `provisionLogin` | mutation | `provisionLoginInput` (personId, email? override, initialPassword? min 8) | `Result`→ `{ id, idpUserId }` (201; 409 `PEO-008`; 422 `PEO-009`; 502 `IDP-001`) | `POST /api/v1/people/:personId/login` |
| `requestPasswordReset` | mutation | `personIdSchema` | `Result`→ void (**202 Accepted** — link nunca no body; 422 `PEO-007`; 502 `IDP-004`) | `POST /api/v1/people/:personId/request-password-reset` |
| `erasePerson` | mutation | `erasePersonInput` (personId + confirmação de nome digitado, validada no BFF) | `Result`→ void (204; 403 `PEO-010` se não superadmin; 502 `IDP-005`) | `DELETE /api/v1/people/:personId` |
| `assignRole` | mutation | `assignRoleInput` (personId, system, role) | `Result`→ `{ kind: 'assigned', id } \| { kind: 'already-active' }` (201 vs **204 noop**) | `POST /api/v1/people/:personId/roles` |
| `listPersonRoles` | query | `listPersonRolesInput` (personId, active?) | `Result`→ `SystemRole[]` | `GET /api/v1/people/:personId/roles` |
| `deactivateRole` | mutation | `roleActionInput` (personId, roleId) | `Result`→ void (204; 404 `ROL-002`; 403 `ROL-007`; 409 `ROL-009`) | `PUT /api/v1/people/:personId/roles/:roleId/deactivate` |
| `reactivateRole` | mutation | `roleActionInput` (personId, roleId) | `Result`→ void (204; 404 `ROL-003`; 403 `ROL-007`; 409 `ROL-009`) | `PUT /api/v1/people/:personId/roles/:roleId/reactivate` |
| `queryRoles` | query | `queryRolesInput` (system obrigatório, role?, active? default true) | `Result`→ `{ person: PersonSummary, role: SystemRole }[]` (⚠️ `PersonSummary` traz `cpf` — exibir mascarado) | `GET /api/v1/roles` |

- **Cadeia de erro** (Princ. II/V): people-context 4xx/5xx → `resultFetch` → `HttpError` → `mapToServerResponse` →
  handler Elysia devolve `{ error }` via Eden → `createAsync` lança para o `<ErrorBoundary>` do Solid → `switch` em `AppError.kind` → tag i18n. A UI nunca olha status HTTP. Os códigos estruturados do serviço são preservados em `AppError.code` e mapeados em kinds: `PEO-001`/`ROL-001`/`PEO-003`/`PEO-004`/`ROL-005` → `validation`; `PEO-002`/`ROL-002`/`ROL-003` → `notFound`; `PEO-005`/`PEO-006`/`PEO-008`/`ROL-009` → `conflict`; `PEO-007`/`PEO-009` → `precondition`; `PEO-010`/`ROL-006`/`ROL-007`/`ROL-008`/`AUTH-002`/`ADM-001` → `forbidden`; `AUTH-001` → `unauthorized` (BFF redireciona para re-login); `AUTH-003` → `validation` (bug do BFF — nunca deve ocorrer, pois o `X-Actor-Id` é injetado no servidor); `IDP-001..005` → `idpUnavailable` (mensagem "Falha de comunicação com o provedor de identidade — tente novamente"). O **207 Multi-Status não entra na cadeia de erro**: é parseado como sucesso parcial (`created-idp-pending`) e a UI oferece o retry "Provisionar login" via `provisionLogin`.

## Integração core-api *(prontidão)*

Resumo de [api-readiness.fe.md](./api-readiness.fe.md). Ponto de troca = repository (`client/data`) / client (`server/adapters`).

| Capacidade | Prontidão | Estratégia Fase 1 |
|---|---|---|
| Pessoa — lista/busca, lookup por CPF, ficha | 🟢 | integrar real (sem filtro `active` server-side — filtrar visualmente por página e pedir filtro como P1) |
| Pessoa — cadastro (com dedup por CPF) e edição | 🟢 | integrar real; pós-mutação 204 → re-fetch da ficha |
| Vínculos — assign/listar/deactivate/reactivate | 🟢 | integrar real; tratar 201 vs 204 (noop) no `assignRole` |
| Vínculos — discovery por sistema (`GET /roles`) | 🟡 | integrar real; sem paginação no endpoint — limitar uso a sistemas pequenos e exibir CPF mascarado |
| Acesso — provisão de login (no cadastro e retroativa) | 🟢 | integrar real; 207 → estado `idp-pending` + CTA de retry |
| Acesso — password reset, desativar/reativar, erasure | 🟢 | integrar real; erasure só visível para `superadmin` (claim `groups`) |
| Catálogo de sistemas/roles conhecidos | 🔴 | hardcode de catálogo (`KnownSystem`/`KnownRole` como union + `as const`) com campo livre para valores fora do catálogo |
| Concorrência otimista (`ETag`/`If-Match`/`version`) | 🔴 | fallback: re-fetch pós-mutação + tratamento dos 409 existentes (`PEO-005/006`, `ROL-009`) com recarga |

## Design System Impact *(Atomic Design — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md), design-system só-tokens)*

- **Tokens**: usa os existentes de `shared/ui/tokens` ([design-tokens.fe.md](./design-tokens.fe.md)); reaproveita os tokens semânticos de severidade (`alert.info/warning/critical`) para os estados de acesso e para o aviso de erasure — proibido hex/px cru em `ui/`.
- **Átomos/Moléculas novos**: `Badge` de status da pessoa (ativa/inativa) e de vínculo (`system:role`, ativo/inativo); `MaskedField` CPF (exibe `123.456.789-00`, emite 11 dígitos); `DateField` ISO 8601 ↔ `dd/MM/yyyy`; `SearchField` único (nome ILIKE ou prefixo de CPF — detecta dígitos e alterna a máscara); `AccessStatusPill` (sem login · login ativo · provisão pendente).
- **Organismos**: `PersonHeader` (nome + badges + ações de acesso por role do caller); `RolesTable` (vínculos com toggle ativar/desativar); `AssignRoleDialog` (selects de system/role com catálogo hardcoded + campo livre); `IdpPendingCallout` (banner pós-207 com CTA "Provisionar login"); `EraseConfirmDialog` (dupla confirmação digitando o nome completo — irreversível, LGPD Art. 18 V); `ResetRequestedToast` ("Solicitação enviada — a pessoa receberá um email" — o link nunca aparece).
- **Templates/Pages**: lista de pessoas (busca + paginação cursor); ficha da pessoa em abas (Cadastro · Vínculos · Acesso); formulário de cadastro com seção opcional "Criar login"; página de discovery de vínculos por sistema (admin).

## Data Model (client × server)

- **server/domain**: `Person` (com `idpUserId`/`idpUserPk` nullable e flag `active`), `SystemRole`; VOs branded `PersonId`, `RoleId` (UUID), `Cpf` (11 dígitos + MOD-11 + rejeição de repdigits), `IsoDateString` (`YYYY-MM-DD`, não-futura para birthDate); invariantes replicadas como pré-condições de UX (ex.: só oferecer "Provisionar login" se `idpUserId === null`; só oferecer "Reativar" se `active === false`; `createLogin` exige email) — o serviço continua sendo a autoridade.
- **client/data Model**: TypeBox (`Elysia.t`) do retorno do BFF, propagado ao client via Eden (sem redeclarar Model) — `PersonModel` (lista e ficha usam o mesmo shape `Person` completo), `SystemRoleModel` (`{ id, personId, system, role, active, assignedAt }`), `RoleQueryEntryModel` (`{ person: PersonSummary, role: SystemRole }` do discovery — CPF presente, exibido mascarado), `AccessState` derivado (`no-login | provisioned | idp-pending`).
- Detalhe em [domain.fe.md](./domain.fe.md).

## Plano de Testes (TDD)

- **Puro (`bun:test`, imports relativos)**: domain (VOs `Cpf` MOD-11/repdigits, `IsoDateString`, derivação de `AccessState`), application (use-cases com fakes in-memory do client HTTP — incluindo 207 → `created-idp-pending` e 201-dedup → mesmo `id`), view-model (busca nome/CPF da lista, cursor, regras do formulário de cadastro com `createLogin` ⇒ email obrigatório, ações de acesso oferecidas por estado, regras de RBAC do caller para esconder ações `admin`/`superadmin`), data (repository → handler Elysia fake via Eden; parsing dos models TypeBox).
- **DOM (`bun:test` + happy-dom, aliases ok)**: `person-list.page`, `person-registration.page` (fluxo 207 → callout + retry), `person-record.page` (abas), `role-management.component` (201 vs 204; ROL-007 exibido como mensagem de escopo), `access-management.component` (erasure com dupla confirmação; reset → toast 202).
- **Escreva o teste antes** (Princípio V). Suites que falham primeiro (RED): `envelope.schema.test.ts`, `people-context.client.test.ts`, `person.repository.test.ts`, `person-list.view-model.test.ts` — mesmas do W0 em [plan.md](./plan.md).

## Complexity Tracking

| Violação | Por que necessária | Alternativa simples rejeitada porque |
|---|---|---|
| — nenhuma: os 6 princípios passam sem exceção | — | — |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — lei máxima do projeto
- [ADR-0001 — Arquitetura Vertical-Modular](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0003 — Bun Supply-Chain](../../adr/0003-bun-supply-chain.md)
- [ADR-0004 — Client × Server Split (MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 — Auth/Session/Refresh](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0007 — Design System vanilla-extract](../../adr/0007-design-system-vanilla-extract.md)
- [ADR-0008 — Self-host Webfonts](../../adr/0008-self-host-webfonts.md)
- [ADR-0009 — Framework-Agnostic Client (MVVM)](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 — BFF Elysia Orquestrador / fn naming](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [Índice de ADRs](../../adr/README.md)
- [spec.fe.md — especificação frontend](./spec.fe.md)
- [plan.md — visão core-api do contrato](./plan.md)
- [api-readiness.fe.md — prontidão endpoint a endpoint](./api-readiness.fe.md)
- [domain.fe.md — agregados Person/SystemRole vistos pelo front](./domain.fe.md)
- [design-tokens.fe.md — tokens do design system](./design-tokens.fe.md)
- [constitution.md — princípios do módulo](./constitution.md)
- [Docs offline: runtime/bun](../../reference/runtime/bun/)
- [Docs offline: framework/elysia](../../reference/framework/elysia/)
- [Docs offline: framework/solidstart](../../reference/framework/solidstart/)
- [Docs offline: ui/vanilla-extract](../../reference/ui/vanilla-extract/)
