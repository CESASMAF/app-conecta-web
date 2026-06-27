# 05 · Templates: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Nível**: Templates (Atomic Design, Cap. 2)

> **Templates** = objetos no nível de página que posicionam organismos num **layout** e articulam a
> **estrutura de conteúdo** — o esqueleto, sem conteúdo final. Definem guardrails do conteúdo dinâmico
> (dimensões, limites de caracteres, nº de colunas). No web-app, um template ≈ o componente de layout
> Solid que **liga o ViewModel + binding** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)) +
> compõe organismos. Rotas vivem em `src/routes/` (file-based SolidStart). **Foco em estrutura,
> não em dados reais** (isso é o [design-pages.fe.md](./design-pages.fe.md)).

## Lista de templates de layout

### `ShellTemplate` — casca autenticada
- **Layout**: nav rail fixo à esquerda (72px; bottom tabs < `md`) + `M3TopAppBar` sticky + área de conteúdo (max-width 1200px, `vars.spacing6` de gutter)
- **Organismos posicionados**: `AppShell` (rail, user menu, network banner) + slot de página
- **Estrutura de conteúdo (guardrails)**: título da app bar ≤ 1 linha (truncate); itens do rail = 5 áreas (Dashboard, Pacientes, Domínios, +2 reservadas) com `M3CountBadge` opcional
- **Regiões dinâmicas / slots**: conteúdo da rota filha; ações da app bar por página
- **Mapeia para**: `src/routes/_auth.tsx` (layout route SolidStart) + `src/modules/shell/client/`
- **Rota(s)**: todas sob `/_auth`

### `ListTemplate` — listagem com busca, filtros e paginação
- **Layout**: header da página (título + `M3FAB`/CTA) → barra de busca + chips de filtro (1 linha, wrap) → tabela full-width → controle de paginação centrado
- **Organismos posicionados**: `PatientTable` (inclui `M3SearchBar`, filtros, `M3PaginationControl`, `M3EmptyState`)
- **Estrutura de conteúdo (guardrails)**: colunas da tabela: avatar (48px) · nome (flex, truncate 2 linhas) · documento (mono, 140px) · status (chip, 120px) · riscos (até 3 chips + `+N`) · idade (64px) · menu (48px); `limit` 1–100 (default 20)
- **Regiões dinâmicas / slots**: conjunto de filtros; colunas; CTA do header
- **Mapeia para**: `src/routes/_auth/patients/index.tsx`
- **Rota(s)**: `/patients`; reutilizável por `/settings/lookups/requests`

### `RecordTemplate` — prontuário com abas por bounded context
- **Layout**: `M3TopAppBar` (voltar + nome do titular + `M3StatusChip` + menu de transições) → banners de estado (`LgpdAnonymizedBanner`/`VersionConflictBanner`) → `AnalyticsStatGrid` compacto → barra de abas (`M3TabBarItem`) → painel da aba ativa
- **Organismos posicionados**: abas espelham os bounded contexts do `social-care`: **Registry** (dados pessoais via `M3DataField`, documentos, endereço, identidade social, `FamilyCompositionTable`) · **Assessment** (índice das 7 seções + `AssessmentForm`) · **Care** (atendimentos + ingresso) · **Protection** (encaminhamentos, violações, acolhimento) · **Audit** (`AuditTimeline`)
- **Estrutura de conteúdo (guardrails)**: header com nome ≤ 2 linhas; máx. 5 abas com `M3CountBadge`; cards de analytics em grid 2–4 colunas; painel da aba com max-width 920px para leitura
- **Regiões dinâmicas / slots**: conteúdo por aba; ações de transição válidas pelo status atual; banners condicionais
- **Mapeia para**: `src/routes/_auth/patients/[patientId].tsx` (+ uma sub-rota por aba em SolidStart file-based)
- **Rota(s)**: `/patients/$patientId` (+ `/family`, `/assessments`, `/care`, `/protection`, `/audit`)

