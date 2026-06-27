# 04 · Organisms: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Nível**: Organisms (Atomic Design, Cap. 2)

> **Organismos** = seções relativamente complexas da interface, compostas de moléculas/átomos/outros
> organismos. Estabelecem padrões reutilizáveis e dão contexto. Vivem em
> `src/modules/shared/client/ui/m3/` (globais) ou em `src/modules/social-care/client/ui/` quando
> específicos da feature ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)).
> Ficha por organismo (Frost, Cap. 3) — com **linhagem** e variações. Views burras: recebem
> **ViewModel + handlers** do binding Solid ([ADR-0009](../../adr/0009-framework-agnostic-client.md)),
> nunca chamam rota Elysia diretamente.

## Lista de organismos

### `AppShell` — casca da aplicação autenticada
- **Reuso?**: existe (`src/modules/shell/client/`) · **Escopo**: `shared` global ([ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md))
- **Composto de**: `M3TopAppBar` + nav rail (`M3NavRailItem`) + `user-menu` + `theme-toggle` + `network-status-banner` + slot de conteúdo
- **Props (API)**: `{ user: SessionVM, children: JSX.Element }` — sessão vem do BFF (cookie HttpOnly; browser nunca vê token, Princípio I)
- **Variações/estados**: online/offline (banner) · rail colapsado (mobile = bottom tabs) · item ativo por rota
- **Padrões de composição**: itens de navegação repetidos (rail) + header dissimilar
- **Tokens**: `vars.color.bgPrimary`, `vars.color.bgSecondary`, `vars.zIndex.sticky`, `vars.elevation.shadowSm`
- **Acessibilidade**: landmark `nav`/`main`; skip-link; foco gerenciado em troca de rota
- **Usado em (linhagem)**: `ShellTemplate` (todas as páginas autenticadas)
- **Evidência**: `src/modules/shell/client/` existente; [ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md)

### `M3TopAppBar` — barra superior contextual
- **Reuso?**: existe · **Escopo**: global
- **Composto de**: `M3BackButton` + título + subtítulo (ex.: `M3StatusChip` do paciente) + slot de ações
- **Props (API)**: `{ title: string, onBack?: () => void, statusSlot?: JSX.Element, actions?: JSX.Element }`
- **Variações/estados**: raiz (sem voltar) · detalhe (com voltar) · com chip de status · com menu de ações de transição
- **Tokens**: `vars.color.bgElevated`, `vars.color.textPrimary`, `vars.zIndex.sticky`
- **Acessibilidade**: `header` landmark; título = `h1` da página
- **Usado em (linhagem)**: todos os templates
- **Evidência**: Figma `M3/TopAppBar`

### `PatientTable` — tabela paginada de pacientes
- **Reuso?**: novo (compõe `M3Table` existente) · **Escopo**: `modules/social-care/client/ui/` local
- **Composto de**: `M3SearchBar` + `M3ChoiceChip` (filtro de status, 4 estados + Todos) + `M3Table` (linhas com `M3CircleAvatar`, nome, CPF mascarado, `M3StatusChip`, `M3RiskChip[]`, idade) + `M3PaginationControl` + `M3EmptyState`
- **Props (API)**: `{ rows: PatientSummaryVM[], totalCount: number, hasMore: boolean, pending: boolean, error?: AppError, onSearch: (q: string) => void, onFilterStatus: (s: string) => void, onLoadMore: () => void, onRowPress: (id: string) => void }` — recebe dados/handlers do ViewModel ([ADR-0009](../../adr/0009-framework-agnostic-client.md); view burra, Princípio III)
- **Variações/estados**: vazio · carregando (skeleton de linhas) · erro (`AppError` + retry) · paginado (`hasMore`) · filtrado por status · busca sem resultado
- **Padrões de composição**: header dissimilar (busca+filtros) vs. linhas repetidas
- **Tokens**: `vars.color.borderDefault`, `vars.elevation.stateLayerHover` (linha clicável), `vars.spacing`
- **Acessibilidade**: `<table>` semântica; linha inteira clicável com `aria-label` ("Abrir prontuário de …"); ordenação anunciada
- **Usado em (linhagem)**: `ListTemplate` → página `/patients`
- **Evidência**: `GET /api/v1/patients?search&status&cursor&limit`; `PatientSummaryResponse`

