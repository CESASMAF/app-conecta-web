# 02 · Atoms: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Nível**: Atoms (Atomic Design, Cap. 2)

> **Átomos** = blocos elementares de UI que não se decompõem sem perder função (Button, Input, Label,
> Badge, Icon…). Vivem em `src/modules/shared/client/ui/m3/` (Atomic: `tokens ← atoms`). São burros,
> só-tokens, nomeados pelo papel, construídos com **vanilla-extract** (CSS-in-TS zero-runtime,
> [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) sobre primitivos acessíveis (WAI-ARIA APG).
> Ficha por átomo segue as qualidades de pattern library (Frost, Cap. 3): descrição, props, estados/variações,
> tokens, a11y, **linhagem** (onde é usado).

## Lista de átomos (novos ou reusados)

### `M3Button` — ação
- **Reuso?**: já existe em `ui/m3/M3Button/`
- **Props (API)**: `{ variant: "filled" | "tonal" | "outlined" | "text" | "destructive", size, disabled, pending, onClick, children }`
- **Variações/estados**: default · hover (state-layer 0.08) · focus (0.12) · pressed (0.16) · disabled · pending (trava duplo-submit — backend sem idempotência)
- **Tokens usados**: `vars.color.actionPrimary*`, `vars.color.danger500` (destructive), `vars.elevation.stateLayer`, `vars.radius.full`, `vars.spacing`
- **Acessibilidade**: `<button>` nativo; foco visível (`vars.color.focusRing`); `aria-disabled` em pending; contraste AA no `vars.color.actionPrimaryFg`
- **Usado em (linhagem)**: `StatusTransitionDialog` (Admitir/Desligar/Readmitir/Retirar), `AssessmentForm`, `M3PaginationControl`, `LookupAdminPanel`
- **Evidência**: Figma `M3/Button`; ações de `POST /patients/:id/{admit,discharge,readmit,withdraw}`

### `M3FAB` — ação primária flutuante
- **Reuso?**: já existe (`ui/m3/M3FAB/`)
- **Props (API)**: `{ icon, label, onClick }`
- **Variações/estados**: default · hover · pressed · extended (com label)
- **Tokens usados**: `vars.color.actionPrimary`, `vars.elevation.shadowMd`, `vars.radius.xl`, `vars.zIndex.sticky`
- **Acessibilidade**: label textual obrigatório (não só ícone); alvo ≥ 44px
- **Usado em (linhagem)**: `ListTemplate` (`/patients` → "Novo paciente")
- **Evidência**: Figma `M3/FAB`; `POST /api/v1/patients`

### `M3BackButton` / `M3MenuButton` — navegação e menu contextual
- **Reuso?**: já existem
- **Props (API)**: `{ onClick }` · `{ items: MenuItem[], onAction }` (menu kebab por linha)
- **Variações/estados**: default · hover · focus · menu aberto (`aria-expanded`)
- **Tokens usados**: `vars.color.textSecondary`, `vars.elevation.stateLayer`, `vars.zIndex.dropdown`
- **Acessibilidade**: menu com navegação por setas; `aria-haspopup`
- **Usado em (linhagem)**: `M3TopAppBar` (voltar ao prontuário/lista); linhas de `PatientTable` e `FamilyCompositionTable` (ações por item)
- **Evidência**: Figma `M3/TopAppBar`, `M3/Menu`

### `M3TextField` — entrada de texto com label e erro
- **Reuso?**: já existe
- **Props (API)**: `{ label, value, onInput, errorMessage?: string, description?: string, required: boolean, disabled: boolean, maxLength: number }`
- **Variações/estados**: default · focus (`vars.color.borderActive`) · erro (`vars.color.borderError` + mensagem) · disabled · readOnly (prontuário anonimizado)
- **Tokens usados**: `vars.color.border*`, `vars.color.text*`, `vars.color.textError`, `vars.radius.md`, `vars.spacing`
- **Acessibilidade**: `<label>` + `<input>` + `<span>` de erro associados via `aria-describedby`; erro anunciado em live region
- **Usado em (linhagem)**: todas as moléculas de formulário; campos `reason`/`notes` (max 1000 chars em discharge/withdraw), `descriptionOfFact`, `serviceReason`
- **Evidência**: Figma `M3/TextField`; DTOs `RegisterPatientRequest`, `ReportRightsViolationRequest`

### `M3NumberField` — entrada numérica
- **Reuso?**: já existe
- **Props (API)**: `{ label, value, onInput, minValue, maxValue, formatOptions, errorMessage?: string }`
- **Variações/estados**: default · erro de faixa (ex.: `monthsGestation` 1–9; renda ≥ 0 — espelha `SOCIO-001`, `HOUSING-001`) · disabled
- **Tokens usados**: mesmos do `M3TextField`
- **Acessibilidade**: steppers acessíveis por teclado; `inputmode="decimal"`
- **Usado em (linhagem)**: `AssessmentForm` (cômodos/dormitórios/banheiros, `totalFamilyIncome`, `monthlyAmount`, `monthsGestation`)
- **Evidência**: DTOs `UpdateHousingConditionRequest`, `UpdateSocioEconomicSituationRequest`, `UpdateHealthStatusRequest`

### `M3MaskedField` — identificadores brasileiros mascarados (LGPD)
- **Reuso?**: já existe (componente custom citado na [ADR-0007](../../adr/0007-design-system-vanilla-extract.md))
- **Props (API)**: `{ mask: "cpf" | "nis" | "cep" | "phone" | "cns", label, value, onInput, errorMessage?: string, reveal?: boolean }`
- **Variações/estados**: mascarado parcial (`***.456.789-**`, exibição LGPD) · edição com máscara visual · erro de validação (dígito verificador de CPF replica VO `CPF` do backend) · readOnly
- **Tokens usados**: `vars.typography.fontFamilyMono`, `vars.color.border*`, `vars.color.textError`
- **Acessibilidade**: máscara não vaza pra leitores de tela (anuncia valor lógico); botão "revelar" com `aria-pressed`
- **Usado em (linhagem)**: wizard de cadastro (`civilDocuments`: CPF 11 dígitos, NIS 11, RG, CNS; `address.cep` `12345-678`); busca por documento
- **Evidência**: VOs do Kernel (`CPF`, `NIS`, `CEP`, `CNS`); regra "exibir formatado, enviar cru" ([design-interface-inventory.fe.md](./design-interface-inventory.fe.md) §3.3)

### `M3DateField` — entrada de data (NOVO)
- **Reuso?**: novo — único átomo novo da feature; compor com input nativo + tokens existentes (sem token novo, ver [design-tokens.fe.md](./design-tokens.fe.md) §4)
- **Props (API)**: `{ label, value, onInput, maxValue?: string, minValue?: string, errorMessage?: string }`
- **Variações/estados**: default · erro (data futura proibida — espelha `REF-001`; `endDate ≥ startDate` — `PLACE-001`) · disabled
- **Tokens usados**: mesmos do `M3TextField` + `vars.zIndex.overlay` (popover do calendário)
- **Acessibilidade**: grade de calendário navegável por teclado; entrada digitada `dd/MM/yyyy`, emissão ISO 8601
- **Usado em (linhagem)**: `birthDate`, `incidentDate`/`reportDate`, `issueDate` do RG, datas de acolhimento, `date` de atendimento/encaminhamento
- **Evidência**: formatos §10.1 do mapa do serviço; validações `REF-001`, `PLACE-001`

### `M3StatusChip` — status do prontuário
- **Reuso?**: já existe
- **Props (API)**: `{ status: "acolhido" | "fila" | "alta" | "desistente", class?: string }` — variantes = imagem 1:1 da máquina de estados `PatientStatus` (`active`→acolhido, `waitlisted`→fila, `discharged`→alta, `withdrawn`→desistente)
- **Variações/estados**: 4 variantes, sempre cor + ícone + label (check/relógio/seta/✕) — nunca só cor (daltonismo)
- **Tokens usados**: `vars.color.status{Acolhido,Fila,Alta,Desistente}`, `vars.radius.full`, `vars.typography.fontSizeXs`
- **Acessibilidade**: ícone `aria-hidden`; label textual sempre presente; contraste AA da borda
- **Usado em (linhagem)**: `PatientTable` (coluna status), header do `RecordTemplate`, `M3StatCard` do dashboard
- **Evidência**: `M3StatusChip` existente; enum `PatientStatus` + transições admit/discharge/readmit/withdraw

### `M3RiskChip` — alerta de risco computado
- **Reuso?**: já existe
- **Props (API)**: `{ risk: "violation" | "overcrowding" | "delay" | "prenatal" | "default", label: string }`
- **Variações/estados**: 5 variantes — derivadas de dados reais: `violationReports`, `computedAnalytics.housing.isOvercrowded`, `educationalVulnerabilities.dropoutRisk`, `gestatingMembers` sem pré-natal
- **Tokens usados**: `vars.color.risk*`, `vars.radius.full`
- **Acessibilidade**: idem `M3StatusChip` (cor + ícone + label)
- **Usado em (linhagem)**: `PatientTable`, `AnalyticsStatGrid`, header do prontuário
- **Evidência**: tokens `vars.color.risk*` em `tokens.css.ts`; `computedAnalytics` (§10.8 do mapa)

### `M3CountBadge` — contador
- **Reuso?**: já existe
- **Props (API)**: `{ count: number, max?: number }`
- **Variações/estados**: 0 (oculto) · 1–99 · `99+`
- **Tokens usados**: `vars.color.actionPrimary`, `vars.typography.fontSizeXs`, `vars.radius.full`
- **Acessibilidade**: acompanhado de texto invisível (`aria-label` com unidade: "3 documentos pendentes")
- **Usado em (linhagem)**: abas do `RecordTemplate` (nº de encaminhamentos pendentes, documentos exigidos `requiredDocuments`), nav rail
- **Evidência**: `FamilyMember.requiredDocuments`; `referrals` com `status=PENDING`

### `M3CaregiverBadge` — marcador de pessoa de referência
- **Reuso?**: já existe
- **Props (API)**: `{ }` (presença binária)
- **Variações/estados**: única — exibido quando `isCaregiver` + designação via `PUT /patients/:id/primary-caregiver` (invariante: máx. 1 por família)
- **Tokens usados**: `vars.color.info500`, `vars.radius.full`
- **Acessibilidade**: `aria-label="Pessoa de referência"`
- **Usado em (linhagem)**: `M3FamilyMemberRow`
- **Evidência**: comando `AssignPrimaryCaregiverCommand`; invariante "máx. 1 cuidador primário"

### `M3CircleAvatar` — identidade visual de pessoa
- **Reuso?**: já existe
- **Props (API)**: `{ name: string, size: "sm" | "md" | "lg" }` (iniciais — sem foto; não há upload de binários na API)
- **Variações/estados**: tamanhos sm/md/lg · fallback de iniciais · estado anonimizado (ícone genérico pós-LGPD erasure)
- **Tokens usados**: paleta `vars.color.warmGray*`, `vars.radius.full`, `vars.typography`
- **Acessibilidade**: `aria-hidden` quando nome visível ao lado
- **Usado em (linhagem)**: `PatientTable`, `M3FamilyMemberRow`, `user-menu` do shell
- **Evidência**: `personalData.firstName/lastName`; `PatientPIIAnonymizedEvent`

### `M3ChoiceChip` — seleção exclusiva curta
- **Reuso?**: já existe
- **Props (API)**: `{ options: Option[], value: string, onChange: (v: string) => void }` (grupo `role="radiogroup"`)
- **Variações/estados**: selecionado · não selecionado · disabled
- **Tokens usados**: `vars.color.actionPrimary`, `vars.color.borderDefault`, `vars.radius.full`, `vars.elevation.stateLayer`
- **Acessibilidade**: grupo com `role="radiogroup"`; navegação por setas
- **Usado em (linhagem)**: filtro de status em `/patients` (4 estados + "Todos"); `sex` (`M|F|NB`) no cadastro; filtro `eventType` do `AuditTimeline`
- **Evidência**: query `?status=` de `GET /patients`; `PersonalData.sex`

## Cobertura vs. inventory

| Átomo do inventory | Coberto? | Documento |
|---|---|---|
| Botões (filled/tonal/outlined/text/destrutivo) | ✅ | `M3Button` |
| FAB "Novo paciente" | ✅ | `M3FAB` |
| Voltar / menu kebab | ✅ | `M3BackButton` / `M3MenuButton` |
| Campo texto | ✅ | `M3TextField` |
| Campo numérico | ✅ | `M3NumberField` |
| Campo mascarado CPF/NIS/CEP/CNS/telefone | ✅ | `M3MaskedField` |
| Campo de data | ✅ (novo) | `M3DateField` |
| Chip de status do paciente | ✅ | `M3StatusChip` |
| Chip de risco | ✅ | `M3RiskChip` |
| Contador | ✅ | `M3CountBadge` |
| Badge de cuidador | ✅ | `M3CaregiverBadge` |
| Avatar | ✅ | `M3CircleAvatar` |
| Chip de escolha (filtros, sexo) | ✅ | `M3ChoiceChip` |
| Select de lookup, sim/não, busca, paginação | ⬜ (são moléculas) | [design-molecules.fe.md](./design-molecules.fe.md) |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios III (MVVM; views burras), IV (Bun-Native), V (TypeBox/Eden type-safe)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract; regra só-tokens; `vars.*`
- [ADR-0008](../../adr/0008-self-host-webfonts.md) — self-host `.woff2` (Atkinson Hyperlegible Next); sem @fontsource
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid (sem `solid-js` no núcleo)
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — inventário e vocabulário compartilhado
- [design-tokens.fe.md](./design-tokens.fe.md) — primitivos e semânticos (`vars.*`); lacunas
- [design-molecules.fe.md](./design-molecules.fe.md) — moléculas que compõem estes átomos
- [design-governance.fe.md](./design-governance.fe.md) — regras de evolução, gates de qualidade
- Docs offline: `../../reference/ui/vanilla-extract/` · `../../reference/framework/solidstart/`
