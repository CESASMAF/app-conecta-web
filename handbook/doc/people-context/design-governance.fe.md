# 07 · Governance & Maintenance: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Base**: Atomic Design Cap. 5 + [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (Design System Strategy) + [ADR-0001](../../adr/0001-vertical-modular-architecture.md) + [ADR-0009](../../adr/0009-framework-agnostic-client.md) + [ADR-0011](../../adr/0011-no-mocks-in-production.md)

> O design system é **produto vivo**, não artefato (Nathan Curtis). Este doc define como os
> átomos/moléculas/organismos desta feature são mantidos, versionados e promovidos para o design system
> global (`src/components/ui/m3/`) vs. mantidos locais na feature
> (`src/modules/people-context/client/ui/`). É **consistente com** a governança do conjunto
> social-care ([../social-care/design-governance.fe.md](../social-care/design-governance.fe.md)) — mesmas regras, mesmos makers;
> o foco aqui é como o módulo people-context **consome** e **contribui** componentes globais.

## 1. Makers vs. Users

- **Makers** (mantêm `src/components/ui/m3/` + `src/styles/`): os mesmos do social-care — Gabriel + agente `design-system-curator` ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)), fontes na ordem vanilla-extract docs → WAI-ARIA APG → Atlassian tokens → Carbon → M3 community. Decidem API de componente global, tokens novos (incluindo os aliases `vars.color.personActive`/`vars.color.idp*` propostos em [./design-tokens.fe.md](./design-tokens.fe.md) §2) e breaking changes. PR de componente global exige: story, axe verde, comparação visual com o Figma `bHV9kAG2pIWMnEjOQIUCOE`, TSDoc e aprovação dupla.
- **Users** (consomem na feature): a feature `002-people-context-web` é o **primeiro segundo-consumidor** do design system — usa `M3*` via import direto de `~/components/ui/m3/*`; **não forka estilo** nem reimplementa variante local de componente global. Em particular: `M3DateField` e `M3PaginationControl`, que nasceram da feature social-care, são consumidos aqui sem alteração — validando o critério de promoção previsto lá (§2). Necessidade nova → issue para os makers (ou proposta de promoção, §2). Documentos de consumo: [./design-atoms.fe.md](./design-atoms.fe.md) → [./design-pages.fe.md](./design-pages.fe.md) desta pasta.

## 2. Local vs. Global (promoção)

| Componente | Hoje | Critério para promover a `src/components/ui/m3/` |
|---|---|---|
| `M3ActiveBadge` | proposto (novo átomo, [./design-atoms.fe.md](./design-atoms.fe.md)) | nasce **global** — `active` boolean existe em Person, SystemRole e em catálogos do social-care (lookups `ativo`); API genérica `{ active, size }` |
| `M3RoleBadge` | proposto (novo átomo) | nasce **global** — `system:role` é o formato dos claims `groups` do Authentik na plataforma toda (BFF, futuras features de admin) |
| `M3LoginIndicator` | proposto, local em `src/modules/people-context/client/ui/` | promover quando segunda feature exibir estado de provisão IdP (provável: tela de administração de usuários) |
| `M3PasswordField` | proposta (nova molécula) | nasce **global** — credencial inicial/reset aparecerá em qualquer fluxo de provisão; segurança (sem log, `autocomplete="new-password"`) deve ser única |
| `PersonRow`, `RoleChipWithActions`, `IdpRetryBanner` | locais em `src/modules/people-context/client/ui/` | binding de domínio permanece local; se `PersonTable` for reusada por outra feature (ex. seleção de pessoa no social-care), extrair a parte genérica (`DataTable` global) e manter o binding aqui |
| `PersonTable`, `PersonForm`, `RolePanel`, `IdpAccessPanel` | locais | idem — organismos de domínio; a oportunidade real de extração é o padrão tabela+cursor compartilhado com `PatientTable` (mesmo gatilho registrado na governança do social-care §2) |
| `ErasureDialog` | local | extrair núcleo genérico **`ConfirmTypedDialog`** (dialog destrutivo com confirmação digitada) para `src/components/ui/m3/` quando o social-care implementar a UI do seu erasure LGPD (`DELETE` de PII lá) — padrão idêntico |
| Tokens `vars.color.personActive/Inactive`, `vars.color.idpLinked/None/Failed` | propostos em [./design-tokens.fe.md](./design-tokens.fe.md) §2 | entram direto em `tokens.css.ts` (camada global por definição, [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)), com aprovação de maker |

## 3. Regras de evolução (governance tests enforçam)