### `FamilyCompositionTable` — composição familiar
- **Reuso?**: parcial (`M3FamilyMemberRow` + `M3FamilyTableHeader` + `M3AddMemberButton` existem) · **Escopo**: local
- **Composto de**: `M3FamilyTableHeader` + N×`M3FamilyMemberRow` + `M3AddMemberButton` + `StatusTransitionDialog` (confirmação de remoção)
- **Props (API)**: `{ members: FamilyMemberVM[], onAdd: () => void, onRemove: (id: string) => void, onAssignCaregiver: (id: string) => void, readOnly: boolean }`
- **Variações/estados**: vazio (só titular) · com cuidador designado · com pendências de documentos · readOnly (prontuário anonimizado/alta)
- **Padrões de composição**: linhas repetidas; rodapé de ação
- **Tokens**: herdados das moléculas
- **Acessibilidade**: tabela com caption ("Composição familiar"); confirmação de remoção em dialog modal com foco preso
- **Usado em (linhagem)**: aba Registry do `RecordTemplate`
- **Evidência**: `POST/DELETE /patients/:id/family-members`, `PUT /patients/:id/primary-caregiver`; invariante de 1 pessoa de referência; erros `FAM-001..003`

### `AssessmentForm` — formulário de avaliação socioeconômica (7 instâncias)
- **Reuso?**: novo (compõe `M3FormSection` existente) · **Escopo**: local
- **Composto de**: `M3FormSection` + `M3SectionHeader` + campos (`M3NumberField`, `M3DropdownField`, `M3BoolChoice`, `M3TextField`, `M3DateField`, `M3MaskedField`) + `M3AutoSaveIndicator` + `VersionConflictBanner`
- **Props (API)**: `{ section: AssessmentSectionVM, lookups: LookupItems, formState: FormState, onSubmit: () => void, onFieldChange: (field: string, val: unknown) => void }` — uma instância por endpoint: `housing-condition`, `socioeconomic-situation`, `work-and-income`, `educational-status`, `health-status`, `community-support-network`, `social-health-summary` (todos `PUT /patients/:id/...` → `204`)
- **Variações/estados**: idle · dirty · saving · saved · erro de campo (espelha `HOUSING-001`, `SOCIO-001/002`, `WORK-001`, `EDU-001`, `HEALTH-001/002`) · conflito 409 · readOnly pós-anonimização (LGPD bloqueia edição)
- **Padrões de composição**: seções dissimilares; **campos condicionais metadata-driven** — ao selecionar `benefitTypeId`, flags do lookup (`exigeCpfFalecido`, `exigeRegistroNascimento`, `exigeDescricao`) montam/exigem campos extras (CPF do falecido via `M3MaskedField`, nº de certidão); listas por membro (`individualIncomes`, `memberProfiles`, `deficiencies`, `gestatingMembers`) renderizam um subgrupo por `FamilyMember`
- **Tokens**: `vars.spacing` (grid 4/8), `vars.color.borderError`, `vars.radius.lg`
- **Acessibilidade**: `fieldset/legend` por seção; erros agrupados em sumário com links-âncora; validação anunciada em `aria-live`
- **Usado em (linhagem)**: `FormTemplate` → aba Assessment
- **Evidência**: `AssessmentController` (7 PUTs); `LookupItemMetadata`; validação dupla client/servidor (§10.9 do mapa)

