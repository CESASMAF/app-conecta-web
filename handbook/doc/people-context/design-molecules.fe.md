# 03 · Molecules: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Nível**: Molecules (Atomic Design, Cap. 2)

> **Moléculas** = grupos simples de átomos funcionando como uma unidade com propósito (single
> responsibility: "faz uma coisa bem"). Vivem em `src/components/ui/m3/` (globais) ou em
> `src/modules/people-context/client/ui/` (locais). Compõem só átomos (e tokens), sem lógica de
> negócio — dados e handlers chegam prontos do **ViewModel + binding Solid** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)).
> Ficha por molécula (Frost, Cap. 3). Reusos do catálogo do social-care: ficha completa em
> [../social-care/design-molecules.fe.md](../social-care/design-molecules.fe.md).

## Lista de moléculas

### `M3SearchBar` — busca por nome ou CPF
- **Reuso?**: já existe (`ui/m3/M3SearchBar/`)
- **Composta de (átomos)**: input de busca + ícone + botão limpar
- **Props (API)**: `{ value: string, onChange: (v: string) => void, onSubmit: () => void, placeholder: string, isPending: boolean }`
- **Comportamento**: submit/debounce dispara `onSearch` → query `GET /people?search=`; o backend resolve: ILIKE em `fullName` **ou** LIKE por prefixo de CPF — se o usuário digitar CPF com máscara, a molécula normaliza para dígitos crus antes de emitir (mesma regra do social-care)
- **Variações/estados**: vazio · preenchido (nome) · preenchido (CPF, mono) · pendente · sem resultado (delegado ao `M3EmptyState`)
- **Tokens**: `--color-bg-secondary`, `--color-border-*`, `radius.full`
- **Acessibilidade**: `role="searchbox"` + label "Buscar por nome ou CPF"; `Esc` limpa; resultado anunciado via `aria-live`
- **Usado em (linhagem)**: `PersonTable`, `ListTemplate`
- **Evidência**: `PersonRepository.list({search})` — ILIKE fullName | LIKE cpf prefix (§4 do mapa)

### `M3PaginationControl` — paginação por cursor
- **Reuso?**: já existe — molécula criada pelo conjunto social-care (nasceu global, ver [../social-care/design-governance.fe.md](../social-care/design-governance.fe.md) §2), aqui só consumida
- **Composta de (átomos)**: `M3Button` (text, "Carregar mais") + contador exibidos/total
- **Props (API)**: `{ shownCount: number, totalCount: number, hasMore: boolean, isPending: boolean, onLoadMore: () => void }`
- **Comportamento**: emite `onLoadMore`; o `nextCursor` (UUID, `id > cursor ORDER BY id`) fica guardado no ViewModel — a molécula nunca monta URL
- **Variações/estados**: com mais páginas (`hasMore=true`) · última página (botão oculto) · carregando
- **Tokens**: herdados de `M3Button` + `--color-text-secondary`
- **Acessibilidade**: `aria-live="polite"` para itens novos; foco preservado após append
- **Usado em (linhagem)**: `PersonTable`
- **Evidência**: `meta: { pageSize, totalCount, hasMore, nextCursor }` de `GET /people` (limit max 100, default 20)

### `M3DataField` — par label/valor somente leitura
- **Reuso?**: já existe
- **Composta de (átomos)**: label secundário + valor primário (+ máscara/mono p/ documentos)
- **Props (API)**: `{ label: string, value: string | null, format?: "cpf" | "date" | "text", emptyFallback?: string }`
- **Comportamento**: exibição da aba Perfil (GET); `birthDate` ISO→`dd/MM/yyyy` via `Intl`; `cpf`/`email` ausentes (nullable) viram "—"; `idpUserId` abreviado em mono
- **Variações/estados**: preenchido · vazio ("—") · identificador técnico (mono)
- **Tokens**: `--color-text-secondary` (label), `--color-text-primary` (valor), `typography.fontFamily.mono`
- **Acessibilidade**: `<dl>/<dt>/<dd>` semântico
- **Usado em (linhagem)**: aba Perfil do `RecordTemplate`, `IdpAccessPanel`, revisão do `ErasureDialog`
- **Evidência**: `Person` (cpf/email/idpUserId nullable, §2.1 do mapa)

