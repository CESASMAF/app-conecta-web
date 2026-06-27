# 06 · Pages: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Nível**: Pages (Atomic Design, Cap. 2)

> **Páginas** = instâncias concretas de templates com **conteúdo real e representativo**. Validam se os
> padrões aguentam o conteúdo de verdade e documentam **variações e edge-cases** (lista vazia vs cheia,
> texto curto vs longo, papéis de usuário, seções suprimidas). Cada página mapeia para uma rota real
> (SolidStart file-based em `src/routes/_auth/`) e seu fluxo: rota Solid → ViewModel (`*.view-model.ts`)
> → binding Solid (`*.binding.ts`) → handler Elysia consumido via Eden Treaty ([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) →
> endpoint do `people-context`. O BFF Elysia injeta `Authorization: Bearer` **e**
> `X-Actor-Id` (= `sub` da sessão) em toda mutação ([Princípio I](../../../.specify/memory/constitution.md)) — o browser nunca vê token nem monta header.
> RBAC real por rota: `worker`/`owner`/`admin` (escopado `system:admin`)/`superadmin`.

## Páginas (instâncias) por comportamento

### Lista de pessoas — `/people`
- **Template base**: `ListTemplate`
- **Conteúdo representativo**: "Maria das Graças Souza" · CPF `***.456.789-**` · badge "Ativa" · "Tem login" · vínculos `social-care:patient`; "José Raimundo Lima" · sem CPF ("—") · "Sem login"; 150 pessoas, 20 por página (`totalCount=150`)
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | lista cheia | `totalCount=150`, `hasMore=true` | append por cursor via "Carregar mais" (`M3PaginationControl` emite `onLoadMore`; ViewModel envia `?cursor=<nextCursor>`) |
  | lista vazia | `totalCount=0` | `M3EmptyState` + CTA "Cadastrar primeira pessoa" (CTA oculto p/ `owner`) |
  | busca por nome | `?search=maria` | ILIKE em `fullName`; termo refletido na URL |
  | busca por CPF | `?search=12345` (dígitos) | LIKE por prefixo de CPF; máscara digitada é normalizada |
  | busca sem resultado | `?search=zzz` | empty state de busca, mantém termo |
  | erro | BFF repassa `{ error: { code } }` ([Princípio II](../../../.specify/memory/constitution.md)) | mensagem i18n por código + botão tentar de novo |
  | carregando | pending | skeleton de 5 linhas |
  | RBAC por papel | `worker`/`admin` vs `owner` | worker/admin: FAB + menu de linha com Editar; `owner`: só leitura/abrir (POST/PUT exigem worker ou admin) |
- **Edge-cases**: nome longo (truncate 2 linhas); pessoa sem CPF e sem email (colunas "—"); pessoa inativa (linha esmaecida + badge "Inativa" — `GET /people` lista todas); >3 vínculos (`+N`); pessoa `failed` 207 criada na sessão atual exibe `M3LoginIndicator failed`
- **Fluxo de dados**: `src/routes/_auth/people/index.tsx` → `person-list.view-model.ts` → `list-people.query.fn.ts` (handler Elysia via Eden Treaty) → **`GET /api/v1/people?search&cursor&limit`** (roles: worker, owner, admin)

### Cadastro de pessoa — `/people/new`
- **Template base**: `FormTemplate`
- **Conteúdo representativo**: "Ana Beatriz Carvalho" · CPF `529.982.247-25` (válido MOD-11) · nascimento `12/03/1991` · email `ana.carvalho@example.org` · toggle "Criar login de acesso" marcado · senha inicial opcional preenchida
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | sucesso sem login | `createLogin` desmarcado → `201 { data: { id } }` | redirect `/people/$personId` com toast; `M3LoginIndicator none` |
  | sucesso com login | `createLogin=true` → `201` | redirect; indicador `linked`; evento `people.user.provisioned` no backend |
  | **207 Multi-Status** | pessoa criada, IdP falhou | redirect ao detalhe **com** `IdpRetryBanner` (`role="alert"`); retry chama `POST /people/:id/login` via Eden Treaty |
  | dedup por CPF | CPF já existe → `201` com `id` **existente** (idempotente) | redirect ao detalhe retornado; se dados divergem do digitado, operador percebe (inquiry por flag `deduplicated` — [inventory](./design-interface-inventory.fe.md) #4) |
  | validação local | CPF repdigit/dígito inválido; data futura; nome vazio | erro no campo antes do submit (TypeBox replica branded types `Cpf`/`IsoDateString` via Eden — [Princípio V](../../../.specify/memory/constitution.md)) |
  | validação do contrato | `400 PEO-001` | erro campo a campo + sumário com âncoras |
  | login sem email | `createLogin=true` e `email` vazio | bloqueio local (espelha `PEO-009` 422); erro no campo email |
  | senha curta | `initialPassword` < 8 | erro local no `M3PasswordField` |
  | carregando | pending | botão Salvar travado (sem idempotência no backend); `useSubmission` do `@solidjs/router` |
  | RBAC | rota permitida a `worker`/`admin` | `owner` não acessa (guard de rota redireciona à lista) |
- **Edge-cases**: CPF opcional (pessoa sem documento é válida); seção de login colapsada não envia `createLogin`; senha nunca aparece em log/console; submit duplo em race protegido pelo lock de pending via `action` do Solid
- **Fluxo de dados**: `src/routes/_auth/people/new.tsx` → `person-create.view-model.ts` + `person-create.binding.ts` → `register-person.service.fn.ts` (handler Elysia via Eden Treaty) → **`POST /api/v1/people`** (roles: worker, admin; BFF injeta Bearer + `X-Actor-Id`)

### Detalhe da pessoa (aba Perfil) — `/people/$personId`
- **Template base**: `RecordTemplate` (3 abas)
- **Conteúdo representativo**: header "Maria das Graças Souza" + "Ativa" + "Tem login"; `M3DataField`: CPF `***.456.789-**` · nascimento `20/03/1985` · email · `idpUserId` abreviado em mono · criada em `01/06/2026`; botão "Editar" abre `PersonForm` em modo edição
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | ativa com login | `active=true`, `idpUserId != null` | badges "Ativa" + "Tem login"; todas as abas plenas |
  | inativa | `active=false` | badge "Inativa"; aviso no topo; ações de edição mantidas (PUT não depende de active) |
  | sem login | `idpUserId === null` | "Sem login"; aba Acesso oferece provisão |
  | editar com sucesso | `PUT /people/:id` → `204` | toast "Dados atualizados"; se tinha `idpUserPk`, backend sincroniza nome/email no Authentik (best-effort — sem feedback de falha) |
  | validação | `400 PEO-001/PEO-004` | erro campo a campo no form de edição |
  | UUID inválido na URL | `400 PEO-003` | `error-page` com voltar à lista |
  | não encontrada | `404 PEO-002` | `not-found-page` do shell |
  | erro | demais `AppError` ([ADR-0002](../../adr/0002-errors-as-values.md)) | mensagem por código + retry |
  | RBAC | `owner` | vê perfil; sem botão Editar (PUT é worker/admin) |
- **Edge-cases**: campo omitido no PUT preserva valor atual (COALESCE — limpar email exigiria contrato novo, não oferecer "apagar email" na UI); CPF não some após dedup; email alterado de pessoa com login altera login futuro (avisar no form)
- **Fluxo de dados**: `src/routes/_auth/people/[personId].tsx` → `person-record.view-model.ts` + `person-record.binding.ts` → `get-person-by-id.query.fn.ts` (Eden Treaty) → **`GET /api/v1/people/:personId`**; edição → `update-person.service.fn.ts` → **`PUT /api/v1/people/:personId`**

### Vínculos de sistema — `/people/$personId/roles`
- **Template base**: `RecordTemplate` (aba Vínculos) com `RolePanel`
- **Conteúdo representativo**: chips "Paciente · Social Care" (`social-care:patient`, ativo desde `05/06/2026`) e "Funcionário · Timesheet" (`timesheet:employee`, inativo); filtro Ativos/Inativos/Todos; ator logado: `social-care:admin`
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | atribuir novo | `POST .../roles {system, role}` → `201 { id }` | chip novo; sync de group Authentik best-effort no backend |
  | já ativo (noop) | → `204 No Content` | aviso "vínculo já estava ativo" (sem erro) |
  | reativar inativo | `POST` do mesmo par → `201` | chip volta a ativo |
  | desativar | `PUT .../roles/:roleId/deactivate` → `204` | chip esmaece; evento `people.role.deactivated` |
  | reativar via menu | `PUT .../roles/:roleId/reactivate` → `204` | chip reativa |
  | admin fora de escopo | `403 ROL-007` | ação nem oferecida (sistemas limitados a `adminSystems`); se ocorrer, toast por código |
  | role superadmin | `403 ROL-006` | opção "superadmin" só aparece para superadmin |
  | auto-assign | `403 ROL-008` (`person.idpUserId === auth.sub`) | ação desabilitada com explicação "não é possível atribuir vínculo a si mesmo" |
  | corrida concorrente | `409 ROL-009` | toast + recarregar lista |
  | não encontrado | `404 ROL-002/003` (estado mudou) · `400 ROL-005` (UUID) | recarregar; mensagem por código |
  | vazio | `data: []` | `M3EmptyState` "Nenhum vínculo de sistema" + CTA (admin) |
  | RBAC por papel | worker/owner vs admin vs superadmin | worker/owner: leitura; admin: gerencia só seu(s) sistema(s); superadmin: tudo |
- **Edge-cases**: par `system:role` fora de `KnownSystem`/`KnownRole` (listas não exaustivas) renderiza identificador cru em mono; vínculo de sistema sem group no Authentik (sync skip) não muda nada na UI — DB é source of truth; filtro `?active=` refletido na URL
- **Fluxo de dados**: `src/routes/_auth/people/[personId]/roles.tsx` → `person-roles.view-model.ts` + binding → service/query fns via Eden Treaty → **`GET /api/v1/people/:personId/roles?active=`** (worker/owner/admin) · **`POST /api/v1/people/:personId/roles`** · **`PUT /api/v1/people/:personId/roles/:roleId/{deactivate,reactivate}`** (admin escopado; Bearer + `X-Actor-Id` via BFF Elysia)

### Acesso e IdP — `/people/$personId/access`
- **Template base**: `RecordTemplate` (aba Acesso) com `IdpAccessPanel` (+ `ErasureDialog`)
- **Conteúdo representativo**: bloco "Login" com `M3LoginIndicator linked` + `idpUserId` mono; bloco "Recuperação de senha" com botão "Enviar link por e-mail"; bloco "Situação" com "Desativar pessoa"; zona de perigo "Apagamento total (LGPD)" visível só para superadmin
- **Variações documentadas**:
  | Variação | Estado | Comportamento esperado |
  |---|---|---|
  | provisionar login | sem login → `POST .../login` → `201 { id, idpUserId }` | indicador vira `linked`; toast |
  | já tem login | `409 PEO-008` | recarrega; blocos de "com login" aparecem |
  | sem email | `422 PEO-009` | erro no campo de override de email |
  | IdP fora (provisão) | `502 IDP-001` | `IdpRetryBanner` persiste com retry |
  | reset de senha | `POST .../request-password-reset` → `202` | aviso info "Link enviado por e-mail" — **link jamais exibido** (evento NATS carrega o `recoveryLink`); `useSubmission` do `@solidjs/router` |
  | reset sem login | `422 PEO-007` | bloco nem oferecido; se ocorrer, mensagem orientando provisionar antes |
  | reset com IdP fora | `502 IDP-004` | erro + tentar de novo |
  | desativar | `PUT .../deactivate` → `204` | badge vira "Inativa"; explicação "IdP primeiro, depois banco" no dialog |
  | já inativa | `409 PEO-005` | recarregar estado (outro admin agiu) |
  | IdP fora (desativar/reativar) | `502 IDP-002/IDP-003` | "Nada foi alterado — o IdP está indisponível" (mutação abortada antes do DB) |
  | reativar | `PUT .../reactivate` → `204` · `409 PEO-006` | simétrico ao desativar |
  | **erasure LGPD** | superadmin → `DELETE /people/:id` → `204` | `ErasureDialog` com dupla confirmação (checkbox + nome digitado); sucesso → redirect à lista + toast "Registro apagado definitivamente" |
  | erasure com IdP fora | `502 IDP-005` | "Banco não foi tocado"; manter dialog com erro |
  | erasure sem permissão | `403 PEO-010` | zona de perigo invisível p/ não-superadmin (erro só por corrida de sessão) |
  | RBAC por papel | worker vs admin vs superadmin | worker: só provisionar login; admin: + reset/desativar/reativar; superadmin: + erasure |
- **Edge-cases**: pessoa sem login não mostra reset (CTA provisionar no lugar); desativar pessoa **não** desativa vínculos (eixos independentes — exibir nota); pós-erasure qualquer aba navegada devolve `404 PEO-002` → `not-found-page`; `X-Actor-Id` sempre injetado pelo BFF Elysia
- **Fluxo de dados**: `src/routes/_auth/people/[personId]/access.tsx` → `person-access.view-model.ts` + `person-access.binding.ts` → service fns via Eden Treaty → **`POST /api/v1/people/:personId/login`** (worker/admin) · **`POST /api/v1/people/:personId/request-password-reset`** (admin) · **`PUT /api/v1/people/:personId/{deactivate,reactivate}`** (admin) · **`DELETE /api/v1/people/:personId`** (superadmin)

## Cobertura de telas

| Tela (evidência) | Página documentada? | Rota | Template |
|---|---|---|---|
| Lista/busca de pessoas (cursor) | ✅ | `/people` | `ListTemplate` |
| Cadastro de pessoa (com opção criar login) | ✅ | `/people/new` | `FormTemplate` |
| Detalhe da pessoa (Perfil + edição) | ✅ | `/people/$personId` | `RecordTemplate` |
| Vínculos de sistema | ✅ | `/people/$personId/roles` | `RecordTemplate` |
| Gestão de acesso/IdP + erasure LGPD | ✅ | `/people/$personId/access` | `RecordTemplate` |

> Endpoints sem tela própria: `GET /people/by-cpf/:cpf` é atalho de busca (coberto pela busca por CPF da
> lista; o ViewModel pode usá-lo quando o termo tem 11 dígitos exatos — `400 PEO-004`/`404 PEO-002`
> caem no empty state); `GET /api/v1/roles?system=` (discovery/auditoria cross-pessoa, expõe CPF no
> `PersonSummary`) fica para feature administrativa futura; `GET /health`/`/ready` são infra.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (fluxo completo BFF→ViewModel→view)
- [ADR-0002](../../adr/0002-errors-as-values.md) — Erros como valores; `Result<T,E>`; derivação para `ErrorBoundary` Solid
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — Split client × server; a fronteira é Eden Treaty → Elysia
- [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE; sessão opaca; BFF injeta Bearer
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; `*.view-model.ts` + `*.binding.ts`
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — Naming de handlers: `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — Sem mocks; `not-implemented` como valor
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — Inventário e política de fidelidade
- [./design-templates.fe.md](./design-templates.fe.md) — Templates base instanciados aqui
- [./design-organisms.fe.md](./design-organisms.fe.md) — Organismos compostos pelas páginas
- [../README.md](../README.md) — Índice de integração cross-service
- Docs offline: [../../reference/framework/solidstart/](../../reference/framework/solidstart/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/runtime/bun/](../../reference/runtime/bun/)
