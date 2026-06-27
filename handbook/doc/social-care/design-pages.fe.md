# 06 · Pages: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Nível**: Pages (Atomic Design, Cap. 2)

> **Páginas** = instâncias concretas de templates com **conteúdo real e representativo**. Validam se os
> padrões aguentam o conteúdo de verdade e documentam **variações e edge-cases** (lista vazia vs cheia,
> texto curto vs longo, papéis de usuário, seções suprimidas). Cada página mapeia para uma rota real
> (SolidStart, file-based em `src/routes/_auth/`) e seu fluxo:
> page (`*.tsx` Solid) → **ViewModel** (`*.view-model.ts`) + **binding** (`*.binding.ts`, usa
> `createAsync`/`action`/`useSubmission` do `@solidjs/router`) → **handler Elysia**
> (`*.query.fn.ts`/`*.service.fn.ts`, [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) →
> endpoint do `social-care`. RBAC real por rota: `worker`/`owner`/`admin`.

## Páginas (instâncias) por comportamento

### Lista de pacientes — `/patients`
- **Template base**: `ListTemplate`
- **Conteúdo representativo**: "Maria das Graças Souza" · CPF `***.456.789-**` · chip "Acolhido" · riscos "Sobrelotação" + "Evasão escolar" · 47 anos; 150 prontuários, 20 por página
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | lista cheia | `totalCount=150`, `hasMore=true` | append por cursor via "Carregar mais" (`M3PaginationControl`) |
  | lista vazia | `totalCount=0` | `M3EmptyState` + CTA "Cadastrar primeiro paciente" |
  | filtro por status | `?status=waitlisted` | só chips "Fila de espera"; filtro refletido na URL |
  | busca sem resultado | `?search=zzz` | empty state de busca, mantém filtros |
  | erro | BFF repassa `AppError` | mensagem i18n por `code` + botão tentar de novo |
  | carregando | pending | skeleton de 5 linhas |
- **Edge-cases**: nome longo (2 linhas + truncate); paciente sem `personalData` (anonimizado → "Paciente [LGPD]"); >3 risk chips (`+N`); `owner` vê lista mas sem CTA de cadastro (POST é só `worker`)
- **Fluxo de dados**: `src/routes/_auth/patients/index.tsx` → `patients-list.view-model.ts` + `patients-list.binding.ts` → `listPatients.query.fn.ts` → `GET /api/v1/patients?search&status&cursor&limit`

### Cadastro de paciente — `/patients/new`
- **Template base**: `WizardTemplate`
- **Conteúdo representativo**: etapas com `personId` (vindo do people-context), nome/`birthDate`/sexo `M|F|NB`, CPF/NIS/RG/CNS, endereço com CEP `69301-150` (Boa Vista-RR) + flags `isShelter`/`isHomeless`, diagnósticos ICD-10 (ex.: `E75.2`), identidade social (lookup), `prRelationshipId`
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | sucesso | `201` `{ data: { id } }` | redirect `/patients/$patientId` com toast |
  | validação local | CPF com dígito inválido | erro no campo antes do submit (replica VO `CPF`) |
  | erro de contrato | `400` por etapa | volta à etapa dona do campo, foca o erro |
  | duplicado | `409` (personId já registrado) | mensagem + link pro prontuário existente |
  | carregando | pending | botão Concluir travado (sem idempotência no backend) |
- **Edge-cases**: documentos civis todos opcionais (etapa pulável); pai/mãe falecido exige documentação (metadata-driven); paciente sem endereço fixo (`isHomeless`) suprime campos de logradouro
- **Fluxo de dados**: `src/routes/_auth/patients/new.tsx` → `patient-create.view-model.ts` + `patient-create.binding.ts` → `registerPatient.service.fn.ts` → `POST /api/v1/patients` (BFF injeta Bearer; backend valida `personId` no people-context com Bearer forwarding)

### Prontuário (aba Registry) — `/patients/$patientId`
- **Template base**: `RecordTemplate`
- **Conteúdo representativo**: header "Maria das Graças Souza" + chip "Acolhido" + menu "Desligar do serviço"; `AnalyticsStatGrid` (densidade 2.5, RPC R$ 333,33, vulnerabilidade alta, perfil etário 1/2/0/2/1); `M3DataField` de dados pessoais/documentos/endereço; `FamilyCompositionTable` com 5 membros, 1 pessoa de referência
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | acolhido | `status=active` | menu oferece só "Desligar" (discharge) |
  | fila de espera | `status=waitlisted` | menu oferece "Admitir" e "Retirar da fila" |
  | alta | `status=discharged` | banner com `dischargeInfo` (motivo/notas); menu "Readmitir" |
  | desistente | `status=withdrawn` | banner com `withdrawInfo`; sem transições |
  | anonimizado | pós `PatientPIIAnonymizedEvent` | `LgpdAnonymizedBanner`; PII vira "—"; edição bloqueada |
  | não encontrado | `PAT-001` 404 | `not-found-page` do shell |
  | erro | outros `AppError` | erro com código + retry |
- **Edge-cases**: transição inválida concorrente (`ADM-002`, `DISC-007`, `READM-005` → dialog mostra mensagem orientando ação correta e recarrega status); `discharge` com `reason=other` exige `notes` ≤1000; família vazia (só titular)
- **Fluxo de dados**: `src/routes/_auth/patients/[patientId].tsx` → `patient-record.view-model.ts` + `patient-record.binding.ts` → `getPatientById.query.fn.ts` → `GET /api/v1/patients/:patientId`; transições → `patientTransition.service.fn.ts` → `POST /api/v1/patients/:patientId/{admit|discharge|readmit|withdraw}`

### Composição familiar — `/patients/$patientId/family`
- **Template base**: `RecordTemplate` (aba Registry, seção família) + `WizardTemplate` curto no "Adicionar membro"
- **Conteúdo representativo**: 5 linhas — "José Souza · Pai · 52 anos · Pessoa de referência"; "Ana Souza · Irmã · 9 anos · 2 documentos pendentes"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | adicionar | `POST .../family-members` 201 | linha nova + recálculo de analytics vindo do GET |
  | duplicado | `FAM-002` 409 | erro no campo `memberPersonId` |
  | remover | `DELETE .../family-members/:memberId` | dialog de confirmação; soft-delete (linha some) |
  | designar referência | `PUT .../primary-caregiver` | badge migra de membro (máx. 1 — invariante) |
  | erro de data | `FAM-003` 400 | erro no `M3DateField` de `birthDate` |
- **Edge-cases**: designar cuidador em membro com `isCaregiver=false` (bloqueado no client antes do submit); membro menor de idade com responsável falecido (documentos exigidos via lookup metadata)
- **Fluxo de dados**: página → `family-composition.view-model.ts` + `family-composition.binding.ts` → handlers Elysia (`*.query.fn.ts`/`*.service.fn.ts`) → rotas de family-members do `PatientController`

### Avaliação socioeconômica — `/patients/$patientId/assessments` (+ `/assessments/$section`)
- **Template base**: `FormTemplate` (índice de 7 seções → uma rota por seção; `/assessments/new` abre a primeira seção não preenchida)
- **Conteúdo representativo**: Habitação (casa, alvenaria, 4 cômodos/2 dormitórios, água encanada, área de risco geográfico) · Situação socioeconômica (renda total R$ 2.000,00, Bolsa Família, benefício com `exigeCpfFalecido` exibindo campo extra) · Saúde (deficiência visual com cuidado constante, gestante 5 meses sem pré-natal)
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | salvar seção | `PUT .../housing-condition` 204 | `M3AutoSaveIndicator` → "Salvo"; audit no backend |
  | validação | `HOUSING-001`, `SOCIO-001`, `EDU-001`, `HEALTH-001` | erro campo a campo + sumário com âncoras |
  | conflito | 409 (version divergiu) | `VersionConflictBanner` + recarregar |
  | seção vazia | VO nulo no GET | `M3EmptyState` "Avaliação ainda não realizada" + CTA preencher |
  | anonimizado | LGPD | seções readOnly |
- **Edge-cases**: benefício "Falecido" monta CPF do falecido + certidão (metadata-driven, revalidado no servidor); gestação só p/ membro >12 anos (`HEALTH-001`); grupos por membro acompanham composição familiar atual
- **Fluxo de dados**: `src/routes/_auth/patients/[patientId]/assessments/[section].tsx` → `assessment-section.view-model.ts` + `assessment-section.binding.ts` → handlers Elysia → 7 PUTs do `AssessmentController` (+ `GET /dominios/:tableName` para selects)

### Atenção e cuidado — `/patients/$patientId/care`
- **Template base**: `RecordTemplate` (aba Care) + `FormTemplate` para ingresso
- **Conteúdo representativo**: lista de atendimentos ("Visita domiciliar · 10/06/2026 · resumo + plano de ação"); ingresso "Encaminhamento CREAS · motivo: acompanhamento de diagnóstico raro · programas vinculados: Bolsa Família"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | registrar atendimento | `POST .../appointments` 201 | item novo no topo da lista |
  | data futura | 400 (date ≤ now) | erro no `M3DateField` |
  | registrar ingresso | `PUT .../intake-info` 204 | seção preenchida substitui empty state |
  | sem atendimentos | lista vazia | `M3EmptyState` + CTA "Registrar atendimento" |
- **Edge-cases**: `summary`/`actionPlan` opcionais (exibir "—"); `serviceReason` obrigatório; programas vinculados N itens com observação
- **Fluxo de dados**: página → `care-tab.view-model.ts` + `care-tab.binding.ts` → handlers Elysia → `CareController`

### Proteção social — `/patients/$patientId/protection`
- **Template base**: `RecordTemplate` (aba Protection) com 3 seções: encaminhamentos, violações, acolhimento
- **Conteúdo representativo**: encaminhamento "CREAS · Pendente" (chip `vars.color.flowPendente`); violação "Negligência · vítima: Ana Souza · 02/06/2026"; acolhimento com registro `data_inicio` sem `data_fim` + checklist (adulto em prisão)
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | criar encaminhamento | `POST .../referrals` 201 | chip Pendente; destino `CRAS/CREAS/HEALTH_CARE/EDUCATION/LEGAL/OTHER` |
  | data futura / sem motivo | `REF-001` / `REF-002` | erros de campo |
  | registrar violação | `POST .../violation-reports` 201 | imutável após criação (sem editar/excluir) |
  | tipo exige descrição | `VIO-002` (metadata `exigeDescricao`) | `descriptionOfFact` obrigatório no client |
  | acolhimento inválido | `PLACE-001`/`PLACE-002` | erro de datas / exige membro 12–18 anos |
- **Edge-cases**: relatório de violação some da edição (audit only); checklist de afastamento com validação cruzada de idade vinda da composição familiar
- **Fluxo de dados**: página → `protection-tab.view-model.ts` + `protection-tab.binding.ts` → handlers Elysia → `ProtectionController`

### Audit trail — `/patients/$patientId/audit`
- **Template base**: `RecordTemplate` (aba Audit)
- **Conteúdo representativo**: "HousingConditionUpdated · por Téc. Carla (actorId) · 10/06/2026 14:30 · diff: numberOfBedrooms 1→2"; "PatientAdmitted · 01/06/2026"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | filtrado | `?eventType=HousingConditionUpdated` | só eventos do tipo; filtro na URL |
  | diff | eventos de Assessment | before/after expansível campo a campo |
  | vazio | prontuário recém-criado | timeline só com `PatientCreated` |
  | erro | `AppError` | retry |
- **Edge-cases**: `actorId` é UUID do IdP — resolver nome via BFF quando possível, senão exibir abreviado em mono; eventos LGPD (`PatientPIIAnonymized`) destacados
- **Fluxo de dados**: `src/routes/_auth/patients/[patientId]/audit.tsx` → `audit-trail.view-model.ts` + `audit-trail.binding.ts` → `getAuditTrail.query.fn.ts` → `GET /api/v1/patients/:patientId/audit-trail?eventType=` (fonte única: backend Swift; o BFF não tem audit próprio)

### Domínios (lookups) — `/settings/lookups` e `/settings/lookups/requests`
- **Template base**: `SettingsTemplate` (+ `ListTemplate` para a fila de solicitações)
- **Conteúdo representativo**: tabela `dominio_parentesco` (PAI/MÃE/IRMÃO… com toggle ativo); solicitação "novo benefício: Auxílio Reconstrução · justificativa · Pendente"
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | worker | role `worker` | vê itens ativos; pode solicitar (`POST /dominios/requests`); vê só as próprias solicitações |
  | admin | role `admin` | cria/edita/toggle (`POST/PUT/PATCH /dominios/...`); aprova/rejeita; vê tudo + inativos |
  | código duplicado | `LOOKUP-002` 409 | erro no campo `codigo` |
  | já processada | `LREQ-001` 409 | ação bloqueada + estado atualizado |
  | aprovação | `PUT /requests/:id/approve` | chip vira "Aprovado"; item aparece no catálogo |
- **Edge-cases**: rejeição exige `reviewNote`; toggle de item em uso (continua referenciado por prontuários antigos — exibição preservada); tabela desconhecida → `LOOKUP-001`
- **Fluxo de dados**: `src/routes/_auth/settings/lookups.tsx` → `lookup-admin.view-model.ts` + `lookup-admin.binding.ts` → handlers Elysia (`*.query.fn.ts`/`*.service.fn.ts`) → `LookupController`

### Dashboard — `/dashboard`
- **Template base**: `ShellTemplate` + grid de `M3StatCard` (rota `src/routes/_auth/dashboard.tsx`)
- **Conteúdo representativo**: totais por status (Fila 32 / Acolhidos 98 / Altas 15 / Desistentes 5), encaminhamentos pendentes, alertas de risco agregados
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | completo | dados agregados | cards com semáforo + link pra lista filtrada |
  | parcial | serviço de BI indisponível | cards locais (contagens da lista) + aviso |
  | carregando | pending | skeleton de cards |
- **Edge-cases**: indicadores anonimizados/agregados apenas (nada de PII em tela de visão geral — LGPD)
- **Fluxo de dados**: página → `dashboard.view-model.ts` + `dashboard.binding.ts` → handlers Elysia → `GET /patients?status=*&limit=1` (totalCount) e, futuramente, `analysis-bi` via BFF

## Cobertura de telas

| Tela (evidência) | Página documentada? | Rota | Template |
|---|---|---|---|
| Lista/busca de pacientes | ✅ | `/patients` | `ListTemplate` |
| Cadastro de paciente | ✅ | `/patients/new` | `WizardTemplate` |
| Prontuário (Registry) | ✅ | `/patients/$patientId` | `RecordTemplate` |
| Composição familiar | ✅ | `/patients/$patientId/family` | `RecordTemplate` |
| Avaliação socioeconômica (7 seções) | ✅ | `/patients/$patientId/assessments[/$section]` | `FormTemplate` |
| Atendimentos + ingresso | ✅ | `/patients/$patientId/care` | `RecordTemplate`/`FormTemplate` |
| Encaminhamentos/violações/acolhimento | ✅ | `/patients/$patientId/protection` | `RecordTemplate` |
| Audit trail | ✅ | `/patients/$patientId/audit` | `RecordTemplate` |
| Domínios + solicitações | ✅ | `/settings/lookups[/requests]` | `SettingsTemplate` |
| Dashboard | ✅ | `/dashboard` | `ShellTemplate` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio I (BFF-Orchestrated Boundary; fluxo page→ViewModel→binding→Elysia), III (MVVM; rotas SolidStart file-based)
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid (`createAsync`/`action`/`useSubmission`)
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — naming `*.query.fn.ts` / `*.service.fn.ts`; rota Elysia por caso de uso
- [ADR-0002](../../adr/0002-errors-as-values.md) — `Result<T,E>`; UI decide por código i18n, nunca por status HTTP
- [design-templates.fe.md](./design-templates.fe.md) — templates base de cada página
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos compostos
- [design-tokens.fe.md](./design-tokens.fe.md) — `vars.*` usados nas páginas
- [design-governance.fe.md](./design-governance.fe.md) — gates de qualidade, testes de acessibilidade
- Docs offline: `../../reference/framework/solidstart/` · `../../reference/framework/elysia/` · `../../reference/runtime/bun/`
