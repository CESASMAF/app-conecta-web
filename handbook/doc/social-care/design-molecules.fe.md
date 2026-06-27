# 03 · Molecules: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Nível**: Molecules (Atomic Design, Cap. 2)

> **Moléculas** = grupos simples de átomos funcionando como uma unidade com propósito (single
> responsibility: "faz uma coisa bem"). Vivem em `src/modules/shared/client/ui/m3/`. Compõem só átomos
> (e tokens), sem lógica de negócio — dados e handlers chegam prontos do **ViewModel + binding Solid**
> ([ADR-0009](../../adr/0009-framework-agnostic-client.md)). Ficha por molécula (Frost, Cap. 3).

## Lista de moléculas

### `M3SearchBar` — busca de pacientes
- **Reuso?**: já existe
- **Composta de (átomos)**: input de busca + ícone + botão limpar
- **Props (API)**: `{ value: string, onInput: (v: string) => void, onSubmit: () => void, placeholder: string, pending: boolean }`
- **Comportamento**: submit/debounce dispara `onSearch` → query `GET /patients?search=` (busca textual em `firstName`/`lastName`); aceita CPF/NIS digitados (normaliza máscara antes de emitir)
- **Variações/estados**: vazio · preenchido · pendente (busca em voo) · sem resultado (delegado ao `M3EmptyState`)
- **Tokens**: `vars.color.bgSecondary`, `vars.color.border*`, `vars.radius.full`
- **Acessibilidade**: `role="searchbox"` + label; `Esc` limpa; resultado anunciado via `aria-live` na lista
- **Usado em (linhagem)**: `PatientTable` (organismo), `ListTemplate`
- **Evidência**: Figma `M3/SearchBar`; query params de `GET /api/v1/patients`

### `M3DropdownField` — select alimentado por lookup
- **Reuso?**: já existe
- **Composta de (átomos)**: label + `<select>` nativo (ou popover acessível) + mensagem de erro
- **Props (API)**: `{ label: string, items: { id: string, codigo: string, descricao: string }[], selectedKey: string | null, onSelectionChange: (k: string) => void, errorMessage?: string, required: boolean }`
- **Comportamento**: renderiza itens vindos de `GET /dominios/:tableName` (parentesco, tipo de ingresso, benefício, violação, ocupação, nível educacional, deficiência…); emite `LookupId`; só itens `ativo=true`
- **Variações/estados**: fechado · aberto · selecionado · erro (`LOOKUP-*`/`SOCIO-002`/`WORK-001`) · carregando itens · disabled
- **Tokens**: `vars.color.border*`, `vars.zIndex.dropdown`, `vars.elevation.shadowMd`, `vars.radius.md`
- **Acessibilidade**: combobox ARIA completo; erro em `aria-describedby`
- **Usado em (linhagem)**: `AssessmentForm`, wizard de cadastro (`socialIdentity.typeId`, `prRelationshipId`), forms de Protection/Care
- **Evidência**: `LookupController` (`GET /dominios/:tableName`); campos `*Id: LookupId` dos DTOs

### `M3BoolChoice` — pergunta sim/não
- **Reuso?**: já existe
- **Composta de (átomos)**: label da pergunta + 2 `M3ChoiceChip` (Sim/Não)
- **Props (API)**: `{ label: string, value: boolean | null, onChange: (v: boolean | null) => void, required: boolean }`
- **Comportamento**: mapeia flags booleanas dos agregados (`isResiding`, `isCaregiver`, `hasDisability`, `hasPipedWater`, `receivesSocialBenefit`, `foodInsecurity`, `facesDiscrimination`, `adultInPrison`…)
- **Variações/estados**: não respondido (null) · sim · não · erro de obrigatoriedade · disabled
- **Tokens**: herdados de `M3ChoiceChip`
- **Acessibilidade**: `role="radiogroup"` com legenda; obrigatório indicado fora da cor
- **Usado em (linhagem)**: `AssessmentForm` (todas as 7 seções), membro familiar, checklist de afastamento
- **Evidência**: dezenas de campos `Bool` em `HousingCondition`, `CommunitySupportNetwork`, `AfastamentoConvivio` etc.

