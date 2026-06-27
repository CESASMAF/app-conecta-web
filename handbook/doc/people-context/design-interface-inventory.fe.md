# 00 · Interface Inventory: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Método**: Atomic Design (Frost), Cap. 4

> O **interface inventory** é a foto crua de TODA a UI da feature antes de sistematizar: cataloga cada
> elemento visual repetido (botões, campos, badges, tabelas, modais…), expõe **inconsistências** e
> estabelece o **vocabulário compartilhado**. É o insumo dos documentos 01–06 (tokens→pages).
> Aqui também fica fixada a **política de fidelidade**: replicar o contrato real do backend
> `people-context` (Person, SystemRole, provisão IdP, erasure LGPD) e **reutilizar o design system
> já catalogado** pelo conjunto irmão `social-care` (ver [../social-care/design-interface-inventory.fe.md](../social-care/design-interface-inventory.fe.md)), saneando
> divergências de borda — bug a bug.

## 1. Fonte da evidência

- Mapa completo do serviço `people-context` (Bun 1.3 + Elysia + PostgreSQL + NATS): agregado `Person` (CPF com dedup, `birthDate`, `email`, `active`, `idpUserId`/`idpUserPk`), entidade `SystemRole` (`system:role`), provisão de login Authentik, password reset assíncrono (202 + evento NATS), erasure LGPD Art. 18 V (superadmin) — relatório de exploração de 2026-06-12 (`/tmp/people-context-service-map.md`, repo `svc-people-context` @ HEAD).
- Conjunto irmão `social-care` — [../social-care/design-interface-inventory.fe.md](../social-care/design-interface-inventory.fe.md) a [../social-care/design-governance.fe.md](../social-care/design-governance.fe.md) — que cataloga os 29 componentes `M3*` existentes, tokens OKLCH e templates. **Este conjunto reusa aquele**; só elementos exigidos pelo domínio de pessoas são novos.
- Código existente do design system: `src/components/ui/m3/` (29 componentes `M3*` com stories), `src/components/shell/` (app-shell, nav rail, user menu) e tokens em `src/styles/tokens.css.ts` (vanilla-extract, [ADR-0007](../../adr/0007-design-system-vanilla-extract.md): CSS-in-TS zero-runtime, `Princípio V`).
- ADRs do `web_02/`: [ADR-0001](../../adr/0001-vertical-modular-architecture.md) (arquitetura vertical-modular), [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) (split MVVM×DDD), [ADR-0009](../../adr/0009-framework-agnostic-client.md) (ViewModel puro + binding Solid), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (BFF Elysia, naming de fns).
- Telas cobertas: Lista/busca de pessoas (paginação por cursor) · Cadastro de pessoa (com opção "criar login") · Detalhe da pessoa (abas Perfil / Vínculos / Acesso) · Vínculos de sistema (atribuir/desativar/reativar `system:role`) · Gestão de acesso/IdP (provisionar login retroativo, solicitar reset de senha, desativar/reativar pessoa, apagamento total LGPD com dupla confirmação).

## 2. Inventário por categoria (Frost)

> Liste o que aparece, com onde foi visto. Marque duplicatas/variações divergentes.

