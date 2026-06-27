# Data Model — Fase 1 (003-patient-manage)

Entidades de **escrita** da feature. Tipos descritos de forma agnóstica; a fonte única em código é o **schema TypeBox (`Elysia.t`)** das rotas BFF, propagado ao client via **Eden** (Princ. V — sem redeclarar Model). Reusa `PatientStatus` da 002.

## PatientStatus + máquina de estados

`WAITLISTED` | `ACTIVE` | `DISCHARGED` (estados-fonte de transição) — `ADMITTED`/`WITHDRAWN` aparecem como rótulos de leitura (002).

```
            admit                    discharge
WAITLISTED ────────►  ACTIVE  ──────────────────►  DISCHARGED
   │                    ▲                                │
   │ withdraw           └────────────── readmit ─────────┘
   ▼
 (saída da fila)
```

| Transição | De | Para | Comando upstream | Motivo? |
|---|---|---|---|---|
| Admitir | `WAITLISTED` | `ACTIVE` | `admit` | não |
| Dar alta | `ACTIVE` | `DISCHARGED` | `discharge` | **sim** (+ obs. se "outro") |
| Readmitir | `DISCHARGED` | `ACTIVE` | `readmit` | observações opcionais |
| Retirar da fila | `WAITLISTED` | saída | `withdraw` | **sim** (+ obs. se "outro") |

Operações puras (ViewModel, testáveis sem Solid): `nextTransitions(status)`, `requiresReason(transition)`, `requiresNotes(transition, reason)`.

## PatientRegistration (request do cadastro — US1)

| Campo | Tipo | Regra |
|---|---|---|
| `personId` | UUID | obrigatório; pessoa existente no people-context (REGP-002/029) |
| `initialDiagnoses` | `Diagnosis[]` (≥1) | cada `{ icdCode, date, description }`; data não-futura, descrição não-vazia (REGP-003..006) |
| `personalData` | objeto? | `{ firstName, lastName, motherName, nationality, sex(M\|F\|O), socialName?, birthDate (não-futura), phone? }` (REGP-009..014) |
| `civilDocuments` | objeto? | `{ cpf?, nis?, rg?, cns? }` — ≥1 se fornecido; CPF válido; CNS.cpf == CPF (REGP-015..018,027,028) |
| `address` | objeto? | `{ cep?, isShelter, isHomeless?, residenceLocation, street?, neighborhood?, number?, complement?, state, city }` (REGP-019..022) |
| `socialIdentity` | objeto? | `{ typeId (catálogo), description? }` — descrição exigida p/ certos tipos (REGP-025) |
| `prRelationshipId` | catálogo (parentesco) | obrigatório (REGP-026) |

`Diagnosis = { icdCode: string; date: ISODate; description: string }`.
Resposta de sucesso: `{ id: UUID }` (201) → paciente em `WAITLISTED`. Evento: `PatientCreated`.

## DischargeReason / WithdrawReason

```
DischargeReason = 'improved' | 'deceased' | 'transferred' | 'abandoned' | 'other'
WithdrawReason  = 'refused_service' | 'moved_location' | 'other'
```

- `notes`: obrigatório quando `reason === 'other'`; máx. 1000 caracteres (DISC-003/005, WDR-005/006).
- `readmit.notes`: opcional, máx. 1000 (READM-004).

## FamilyMember (US3)

| Campo | Tipo | Regra |
|---|---|---|
| `memberPersonId` | UUID | obrigatório; pessoa existente |
| `relationship` | catálogo (parentesco) | obrigatório |
| `isResiding` | boolean | obrigatório |
| `isCaregiver` | boolean | obrigatório |
| `hasDisability` | boolean | obrigatório |
| `requiredDocuments` | `('CN'\|'RG'\|'CTPS'\|'CPF'\|'TE')[]` | valores válidos (APP-011) |
| `birthDate` | ISODate | obrigatório |
| `prRelationshipId` | catálogo (parentesco) | obrigatório |