### `M3SectionHeader` — título de seção
- **Reuso?**: já existe
- **Composta de (átomos)**: título + descrição opcional + slot de ação
- **Props (API)**: `{ title: string, description?: string, action?: JSX.Element }`
- **Comportamento**: ancora as seções do `PersonForm` ("Dados da pessoa" / "Acesso ao sistema") e os blocos do `IdpAccessPanel`
- **Variações/estados**: com/sem descrição · com/sem ação
- **Tokens**: `typography.fontSize.xl`, `--color-text-primary`, `spacing.6`
- **Acessibilidade**: heading semântico (`h2`/`h3`)
- **Usado em (linhagem)**: `PersonForm`, `IdpAccessPanel`, `RolePanel`
- **Evidência**: seção opcional `createLogin` do `CreatePersonInput`

### `M3EmptyState` — vazio com ação
- **Reuso?**: já existe
- **Composta de (átomos)**: ícone + título + texto + `M3Button` opcional
- **Props (API)**: `{ title: string, description: string, action?: JSX.Element }`
- **Variações/estados**: lista vazia ("Nenhuma pessoa cadastrada" + CTA) · busca sem resultado · pessoa sem vínculos ("Nenhum vínculo de sistema" + CTA p/ admin) · pessoa sem login (delegado ao `IdpAccessPanel`)
- **Tokens**: `--color-text-secondary`, `spacing.12`
- **Acessibilidade**: título como heading; não usa `role="alert"`
- **Usado em (linhagem)**: `PersonTable`, `RolePanel`
- **Evidência**: `totalCount=0`; `GET /people/:id/roles` → `data: []`

### `M3PasswordField` — senha inicial (NOVO)
- **Reuso?**: novo — candidato a global em `ui/m3/` (qualquer fluxo de credencial reusa); composto sobre `M3TextField`
- **Composta de (átomos)**: `M3TextField` (`type=password`) + botão revelar/ocultar + hint de requisito
- **Props (API)**: `{ label: string, value: string, onChange: (v: string) => void, errorMessage?: string, required?: boolean, minLength: 8 }`
- **Comportamento**: validação local de comprimento mínimo (espelha TypeBox `minLength: 8` de `initialPassword` via Eden Treaty — [Princípio V](../../../.specify/memory/constitution.md)); valor **nunca** logado nem persistido no client (sem autofill de histórico, `autocomplete="new-password"`); campo é **opcional** — sem senha, a provisão cria o usuário e a senha é definida via reset
- **Variações/estados**: vazio (opcional) · preenchido oculto · revelado (`aria-pressed`) · erro (< 8 chars) · disabled
- **Tokens**: herdados de `M3TextField`; ícone com `--color-text-secondary`
- **Acessibilidade**: requisito de tamanho em `aria-describedby` (não só na cor do erro); botão revelar com label "Mostrar senha"
- **Usado em (linhagem)**: seção "Acesso ao sistema" do `PersonForm` (`createLogin=true`), `IdpAccessPanel` (provisão retroativa)
- **Evidência**: `initialPassword?` (min 8) em `POST /people` e `POST /people/:id/login`; `setPassword` best-effort no IdP (§4 do mapa)

### `PersonRow` — linha de pessoa (NOVO)
- **Reuso?**: novo · local em `src/modules/people-context/client/ui/` (binding de domínio; análogo ao `M3FamilyMemberRow` do social-care)
- **Composta de (átomos)**: `M3CircleAvatar` + nome + CPF mascarado parcial (`M3MaskedField` readOnly/mono) + `M3ActiveBadge` + `M3LoginIndicator` + até 3 `M3RoleBadge` (+ `+N`) + `M3MenuButton`
- **Props (API)**: `{ person: PersonRowVM, onOpen: () => void, onEdit?: () => void, onDeactivate?: () => void, onReactivate?: () => void }` — handlers opcionais conforme RBAC (menu não renderiza ação sem permissão)
- **Comportamento**: linha inteira clicável abre o detalhe; ações do menu delegam ao ViewModel; **nenhuma** chamada direta a handler de servidor
- **Variações/estados**: ativa · inativa (esmaecida `--color-text-disabled` + badge "Inativa") · sem CPF ("—") · sem login (`M3LoginIndicator none`) · sem vínculos (coluna vazia) · `owner` (menu só com "Abrir")
- **Tokens**: `--color-border-default` (divisor), `elevation.stateLayer.hover`, `spacing.4`
- **Acessibilidade**: linha de tabela semântica; `aria-label` "Abrir cadastro de {nome}"; ações com labels explícitos
- **Usado em (linhagem)**: `PersonTable`
- **Evidência**: `GET /people` → `Person[]`; matriz de roles (§7 do mapa)

