# 07 · Governance & Maintenance: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Base**: Atomic Design Cap. 5 + [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (vanilla-extract; design system) + [ADR-0001](../../adr/0001-vertical-modular-architecture.md) (vertical-modular) + [ADR-0009](../../adr/0009-framework-agnostic-client.md) (ViewModel puro) + [ADR-0011](../../adr/0011-no-mocks-in-production.md) (sem mocks)

> O design system é **produto vivo**, não artefato (Nathan Curtis). Este doc define como os
> átomos/moléculas/organismos desta feature são mantidos, versionados e promovidos para o design system
> global (`src/modules/shared/client/ui/m3/`) vs. mantidos locais na feature
> (`src/modules/social-care/client/ui/`).

## 1. Makers vs. Users

- **Makers** (mantêm `ui/m3/` + `src/styles/`): Gabriel + agente `design-system-curator` ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)), que consulta as fontes na ordem hierárquica WAI-ARIA APG → Figma `bHV9kAG2pIWMnEjOQIUCOE` (frames `M3/*`) → Atlassian tokens → Carbon → M3 community. Decidem API de componente global, tokens novos e breaking changes. PR de componente global exige: teste de acessibilidade (axe), comparação visual com o Figma `bHV9kAG2pIWMnEjOQIUCOE`, TSDoc (props + variants + a11y notes) e **aprovação dupla** (Gabriel + 1).
- **Users** (consomem na feature): a feature `001-social-care-web` usa `M3*` via import direto de `~/modules/shared/client/ui/m3/*` pelo `public-api`; **não forka estilo** nem reimplementa variante local de componente global ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)). Necessidade nova → issue para os makers (ou proposta de promoção, §2). Documentos de consumo: [design-atoms.fe.md](./design-atoms.fe.md) → [design-pages.fe.md](./design-pages.fe.md).

## 2. Local vs. Global (promoção)

| Componente | Hoje | Critério para promover a `ui/m3/` |
|---|---|---|
| `M3DateField` | proposto (novo átomo, [design-atoms.fe.md](./design-atoms.fe.md)) | nasce **global** — datas existem em todo o domínio (birthDate, incidentDate, acolhimento) |
| `M3PaginationControl` | proposto (molécula, [design-molecules.fe.md](./design-molecules.fe.md)) | nasce **global** — todo endpoint paginado usa cursor (`hasMore`/`nextCursor`) |
| `PatientTable`, `FamilyCompositionTable`, `AssessmentForm`, `AuditTimeline`, `StatusTransitionDialog`, `LookupAdminPanel`, `AnalyticsStatGrid` | locais em `modules/social-care/client/ui/` | usados por ≥2 features (ex.: people-context web) → extrair a parte genérica (`DataTable`, `Timeline`, `ConfirmDialog`) pra `ui/m3/`, mantendo o binding de domínio local |
| `LgpdAnonymizedBanner` / `VersionConflictBanner` | locais | LGPD erasure e optimistic locking são transversais à plataforma → promover quando segunda feature precisar |
| Tokens `vars.color.flow*`, `vars.color.bannerLgpd*` | propostos em [design-tokens.fe.md](./design-tokens.fe.md) §2 | entram direto em `tokens.css.ts` + `contract.css.ts` (camada global por definição), com aprovação de maker |

## 3. Regras de evolução (governance tests enforçam)

- **Só-tokens**: nenhum hex/rgb/oklch/px cru em `ui/` ou `modules/*/client/ui/` — **governance test** `tests/architecture/only-tokens.test.ts` roda em `bun test` e falha o CI ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)). No vanilla-extract, referenciar `vars.*` inexistente já é erro de compilação; literais primitivos só em `src/styles/tokens.css.ts` e `contract.css.ts`. Mudança de primitivo exige sincronizar **os dois** arquivos no mesmo PR (lacuna registrada em [design-tokens.fe.md](./design-tokens.fe.md) §4).
- **Hierarquia Atomic**: `tokens ← atoms ← molecules ← organisms ← templates ← pages`; átomo não importa molécula; organismo de feature não importa outro módulo de feature (boundaries enforçadas por **governance test** `tests/architecture/module-boundaries.test.ts`, [ADR-0001](../../adr/0001-vertical-modular-architecture.md)).
- **Views burras** ([ADR-0009](../../adr/0009-framework-agnostic-client.md)): componentes de `ui/` não chamam handlers Elysia, não usam `createAsync`/`action` diretamente, não contêm lógica de ViewModel — recebem `ViewModel + handlers` do binding Solid; nomear por papel, postfix obrigatório (ex.: `*.view.tsx`, `*.binding.ts`, `*.view-model.ts`).
- **Núcleo do ViewModel sem `solid-js`**: `*.view-model.ts` e `*.service.fn.ts` **não importam** `solid-js` nem `@solidjs/*` — enforçado por governance test `tests/architecture/no-solid-in-core.test.ts` ([ADR-0009](../../adr/0009-framework-agnostic-client.md), Princípio III).
- **Sem mocks em `src/`**: `tests/` pode ter fixtures; em `src/` operação sem rota retorna `'not-implemented'` — governance test `tests/architecture/no-mocks-in-src.test.ts` ([ADR-0011](../../adr/0011-no-mocks-in-production.md)).
- **Variantes derivam do domínio**: enums de UI (status, motivo, risco) devem espelhar os enums reais do `social-care` (`PatientStatus`, `DischargeReason`, `WithdrawReason`, `Referral.Status`, `LookupRequestStatus`); adicionar variante de chip sem enum correspondente no backend é violação de revisão.
- **Status/risco nunca só por cor**: cor + ícone + label (a11y/daltonismo) — checado no axe + revisão.
- Mudança de API de componente global = revisão de todos os consumidores (busca por import) + atualização TSDoc + nota neste handbook ([design-atoms.fe.md](./design-atoms.fe.md)/[design-molecules.fe.md](./design-molecules.fe.md)/[design-organisms.fe.md](./design-organisms.fe.md)).

