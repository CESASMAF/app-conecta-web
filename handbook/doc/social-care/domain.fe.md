# Modelo de Domínio: Social Care Web

**Feature**: `specs/001-social-care-web/` · **Consultor**: `/acdg-skills:ddd-architect`

> Fase de modelagem (frontend, máximo rigor). No web-app o domínio vive no **`server/`** (BFF, DDD):
> agregados, value-objects branded, errors-como-valor. O **`client/`** consome um **Model** (TypeBox /
> Eden Treaty) já normalizado pelo BFF — não reimplementa regra de negócio. Cada decisão de
> fronteira/agregado exige **citação canônica ≥4 linhas** (Evans/Vernon) via `skills_citar`.
> O domínio CORE (backend Swift) está mapeado em [`domain.md`](./domain.md); contratos em
> [`api-readiness.fe.md`](./api-readiness.fe.md); requisitos em [`discovery.fe.md`](./discovery.fe.md).

## Bounded Context (módulo vertical)

- **Módulo**: `src/modules/social-care/` (convenção [ADR-0001](../../adr/0001-vertical-modular-architecture.md):
  `src/modules/social-care/{server,client,public-api}/`) — fronteira de import enforçada por
  **governance tests** em `bun:test` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md),
  [ADR-0011](../../adr/0011-no-mocks-in-production.md)); cross-módulo só via `public-api` (`index.ts`).
- **Relação com outros módulos**: **downstream** de `001-foundation` (sessão OIDC/Authentik,
  cookie `__Host-session`, i18n, layout shell) e de `002-design-system` (importa tokens via
  `public-api` — ver [`design-tokens.fe.md`](./design-tokens.fe.md)). **Não importa nada**
  de `analysis-bi` nem de `people-context` no client: toda composição cross-serviço acontece
  no BFF Elysia (Princípio I — BFF-Orchestrated Boundary). Atua como **ACL** do contrato
  HTTP do `social-care` (`server/adapters`).