### `FormTemplate` — formulário seccionado com auto-save
- **Layout**: navegação lateral de seções (sticky, oculta < `lg`) + coluna do formulário (max-width 720px) + `M3AutoSaveIndicator` fixo no rodapé da seção + ações (Salvar/Descartar)
- **Organismos posicionados**: `AssessmentForm` (uma instância por seção PUT); reutilizado por forms de Protection (`placement-history`) e Care (`intake-info`)
- **Estrutura de conteúdo (guardrails)**: grid de campos 1–2 colunas (`vars.spacing4`); textos longos (`notes`, `descriptionOfFact`, `reason`) com contador e limite (1000 chars onde o contrato exige); grupos por membro familiar repetidos com cabeçalho do membro
- **Regiões dinâmicas / slots**: conjunto de campos da seção; campos condicionais metadata-driven; banner de conflito
- **Mapeia para**: `src/routes/_auth/patients/[patientId]/assessments/[section].tsx`
- **Rota(s)**: `/patients/$patientId/assessments/$section`

### `WizardTemplate` — cadastro em etapas
- **Layout**: indicador de progresso (etapas: Identificação → Documentos → Endereço → Diagnósticos → Identidade social → Revisão) + painel da etapa (max-width 720px) + rodapé com Voltar/Avançar/Concluir
- **Organismos posicionados**: seções de formulário por etapa (átomos/moléculas de campo); revisão final com `M3DataField`
- **Estrutura de conteúdo (guardrails)**: 1 assunto por etapa; etapa de revisão lista tudo somente leitura; submit único no final (`POST /patients` — sem idempotência, botão trava em pending)
- **Regiões dinâmicas / slots**: etapas podem ser puladas se opcionais (documentos civis são `?` no contrato); erros de validação retornam à etapa dona do campo
- **Mapeia para**: `src/routes/_auth/patients/new.tsx`
- **Rota(s)**: `/patients/new`

### `SettingsTemplate` — administração/configuração
- **Layout**: header + duas regiões empilhadas: catálogo de itens da tabela de domínio (tabela full-width) e fila de solicitações (lista com ações); seletor de `tableName` no topo
- **Organismos posicionados**: `LookupAdminPanel`
- **Estrutura de conteúdo (guardrails)**: `codigo` mono ≤ 32 chars; `descricao` truncada em 1 linha na tabela (completa no form); `justificativa`/`reviewNote` em textarea limitada
- **Regiões dinâmicas / slots**: ações visíveis por role (worker solicita; admin cria/edita/toggle/aprova/rejeita)
- **Mapeia para**: `src/routes/_auth/settings/lookups.tsx` e `src/routes/_auth/settings/lookups/requests.tsx`
- **Rota(s)**: `/settings/lookups`, `/settings/lookups/requests`

## Matriz template × comportamento

| Template | Comportamentos que usam | Variações de layout |
|---|---|---|
| `ShellTemplate` | todas as páginas autenticadas | rail lateral (≥ md) vs. bottom tabs (mobile) |
| `ListTemplate` | lista de pacientes; fila de solicitações de lookup | com/sem chips de filtro; com/sem FAB |
| `RecordTemplate` | prontuário (5 abas: Registry/Assessment/Care/Protection/Audit) | com/sem banners (LGPD, conflito); analytics compacto vs. expandido |
| `FormTemplate` | 7 seções de avaliação; acolhimento; ingresso | 1 vs. 2 colunas; com/sem grupos por membro; com/sem campos condicionais |
| `WizardTemplate` | cadastro de paciente; adicionar membro familiar (versão curta, 2 etapas) | nº de etapas; revisão final opcional |
| `SettingsTemplate` | domínios (lookups) + solicitações | leitura (worker/owner) vs. administração (admin) |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio I (BFF orquestra; cookie opaco), III (ViewModel + binding Solid; rotas file-based SolidStart)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — `modules/<f>/client/`; rotas `src/routes/`
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — split client/server; fronteira Eden → Elysia
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid (`createAsync`/`action`/`useSubmission`)
- [ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md) — Shell autenticado como tela MVVM raiz
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos posicionados por cada template
- [design-pages.fe.md](./design-pages.fe.md) — instâncias concretas destes templates com dados reais
- [design-tokens.fe.md](./design-tokens.fe.md) — `vars.*` de layout usados (spacing, zIndex, radius)
- [design-governance.fe.md](./design-governance.fe.md) — gates de qualidade e versionamento
- Docs offline: `../../reference/framework/solidstart/` · `../../reference/ui/vanilla-extract/`