- **Só-tokens**: nenhum hex/rgb/oklch/px cru em `src/components/ui/` ou `src/modules/*/client/ui/` — **governance test** em `bun:test` ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)) falha o CI; literais só em `src/styles/tokens.css.ts`. O gate de compilação (`tsc --noEmit`) detecta referência a `vars.*` inexistente ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)).
- **Hierarquia Atomic**: `tokens ← atoms ← molecules ← organisms ← templates ← pages`; átomo não importa molécula; organismo desta feature **não importa** organismo de `modules/social-care/` — reuso cross-feature passa por promoção a `src/components/ui/m3/`, nunca por import direto. **Governance test** em `bun:test` (`tests/architecture/boundaries.test.ts`) verifica boundaries.
- **Views burras** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)): componentes de `client/ui/` não chamam handler de servidor, não importam `createAsync`/`action`/`useSubmission` do `@solidjs/router` — esses são exclusivos do binding (`*.binding.ts`); o núcleo de dados e domínio (`*.view-model.ts`) não importa `solid-js`/`@solidjs/*`. **Governance test** verifica esta fronteira.
- **Variantes derivam do domínio**: estados de UI devem espelhar o contrato real do `people-context` — `M3ActiveBadge` é imagem do boolean `active` (sem terceiro estado inventado); `M3LoginIndicator` deriva de `idpUserId` null/presente (+ flag 207 de sessão no ViewModel); `M3RoleBadge` renderiza `system:role` cru e tolera pares fora de `KnownSystem`/`KnownRole` (listas não exaustivas). Adicionar variante sem correspondência no contrato é violação de revisão.
- **RBAC na borda da view**: ação sem permissão **não renderiza** (worker não vê reset; não-superadmin não vê zona de perigo); ação bloqueada por **estado** (auto-assign `ROL-008`, vínculo já ativo) renderiza desabilitada **com explicação** — regra de UX auditável nas stories.
- **LGPD em componente**: CPF sempre via `M3MaskedField` (exibe formatado, emite cru, parcial em listas); link de recuperação de senha **nunca** chega à UI (202 + evento NATS); `ErasureDialog` mantém a dupla confirmação como invariante de API (não aceitar prop que a desligue).
- **Status nunca só por cor**: cor + ícone + label em `M3ActiveBadge`/`M3LoginIndicator`/`M3RoleBadge` — checado no axe + revisão.
- **Sem mocks em `src/`** ([ADR-0011](../../adr/0011-no-mocks-in-production.md)): operação não implementada retorna o valor `'not-implemented'`, nunca dado fabricado. **Governance test** `no-mocks-in-src` em `bun:test` varre `src/modules/people-context/`. Fixtures de teste só em `tests/`.
- Mudança de API de componente global = revisão de todos os consumidores (**agora ≥2 features**: buscar imports em `modules/social-care/` e `modules/people-context/`) + stories + atualização do doc irmão correspondente nas **duas** pastas (`social-care/` e `people-context/`) quando o componente for compartilhado.

## 4. Versionamento & changelog

- Conventional Commits por repo (`feat(ds): adiciona M3ActiveBadge` → minor; `fix(ds): contraste do M3LoginIndicator failed` → patch), commits em PT-BR (convenção do `web_02/`).
- **Estrutural** (API de componente global, token novo/renomeado — incl. os aliases §2, mudança de hierarquia): exige ADR em [../../adr/](../../adr/) antes do merge. **Cosmético**: nota no PR + story atualizada.
- Docs desta pasta são versionados junto: PR que muda componente referenciado aqui atualiza o doc irmão correspondente ([./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) → tokens → atoms → … → pages) no mesmo PR; mudanças em componentes consumidos do social-care atualizam **também** os docs de lá.
- **Depreciação**: `@deprecated` no TSDoc apontando substituto; compat por ≥1 sprint; remoção só com zero consumidores nas duas features.

## 5. Acessibilidade & qualidade (gate)

- Gate obrigatório antes de fechar PR (CI Bun-native, [Princípio IV](../../../.specify/memory/constitution.md)): `bunx tsc --noEmit` · **governance tests** em `bun:test` (boundaries + só-tokens + jsx-a11y/strict + no-mocks-in-src) · `bun test` (cobertura + axe nos componentes) · `bun build` (budget ≤200KB gzip) — **nunca** npm/yarn/npx/pnpm ([ADR-0003](../../adr/0003-bun-supply-chain.md)).
- E2E com `happy-dom` + `bun:test` nas 5 páginas de [./design-pages.fe.md](./design-pages.fe.md); PR bloqueia com violação séria de axe. Cenários obrigatórios: fluxo 207→retry, dupla confirmação do `ErasureDialog` (teclado completo, foco preso) e RBAC por papel (worker/owner/admin/superadmin).
- Catálogo de stories: todo componente novo tem story com matriz de variants/states — `M3ActiveBadge` (true/false), `M3LoginIndicator` (linked/none/failed), `M3RoleBadge` (conhecido/desconhecido/inativo), `RolePanel` (4 papéis de viewer).
- Tipografia Atkinson Hyperlegible (self-hosted `.woff2`, [ADR-0008](../../adr/0008-self-host-webfonts.md)) + foco visível (`vars.color.focus.ring`) + `prefers-reduced-motion` são pré-condições globais (herdadas), não checklist por PR.
- LGPD como qualidade: nenhum CPF completo, senha ou `recoveryLink` em story, screenshot ou fixture ([ADR-0011](../../adr/0011-no-mocks-in-production.md)) — dados sintéticos mascarados; CPFs de teste válidos por MOD-11 porém fictícios.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (em especial IV: Bun-native; V: TypeScript estrito)
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — Módulos verticais; `public-api`; boundaries via governance test
- [ADR-0003](../../adr/0003-bun-supply-chain.md) — Bun como PM e test runner (`bun:test`); supply-chain hardening
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract; só-tokens; gate de compilação
- [ADR-0008](../../adr/0008-self-host-webfonts.md) — Self-host `.woff2`; zero CDN
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro sem `solid-js`; views burras
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — Sem mocks em `src/`; governance test `no-mocks-in-src`
- [../../adr/README.md](../../adr/README.md) — Índice de todos os ADRs do web_02
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) · [./design-tokens.fe.md](./design-tokens.fe.md) · [./design-atoms.fe.md](./design-atoms.fe.md) · [./design-molecules.fe.md](./design-molecules.fe.md) · [./design-organisms.fe.md](./design-organisms.fe.md) · [./design-templates.fe.md](./design-templates.fe.md) · [./design-pages.fe.md](./design-pages.fe.md)
- [../social-care/design-governance.fe.md](../social-care/design-governance.fe.md) — Governança base (mesmas regras; makers compartilhados)
- Docs offline: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/) · [../../reference/runtime/bun/](../../reference/runtime/bun/) · [../../reference/framework/solidstart/](../../reference/framework/solidstart/)
