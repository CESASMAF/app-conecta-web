# 04 · Organisms: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Nível**: Organisms (Atomic Design, Cap. 2)

> **Organismos** = seções relativamente complexas da interface, compostas de moléculas/átomos/outros
> organismos. Estabelecem padrões reutilizáveis e dão contexto. Vivem em `src/components/ui/m3/`
> (globais) ou em `src/modules/people-context/client/ui/` quando específicos da feature ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)).
> Ficha por organismo (Frost, Cap. 3) — com **linhagem** e variações. Views burras: recebem
> ViewModel + handlers do binding Solid ([ADR-0009](../../adr/0009-framework-agnostic-client.md)), nunca chamam handler de servidor diretamente.
> `AppShell` e `M3TopAppBar` são reusados como estão — fichas em
> [../social-care/design-organisms.fe.md](../social-care/design-organisms.fe.md).

## Lista de organismos

### `AppShell` / `M3TopAppBar` — casca e barra superior
- **Reuso?**: existem (`src/components/shell/`, `ui/m3/M3TopAppBar/`) · **Escopo**: globais
- **Composto de**: ver fichas no social-care; aqui apenas: novo item de nav rail "Pessoas" (`M3NavRailItem`) e app bar do detalhe com `M3CircleAvatar` + nome + `M3ActiveBadge` + `M3LoginIndicator`
- **Props (API)**: inalteradas (`{ user: SessionVM, children: JSX.Element }` · `{ title: string, onBack?: () => void, statusSlot?: JSX.Element, actions?: JSX.Element }`)
- **Variações/estados**: raiz (lista) vs. detalhe (voltar); slot de status com os dois badges da pessoa
- **Padrões de composição**: header dissimilar + rail repetido
- **Tokens**: herdados
- **Acessibilidade**: landmarks; título do detalhe = `h1` ("Cadastro de {nome}")
- **Usado em (linhagem)**: `ShellTemplate` → todas as páginas `_auth`
- **Evidência**: `app-shell.component.tsx`, `app-nav.constants.tsx` existentes

### `PersonTable` — tabela de pessoas paginada por cursor
- **Reuso?**: novo (compõe `M3Table` existente; padrão idêntico ao `PatientTable` do social-care) · **Escopo**: `src/modules/people-context/client/ui/` local
- **Composto de**: `M3SearchBar` + `M3Table` (N×`PersonRow`) + `M3PaginationControl` + `M3EmptyState`
- **Props (API)**: `{ rows: PersonRowVM[], totalCount: number, hasMore: boolean, isPending: boolean, error?: AppError, onSearch: (q: string) => void, onLoadMore: () => void, onRowPress: (id: string) => void, onRowAction: (action: RowAction, id: string) => void }` — recebe dados/handlers do ViewModel ([ADR-0009](../../adr/0009-framework-agnostic-client.md)); o `nextCursor` vive no ViewModel
- **Variações/estados**: vazio · carregando (skeleton de linhas) · erro (`AppError` + retry) · paginado (`hasMore=true` → "Carregar mais") · busca por nome · busca por prefixo de CPF · busca sem resultado · linhas inativas esmaecidas
- **Padrões de composição**: header dissimilar (busca) vs. linhas repetidas (`PersonRow`)
- **Tokens**: `--color-border-default`, `elevation.stateLayer.hover`, `spacing`
- **Acessibilidade**: `table` semântica; linha clicável com `aria-label`; total/append anunciados em `aria-live`
- **Usado em (linhagem)**: `ListTemplate` → página `/people`
- **Evidência**: `GET /api/v1/people?search&cursor&limit` (limit max 100, default 20; `meta { pageSize, totalCount, hasMore, nextCursor }`)