### `AuditTimeline` — linha do tempo do prontuário
- **Reuso?**: novo (compõe `M3TimelineItem`) · **Escopo**: local
- **Composto de**: filtro `M3ChoiceChip`/`M3DropdownField` por `eventType` + N×`M3TimelineItem` + `M3PaginationControl` + `M3EmptyState`
- **Props (API)**: `{ entries: AuditEntryVM[], eventTypeFilter: string | null, onFilterChange: (f: string | null) => void, hasMore: boolean, onLoadMore: () => void }`
- **Variações/estados**: completo · filtrado (`?eventType=HousingConditionUpdated`…) · vazio · com diffs before/after expandido
- **Padrões de composição**: itens repetidos em ordem cronológica inversa
- **Tokens**: `vars.color.borderStrong`, marcadores com `vars.color.status*`/`vars.color.risk*`
- **Acessibilidade**: `<ol>` semântica; datas com `<time datetime>`; diff expansível por teclado
- **Usado em (linhagem)**: aba Audit do `RecordTemplate`
- **Evidência**: `GET /patients/:id/audit-trail?eventType=`; ~18 tipos de evento (audit é do backend Swift — o BFF não tem audit próprio, Princípio I)

### `StatusTransitionDialog` — confirmação de transição de status
- **Reuso?**: novo (compõe `M3Dialog` existente) · **Escopo**: local
- **Composto de**: `M3Dialog` + texto da consequência + `M3DropdownField` (motivo enum) + `M3TextField` (notes) + ações (`M3Button` destructive/text)
- **Props (API)**: `{ transition: "admit" | "discharge" | "readmit" | "withdraw", reasonOptions: Option[], formState: FormState, onConfirm: () => void, onCancel: () => void }`
- **Variações/estados**: admit/readmit (sem motivo) · discharge (motivos `caseObjectiveAchieved | transferredToAnotherService | patientRequestedDischarge | lossOfContact | relocation | death | other`) · withdraw (motivos `patientDeclined | noResponse | duplicateRecord | ineligible | transferredBeforeAdmit | other`) · `notes` obrigatório e ≤1000 chars quando `other` · pending · erro de transição inválida (`ADM-002/003`, `DISC-001/007`, `WDR-003`, `READM-005` → mensagem orientando a ação correta)
- **Padrões de composição**: só oferece transições válidas para o estado atual — espelho fiel da máquina `PatientStatus` (`waitlisted→admit|withdraw`, `active→discharge`, `discharged→readmit`)
- **Tokens**: `vars.color.bgOverlay`, `vars.zIndex.modal`, `vars.color.danger500` (ações destrutivas)
- **Acessibilidade**: dialog modal (foco preso, `Esc` cancela); `aria-live="assertive"` para erro de confirmação
- **Usado em (linhagem)**: header do `RecordTemplate`; menu de linha da `PatientTable`
- **Evidência**: `POST /patients/:id/{admit,discharge,readmit,withdraw}`; DTOs `DischargePatientRequest`/`WithdrawPatientRequest`

### `LookupAdminPanel` — administração de domínios
- **Reuso?**: novo (compõe `M3Table`, `M3Dialog`) · **Escopo**: local
- **Composto de**: seletor de tabela (`M3DropdownField` com as `dominio_*`) + `M3Table` (codigo, descricao, ativo com toggle) + form de criação + lista de solicitações com ações aprovar/rejeitar (`M3Dialog` com `reviewNote`)
- **Props (API)**: `{ tableName: string, items: LookupItemVM[], requests: LookupRequestVM[], role: "worker" | "owner" | "admin", onCreate: () => void, onUpdate: (id: string) => void, onToggle: (id: string) => void, onRequest: () => void, onApprove: (id: string) => void, onReject: (id: string, note: string) => void }`
- **Variações/estados**: leitura (worker/owner) · administração completa (admin) · solicitação pendente/aprovada/rejeitada (chips `vars.color.flow*`) · item inativo (linha esmaecida, `?includeInactive=true` só p/ admin) · erro `LOOKUP-002` (código duplicado), `LREQ-001` (já processada)
- **Padrões de composição**: duas regiões — catálogo (repetido) e fila de aprovação (repetido)
- **Tokens**: `vars.color.flow*` (proposto em [design-tokens.fe.md](./design-tokens.fe.md) §2), `vars.color.textDisabled`
- **Acessibilidade**: toggle ativo/inativo como switch ARIA com label; aprovação/rejeição confirmada em dialog
- **Usado em (linhagem)**: `SettingsTemplate` → `/settings/lookups`
- **Evidência**: `LookupController` (`GET/POST/PUT/PATCH /dominios/...`, `/dominios/requests/...`); RBAC por rota (§7.2 do mapa)