## 4. Versionamento & changelog

- Conventional Commits por repo (`feat(ds): adiciona M3DateField` → minor; `fix(ds): contraste do chip fila` → patch), commits em PT-BR (convenção do `web_02/`).
- **Estrutural** (API de componente global, token novo/renomeado, mudança de hierarquia): exige ADR em [../../adr/](../../adr/README.md) antes do merge. **Cosmético** (ajuste de spacing/ícone sem mudar API): nota no PR + teste de snapshot atualizado basta.
- Docs desta pasta são versionados junto: PR que muda componente referenciado aqui atualiza o doc irmão correspondente (inventory → tokens → atoms → … → pages) no mesmo PR.
- **Depreciação**: marcar com `@deprecated` no TSDoc apontando o substituto; manter compat por pelo menos 1 sprint; remover só após zero consumidores e aviso no changelog do PR.

## 5. Acessibilidade & qualidade (gate)

- Gate obrigatório antes de fechar PR (pipeline CI Bun-native, sem ESLint):
  - `bunx tsc --noEmit` limpo (type-safety ponta a ponta; referência a `vars.*` inexistente = erro de compilação vanilla-extract).
  - `bun test` — inclui **todos** os governance tests de architecture (`only-tokens`, `module-boundaries`, `no-solid-in-core`, `no-mocks-in-src`) + testes unitários de ViewModel (sem montar Solid) + testes de segurança (`security-headers.test.ts`).
  - **Cobertura** e testes de acessibilidade (`axe-core` headless nos componentes de `ui/m3/`).
  - `bun build` (budget ≤200KB gzip).
  - **NUNCA** npm/yarn/npx — Bun é o único PM (Princípio IV, [ADR-0003](../../adr/0003-bun-supply-chain.md)).
- E2E com Playwright + `@axe-core/playwright` nas páginas de [design-pages.fe.md](./design-pages.fe.md); PR bloqueia com violação séria de axe.
- Todo componente novo/alterado tem teste de snapshot Solid (renderização SSR + hydration) com matriz de variants/states (default/hover/focus/disabled/loading/error — e, para chips, todas as variantes de enum).
- Tipografia Atkinson Hyperlegible Next self-hosted ([ADR-0008](../../adr/0008-self-host-webfonts.md)) + foco visível (`vars.color.focusRing`) + `prefers-reduced-motion` (já global em `src/styles/globals.css.ts`) são pré-condições, não itens de checklist por PR.
- LGPD como qualidade: nenhum CPF/NIS completo em teste, screenshot ou fixture — usar dados sintéticos mascarados (`M3MaskedField` em modo parcial); fixtures de teste só em `tests/` ([ADR-0011](../../adr/0011-no-mocks-in-production.md)).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — todos os Princípios; Princípio VI (Honesty/No Mocks) e Princípio IV (Bun-Native) como não-negociáveis
- [ADR-0001](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo; cross-módulo via `public-api`
- [ADR-0003](../../adr/0003-bun-supply-chain.md) — Bun como único PM; `bun test`; supply-chain hardening
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract; governance test `only-tokens`
- [ADR-0008](../../adr/0008-self-host-webfonts.md) — self-host `.woff2`; Atkinson Hyperlegible Next
- [ADR-0009](../../adr/0009-framework-agnostic-client.md) — ViewModel puro sem `solid-js`; governance test `no-solid-in-core`
- [ADR-0011](../../adr/0011-no-mocks-in-production.md) — sem mocks em `src/`; governance test `no-mocks-in-src`
- [ADR README](../../adr/README.md) — índice completo de ADRs
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — inventário e vocabulário
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens; lacunas (§4)
- [design-atoms.fe.md](./design-atoms.fe.md) · [design-molecules.fe.md](./design-molecules.fe.md) · [design-organisms.fe.md](./design-organisms.fe.md) · [design-templates.fe.md](./design-templates.fe.md) · [design-pages.fe.md](./design-pages.fe.md)
- Docs offline: `../../reference/ui/vanilla-extract/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/`
