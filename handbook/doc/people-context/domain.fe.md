# Modelo de Domínio: People Context Web

**Feature**: `specs/002-people-context-web/` · **Consultor**: `/acdg-skills:ddd-architect`

> Fase de modelagem (frontend, máximo rigor). No web-app o domínio vive no **`server/`** (BFF, DDD):
> agregados, value-objects branded, errors-como-valor. O **`client/`** consome um **Model** (TypeBox
> via Eden Treaty) já normalizado pelo BFF — não reimplementa regra de negócio. Cada decisão de
> fronteira/agregado exige **citação canônica ≥4 linhas** (Evans/Vernon) via `skills_citar`.
> O domínio CORE (backend Bun/Elysia) está mapeado em [`domain.md`](./domain.md); contratos em
> [`api-readiness.fe.md`](./api-readiness.fe.md); requisitos em `spec.fe.md`; plano técnico em
> `plan.fe.md`. ADRs globais: [índice](../../adr/README.md).
> [Constituição web_02](../../../.specify/memory/constitution.md).

## Bounded Context (módulo vertical)

- **Módulo**: `src/modules/people-context/` (convenção [ADR-0001 web_02](../../adr/0001-vertical-modular-architecture.md): `modules/<feature>/{server,client,public-api}`) — fronteira de import enforçada por governance tests em `bun:test` (sem ESLint/`no-restricted-imports` — ver [ADR-0009](../../adr/0009-framework-agnostic-client.md) e [ADR-0011](../../adr/0011-no-mocks-in-production.md)); cross-módulo só via `public-api` (`index.ts`).
- **Relação com outros módulos**: **downstream** de `001-foundation` (sessão OIDC/Authentik, cookie `__Host-session`, i18n, layout shell) e de `002-design-system` (importa tokens vanilla-extract via `public-api` — ver `design-tokens.fe.md`). **Upstream** do módulo `social-care` apenas no nível de identidade: o prontuário referencia `PersonId`, mas a composição cross-serviço acontece **no BFF** (Princípio I — BFF-Orchestrated Boundary) — nenhum import client-side entre os módulos. **Não importa nada** do Authentik no client nem no BFF: a Management API é assunto exclusivo do backend `people-context` (ver [`adr.md`](./adr.md)). Atua como **ACL** do contrato HTTP do `people-context` (`server/adapters`).