### `AnalyticsStatGrid` — grade de indicadores computados
- **Reuso?**: novo (compõe `M3StatCard`) · **Escopo**: local
- **Composto de**: N×`M3StatCard` (densidade habitacional + flag sobrelotação, renda total/per capita, índice de vulnerabilidade, perfil etário 0-6/7-14/15-18/19-59/60+, vulnerabilidades educacionais)
- **Props (API)**: `{ analytics: ComputedAnalyticsVM, pending: boolean }`
- **Variações/estados**: completo · parcial (avaliações não preenchidas → cards com "—") · skeleton
- **Padrões de composição**: cards repetidos em grid responsivo
- **Tokens**: `vars.spacing4`, `vars.spacing6`, semáforos via `M3StatCard`
- **Acessibilidade**: grid com headings; valores numéricos com unidade no `aria-label`
- **Usado em (linhagem)**: topo do `RecordTemplate`; dashboard
- **Evidência**: `computedAnalytics` (housing/financial/ageProfile/educationalVulnerabilities)

### `LgpdAnonymizedBanner` / `VersionConflictBanner` — avisos de estado do prontuário
- **Reuso?**: novos · **Escopo**: local
- **Composto de**: ícone + texto + ação opcional ("Recarregar")
- **Props (API)**: `{ }` (LGPD) · `{ onReload: () => void }` (conflito)
- **Variações/estados**: LGPD — fixo, não dispensável ("Dados pessoais removidos por solicitação LGPD"; histórico clínico/social permanece; edição de avaliações bloqueada). Conflito — após `409` (`Patient.version` divergiu): orienta recarregar e reconciliar
- **Padrões de composição**: banner full-width acima do conteúdo da página
- **Tokens**: `vars.color.bannerLgpd*` (proposto) · `vars.color.warning500`
- **Acessibilidade**: LGPD `role="note"`; conflito `role="alert"`
- **Usado em (linhagem)**: `RecordTemplate`, `AssessmentForm`
- **Evidência**: `PatientPIIAnonymizedEvent` + regras de frontend §10.4; optimistic locking §10.5

## Cobertura vs. inventory

| Organismo do inventory | Coberto? | Documento |
|---|---|---|
| Shell + navegação | ✅ | `AppShell`, `M3TopAppBar` |
| Tabela de pacientes paginada | ✅ | `PatientTable` |
| Composição familiar | ✅ | `FamilyCompositionTable` |
| Formulários de avaliação (7) | ✅ | `AssessmentForm` |
| Timeline do audit trail | ✅ | `AuditTimeline` |
| Modais de transição/remoção/aprovação | ✅ | `StatusTransitionDialog`, `LookupAdminPanel` |
| Admin de lookups + solicitações | ✅ | `LookupAdminPanel` |
| Cards de indicadores | ✅ | `AnalyticsStatGrid` |
| Banners LGPD / conflito de versão | ✅ | `LgpdAnonymizedBanner`, `VersionConflictBanner` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio I (BFF-Orchestrated Boundary; views nunca chamam rotas Elysia diretamente), III (ViewModel puro + binding)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — módulos locais vs. globais; cross-módulo só via `public-api`
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira Eden → Elysia; BFF orquestra
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command
- [ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md) — Shell autenticado como tela MVVM raiz
- [design-atoms.fe.md](./design-atoms.fe.md) — átomos compostos por estes organismos
- [design-molecules.fe.md](./design-molecules.fe.md) — moléculas compostas por estes organismos
- [design-templates.fe.md](./design-templates.fe.md) — templates que posicionam estes organismos
- [design-tokens.fe.md](./design-tokens.fe.md) — `vars.*` usados; tokens propostos (flow/lgpd)
- [design-governance.fe.md](./design-governance.fe.md) — critérios de promoção local→global
- Docs offline: `../../reference/ui/vanilla-extract/` · `../../reference/framework/solidstart/` · `../../reference/framework/elysia/`