**Justificativa da fronteira** (citação obrigatória):
> Choose MODULES that tell the story of the system and contain a cohesive set of concepts.
> This often yields low coupling between MODULES, but if it doesn't, look for a way to
> change the model to disentangle the concepts. Give the MODULES names that become part of
> the UBIQUITOUS LANGUAGE. MODULES and their names should reflect insight into the domain.
> — *(Linha 1832, p. 110, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

O módulo conta uma história única — "o prontuário socioassistencial na tela" — e seu nome
(`social-care`) é o mesmo termo do serviço upstream, mantendo a linguagem ubíqua de ponta a ponta.

## Linguagem ubíqua

| Termo (PT) | Significado (negócio) | Tipo no código (EN) |
|---|---|---|
| Prontuário (na tela) | ViewModel completo do paciente, pronto para render | `PatientCaseFileModel` (Model) |
| Ficha resumida | Linha da listagem paginada de pacientes | `PatientSummaryModel` (Model) |
| CPF / NIS / CEP / CNS | Documentos validados na borda (dígito verificador, formato) | `Cpf`, `Nis`, `Cep`, `Cns` (VO branded) |
| Dinheiro | Valor monetário em centavos — nunca `number` cru de ponto flutuante na borda | `Money` (VO branded) |
| Situação do prontuário | Estado finito do ciclo de vida | `PatientStatus` (`'waitlisted' \| 'active' \| 'discharged' \| 'withdrawn'`) |
| Indicadores calculados | Densidade, renda per capita, perfil etário — calculados **só no backend** | `ComputedAnalyticsModel` (Model) |
| Catálogo de domínio | Itens ativos de uma lookup table para selects | `LookupCatalog` (Aggregate server) / `LookupOptionModel` (Model) |
| Trilha de auditoria | Timeline de eventos com diff before/after | `AuditTrailEntryModel` (Model) |
| Conflito de versão | Edição concorrente detectada (HTTP 409, optimistic locking) | `VersionConflictDetected` (Event client) |
| Erro estruturado | Código `PAT-XXX`/`AppError` traduzido para union literal | `SocialCareError` (string literal union) |

## Agregados e Value Objects (server/domain)

### PatientCaseFile (server/domain)
- **Raiz**: `PatientCaseFile` (`PatientId` branded) · **Invariantes**:
  - Apenas invariantes de **orquestração/composição** — nunca duplica regra canônica do backend
    (Princípio III da constituição — server é DDD, client é MVVM): `version: number` sempre
    presente e propagado em toda mutation; `status` exaustivo (switch + `never`); seções de
    assessment são `Section | null` (ausência ≠ erro); paciente anonimizado (`PatientPIIAnonymizedEvent`)
    → `personalData/civilDocuments/address = null` + flag `isAnonymized: true` (UI bloqueia
    edição e exibe aviso LGPD).
  - Agregado `Readonly<{}>` imutável; mutação = cópia via spread (Princípio V — Strict TS).
- **Value Objects**: `Cpf`, `Nis`, `Cep`, `Cns`, `Money`, `PatientId`, `PersonId`, `ProfessionalId`,
  `LookupId`, `IsoDateTime` — branded types com smart constructor → `Result<T, E>`
  (ex.: `cpf.value-object.ts`: `const Cpf = (raw: string): Result<Cpf, 'cpf-invalid-format' | 'cpf-invalid-check-digit'>`).
  Nunca lançam (`throw` proibido em `domain/` — Princípio II).
- **Justificativa do boundary do agregado** (citação obrigatória):
  > Limit the Aggregate to just the Root Entity and a minimal number of attributes and/or
  > Value-Typed properties. The correct minimum is the ones necessary, and no more. Which
  > ones are necessary? The simple answer is: those that must be consistent with others,
  > even if domain experts don't specify them as rules. Smaller Aggregates not only perform
  > and scale better, they are also biased toward transactional success.
  > — *(Linha 6244, p. 357–358, VAUGHN VERNON, *Implementing Domain-Driven Design*)*

  O agregado do BFF carrega só o que a tela exige consistente entre si (status × ações
  permitidas × version); o agregado canônico, com todas as invariantes de negócio, vive no
  Swift ([`domain.md`](./domain.md)).

### LookupCatalog (server/domain)
- **Raiz**: `LookupCatalog` (`tableName` como identidade: `dominio_parentesco`, `dominio_tipo_beneficio`, `dominio_tipo_violacao`, `dominio_tipo_ingresso`…) · **Invariantes**:
  - Só itens `ativo = true` chegam ao client por padrão; metadata flags (`exigeCpfFalecido`, `exigeRegistroNascimento`, `exigeDescricao`) acompanham cada opção para validação dinâmica de formulário (campos condicionais), revalidada pelo backend (`MetadataValidator`).
- **Value Objects**: `LookupOption` (id branded `LookupId`, `codigo`, `descricao`, `metadata` readonly) — imutável, comparado por valor.
- **Justificativa do boundary do agregado** (citação obrigatória):
  > When you care only about the attributes of an element of the model, classify it as a
  > VALUE OBJECT. Make it express the meaning of the attributes it conveys and give it
  > related functionality. Treat the VALUE OBJECT as immutable. Don't give it any identity
  > and avoid the design complexities necessary to maintain ENTITIES.
  > — *(Linha 1654, p. 99, ERIC EVANS, *Domain-Driven Design*)*

  As opções de domínio são puro valor para a UI (selects, radios); o ciclo de vida
  (criar/aprovar/desativar item) pertence ao Configuration Context do backend.

## Model do client (`client/data`)

> O que a UI realmente consome (tipo inferido do Eden Treaty a partir do schema TypeBox `Elysia.t`
> do BFF — sem redeclarar Model; Princípio V da constituição).

| Model | Campos | Origem (handler Elysia) |
|---|---|---|
| `PatientSummaryModel` | `id`, `fullName`, `socialName?`, `status`, `age`, `cpfMasked?` | `listPatients.query.fn.ts` (search, status, cursor, limit ≤ 100; meta `hasMore`/`nextCursor`) |
| `PatientCaseFileModel` | `id`, `personId`, `version`, `status`, `isAnonymized`, `personalData?`, `civilDocuments?`, `address?`, `familyMembers[]`, `diagnoses[]`, seções de assessment (`housingCondition?` … `socialHealthSummary?`), `placementHistory?`, `intakeInfo?`, `appointments[]`, `referrals[]`, `violationReports[]`, `computedAnalytics`, `dischargeInfo?`, `withdrawInfo?` | `getPatientCaseFile.query.fn.ts` |
| `ComputedAnalyticsModel` | `housing.density`, `housing.isOvercrowded`, `financial.incomePerCapita`, `financial.vulnerabilityIndex`, `ageProfile`, `educationalVulnerabilities` | embutido em `getPatientCaseFile.query.fn.ts` (frontend **não calcula** — badge "Risco de Sobrelotação" quando `density > 3.0`) |
| `AuditTrailEntryModel` | `id`, `eventType`, `actorId`, `occurredAt`, `before?`, `after?`, `endpoint` | `getPatientAuditTrail.query.fn.ts` (filtro `eventType`) |
| `LookupOptionModel` | `id`, `codigo`, `descricao`, `metadata` (`exigeCpfFalecido`…) | `getLookupOptions.query.fn.ts(tableName)` |
| `MutationAckModel` | `id?` (201) ou vazio (204), `version` atualizado quando aplicável | `registerPatient.service.fn.ts`, `admitPatient.service.fn.ts`, `dischargePatient.service.fn.ts`, `withdrawPatient.service.fn.ts`, `readmitPatient.service.fn.ts`, `addFamilyMember.service.fn.ts`, `updateHousingCondition.service.fn.ts`, `createReferral.service.fn.ts`, `reportRightsViolation.service.fn.ts`, `registerAppointment.service.fn.ts`… |

## Eventos (client — `createAsync` / `ErrorBoundary` do Solid, Princípio II)

| Evento (EN-passado) | Quando ocorre | Quem assina (reação) |
|---|---|---|
| `PatientRegistered` | Mutation `registerPatient` confirma (201 + `IdResponse`) | ViewModel da listagem (invalida `createAsync` de `['patients', filters, userId]`) e navegação para o prontuário |
| `PatientStatusChanged` | `admit`/`discharge`/`readmit`/`withdraw` confirmam | ViewModel do detalhe (recarrega case file via `createAsync`) + listagem (badge de status) |
| `AssessmentSectionSaved` | Qualquer `PUT` de seção retorna 204 | ViewModel do detalhe (refetch `computedAnalytics` e trilha de auditoria) |
| `VersionConflictDetected` | BFF traduz HTTP 409 (optimistic locking / `PAT-002`, `ADM-002`…) | ViewModel do formulário (descarta draft, recarrega `version`, mostra diálogo de reconciliação) |
| `SessionExpired` | BFF retorna `unauthorized` (sessão OIDC expirada) | ViewModel de auth do `001-foundation` (limpa estado e redireciona ao login) |
| `LookupCatalogRefreshed` | Admin aprova `LookupRequest` (tela de configuração) | ViewModels de formulário (invalidam `createAsync` de `['lookup', tableName]`) |

Implementação nativa `EventTarget` + `CustomEvent` (Princípio IV — sem mitt/nanoevents).
Integração com o ciclo reactivo do Solid: o binding (`*.binding.ts`) assina os eventos e
atualiza os signals (`createSignal`/`createStore`) correspondentes — o ViewModel puro não
importa `solid-js` ([ADR-0009](../../adr/0009-framework-agnostic-client.md)).

## Notas de mapeamento (anti-corrupção)

O `server/adapters` (`social-care.adapter.ts`) isola integralmente o contrato do core-api:

- **Envelope**: desempacota `StandardResponse` `{ data, meta: { timestamp, pageSize?, totalCount?, hasMore?, nextCursor? } }`; `meta` de paginação vira campo tipado do Model da listagem.
- **Erros**: `{ error: { code, message } }` → união de string literals (`PAT-001` → `'patient-not-found'`, `DISC-007` → `'cannot-discharge-waitlisted'`, …) com switch exaustivo; UI resolve via dicionário i18n — decisão completa em [`adr.fe.md`](./adr.fe.md).
- **Datas**: ISO 8601 (`2026-06-12T10:30:45Z`) → `IsoDateTime` branded; exibição `dd/MM/yyyy` via `Intl.DateTimeFormat('pt-BR')`; entrada de formulário converte para ISO antes do envio.
- **Documentos**: CPF/NIS trafegam como dígitos crus; máscara (`123.456.789-00`, `12345-678`) só na camada de exibição — o adapter remove formatação no caminho de escrita.
- **Money**: `double` do contrato → `Money` em centavos no domain do BFF; render via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- **Versionamento**: `version` do agregado acompanha todo ViewModel editável; 409 → evento `VersionConflictDetected` (acima).
- **Auth**: o adapter injeta `Authorization: Bearer <jwt>` lido da sessão server-side (Elysia); `actorId` é derivado do `JWT.sub` **pelo backend** — nenhum header customizado de ator (ADR-023 do `social-care`).
- **Integração progressiva**: enquanto endpoints não estiverem verdes no [`api-readiness.fe.md`](./api-readiness.fe.md), o handler retorna o valor `'not-implemented'` como `Result` — o restante do módulo não percebe a troca e nenhum dado fabricado chega à UI (Princípio VI — [ADR-0011](../../adr/0011-no-mocks-in-production.md)).

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0001 Arquitetura vertical-modular: [`../../adr/0001-vertical-modular-architecture.md`](../../adr/0001-vertical-modular-architecture.md)
- ADR-0002 Errors as Values: [`../../adr/0002-errors-as-values.md`](../../adr/0002-errors-as-values.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- ADR-0009 Framework-agnostic client (ViewModel puro + binding Solid): [`../../adr/0009-framework-agnostic-client.md`](../../adr/0009-framework-agnostic-client.md)
- ADR-0010 BFF orquestrador / nomenclatura fn: [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md)
- ADR-0011 No mocks em produção: [`../../adr/0011-no-mocks-in-production.md`](../../adr/0011-no-mocks-in-production.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Domínio core-api (backend Swift): [`./domain.md`](./domain.md)
- Mapeamento de erros (ADR de feature): [`./adr.fe.md`](./adr.fe.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Tokens de design: [`./design-tokens.fe.md`](./design-tokens.fe.md)
- Elysia (BFF): [`../../reference/framework/elysia/`](../../reference/framework/elysia/)
- SolidStart: [`../../reference/framework/solidstart/`](../../reference/framework/solidstart/)
- vanilla-extract (design system): [`../../reference/ui/vanilla-extract/`](../../reference/ui/vanilla-extract/)
