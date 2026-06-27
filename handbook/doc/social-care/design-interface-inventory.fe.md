# 00 · Interface Inventory: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Método**: Atomic Design (Frost), Cap. 4

> O **interface inventory** é a foto crua de TODA a UI da feature antes de sistematizar: cataloga cada
> elemento visual repetido (botões, campos, badges, tabelas, modais…), expõe **inconsistências** e
> estabelece o **vocabulário compartilhado**. É o insumo dos documentos 01–06 (tokens→pages).
> Aqui também fica fixada a **política de fidelidade**: replicar o contrato real do backend
> `social-care` (agregados, enums, máquinas de estado) e os frames `M3/*` do Figma, saneando
> divergências de borda — bug a bug.

## 1. Fonte da evidência

- Mapa completo do serviço `social-care` (Swift 6.3 + Vapor, CQRS+ES+Outbox): agregados, máquinas de estado, rotas `/api/v1`, códigos de erro `PAT-*`/`FAM-*`/etc. — relatório de exploração de 2026-06-12 (commit `social-care` @ HEAD).
- Figma file `bHV9kAG2pIWMnEjOQIUCOE`, frames `M3/*` (~30 componentes Material 3) — base da [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (vanilla-extract como engine do design system).
- Stack web_02: **SolidStart** (Solid · Vinxi · Nitro preset `bun`) + **Elysia** BFF em `src/routes/api/[...path].ts` + **Bun** + **Eden Treaty** + **vanilla-extract** (CSS-in-TS zero-runtime); componentes vivem em `src/modules/shell/client/` (shell global) e `src/modules/social-care/client/` (feature). Tokens em `src/styles/tokens.css.ts` (primitivos OKLCH) + `src/styles/contract.css.ts` (semânticos).
- ADRs do `web_02/`: [ADR-0001](../../adr/0001-vertical-modular-architecture.md) (vertical-modular), [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) (MVVM×DDD), [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (vanilla-extract), [ADR-0008](../../adr/0008-self-host-webfonts.md) (webfonts), [ADR-0009](../../adr/0009-framework-agnostic-client.md) (ViewModel puro + binding Solid), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (BFF Elysia + naming).
- Telas cobertas: Dashboard de indicadores · Lista/busca de pacientes · Cadastro de paciente (wizard) · Prontuário com abas por contexto (Registry / Assessment / Care / Protection) · Composição familiar · Avaliação socioeconômica (7 formulários) · Atendimentos e ingresso · Encaminhamentos · Relatórios de violação · Acolhimento/afastamento · Audit trail · Administração de lookups (`/dominios`) + solicitações de novos itens.

## 2. Inventário por categoria (Frost)

> Liste o que aparece, com onde foi visto. Marque duplicatas/variações divergentes.

| Categoria | Variações encontradas | Onde aparece | Consolidar como |
|---|---|---|---|
| Botões | filled (CTA coral), tonal, outlined, text, destrutivo (discharge/withdraw), FAB (novo paciente), back, menu kebab | todas as telas; transições de status; lista de pacientes | átomos `M3Button` (variants), `M3FAB`, `M3BackButton`, `M3MenuButton` |
| Campos | texto, numérico (renda, cômodos), mascarado (CPF, NIS, CEP, CNS, telefone), data (birthDate, incidentDate), select de lookup (`/dominios/:tableName`), sim/não (flags booleanas), busca | wizard de cadastro; 7 forms de avaliação; protection/care | átomos `M3TextField`, `M3NumberField`, `M3MaskedField`, `M3DateField` (novo); moléculas `M3DropdownField`, `M3BoolChoice`, `M3SearchBar` |
| Badges/Status | status do paciente (`waitlisted/active/discharged/withdrawn` → Fila/Acolhido/Alta/Desistente), riscos computados (violação, sobrelotação, evasão, pré-natal), contadores (membros, pendências), cuidador primário | lista de pacientes; header do prontuário; linhas da família | átomos `M3StatusChip`, `M3RiskChip`, `M3CountBadge`, `M3CaregiverBadge` |
| Tabelas | tabela de pacientes (paginação por cursor `nextCursor`/`hasMore`, linha clicável), tabela de composição familiar (header + linhas + botão adicionar), tabela de lookups (admin) | `/patients`; aba Registry; `/settings/lookups` | organismos `PatientTable` (sobre `M3Table`), `FamilyCompositionTable`, `LookupAdminPanel` |
| Modais | confirmar transição de status com motivo enum (`DischargeReason`/`WithdrawReason` + `notes` obrigatório se `other`), remover membro familiar, aprovar/rejeitar lookup request (com `reviewNote`) | prontuário; família; lookups | organismo `StatusTransitionDialog` (sobre `M3Dialog`) |
| Formulários | seções de avaliação (housing, socioeconomic, work-and-income, educational, health, community-support, social-health-summary), campos condicionais metadata-driven (`exigeCpfFalecido`, `exigeRegistroNascimento`, `exigeDescricao`), indicador de auto-save | aba Assessment; protection | organismo `AssessmentForm` (sobre `M3FormSection` + `M3AutoSaveIndicator`) |
| Cards/Indicadores | cards de `computedAnalytics` (densidade habitacional, renda per capita, índice de vulnerabilidade, perfil etário) | dashboard; topo do prontuário | molécula `M3StatCard`; organismo `AnalyticsStatGrid` |
| Timeline | entradas do audit trail (`eventType`, `actorId`, `occurredAt`, diff before/after), filtro por `eventType` | aba Audit do prontuário | organismo `AuditTimeline` (sobre `M3TimelineItem`) |
| Estados vazios/erro | lista vazia, busca sem resultado, erro `AppError` com código (`PAT-001`…), 404, offline | todas as listagens; shell | `M3EmptyState`, `error-page`, `network-status-banner` |
| Navegação | shell com nav rail (ícones por área), top app bar com título contextual, abas do prontuário por bounded context, breadcrumb/back | todas as páginas autenticadas | shell `app-shell` + `M3TopAppBar` + `M3NavRailItem` + `M3TabBarItem` |
| Avisos | banner LGPD "dados pessoais removidos" (`PatientPIIAnonymizedEvent`), banner de conflito de versão (409, optimistic locking [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) backend) | prontuário anonimizado; forms concorrentes | organismos `LgpdAnonymizedBanner`, `VersionConflictBanner` (novos) |

## 3. Inconsistências detectadas

| # | Inconsistência | Telas | Decisão (padronizar / manter / sanear) |
|---|---|---|---|
| 1 | Vocabulário de status: backend usa EN (`waitlisted/active/discharged/withdrawn`), chips usam PT (`fila/acolhido/alta/desistente`) | lista de pacientes, prontuário | padronizar — mapa único EN→PT em [design-tokens.fe.md](./design-tokens.fe.md) §3 + dicionário i18n; enum EN nunca aparece na UI |
| 2 | `PatientStatus` documentado com 3 valores, mas a máquina de estados e os filtros incluem `withdrawn` | filtro de status em `/patients` | padronizar — UI trata 4 estados; `withdrawn` filtrável e exibido como "Desistente" |
| 3 | CPF/NIS/CEP trafegam sem máscara na API, telas exibem formatado (`123.456.789-00`, `12345-678`) | cadastro, prontuário | padronizar — `M3MaskedField` exibe com máscara e emite valor cru; nunca enviar formatado |
| 4 | Datas: API em ISO 8601 UTC (`2026-06-10T14:30:00Z`) vs exibição `dd/MM/yyyy` | todas | padronizar — formatter único via `Intl.DateTimeFormat` (Princípio IV: sem date-fns) |
| 5 | Docs antigas citam header `X-Actor-Id`; backend deriva `actorId` do `JWT.sub` | forms de avaliação | sanear — UI/BFF nunca envia header de ator; Bearer injetado só no BFF (Princípio I, [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)) |
| 6 | Token `--color-risk-delay` vs vocabulário de domínio "evasão escolar" (`dropoutRisk`) | chips de risco | manter token, padronizar label "Evasão escolar" no i18n; documentado em [design-tokens.fe.md](./design-tokens.fe.md) §4 |
| 7 | Sem idempotência nos POSTs (documentado como gap do backend) | wizard, atendimentos, encaminhamentos | sanear na UI — botão de submit trava em `pending` (estado do ViewModel + binding Solid, [ADR-0009](../../adr/0009-framework-agnostic-client.md)) até resposta |

## 4. Política de fidelidade (clone fiel)

- **Replicar** (comportamento visível): frames `M3/*` do Figma (fidelidade visual validada em PR, [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)); enums e transições reais do backend — `StatusTransitionDialog` só oferece ações válidas para o estado atual (`waitlisted→admit|withdraw`, `active→discharge`, `discharged→readmit`); envelope `{ data, meta }` e paginação por cursor; campos condicionais metadata-driven dos benefícios; analytics exibidos como vêm do backend (UI **não recalcula** densidade/RPC).
- **Sanear** (bug de borda, não-UI): encoding/typos em `descricao` de lookups (exibir como vier, abrir solicitação de correção via `/dominios/requests`); duplo-submit sem idempotência (lock de pending no client); divergências de contrato → registrar em `web_02/handbook/inquiries/` ou ADR.
- **Reservado para futuro** (manter placeholder): upload de documentos (`RequiredDocument` sem endpoint de binário — exibir checklist apenas); `ETag`/`If-Match` (header sugerido futuro — hoje conflito chega como 409); dark mode completo de `action/risk/status` (tokens preparados, fora do escopo v1); virtualização da tabela de pacientes (decisão em feature própria).

## 5. Vocabulário compartilhado (saída)

Nomes canônicos usados pelos documentos [design-tokens.fe.md](./design-tokens.fe.md) → [design-pages.fe.md](./design-pages.fe.md) e pelo código (`src/modules/shell/client/` + `src/modules/social-care/client/`), nomeados por **papel/estrutura**, nunca por conteúdo:

- **Átomos**: `M3Button`, `M3FAB`, `M3BackButton`, `M3MenuButton`, `M3TextField`, `M3NumberField`, `M3MaskedField`, `M3DateField`, `M3StatusChip`, `M3RiskChip`, `M3CountBadge`, `M3CaregiverBadge`, `M3CircleAvatar`, `M3ChoiceChip` — ver [design-atoms.fe.md](./design-atoms.fe.md).
- **Moléculas**: `M3SearchBar`, `M3DataField`, `M3DropdownField`, `M3BoolChoice`, `M3SectionHeader`, `M3StatCard`, `M3FamilyMemberRow`, `M3TimelineItem`, `M3EmptyState`, `M3PaginationControl`, `M3AutoSaveIndicator` — ver [design-molecules.fe.md](./design-molecules.fe.md).
- **Organismos**: `AppShell`, `M3TopAppBar`, `PatientTable`, `FamilyCompositionTable`, `AssessmentForm`, `AuditTimeline`, `StatusTransitionDialog`, `LookupAdminPanel`, `AnalyticsStatGrid`, `LgpdAnonymizedBanner`, `VersionConflictBanner` — ver [design-organisms.fe.md](./design-organisms.fe.md).
- **Templates**: `ShellTemplate`, `ListTemplate`, `RecordTemplate`, `FormTemplate`, `WizardTemplate`, `SettingsTemplate` — ver [design-templates.fe.md](./design-templates.fe.md).
- **Domínio (PT-BR na UI)**: Paciente · Prontuário · Titular · Composição familiar · Pessoa de referência (cuidador primário) · Avaliação socioeconômica · Encaminhamento · Violação de direitos · Acolhimento/afastamento · Ingresso/triagem · Atendimento · Domínios (lookups).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI, especialmente I (BFF-Orchestrated Boundary), IV (Bun-Native/Zero-NPM-Utility) e V (Type Safety)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — Arquitetura vertical-modular; paths `modules/<f>/{server,client,public-api}`
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — Split client (MVVM) × server (DDD); fronteira Eden → Elysia
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine do design system
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia; `*.query.fn.ts` / `*.service.fn.ts`
- [design-tokens.fe.md](./design-tokens.fe.md) — Tokens canônicos (mapa EN→PT, lacunas)
- [design-atoms.fe.md](./design-atoms.fe.md) — Fichas de átomos
- [design-molecules.fe.md](./design-molecules.fe.md) — Fichas de moléculas
- [design-organisms.fe.md](./design-organisms.fe.md) — Fichas de organismos
- [design-templates.fe.md](./design-templates.fe.md) — Layout e guardrails
- [design-pages.fe.md](./design-pages.fe.md) — Instâncias concretas com edge-cases
- [design-governance.fe.md](./design-governance.fe.md) — Regras de evolução e qualidade
- Docs offline: `../../reference/ui/vanilla-extract/` · `../../reference/framework/solidstart/` · `../../reference/framework/elysia/`