**Justificativa da fronteira** (citação obrigatória):
> Choose MODULES that tell the story of the system and contain a cohesive set of concepts.
> This often yields low coupling between MODULES, but if it doesn't, look for a way to
> change the model to disentangle the concepts. Give the MODULES names that become part of
> the UBIQUITOUS LANGUAGE. MODULES and their names should reflect insight into the domain.
> — *(Linha 1832, p. 110, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

O módulo conta uma história única — "o registro de identidade do ecossistema na tela:
pessoas, vínculos de sistema e provisão de login" — e seu nome (`people-context`) é o mesmo
termo do serviço upstream, mantendo a linguagem ubíqua de ponta a ponta.

## Linguagem ubíqua

| Termo (PT) | Significado (negócio) | Tipo no código (EN) |
|---|---|---|
| Pessoa (na tela) | ViewModel completo da pessoa, pronto para render | `PersonModel` (Model) |
| Ficha resumida | Linha da listagem paginada de pessoas | `PersonSummaryModel` (Model) |
| CPF | Documento validado na borda (MOD-11, rejeita repdigits); mascarado na exibição | `Cpf` (VO branded) |
| Data de nascimento | `YYYY-MM-DD` validada na borda; render `dd/MM/yyyy` via `Intl` | `IsoDate` (VO branded) |
| Vínculo de Sistema | Papel da pessoa num sistema (`system:role`) | `SystemRoleModel` (Model) |
| Situação da pessoa | Estado derivado de `active` + `idpUserId` | `PersonStatus` / `loginStatus` (derived) |
| Provisão de login | Criação de usuário no Authentik orquestrada via BFF | `provisionLogin` (rota Elysia) |
| Provisão pendente | `POST /people` retornou `207 Multi-Status` — pessoa criada, login falhou | `provisionPending: true` + `LoginProvisionPending` (evento de UI) |
| Recuperação de senha | `202 Accepted` — link **nunca** chega ao browser | `requestPasswordReset` (rota Elysia) |
| Apagamento total | Erasure LGPD (superadmin), irreversível | `erasePerson` (rota Elysia) |
| Erro estruturado | Código `PEO/ROL/IDP/AUTH-XXX` traduzido para union literal | `PeopleContextError` (string literal union) |

## Agregados e Value Objects (server/domain)

### PersonRecord (server/domain)
- **Raiz**: `PersonRecord` (`PersonId` branded) · **Invariantes**:
  - Apenas invariantes de **orquestração/composição** — nunca duplica regra canônica do backend (Princípio III — server é DDD puro): `loginStatus` é estado finito derivado e exaustivo (`'none'` quando `idpUserId === null` | `'provisioned'` | `'provision-pending'` após 207), com `switch` + `never`; `active` × ações permitidas é consistente (pessoa inativa não exibe "atribuir vínculo" nem "recuperar senha"; pessoa sem login não exibe "recuperar senha" — `PEO-007` vira estado, não surpresa); CPF **nunca** entra em JSON de estado JS — o BFF entrega `cpfMasked` (`***.***.***-**` + 2 últimos dígitos) e o valor completo só existe em SSR HTML quando a tela exige (Princípio I — BFF-Orchestrated Boundary).
  - Agregado `Readonly<{}>` imutável; mutação = cópia via spread (Princípio V — Strict TypeScript).
- **Value Objects**: `PersonId`, `RoleId`, `Cpf`, `Email`, `IsoDate`, `InitialPassword` (mín. 8) — branded types com smart constructor → `Result<T, E>` (ex.: `cpf.value-object.ts`: `const Cpf = (raw: string): Result<Cpf, 'cpf-invalid-format' | 'cpf-invalid-check-digit'>`). Nunca lançam (`throw` proibido em `domain/` — Princípio II — Errors as Values). Espelham os branded types do backend (`toCpf`, `toIsoDate` em `people-context/src/domain/person.ts`), mas no estilo `Result` do `web_02` — os dois contratos não se importam mutuamente.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Limit the Aggregate to just the Root Entity and a minimal number of attributes and/or
  > Value-Typed properties. The correct minimum is the ones necessary, and no more. Which
  > ones are necessary? The simple answer is: those that must be consistent with others,
  > even if domain experts don't specify them as rules. Smaller Aggregates not only perform
  > and scale better, they are also biased toward transactional success.
  > — *(Linha 6244, p. 357–358, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  O agregado do BFF carrega só o que a tela exige consistente entre si (`active` ×
  `loginStatus` × ações permitidas); as invariantes canônicas (dedup por CPF, IdP-first,
  unicidade de `idpUserId`) vivem no Bun/Elysia (`domain.md`).

### SystemRoleAssignment (server/domain)
- **Raiz**: `SystemRoleAssignment` (`RoleId` branded, referencia `PersonId`) · **Invariantes**:
  - `system`/`role` tipados como `KnownSystem`/`KnownRole` + extensão `string` (o contrato aceita valores novos sem quebrar o parse TypeBox); `canAssign`/`canDeactivate` são **flags derivadas de exibição** calculadas no BFF a partir dos groups da sessão (admin escopado só vê ações do próprio sistema; `superadmin` vê tudo; nunca exibir auto-assign) — a autorização **real** é do backend (`ROL-006`/`ROL-007`/`ROL-008`), o BFF apenas evita oferecer ações que retornariam 403.
  - Reatribuição de role ativa é noop no backend (204): a mutation trata 201 e 204 como sucesso idempotente, sem toast de erro.
- **Value Objects**: `RoleKey` (`system:role`, ex.: `social-care:patient`) — valor imutável usado para render de badges e correlação com os groups do token.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > When trying to discover the Aggregates in a Bounded Context, we must understand the
  > model's true invariants. Only with that knowledge can we determine which objects should
  > be clustered into a given Aggregate. An invariant is a business rule that must always be
  > consistent. There are different kinds of consistency. One is transactional consistency,
  > which is considered immediate and atomic. There is also eventual consistency.
  > — *(Linha 6188, p. 353, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  O vínculo de sistema é transacionalmente consistente só consigo mesmo
  (`UNIQUE(person, system, role)` no backend); sua projeção nos groups do Authentik é
  **eventual e best-effort** — por isso é agregado separado de `PersonRecord`, e a UI nunca
  promete sincronismo imediato com o IdP.

## Model do client (`client/data`)

> O que a UI realmente consome (TypeBox via Eden Treaty — tipo propaga do BFF sem redeclarar Model;
> Princípio V — end-to-end type safety). Pode ser mais "plano" que o agregado server.
> O client é MVVM: **ViewModel puro** (`*.view-model.ts`) + **binding Solid** (`*.binding.ts`) +
> **Command** + view burra — ver [ADR-0009](../../adr/0009-framework-agnostic-client.md).

| Model | Campos | Origem (rota Elysia — `*.query.fn.ts` / `*.service.fn.ts`) |
|---|---|---|
| `PersonSummaryModel` | `id`, `fullName`, `cpfMasked?`, `birthDate`, `age`, `active`, `hasLogin` | `listPeople.query.fn.ts` (search ILIKE nome / prefixo CPF, `cursor`, `limit ≤ 100` default 20; meta `totalCount`/`hasMore`/`nextCursor` — paginação **cursor-based**, não offset) |
| `PersonModel` | `id`, `fullName`, `cpfMasked?`, `birthDate`, `email?`, `active`, `loginStatus` (`'none' \| 'provisioned' \| 'provision-pending'`), `roles: SystemRoleModel[]`, `allowedActions` | `getPersonProfile.query.fn.ts` (fan-out paralelo `GET /people/:id` + `GET /people/:id/roles` no BFF) |
| `SystemRoleModel` | `id`, `system`, `role`, `roleKey`, `active`, `assignedAt`, `canDeactivate`, `canReactivate` | embutido em `getPersonProfile.query.fn.ts` / `listPersonRoles.query.fn.ts` |
| `RoleDirectoryModel` | `entries: { person: { id, fullName, cpfMasked, birthDate }, role: SystemRoleModel }[]` | `listRoleAssignments.query.fn.ts` (`system` obrigatório — `ROL-004`; `role?`, `active?` default `true`; discovery/auditoria admin) |
| `MutationAckModel` | `id?` (201), `idpUserId?` (provisão), `provisionPending?` (207) | `registerPerson.service.fn.ts`, `updatePerson.service.fn.ts`, `deactivatePerson.service.fn.ts`, `reactivatePerson.service.fn.ts`, `provisionLogin.service.fn.ts`, `requestPasswordReset.service.fn.ts` (202), `assignRole.service.fn.ts`, `deactivateRole.service.fn.ts`, `reactivateRole.service.fn.ts`, `erasePerson.service.fn.ts` |

## Eventos (client — binding Solid, Princípio III)

O client usa o modelo MVVM: o **ViewModel puro** (`*.view-model.ts`) deriva estado; o
**binding Solid** (`*.binding.ts`) — o único ponto que toca `createSignal`/`createStore`/
`createAsync`/`action`/`useSubmission` — propaga o estado reativo para a view burra. Eventos
de "domínio de UI" são emitidos pelo binding via `EventTarget`/`CustomEvent` nativo
(Princípio IV — zero dependência externa de bus de eventos).

| Evento (EN-passado) | Quando ocorre | Quem assina (reação) |
|---|---|---|
| `PersonRegistered` | `registerPerson.service.fn.ts` confirma (201 — inclusive dedup por CPF, que retorna o id existente) | binding da listagem (invalida `createAsync` com `query(['people', filters, userId])`) e navegação Solid Router |
| `LoginProvisionPending` | `registerPerson.service.fn.ts` retorna **207 Multi-Status** (pessoa criada, IdP falhou) | binding da ficha (sinal `provisionPending = true` + ação retry via `action` do Solid) |
| `LoginProvisioned` | `provisionLogin.service.fn.ts` (login retroativo) ou 201 com `createLogin` confirmam | binding da ficha (atualiza sinal `loginStatus`, habilita "recuperar senha") |
| `PersonStatusChanged` | `deactivatePerson.service.fn.ts`/`reactivatePerson.service.fn.ts` confirmam (204) | binding da ficha (`createAsync` re-executa) + binding da listagem (badge ativo/inativo) |
| `RoleAssignmentChanged` | `assignRole.service.fn.ts`/`deactivateRole.service.fn.ts`/`reactivateRole.service.fn.ts` confirmam (201/204) | binding da ficha (invalida `query(['person-roles', personId, userId])`) + diretório de vínculos |
| `PasswordResetRequested` | `requestPasswordReset.service.fn.ts` confirma (**202** — sem link no body) | binding da ficha (sinal de confirmação — "o link será enviado por e-mail") |
| `PersonErased` | `erasePerson.service.fn.ts` confirma (204 — LGPD Art. 18 V) | binding da listagem (remove entrada) + navegação Solid Router de volta; módulo `social-care` reage **via backend** (`people.person.deleted` → ADR-039), nunca via evento de UI |
| `SessionExpired` | BFF traduz `AUTH-001` (sessão OIDC expirada) | binding de auth do `001-foundation` (executa `logout()` + `invalidate()` e redireciona ao login via Solid Router) |

## Notas de mapeamento (anti-corrupção)

O `server/adapters` (`people-context.adapter.ts`) isola integralmente o contrato do serviço.
A fronteira de tipo é o **Eden Treaty → rota Elysia**: o schema TypeBox (`Elysia.t`) definido
no BFF propaga o tipo ao client sem redeclarar Model (Princípio V — end-to-end type safety;
[ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)).

- **Envelope**: desempacota `{ data, meta: { timestamp, pageSize?, totalCount?, hasMore?, nextCursor? } }`; `meta` de paginação vira campo tipado do Model da listagem (cursor opaco — a UI só repassa `nextCursor`).
- **Erros**: `{ success: false, error: { code, message } }` → união de string literals (`PEO-002` → `'person-not-found'`, `PEO-008` → `'person-already-has-login'`, `ROL-007` → `'admin-scope-forbidden'`, …) com switch exaustivo; UI resolve via dicionário i18n — decisão completa em [`adr.fe.md`](./adr.fe.md).
- **207 Multi-Status**: status de **sucesso parcial**, não erro — o handler Elysia o converte em `MutationAckModel` com `provisionPending: true` e o binding Solid emite `LoginProvisionPending` via `action` (retry via `provisionLogin.service.fn.ts` → `POST /people/:id/login`).
- **Password reset**: `202 Accepted` sem link no body (ADR-030/AppSec CRITICAL-2 — o `recoveryLink` viaja só no evento NATS para o `queue-manager`); o handler **não espera** payload e a UI nunca exibe link.
- **Datas**: `YYYY-MM-DD` → `IsoDate` branded; exibição `dd/MM/yyyy` via `Intl.DateTimeFormat('pt-BR')`; idade calculada no BFF (campo `age`), não na view.
- **Documentos**: CPF trafega como 11 dígitos crus na API; máscara (`123.456.789-00`) só na camada de exibição — o adapter remove formatação no caminho de escrita e entrega `cpfMasked` no de leitura (PII fora do estado JS).
- **Auth**: o handler Elysia injeta `Authorization: Bearer <jwt>` lido da sessão server-side (verificada com `jose` — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)) **e**, em toda mutação, o header `X-Actor-Id` com o `JWT.sub` da sessão — exigência do `people-context` (`AUTH-003`), que correlaciona o header com o token validado; o browser nunca vê nenhum dos dois.
- **RBAC de exibição**: papéis vêm do claim `groups` do token (`worker`, `owner`, `admin` escopado `system:admin`, `superadmin`); o BFF deriva `allowedActions`/`canAssign` para a UI esconder o que o backend negaria — a decisão final é sempre do backend.
- **Integração progressiva**: enquanto endpoints não estiverem verdes no [`api-readiness.fe.md`](./api-readiness.fe.md), o handler Elysia usa retornos `'not-implemented'` como valor (Princípio VI — Honesty/No Mocks; [ADR-0011](../../adr/0011-no-mocks-in-production.md)) — o restante do módulo não percebe a troca.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, II, III, IV, V, VI
- [ADR-0001 (web_02): Arquitetura Vertical-Modular](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0004 (web_02): Client-Server Split MVVM×DDD; Eden Treaty](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 (web_02): Auth — jose verify, sessão opaca](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0009 (web_02): Framework-Agnostic Client — ViewModel puro + binding Solid](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 (web_02): BFF Elysia — query.fn / service.fn](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 (web_02): No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [ADR-0001 (people-context): BFF como única fronteira de identidade](./adr.md)
- [ADR-0002 (feature): Mapeamento de erros PEO/ROL/IDP/AUTH](./adr.fe.md)
- [domain.md — domínio CORE do backend people-context](./domain.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [Índice de ADRs web_02](../../adr/README.md)
