# 05 · Templates: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Nível**: Templates (Atomic Design, Cap. 2)

> **Templates** = objetos no nível de página que posicionam organismos num **layout** e articulam a
> **estrutura de conteúdo** — o esqueleto, sem conteúdo final. Definem guardrails do conteúdo dinâmico
> (dimensões, limites de caracteres, nº de colunas). No web-app SolidStart, um template ≈ o arquivo de
> rota em `src/routes/_auth/` que liga o ViewModel ([ADR-0009](../../adr/0009-framework-agnostic-client.md)) + binding Solid + compõe organismos.
> **Foco em estrutura, não em dados reais** (isso é o [./design-pages.fe.md](./design-pages.fe.md)).
>
> Esta feature **não cria template novo**: reutiliza `ShellTemplate`, `ListTemplate`, `RecordTemplate`
> e `FormTemplate` do conjunto social-care ([../social-care/design-templates.fe.md](../social-care/design-templates.fe.md)),
> documentando aqui apenas as **variações** que o domínio de pessoas instancia.

## Lista de templates de layout

### `ShellTemplate` — casca autenticada (reuso integral)
- **Layout**: nav rail fixo à esquerda (72px; bottom tabs < `md`) + `M3TopAppBar` sticky + área de conteúdo (max-width 1200px, `spacing.6` de gutter) — idêntico ao social-care
- **Organismos posicionados**: `AppShell` + slot de página; variação desta feature: item "Pessoas" no rail (`M3NavRailItem`)
- **Estrutura de conteúdo (guardrails)**: título da app bar ≤ 1 linha (truncate); no detalhe, slot de status acomoda no máx. 2 badges (`M3ActiveBadge` + `M3LoginIndicator`)
- **Regiões dinâmicas / slots**: conteúdo da rota filha (SolidStart file-based routing sob `src/routes/_auth/`); ações da app bar por página
- **Mapeia para**: `src/routes/_auth.tsx` (layout route) + `src/components/shell/`
- **Rota(s)**: todas sob `/_auth`

### `ListTemplate` — listagem com busca e paginação (reuso)
- **Layout**: header da página (título "Pessoas" + `M3FAB` "Nova pessoa") → barra de busca (1 linha) → tabela full-width → controle de paginação centrado; variação: **sem** chips de filtro de status (a API de pessoas só filtra por `search` — não há filtro `active` em `GET /people`)
- **Organismos posicionados**: `PersonTable` (inclui `M3SearchBar`, `M3PaginationControl`, `M3EmptyState`)
- **Estrutura de conteúdo (guardrails)**: colunas: avatar (48px) · nome (flex, truncate 2 linhas, fullName ≤ 200 chars) · CPF (mono, 140px, mascarado parcial ou "—") · estado (`M3ActiveBadge`, 100px) · login (`M3LoginIndicator`, 120px) · vínculos (até 3 `M3RoleBadge` + `+N`) · menu (48px); `limit` 1–100 (default 20)
- **Regiões dinâmicas / slots**: CTA do header (oculto p/ `owner`); colunas; ações de linha por RBAC
- **Mapeia para**: `src/routes/_auth/people/index.tsx` (SolidStart file-based)
- **Rota(s)**: `/people`

### `RecordTemplate` — detalhe de pessoa com abas (reuso, variação 3 abas)
- **Layout**: `M3TopAppBar` (voltar + `M3CircleAvatar` + nome + `M3ActiveBadge` + `M3LoginIndicator` + menu de ações) → banner condicional (`IdpRetryBanner`) → barra de abas (`M3TabBarItem`) → painel da aba ativa; variação vs. social-care: **sem** `AnalyticsStatGrid` (não há analytics no registro de pessoas) e **3 abas** em vez de 5
- **Organismos posicionados**: abas espelham as áreas do serviço: **Perfil** (dados via `M3DataField` + `PersonForm` em modo edição) · **Vínculos** (`RolePanel`) · **Acesso** (`IdpAccessPanel`, incl. `ErasureDialog`)
- **Estrutura de conteúdo (guardrails)**: header com nome ≤ 2 linhas; exatamente 3 abas (sem `M3CountBadge` na v1 — contagem de vínculos é opcional futura); painel da aba com max-width 920px
- **Regiões dinâmicas / slots**: conteúdo por aba; ações do menu do header restritas por RBAC (Editar: worker/admin · Desativar/Reativar: admin · Apagar LGPD: superadmin, dentro da aba Acesso)
- **Mapeia para**: `src/routes/_auth/people/[personId].tsx` (+ sub-rotas `roles.tsx`, `access.tsx` — file-based SolidStart)
- **Rota(s)**: `/people/$personId` (+ `/roles`, `/access`)

### `FormTemplate` — formulário seccionado (reuso, variação sem auto-save)
- **Layout**: coluna única do formulário (max-width 720px) + ações no rodapé (Salvar/Cancelar); variações vs. social-care: **sem** navegação lateral de seções (só 2 seções) e **sem** `M3AutoSaveIndicator` — cadastro de pessoa é submit único (`POST`), não auto-save por seção
- **Organismos posicionados**: `PersonForm` (seções "Dados da pessoa" + "Acesso ao sistema" condicional ao toggle `createLogin`)
- **Estrutura de conteúdo (guardrails)**: grid de campos 1–2 colunas (`spacing.4`); `fullName` ≤ 200 chars com contador; CPF máscara fixa 11 dígitos; senha min 8 com hint; seção de login colapsada por padrão
- **Regiões dinâmicas / slots**: seção de login (create only); banner 207 pós-submit; erros de validação ancorados ao campo dono
- **Mapeia para**: `src/routes/_auth/people/new.tsx` (SolidStart file-based)
- **Rota(s)**: `/people/new`

## Matriz template × comportamento

| Template | Comportamentos que usam | Variações de layout |
|---|---|---|
| `ShellTemplate` | todas as páginas autenticadas da feature | rail lateral (≥ md) vs. bottom tabs (mobile); item "Pessoas" ativo |
| `ListTemplate` | lista/busca de pessoas | sem chips de filtro (API não filtra `active`); FAB oculto p/ `owner` |
| `RecordTemplate` | detalhe da pessoa (3 abas: Perfil/Vínculos/Acesso) | sem analytics; com/sem `IdpRetryBanner`; menu de ações por RBAC |
| `FormTemplate` | cadastro de pessoa; edição de perfil (aba Perfil) | com seção de login (create) vs. sem (edit); submit único, sem auto-save |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, III (ViewModel + binding Solid como cola entre template e organismo)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — Módulos verticais; file-based routing em `src/routes/`
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; o template instancia o binding que conecta ViewModel ao organismo
- [ADR-0012](../../adr/0012-shell-as-root-screen-mvvm.md) — Shell autenticado como tela MVVM raiz (`modules/shell/client`)
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — Vocabulário compartilhado e telas cobertas
- [./design-organisms.fe.md](./design-organisms.fe.md) — Organismos posicionados pelos templates
- [./design-pages.fe.md](./design-pages.fe.md) — Instâncias concretas dos templates com conteúdo real
- [../social-care/design-templates.fe.md](../social-care/design-templates.fe.md) — Templates base reutilizados
- Docs offline: [../../reference/framework/solidstart/](../../reference/framework/solidstart/) · [../../reference/runtime/bun/](../../reference/runtime/bun/)