### `M3DataField` — par label/valor somente leitura
- **Reuso?**: já existe
- **Composta de (átomos)**: label secundário + valor primário (+ máscara/mono p/ documentos)
- **Props (API)**: `{ label: string, value: string | null, format?: "cpf" | "nis" | "cep" | "date" | "money" | "text", emptyFallback?: string }`
- **Comportamento**: exibição do prontuário (GET); formata datas ISO→`dd/MM/yyyy` via `Intl`, `Money`→`R$` via `Intl.NumberFormat`; valor ausente vira "—" (campos opcionais do agregado)
- **Variações/estados**: preenchido · vazio ("—") · anonimizado ("Removido — LGPD")
- **Tokens**: `vars.color.textSecondary` (label), `vars.color.textPrimary` (valor), `vars.typography.fontFamilyMono`
- **Acessibilidade**: `<dl>/<dt>/<dd>` semântico
- **Usado em (linhagem)**: aba Registry do `RecordTemplate`, `M3FamilyMemberRow`, diffs do `AuditTimeline`
- **Evidência**: `PatientResponse` (todos os VOs opcionais); política LGPD §10.4 do mapa

### `M3SectionHeader` — título de seção de formulário/prontuário
- **Reuso?**: já existe
- **Composta de (átomos)**: título + descrição opcional + slot de ação (ex.: botão editar)
- **Props (API)**: `{ title: string, description?: string, action?: JSX.Element }`
- **Comportamento**: ancora navegação interna das seções de avaliação
- **Variações/estados**: com/sem descrição · com/sem ação
- **Tokens**: `vars.typography.fontSizeXl`, `vars.color.textPrimary`, `vars.spacing6`
- **Acessibilidade**: heading semântico (`h2`/`h3` conforme template)
- **Usado em (linhagem)**: `AssessmentForm`, `M3FormSection`, abas do prontuário
- **Evidência**: 7 seções de avaliação (housing → social-health-summary)

### `M3StatCard` — indicador computado
- **Reuso?**: já existe
- **Composta de (átomos)**: valor grande + label + chip de tendência/risco opcional
- **Props (API)**: `{ label: string, value: string, tone?: "success" | "warning" | "danger" | "info", riskChip?: JSX.Element }`
- **Comportamento**: exibe `computedAnalytics` do backend (densidade habitacional, renda per capita, índice de vulnerabilidade, perfil etário) — **UI nunca recalcula**
- **Variações/estados**: neutro · com tom semafórico · com `M3RiskChip` · skeleton (carregando)
- **Tokens**: `vars.color.bgElevated`, `vars.radius.lg`, `vars.elevation.shadowSm`, semáforos `vars.color.{success,warning,danger,info}500`
- **Acessibilidade**: valor + label lidos como unidade (`aria-label` composto)
- **Usado em (linhagem)**: `AnalyticsStatGrid` (organismo), dashboard
- **Evidência**: `computedAnalytics` em `GET /patients/:id` (§10.8 do mapa)

### `M3FamilyMemberRow` — linha de membro familiar
- **Reuso?**: já existe (com `M3FamilyTableHeader` e `M3AddMemberButton` no mesmo diretório)
- **Composta de (átomos)**: `M3CircleAvatar` + nome + parentesco (`descricao` do lookup) + idade (de `birthDate`) + `M3CaregiverBadge` + `M3CountBadge` (documentos pendentes) + `M3MenuButton`
- **Props (API)**: `{ member: FamilyMemberVM, onRemove: () => void, onAssignCaregiver: () => void }`
- **Comportamento**: ações do menu disparam handlers do ViewModel (`DELETE /patients/:id/family-members/:memberId`, `PUT /patients/:id/primary-caregiver`)
- **Variações/estados**: residente/não residente · cuidador · com deficiência (`hasDisability`) · com documentos pendentes · removido (some da lista — soft-delete `removed_at`)
- **Tokens**: `vars.color.borderDefault` (divisor), `vars.spacing4`
- **Acessibilidade**: linha de tabela semântica; ações com labels explícitos ("Remover membro", "Designar pessoa de referência")
- **Usado em (linhagem)**: `FamilyCompositionTable` (organismo)
- **Evidência**: entidade `FamilyMember`; rotas de family-members do `PatientController`

### `M3TimelineItem` — entrada do audit trail
- **Reuso?**: já existe
- **Composta de (átomos)**: marcador na linha do tempo + tipo do evento + autor + data/hora + slot de diff
- **Props (API)**: `{ eventType: string, actorLabel: string, occurredAt: string, before?: Record<string, unknown>, after?: Record<string, unknown> }`
- **Comportamento**: exibe entrada de `GET /patients/:id/audit-trail`; quando `before/after` presentes (eventos de Assessment), expande diff campo a campo com `M3DataField`
- **Variações/estados**: evento simples (lifecycle) · evento com diff (assessment) · primeiro/último da linha
- **Tokens**: `vars.color.borderStrong` (linha), `vars.color.status*`/`vars.color.risk*` no marcador conforme tipo, `vars.typography.fontSizeSm`
- **Acessibilidade**: lista ordenada semântica; expansão do diff com `aria-expanded`
- **Usado em (linhagem)**: `AuditTimeline` (organismo)
- **Evidência**: `AuditTrailEntryResponse` (id, eventType, actorId, occurredAt, before, after)