| Categoria | Variações encontradas | Onde aparece | Consolidar como |
|---|---|---|---|
| Botões | filled (CTA coral "Nova pessoa", "Salvar"), tonal ("Provisionar login", "Solicitar reset"), outlined, text, destrutivo (desativar, apagar LGPD), FAB (nova pessoa), back, menu kebab por linha/vínculo | todas as telas; painel de acesso; linhas da tabela | átomos `M3Button` (variants), `M3FAB`, `M3BackButton`, `M3MenuButton` — **todos reusados** do social-care |
| Campos | texto (`fullName` 1–200, `email`), mascarado (CPF 11 dígitos, dedup), data (`birthDate`, não-futura), senha (`initialPassword` min 8, revelar/ocultar), busca (nome ILIKE / prefixo de CPF) | cadastro; edição de perfil; provisão de login; lista | átomos `M3TextField`, `M3MaskedField` (mask `cpf`), `M3DateField` — reusados; molécula nova `M3PasswordField`; molécula `M3SearchBar` reusada |
| Badges/Status | ativo/inativo (`active` boolean), vínculo `system:role` (ex. `social-care:patient`), indicador "tem login" (`idpUserId` presente / `null` / provisão falhou 207) | lista de pessoas; header do detalhe; painel de vínculos; painel de acesso | átomos novos `M3ActiveBadge`, `M3RoleBadge`, `M3LoginIndicator` |
| Tabelas | tabela de pessoas (paginação por cursor `nextCursor`/`hasMore`/`totalCount`, linha clicável, busca), lista de vínculos com chips e ações | `/people`; aba Vínculos | organismos `PersonTable` (sobre `M3Table`), `RolePanel` |
| Modais | confirmar desativar/reativar pessoa, confirmar desativar/reativar vínculo, **erasure LGPD com confirmação digitada** (dupla confirmação, irreversível) | painel de acesso; painel de vínculos | `M3Dialog` reusado; organismo novo `ErasureDialog` |
| Formulários | cadastro de pessoa com **seção opcional "Criar login"** (`createLogin` → exige `email`; `initialPassword` opcional); edição de perfil (COALESCE: campo omitido preserva atual); provisão retroativa (override de `email` + senha inicial) | `/people/new`; aba Perfil; aba Acesso | organismo `PersonForm` (sobre `M3FormSection`) |
| Avisos/banners | **207 Multi-Status** (pessoa criada, IdP falhou → retry via "Provisionar login"), 409 (`PEO-005/006/008`, `ROL-009`), 502 `IDP-*` (IdP fora — mutação abortada), 202 do reset de senha ("link enviado por e-mail" — link nunca aparece na UI) | pós-cadastro; painel de acesso | molécula nova `IdpRetryBanner`; toasts/banners com tokens de status |
| Estados vazios/erro | lista vazia, busca sem resultado, pessoa sem vínculos, pessoa sem login, erro `{ error: { code } }` (`PEO-*`/`ROL-*`/`IDP-*`/`AUTH-*`) com retry | listagens; abas do detalhe | `M3EmptyState` reusado; `error-page` do shell |
| Navegação | shell com nav rail (item "Pessoas"), top app bar contextual (voltar + nome + badges), abas do detalhe (Perfil / Vínculos / Acesso) | todas as páginas autenticadas | `AppShell` + `M3TopAppBar` + `M3NavRailItem` + `M3TabBarItem` — reusados |

## 3. Inconsistências detectadas