### `PersonForm` — cadastro/edição com seção opcional de login
- **Reuso?**: novo (compõe `M3FormSection` existente) · **Escopo**: local
- **Composto de**: `M3FormSection` ×2 + `M3SectionHeader` + campos (`M3TextField` fullName/email, `M3MaskedField` cpf, `M3DateField` birthDate) + toggle "Criar login de acesso" (`createLogin`) que revela `M3PasswordField` + ações (`M3Button` filled/text) + `IdpRetryBanner` (pós-207)
- **Props (API)**: `{ mode: "create" | "edit", formState: PersonFormVM, onFieldChange: (field: string, value: string) => void, onSubmit: () => void, onCancel: () => void, idpFailure?: { onRetry: () => void } }`
- **Variações/estados**:
  - **create**: seção "Acesso ao sistema" colapsada por padrão; ao marcar `createLogin`, `email` passa a obrigatório (validação local espelha `PEO-009` 422) e `initialPassword` opcional (min 8; TypeBox `Elysia.t` é a fonte de verdade via Eden Treaty — [Princípio V](../../../.specify/memory/constitution.md))
  - **edit**: sem seção de login (provisão é ação do `IdpAccessPanel`); campos com COALESCE — campo não tocado é **omitido** do PUT (preserva valor atual, não apaga login)
  - erro de validação (`PEO-001`/`PEO-004` → campo a campo + sumário com âncoras) · pending (submit travado, sem idempotência) · `207 Multi-Status` (pessoa criada, IdP falhou → `IdpRetryBanner` antes do redirect) · dedup por CPF (201 com id existente → redirect ao detalhe retornado, ver [inventory](./design-interface-inventory.fe.md) #4)
- **Padrões de composição**: duas seções dissimilares; a segunda condicional ao toggle
- **Tokens**: `spacing` (grid 4/8), `--color-border-error`, `radius.lg`
- **Acessibilidade**: `fieldset/legend` por seção; toggle de login com `aria-expanded`; erros anunciados em `aria-live`
- **Usado em (linhagem)**: `FormTemplate` → `/people/new`; aba Perfil em modo edição
- **Evidência**: `POST /people` (`CreatePersonInput`: fullName 1–200, cpf?, birthDate, email?, createLogin?, initialPassword? min 8); `PUT /people/:personId` (COALESCE); eventos `people.person.registered`/`updated`

### `RolePanel` — painel de vínculos com RBAC escopado
- **Reuso?**: novo · **Escopo**: local
- **Composto de**: `M3SectionHeader` ("Vínculos de sistema" + ação "Atribuir vínculo") + `M3ChoiceChip` (filtro Ativos/Inativos/Todos) + N×`RoleChipWithActions` + `M3EmptyState` + `M3Dialog` (form de atribuição: selects de `system` e `role` + confirmação de desativar/reativar)
- **Props (API)**: `{ roles: SystemRoleVM[], filter: "all" | "active" | "inactive", onFilterChange: (f: string) => void, viewerScopes: { isSuperadmin: boolean, adminSystems: string[], isSelf: boolean }, onAssign: (system: string, role: string) => void, onDeactivate: (roleId: string) => void, onReactivate: (roleId: string) => void, isPending: boolean, error?: AppError }`
- **Variações/estados**:
  - leitura (worker/owner: sem ações — atribuição/desativação é só admin)
  - admin **escopado**: ação "Atribuir" só oferece sistemas em `adminSystems` (claim `system:admin`); tentar fora do escopo nem renderiza (espelha `ROL-007` 403)
  - role `superadmin` atribuível **apenas** por superadmin (`ROL-006`)
  - auto-assign bloqueado: se `isSelf` (pessoa do cadastro é o próprio ator, `person.idpUserId === auth.sub`) e não superadmin, ação desabilitada com explicação (`ROL-008`)
  - vínculo já ativo → backend responde `204` noop → aviso "vínculo já estava ativo" ([inventory](./design-interface-inventory.fe.md) #5) · reativação de vínculo inativo → `201`
  - conflito de corrida `ROL-009` 409 → toast + recarregar lista · erros `ROL-001/002/003/005`
  - vazio ("Nenhum vínculo de sistema") · filtrado · pendente
- **Padrões de composição**: header dissimilar + chips repetidos
- **Tokens**: herdados das moléculas; `--color-warning-500` (409)
- **Acessibilidade**: lista semântica; dialog de atribuição com foco preso; ações desabilitadas com `aria-disabled` + tooltip do motivo (não apenas sumir, quando a regra é por estado e não por permissão)
- **Usado em (linhagem)**: aba Vínculos do `RecordTemplate`
- **Evidência**: `POST /people/:personId/roles` (`{system, role}`; 201/204; `ROL-006/007/008`); `PUT .../roles/:roleId/{deactivate,reactivate}` (admin escopado); `GET /people/:personId/roles?active=`; sync best-effort com groups Authentik (DB é source of truth)

### `IdpAccessPanel` — painel de acesso/IdP
- **Reuso?**: novo · **Escopo**: local
- **Composto de**: `M3SectionHeader` ("Acesso e login") + `M3LoginIndicator` + `M3DataField` (`idpUserId` mono, email) + blocos de ação (`M3Button` tonal/destructive) + `M3PasswordField` + `M3TextField` (override de email) + `M3Dialog` (confirmações) + `IdpRetryBanner` + `ErasureDialog`
- **Props (API)**: `{ person: PersonAccessVM, viewer: { isAdmin: boolean, isSuperadmin: boolean, isWorker: boolean }, onProvisionLogin: (email?: string, password?: string) => void, onRequestPasswordReset: () => void, onDeactivate: () => void, onReactivate: () => void, onErase: () => void, pendingAction?: string, error?: AppError }`
- **Variações/estados** (cada bloco espelha o contrato):
  - **Provisionar login** (worker/admin; só se `idpUserId === null`): form com email override + senha inicial opcional → `201 { id, idpUserId }`; `409 PEO-008` (já tem login → recarregar); `422 PEO-009` (sem email → erro no campo); `502 IDP-001` (banner retry)
  - **Reset de senha** (admin; só se tem login): confirmação → `202 Accepted` → aviso info "Link de recuperação enviado por e-mail" — o link **nunca** aparece na UI; `422 PEO-007` (sem login); `502 IDP-004`
  - **Desativar/Reativar pessoa** (admin): confirmação em dialog explicando ordem **IdP primeiro** — se `502 IDP-002/003`, nada mudou no banco (mensagem explícita); `409 PEO-005/006` (estado já era o desejado → recarregar)
  - **Apagamento total LGPD** (apenas superadmin): botão destructive isolado em "zona de perigo" → abre `ErasureDialog`; oculto para não-superadmin (`PEO-010` 403 nunca deve acontecer via UI)
  - pessoa sem login: blocos de reset/algumas ações substituídos por empty state com CTA "Provisionar login"
- **Padrões de composição**: blocos de ação empilhados, dissimilares; zona de perigo separada por divisor
- **Tokens**: `--color-idp-*`, `--color-danger-500` (zona de perigo), `--color-info-500` (202), `spacing.6`
- **Acessibilidade**: cada bloco é uma `section` com heading; resultados de ação anunciados em `aria-live="polite"`; erros `IDP-*` em `role="alert"`
- **Usado em (linhagem)**: aba Acesso do `RecordTemplate`
- **Evidência**: `POST /people/:id/login`; `POST /people/:id/request-password-reset`; `PUT /people/:id/{deactivate,reactivate}` (IdP first); `DELETE /people/:id` (superadmin); erros `PEO-005..010`, `IDP-001..005`

### `ErasureDialog` — apagamento LGPD com confirmação digitada
- **Reuso?**: novo (compõe `M3Dialog` existente) · **Escopo**: local (candidato a global como `ConfirmTypedDialog` genérico — ver [./design-governance.fe.md](./design-governance.fe.md) §2)
- **Composto de**: `M3Dialog` + texto de consequência (lista do que será removido: usuário no Authentik, vínculos, registro da pessoa — **irreversível**, LGPD Art. 18 V) + `M3DataField` (revisão: nome, CPF mascarado) + **dupla confirmação**: checkbox "Entendo que esta ação é irreversível" **e** `M3TextField` onde o operador digita o **nome completo** da pessoa + ações (`M3Button` destructive habilitado só com as duas confirmações + text "Cancelar")
- **Props (API)**: `{ person: { id: string, fullName: string, cpfMasked: string }, isPending: boolean, error?: AppError, onConfirm: () => void, onCancel: () => void }`
- **Variações/estados**: inicial (confirmar desabilitado) · checkbox marcado mas nome divergente (confirmar segue desabilitado + hint) · pronto (ambas confirmações) · pending (botões travados) · `502 IDP-005` (falha no Authentik — **banco não foi tocado**, mensagem explícita + fechar) · `404 PEO-002` (já removida → fechar + recarregar lista) · sucesso (`204` → redirect à lista + toast "Registro apagado definitivamente")
- **Padrões de composição**: conteúdo único, sequência de confirmação top-down
- **Tokens**: `--color-danger-500` (header/ação), `--color-bg-overlay`, `zIndex.modal`
- **Acessibilidade**: `M3Dialog` modal (foco preso, `Esc` cancela); `role="alertdialog"`; comparação do nome é case-insensitive e ignora espaços duplicados (digitar é barreira deliberada, não pegadinha); erro anunciado em `aria-live="assertive"`
- **Usado em (linhagem)**: `IdpAccessPanel` (zona de perigo)
- **Evidência**: `DELETE /people/:personId` — superadmin only, IdP FIRST sem rollback, remove roles + pessoa em transação, publica `people.person.deleted` (`{ personId }`, zero PII); erros `PEO-010`, `IDP-005`

## Cobertura vs. inventory

| Organismo do [inventory](./design-interface-inventory.fe.md) | Coberto? | Documento |
|---|---|---|
| Shell + navegação | ✅ (reuso) | `AppShell`, `M3TopAppBar` |
| Tabela de pessoas cursor-paginated | ✅ | `PersonTable` |
| Formulário de cadastro com seção opcional de login | ✅ | `PersonForm` |
| Painel de vínculos com RBAC escopado | ✅ | `RolePanel` |
| Painel de acesso/IdP | ✅ | `IdpAccessPanel` |
| Diálogo de erasure LGPD com confirmação digitada | ✅ | `ErasureDialog` |
| Banner 207 com retry | ✅ (molécula) | [./design-molecules.fe.md](./design-molecules.fe.md) → `IdpRetryBanner` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I (BFF boundary), II (Errors as Values), III (MVVM; views burras)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — Módulos verticais; escopo local vs. global
- [ADR-0002](../../adr/0002-errors-as-values.md) — Erros como valores; `AppError`; propagação para `ErrorBoundary` Solid
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — Fronteira client × server; organismos não conhecem topologia de backends
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command; organismos recebem ViewModel
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia orquestra; organismos consomem via Eden Treaty
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — Inventário completo
- [./design-molecules.fe.md](./design-molecules.fe.md) — Moléculas compostas pelos organismos
- [./design-templates.fe.md](./design-templates.fe.md) — Templates que posicionam estes organismos
- [./design-governance.fe.md](./design-governance.fe.md) — Critérios de promoção local→global
- [../social-care/design-organisms.fe.md](../social-care/design-organisms.fe.md) — Fichas dos organismos reusados
- Docs offline: [../../reference/framework/solidstart/](../../reference/framework/solidstart/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