### `M3EmptyState` — vazio com ação
- **Reuso?**: já existe
- **Composta de (átomos)**: ilustração/ícone + título + texto + `M3Button` opcional
- **Props (API)**: `{ title: string, description: string, action?: JSX.Element }`
- **Comportamento**: nenhum — só apresenta; ação delega ao ViewModel
- **Variações/estados**: lista vazia ("Nenhum paciente cadastrado" + CTA) · busca sem resultado · seção não preenchida ("Avaliação ainda não realizada")
- **Tokens**: `vars.color.textSecondary`, `vars.spacing12`
- **Acessibilidade**: título como heading; não usa `role="alert"` (não é erro)
- **Usado em (linhagem)**: `PatientTable`, abas do `RecordTemplate`, `LookupAdminPanel`
- **Evidência**: `totalCount=0` na paginação; VOs opcionais nulos no `PatientResponse`

### `M3PaginationControl` — paginação por cursor (NOVO)
- **Reuso?**: novo — a API usa cursor (`nextCursor`/`hasMore`), não páginas numeradas; nenhum componente existente cobre
- **Composta de (átomos)**: `M3Button` (variant text, "Carregar mais") + contador de exibidos/total
- **Props (API)**: `{ shownCount: number, totalCount: number, hasMore: boolean, pending: boolean, onLoadMore: () => void }`
- **Comportamento**: emite `onLoadMore` com o `nextCursor` guardado no ViewModel; nunca monta URL própria
- **Variações/estados**: com mais páginas · última página (botão oculto) · carregando
- **Tokens**: herdados de `M3Button` + `vars.color.textSecondary`
- **Acessibilidade**: anuncia novos itens via `aria-live="polite"`; foco preservado após append
- **Usado em (linhagem)**: `PatientTable`, `AuditTimeline`
- **Evidência**: `meta: { pageSize, totalCount, hasMore, nextCursor }` de `GET /patients`

### `M3AutoSaveIndicator` — feedback de persistência de formulário
- **Reuso?**: já existe
- **Composta de (átomos)**: ícone de estado + texto curto
- **Props (API)**: `{ state: "idle" | "saving" | "saved" | "error" | "conflict" }`
- **Comportamento**: espelha o estado do ViewModel do form ([ADR-0009](../../adr/0009-framework-agnostic-client.md)) após cada `PUT` de avaliação (`204 No Content` → saved; `409` → conflict)
- **Variações/estados**: idle · salvando · salvo · erro (`AppError` code) · conflito de versão (manda recarregar — optimistic locking)
- **Tokens**: `vars.color.success500` / `vars.color.textError` / `vars.color.warning500`, `vars.typography.fontSizeXs`
- **Acessibilidade**: `role="status"` (`aria-live="polite"`); conflito usa `role="alert"`
- **Usado em (linhagem)**: `AssessmentForm`, forms de Protection/Care
- **Evidência**: respostas `204` dos PUTs do `AssessmentController`; `Patient.version` (optimistic locking backend)

## Cobertura vs. inventory

| Molécula do inventory | Coberta? | Documento |
|---|---|---|
| Busca de paciente | ✅ | `M3SearchBar` |
| Select de lookup (`/dominios`) | ✅ | `M3DropdownField` |
| Pergunta sim/não | ✅ | `M3BoolChoice` |
| Par label/valor (prontuário) | ✅ | `M3DataField` |
| Título de seção | ✅ | `M3SectionHeader` |
| Card de indicador | ✅ | `M3StatCard` |
| Linha de membro familiar | ✅ | `M3FamilyMemberRow` |
| Item de timeline (audit) | ✅ | `M3TimelineItem` |
| Estado vazio | ✅ | `M3EmptyState` |
| Paginação por cursor | ✅ (novo) | `M3PaginationControl` |
| Indicador de auto-save | ✅ | `M3AutoSaveIndicator` |
| Campos condicionais de benefício (metadata-driven) | ⬜ (variação do organismo) | [design-organisms.fe.md](./design-organisms.fe.md) → `AssessmentForm` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio III (ViewModel puro; views burras sem lógica de negócio)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract; `vars.*`; regra só-tokens
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; handlers chegam prontos da camada de binding
- [design-atoms.fe.md](./design-atoms.fe.md) — átomos compostos por estas moléculas
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos que compõem estas moléculas
- [design-tokens.fe.md](./design-tokens.fe.md) — `vars.*` usados
- [design-governance.fe.md](./design-governance.fe.md) — regras de promoção e gates
- Docs offline: `../../reference/ui/vanilla-extract/` · `../../reference/framework/solidstart/` · `../../reference/framework/elysia/`