### `RoleChipWithActions` — chip de vínculo com ações (NOVO)
- **Reuso?**: novo · local em `src/modules/people-context/client/ui/`
- **Composta de (átomos)**: `M3RoleBadge` + data de atribuição (`assignedAt` → `dd/MM/yyyy`) + `M3MenuButton` (Desativar | Reativar)
- **Props (API)**: `{ role: SystemRoleVM, canManage: boolean, onDeactivate: () => void, onReactivate: () => void }` — `canManage` vem do ViewModel: admin **escopado** ao sistema do vínculo (`system:admin`) ou superadmin
- **Comportamento**: menu oferece **só** a ação válida para o estado (`active=true` → Desativar; `active=false` → Reativar); confirmação em `M3Dialog` pelo organismo pai
- **Variações/estados**: ativo · inativo (esmaecido) · sem permissão (`canManage=false` → sem menu, só leitura) · pendente (ação em voo)
- **Tokens**: herdados de `M3RoleBadge` + `--color-text-secondary` (data)
- **Acessibilidade**: grupo com `aria-label` composto ("Vínculo Paciente em Social Care, ativo desde 10/06/2026"); menu acessível por teclado
- **Usado em (linhagem)**: `RolePanel`
- **Evidência**: `PUT /people/:personId/roles/:roleId/{deactivate,reactivate}` (admin escopado, `ROL-007`); `SystemRole.assignedAt`

### `IdpRetryBanner` — aviso 207 com retry (NOVO)
- **Reuso?**: novo · local em `src/modules/people-context/client/ui/` (padrão de banner análogo ao `VersionConflictBanner` do social-care)
- **Composta de (átomos)**: ícone de alerta + texto + `M3Button` (tonal, "Provisionar login agora")
- **Props (API)**: `{ onRetry: () => void, isPending: boolean, error?: "IDP-001" }`
- **Comportamento**: aparece quando `POST /people` respondeu `207 Multi-Status` (pessoa criada, provisão IdP falhou) ou quando o retry (`POST /people/:id/login`) devolve `502 IDP-001`; o botão delega o retry ao ViewModel
- **Variações/estados**: aviso pós-207 · retry em voo (`isPending`) · retry falhou de novo (mantém banner + mensagem do `IDP-001`) · sucesso (banner some; `M3LoginIndicator` vira `linked`)
- **Tokens**: `--color-idp-failed` / `--color-warning-500` (fundo/borda), `--color-text-primary`
- **Acessibilidade**: `role="alert"` ao aparecer; foco vai para o banner após o 207
- **Usado em (linhagem)**: `PersonForm` (pós-submit), `IdpAccessPanel`, header do `RecordTemplate`
- **Evidência**: `207 Multi-Status` de `POST /people`; retry documentado via `POST /people/:id/login` (§10 do mapa); erro `IDP-001`

## Cobertura vs. inventory

| Molécula do [inventory](./design-interface-inventory.fe.md) | Coberta? | Documento |
|---|---|---|
| Busca por nome/CPF | ✅ (reuso) | `M3SearchBar` |
| Paginação por cursor | ✅ (reuso) | `M3PaginationControl` |
| Par label/valor (perfil) | ✅ (reuso) | `M3DataField` |
| Título de seção | ✅ (reuso) | `M3SectionHeader` |
| Estado vazio | ✅ (reuso) | `M3EmptyState` |
| Formulário de senha inicial | ✅ (nova) | `M3PasswordField` |
| Linha de pessoa | ✅ (nova) | `PersonRow` |
| Chip de vínculo com ações | ✅ (nova) | `RoleChipWithActions` |
| Banner 207 com retry | ✅ (nova) | `IdpRetryBanner` |
| Confirmação digitada do erasure | ⬜ (parte do organismo) | [./design-organisms.fe.md](./design-organisms.fe.md) → `ErasureDialog` |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios III (MVVM, ViewModel burro); V (TypeBox/Eden Treaty end-to-end)
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; `PersonRowVM`/`SystemRoleVM` derivados no ViewModel
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira client × server; moléculas nunca chamam servidor
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — só-tokens; sem hex/rgb/px crus
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — Inventário completo desta feature
- [./design-atoms.fe.md](./design-atoms.fe.md) — Átomos que estas moléculas compõem
- [./design-organisms.fe.md](./design-organisms.fe.md) — Organismos que compõem estas moléculas
- [./design-governance.fe.md](./design-governance.fe.md) — Regras de promoção local→global
- [../social-care/design-molecules.fe.md](../social-care/design-molecules.fe.md) — Fichas completas das moléculas reusadas
- Docs offline: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/) · [../../reference/framework/elysia/](../../reference/framework/elysia/)