| # | Inconsistência | Telas | Decisão (padronizar / manter / sanear) |
|---|---|---|---|
| 1 | Vocabulário: backend usa EN (`active`, `system`, `role`), UI usa PT ("Ativo/Inativo", "Sistema", "Papel") | lista, detalhe, vínculos | padronizar — mapa EN→PT no i18n; boolean/enum EN nunca aparece na UI |
| 2 | CPF trafega sem máscara na API (`^\d{11}$`), telas exibem formatado (`123.456.789-00`) | cadastro, lista, detalhe | padronizar — `M3MaskedField` exibe com máscara e emite valor cru (mesma regra do social-care, inconsistência #3 de lá) |
| 3 | `people-context` **exige** header `X-Actor-Id` em mutações, enquanto o `social-care` deriva `actorId` só do `JWT.sub` (ADR-023 do serviço) | todas as mutações | manter (contrato real do serviço) — o **BFF Elysia** injeta `X-Actor-Id` (= `sub` da sessão) junto do Bearer; o browser nunca monta header ([Princípio I](../../../.specify/memory/constitution.md), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)) |
| 4 | Dedup por CPF: `POST /people` com CPF existente retorna `201` com o `id` **existente**, sem flag de deduplicação | cadastro | manter — UI navega para o detalhe retornado; se os dados divergirem do digitado, o operador percebe a dedup; registrar inquiry pedindo flag `deduplicated` no contrato |
| 5 | `POST /people/:id/roles` responde `201` (nova/reativada) **ou** `204` (já ativa, noop) | painel de vínculos | manter — UI trata ambos como sucesso; `204` exibe aviso "vínculo já estava ativo" |
| 6 | Reset de senha responde `202` sem o link (link viaja só no evento NATS → e-mail) | painel de acesso | manter — UI exibe apenas confirmação "solicitação enviada por e-mail"; **nunca** tentar exibir/copiar link |
| 7 | Datas: API em ISO 8601 (`YYYY-MM-DD`) vs exibição `dd/MM/yyyy` | cadastro, detalhe | padronizar — formatter único via `Intl.DateTimeFormat` (mesma decisão do social-care, inconsistência #4) |
| 8 | Sem idempotência nos POSTs (login retroativo, roles) | cadastro, acesso, vínculos | sanear na UI — botão trava em `pending` (signal Solid via ViewModel + [ADR-0009](../../adr/0009-framework-agnostic-client.md)) até resposta; backend já protege `assign` com `FOR UPDATE` (`ROL-009` em race) |

## 4. Política de fidelidade (clone fiel)

- **Replicar** (comportamento visível): estados reais do domínio — `active` boolean (Ativo/Inativo), `idpUserId` `null`/presente (sem login/com login), vínculos `system:role` com `active`; RBAC real por endpoint (worker/owner/admin/superadmin, admin **escopado** por sistema — `ROL-006/007/008`); ordem IdP-first das mutações de acesso (falha `502 IDP-*` aborta sem tocar o DB — UI explica que nada mudou); `207 Multi-Status` com retry via `POST /people/:id/login`; envelope `{ data, meta }` e paginação por cursor (`nextCursor`/`hasMore`/`totalCount`); dedup idempotente por CPF.
- **Sanear** (bug de borda, não-UI): duplo-submit sem idempotência (lock de pending no client via signal/`useSubmission` do Solid); ausência de flag de dedup no `201` (inquiry); divergências de contrato → registrar em `web_02/handbook/doc/people-context/` ou ADR.
- **Reservado para futuro** (manter placeholder): tela de reconciliação IdP↔DB (`application/reconciliation.ts` é placeholder no backend); rotas `admin.ts` (futuras operações administrativas); busca avançada além de nome/prefixo de CPF; exibição de eventos NATS da pessoa (audit é via eventos, não há endpoint de leitura).

## 5. Vocabulário compartilhado (saída)

Nomes canônicos usados pelos documentos [./design-tokens.fe.md](./design-tokens.fe.md) → [./design-pages.fe.md](./design-pages.fe.md) e pelo código (`src/components/ui/m3/` + `src/modules/people-context/client/`), nomeados por **papel/estrutura**, nunca por conteúdo:

- **Átomos** (reusados do social-care): `M3Button`, `M3FAB`, `M3BackButton`, `M3MenuButton`, `M3TextField`, `M3MaskedField`, `M3DateField`, `M3CircleAvatar`, `M3ChoiceChip`; (novos): `M3ActiveBadge`, `M3RoleBadge`, `M3LoginIndicator` — ver [./design-atoms.fe.md](./design-atoms.fe.md).
- **Moléculas** (reusadas): `M3SearchBar`, `M3DataField`, `M3SectionHeader`, `M3EmptyState`, `M3PaginationControl`; (novas): `M3PasswordField`, `PersonRow`, `RoleChipWithActions`, `IdpRetryBanner` — ver [./design-molecules.fe.md](./design-molecules.fe.md).
- **Organismos** (reusados): `AppShell`, `M3TopAppBar`; (novos, locais): `PersonTable`, `PersonForm`, `RolePanel`, `IdpAccessPanel`, `ErasureDialog` — ver [./design-organisms.fe.md](./design-organisms.fe.md).
- **Templates** (todos reusados do social-care): `ShellTemplate`, `ListTemplate`, `RecordTemplate` (variação 3 abas), `FormTemplate` — ver [./design-templates.fe.md](./design-templates.fe.md).
- **Domínio (PT-BR na UI, conforme §9 do mapa do serviço)**: Pessoa · Identidade (`PersonId`) · Documento (CPF) · Vínculo de Sistema (`SystemRole`) · Sistema (social-care, queue-manager, therapies, timesheet) · Papel/Função (paciente, profissional, membro da família, funcionário, terapeuta) · Ativo/Inativo · Provisão de Login · Recuperação de Senha · Desativação Temporária · Apagamento Total (LGPD Art. 18 V) · Ator.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — Arquitetura vertical-modular
- [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) — Split client MVVM × server DDD
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid
- [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) — BFF Elysia, nomenclatura de handlers
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine do design system
- [../README.md](../README.md) — Índice de documentação de integração cross-service
- [../social-care/design-interface-inventory.fe.md](../social-care/design-interface-inventory.fe.md) — Inventário do social-care (tokens/componentes base)
- [./design-tokens.fe.md](./design-tokens.fe.md) · [./design-atoms.fe.md](./design-atoms.fe.md) · [./design-molecules.fe.md](./design-molecules.fe.md) · [./design-organisms.fe.md](./design-organisms.fe.md) · [./design-templates.fe.md](./design-templates.fe.md) · [./design-pages.fe.md](./design-pages.fe.md) · [./design-governance.fe.md](./design-governance.fe.md)
- Docs offline: [../../reference/framework/solidstart/](../../reference/framework/solidstart/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/runtime/bun/](../../reference/runtime/bun/) · [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
