# 02 · Atoms: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Nível**: Atoms (Atomic Design, Cap. 2)

> **Átomos** = blocos elementares de UI que não se decompõem sem perder função (Button, Input, Label,
> Badge, Icon…). Vivem em `src/components/ui/m3/` (Atomic: `tokens ← atoms`). São burros, só-tokens,
> nomeados pelo papel, construídos com vanilla-extract ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)).
> Ficha por átomo segue as qualidades de pattern library (Frost, Cap. 3): descrição, props, estados/variações,
> tokens, a11y, **linhagem** (onde é usado).
>
> A maioria dos átomos é **reusada** do catálogo do social-care
> ([../social-care/design-atoms.fe.md](../social-care/design-atoms.fe.md)) — fichas completas lá; aqui só a variação de uso.
> Novos: `M3ActiveBadge`, `M3RoleBadge`, `M3LoginIndicator`.

## Lista de átomos (novos ou reusados)

### `M3Button` — ação
- **Reuso?**: já existe em `ui/m3/M3Button/` (ficha completa no social-care)
- **Props (API)**: `{ variant: "filled" | "tonal" | "outlined" | "text" | "destructive", size, disabled, pending, onPress, children }`
- **Variações/estados**: nesta feature, `destructive` cobre **Desativar pessoa/vínculo** e **Apagar definitivamente (LGPD)**; `pending` trava duplo-submit (POSTs sem idempotência — inconsistência #8 do [inventory](./design-interface-inventory.fe.md))
- **Tokens usados**: `--color-action-primary*`, `--color-danger-500` (destructive), `elevation.stateLayer`, `radius.full`
- **Acessibilidade**: foco visível; `aria-disabled` em pending
- **Usado em (linhagem)**: `PersonForm`, `IdpAccessPanel`, `RolePanel`, `ErasureDialog`, `M3PaginationControl`
- **Evidência**: mutações `POST/PUT/DELETE /api/v1/people*` (mapa do serviço §3)

### `M3FAB` — ação primária flutuante
- **Reuso?**: já existe (`ui/m3/M3FAB/`)
- **Props (API)**: `{ icon, label, onPress }`
- **Variações/estados**: extended ("Nova pessoa")
- **Tokens usados**: `--color-action-primary`, `elevation.shadow.md`, `radius.xl`, `zIndex.sticky`
- **Acessibilidade**: label textual obrigatório; alvo ≥ 44px
- **Usado em (linhagem)**: `ListTemplate` (`/people` → "Nova pessoa") — oculto para role `owner` (POST é worker/admin)
- **Evidência**: `POST /api/v1/people` (roles: worker, admin)

### `M3BackButton` / `M3MenuButton` — navegação e menu contextual
- **Reuso?**: já existem
- **Props (API)**: `{ onPress }` · `{ items: MenuItem[], onAction }`
- **Variações/estados**: menu kebab da linha de pessoa (Abrir · Editar · Desativar/Reativar) e do chip de vínculo (Desativar/Reativar) — **itens filtrados por RBAC** antes de renderizar
- **Tokens usados**: `--color-text-secondary`, `elevation.stateLayer`, `zIndex.dropdown`
- **Acessibilidade**: `aria-haspopup`; navegação por setas
- **Usado em (linhagem)**: `M3TopAppBar` (voltar à lista), `PersonRow`, `RoleChipWithActions`
- **Evidência**: matriz endpoint × roles (§7 do mapa)

### `M3TextField` — entrada de texto com label e erro
- **Reuso?**: já existe
- **Props (API)**: `{ label, value, onChange, errorMessage?: string, description?: string, required: boolean, disabled: boolean, maxLength: number }`
- **Variações/estados**: `fullName` (obrigatório, trim 1–200, `maxLength=200`) · `email` (opcional; **obrigatório quando `createLogin=true`** — erro espelha `PEO-009` 422) · erro `PEO-001`
- **Tokens usados**: `--color-border-*`, `--color-text-*`, `--color-text-error`, `radius.md`
- **Acessibilidade**: erro em `aria-describedby`
- **Usado em (linhagem)**: `PersonForm`, `IdpAccessPanel` (override de email na provisão retroativa), `ErasureDialog` (campo de confirmação digitada)
- **Evidência**: `CreatePersonInput` / `UpdatePersonInput` (`validateCreatePerson`, §2.1 do mapa)

### `M3MaskedField` — CPF mascarado (LGPD)
- **Reuso?**: já existe (`ui/m3/M3MaskedField/`)
- **Props (API)**: `{ mask: "cpf", label, value, onChange, errorMessage?: string, reveal?: boolean }` — desta feature só a máscara `cpf`
- **Variações/estados**: edição com máscara visual (`123.456.789-00` → emite 11 dígitos crus) · erro de validação local (MOD-11 + rejeição de repdigits, replicando o branded type `Cpf` do backend; espelha `PEO-004`) · exibição parcial (`***.456.789-**`) em lista · readOnly no detalhe
- **Tokens usados**: `typography.fontFamily.mono`, `--color-border-*`, `--color-text-error`
- **Acessibilidade**: máscara não vaza pra leitores de tela (anuncia valor lógico); "revelar" com `aria-pressed`
- **Usado em (linhagem)**: `PersonForm` (campo opcional — dedup idempotente no backend), `M3SearchBar` (busca por prefixo de CPF normaliza máscara), `PersonRow`, aba Perfil
- **Evidência**: branded type `Cpf` (MOD-11, sem repdigits); `GET /people/by-cpf/:cpf`; regra "exibir formatado, enviar cru" ([inventory](./design-interface-inventory.fe.md) §3.2)

### `M3DateField` — entrada de data
- **Reuso?**: já existe — átomo criado pelo conjunto social-care ([../social-care/design-atoms.fe.md](../social-care/design-atoms.fe.md)), aqui só consumido
- **Props (API)**: `{ label, value, onChange, maxValue?: string, minValue?: string, errorMessage?: string }`
- **Variações/estados**: `birthDate` obrigatório com `maxValue = hoje` (backend rejeita data futura — `PEO-001`)
- **Tokens usados**: mesmos do `M3TextField` + `zIndex.overlay`
- **Acessibilidade**: digitado `dd/MM/yyyy`, emissão ISO 8601 (`YYYY-MM-DD`)
- **Usado em (linhagem)**: `PersonForm`
- **Evidência**: `Person.birthDate` (`IsoDateString`, não-futura)

### `M3CircleAvatar` — identidade visual de pessoa
- **Reuso?**: já existe
- **Props (API)**: `{ name: string, size: "sm" | "lg" }` (iniciais — sem foto)
- **Variações/estados**: sm (linha da tabela) · lg (header do detalhe)
- **Tokens usados**: paleta `warmGray`, `radius.full`, `typography`
- **Acessibilidade**: `aria-hidden` quando nome visível ao lado
- **Usado em (linhagem)**: `PersonRow`, header do `RecordTemplate`
- **Evidência**: `Person.fullName`

### `M3ChoiceChip` — seleção exclusiva curta
- **Reuso?**: já existe
- **Props (API)**: `{ options: string[], value: string, onChange: (v: string) => void }`
- **Variações/estados**: filtro de vínculos por estado (Ativos / Inativos / Todos → query `?active=true|false`/omitido)
- **Tokens usados**: `--color-action-primary`, `--color-border-default`, `radius.full`
- **Acessibilidade**: `role="radiogroup"`; navegação por setas
- **Usado em (linhagem)**: `RolePanel` (filtro `active`)
- **Evidência**: `GET /people/:personId/roles?active=`

### `M3ActiveBadge` — estado ativo/inativo (NOVO)
- **Reuso?**: novo — candidato a global em `ui/m3/` (estado `active` boolean existe em Person **e** SystemRole; ver promoção em [./design-governance.fe.md](./design-governance.fe.md) §2). O `M3StatusChip` existente não serve: suas variantes são a máquina `PatientStatus` do prontuário
- **Props (API)**: `{ active: boolean, size?: "sm" | "md" }` — imagem 1:1 do boolean do domínio; sem terceiro estado
- **Variações/estados**: `active=true` → "Ativa" (verde + ícone check) · `active=false` → "Inativa" (cinza + ícone pausa); sempre cor + ícone + label (daltonismo)
- **Tokens usados**: `--color-person-active` / `--color-person-inactive` (propostos em [./design-tokens.fe.md](./design-tokens.fe.md) §2), `radius.full`, `typography.fontSize.xs`
- **Acessibilidade**: ícone `aria-hidden`; label textual sempre presente; contraste AA da borda
- **Usado em (linhagem)**: `PersonRow`, header do `RecordTemplate`, `RoleChipWithActions` (estado do vínculo), `IdpAccessPanel`
- **Evidência**: `Person.active` (soft delete, §2.1) e `SystemRole.active` (§2.2); erros `PEO-005/006` (409 já inativa/ativa)

### `M3RoleBadge` — vínculo `system:role` (NOVO)
- **Reuso?**: novo — candidato a global (qualquer feature que exiba claims `groups` do Authentik reusa)
- **Props (API)**: `{ system: string, role: string, active?: boolean }` — renderiza `system:role` (ex. `social-care:patient`) com label PT-BR via i18n ("Paciente · Social Care") e o identificador técnico em mono
- **Variações/estados**: ativo (borda normal) · inativo (esmaecido, `--color-text-disabled`) · sistemas conhecidos (`social-care`, `queue-manager`, `therapies`, `timesheet`) e papéis conhecidos (`patient`, `professional`, `family-member`, `employee`, `therapist`) com label traduzido · par desconhecido (lista não exaustiva no backend) → exibe identificador cru em mono, sem quebrar
- **Tokens usados**: `--color-border-default`, `--color-person-active`/`-inactive`, `typography.fontFamily.mono`, `radius.full`
- **Acessibilidade**: `aria-label` composto ("Vínculo Paciente no sistema Social Care, ativo")
- **Usado em (linhagem)**: `RoleChipWithActions`, `PersonRow` (até 3 + `+N`), `RolePanel`
- **Evidência**: `SystemRole { system, role, active }`; mapeamento group Authentik `system:role` (ADR-029 do serviço); `KnownSystem`/`KnownRole` não exaustivos

### `M3LoginIndicator` — indicador "tem login" (NOVO)
- **Reuso?**: novo — local até segunda feature precisar (provável promoção: estados IdP são transversais)
- **Props (API)**: `{ state: "linked" | "none" | "failed" }` — derivado no ViewModel ([ADR-0009](../../adr/0009-framework-agnostic-client.md)): `idpUserId != null` → `linked`; `idpUserId === null` → `none`; `none` + flag de criação `207` na sessão → `failed`
- **Variações/estados**: `linked` ("Tem login", verde, ícone chave) · `none` ("Sem login", cinza, ícone chave cortada) · `failed` ("Provisão falhou — tentar de novo", âmbar, ícone alerta)
- **Tokens usados**: `--color-idp-linked` / `--color-idp-none` / `--color-idp-failed` (propostos em [./design-tokens.fe.md](./design-tokens.fe.md) §2), `radius.full`, `typography.fontSize.xs`
- **Acessibilidade**: cor + ícone + label sempre; `failed` não usa `role="alert"` (o alerta é do `IdpRetryBanner`)
- **Usado em (linhagem)**: `PersonRow` (coluna login), header do `RecordTemplate`, `IdpAccessPanel`
- **Evidência**: `Person.idpUserId` (`null`/presente, §2.1); `207 Multi-Status` de `POST /people` com retry via `POST /people/:id/login` (§10 do mapa)

## Cobertura vs. inventory

| Átomo do [inventory](./design-interface-inventory.fe.md) | Coberto? | Documento |
|---|---|---|
| Botões (filled/tonal/outlined/text/destrutivo) | ✅ (reuso) | `M3Button` |
| FAB "Nova pessoa" | ✅ (reuso) | `M3FAB` |
| Voltar / menu kebab | ✅ (reuso) | `M3BackButton` / `M3MenuButton` |
| Campo texto (`fullName`, `email`) | ✅ (reuso) | `M3TextField` |
| Campo mascarado CPF | ✅ (reuso) | `M3MaskedField` |
| Campo de data (`birthDate`) | ✅ (reuso) | `M3DateField` |
| Avatar | ✅ (reuso) | `M3CircleAvatar` |
| Chip de escolha (filtro de vínculos) | ✅ (reuso) | `M3ChoiceChip` |
| Badge ativo/inativo | ✅ (novo) | `M3ActiveBadge` |
| Badge de vínculo `system:role` | ✅ (novo) | `M3RoleBadge` |
| Indicador "tem login" | ✅ (novo) | `M3LoginIndicator` |
| Campo de senha, busca, paginação | ⬜ (são moléculas) | [./design-molecules.fe.md](./design-molecules.fe.md) |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios III, V (ViewModel puro; TypeBox/vanilla-extract)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine do design system (só-tokens)
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro; binding Solid (derivação de `idpUserId`→`state`)
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — Inventário completo desta feature
- [./design-tokens.fe.md](./design-tokens.fe.md) — Tokens que estes átomos consomem
- [./design-molecules.fe.md](./design-molecules.fe.md) — Moléculas que compõem estes átomos
- [./design-governance.fe.md](./design-governance.fe.md) — Regras de promoção local→global
- [../social-care/design-atoms.fe.md](../social-care/design-atoms.fe.md) — Fichas completas dos átomos reusados
- Docs offline: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/) · [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