- Adicionar: 204; já existe → APP-008 (conflito); paciente não ativo → APP-010. Evento: `FamilyMemberAdded`.
- Remover (`memberId`): 204; não encontrado → RFM-002; não ativo → RFM-005. Evento: `FamilyMemberRemoved`.
- Cuidador principal (`memberPersonId` existente): 204; membro não encontrado → APC-002; não ativo → APC-005. Evento: `PrimaryCaregiverAssigned`.

## SocialIdentityUpdate (US4)

| Campo | Tipo | Regra |
|---|---|---|
| `typeId` | catálogo (tipo de identidade) | obrigatório (USIA-007) |
| `description` | string? | exigida quando o tipo requer (indígena em/fora de aldeia, outros) — USIA-003/004/006 |

204; paciente não ativo → USIA-008. Evento: `SocialIdentityUpdated`.

## ValidationError (client, ViewModel puro)

| Campo | Tipo | Notas |
|---|---|---|
| `field` | string | caminho do campo (ex.: `personalData.birthDate`) |
| `tag` | i18n tag | mensagem PT-BR (ex.: `patients.create.error.birthDateFuture`) |

`validateForm(input): ValidationError[]` — vazio = válido (libera submit). Defesa em profundidade: o BFF revalida com `Elysia.t`; o backend é a autoridade final.

## View-models compostos pelo BFF (facade — ADR-0010 adendo)

Entregues **prontos para a tela** (códigos de domínio já resolvidos em rótulos no servidor; fan-out cross-service mesclado no BFF). O client não compõe nem resolve label de exibição.

**PatientOverview** (tela de paciente — `GET /overview` e retorno do cadastro):

| Campo | Tipo | Notas |
|---|---|---|
| `patientId` / `fullName` | string | |
| `status` / `statusLabel` | `PatientStatus` / string | rótulo PT-BR resolvido no BFF |
| `availableTransitions` | `{ action, label, requiresReason }[]` | **calculado no BFF** a partir da situação (cliente não deriva) |
| `socialIdentity` | `{ typeId, typeLabel, description? }` | `typeLabel` resolvido do catálogo no BFF |
| `family` | `FamilyView` | núcleo familiar recomposto |
| `meta.partial` | boolean | `true` se uma origem secundária (futura: people-context/analysis-bi) caiu — seção omitida, tela não quebra |

**FamilyView**: `{ members: { memberPersonId, fullName, relationshipLabel, isResiding, isCaregiver, isPrimaryCaregiver }[], primaryCaregiverId: string|null }` — `relationshipLabel` resolvido no BFF.

## MutationOutcome (resultado de escrita)

`Result<ViewState, AppError>` onde `AppError = { kind: AppErrorKind, code: string }` (código upstream preservado p/ observabilidade; `kind` decide a i18n). **Toda mutação devolve o view-state recomposto** (ADR-0010 §3), nunca `204`: cadastro → `PatientOverview` (201); admit/discharge/readmit/withdraw → cabeçalho recomposto `{ patientId, status, statusLabel, availableTransitions }`; add/remove/caregiver → `FamilyView`; social-identity → `{ typeId, typeLabel, description }`. O client **troca o estado** com o retorno (sem refetch/revalidate). Quem releu da fonte e recompôs foi o **servidor** → honra Princ. VI (sem dado fabricado).

## Relações

- `PatientRegistration` → cria `Patient` (`WAITLISTED`) → aparece como `PatientSummary` na lista da 002.
- `PatientStatus` governa quais transições `lifecycle.view-model` oferece.
- `FamilyMember.*` e `SocialIdentityUpdate` agem sobre um `Patient` existente (e na maioria, **ativo**).
- Todos os selects (`prRelationshipId`, `socialIdentity.typeId`, `relationship`, `residenceLocation`) → itens do **cache de domínio da 002** (`DomainCatalogItem`), nunca hardcode (FR-005/SC-004).
