# Review W2 (🟡→🟢): Interface Web People-Context (front+BFF)

**Feature**: `specs/002-people-context-web/` · **Ticket**: `[CTR-002-people-context-web]` · **Round**: 1/3
**Consultores**: `/acdg-skills:clean-code-reviewer` + `/acdg-skills:security-reviewer` (superfície sensível: registro de identidade com CPF/LGPD + sessão/token/`X-Actor-Id` no BFF)

> Fase 9 da pipeline `core-api-sdd` (máximo rigor). Audit **read-only** do código de W1.
> Achados ancorados com **citação canônica** (Uncle Bob/Fowler/Valente; OWASP p/ segurança) via
> `skills_citar` — Princípio VI: Honesty. Máx. 3 rounds antes de escalar.

## Veredito

**[ PENDENTE — registrar APPROVED | REJECTED ao fim do round ]**

## Issues

> Pontos de inspeção obrigatórios desta feature. Cada um vira linha de achado se violado;
> severidade indicada é a severidade **caso o ponto falhe**.

| # | Severidade | Arquivo:linha | Problema | Citação (regra) | Sugestão |
|---|---|---|---|---|---|
| 1 | blocker | `src/modules/people-context/server/adapters/*.service.fn.ts` | Token/`Bearer` retornado ao client ou logado; sessão fora de cookie HttpOnly; `X-Actor-Id` aceito do browser em vez de derivado da sessão no servidor | `skills_citar` → OWASP ASVS (session management / trust boundary) | injeção de `Authorization` e `X-Actor-Id` exclusivamente no handler Elysia, derivados da sessão; resposta tipada sem campos de credencial (Princípio I: BFF-Orchestrated Boundary) |
| 2 | blocker | telemetria/RUM, logs do BFF, URLs | **CPF (ou qualquer fragmento dele) presente em telemetria, analytics, logs, URLs ou storage do browser** | `skills_citar` → OWASP (sensitive data exposure) + LGPD minimização | reportar apenas nomes de campo EN e códigos de erro; grep automatizado de payloads em CI; máscara `390.533.•••-••` na exibição padrão |
| 3 | blocker | `src/modules/people-context/client/domain/app-error-mapper.ts` | switch de códigos (`PEO-001`…`PEO-010`, `ROL-001`…`ROL-009`, `IDP-001`…`IDP-005`, `AUTH-001`…`AUTH-003`, `ADM-001`) com `default` silencioso ou código sem tag i18n | `skills_citar` → Uncle Bob, *Clean Code* (tratamento de erro explícito) | união de literais + exaustividade verificada pelo typecheck; fallback nomeado `unknown-error` (Princípio II: Errors as Values) |
| 4 | blocker | `src/modules/people-context/server/adapters/request-password-reset.service.fn.ts` | Qualquer tentativa de ler/exibir/encaminhar link de recuperação do 202 (o link só viaja no evento NATS — ADR-030) | `skills_citar` → OWASP (credential recovery por canal seguro) | 202 → mensagem "instruções enviadas por e-mail"; teste T-015 assegura ausência de link |
| 5 | major | `src/modules/people-context/server/domain/**` e `client/domain/**` | Domínio impuro: classes, `throw`, tipos sem brand, validação de CPF divergente do MOD-11 + repdigits do backend | `skills_citar` → Valente, *Engenharia de Software Moderna* (domínio independente de infraestrutura) | smart constructors com `Result<T, E>`; branded types; Princípio II ([ADR-0002](../../adr/0002-errors-as-values.md)); casos de teste espelhando o backend |
| 6 | major | `src/modules/people-context/client/person-registration/*.view-model.ts` e `client/person-record/*.view-model.ts` | `207 Multi-Status` tratado como erro (perde a pessoa criada) ou dedup 201 tratado como criação nova; retry reenviando `POST /people` em vez de `POST /people/:id/login` | `skills_citar` → Fowler (estados explícitos em vez de booleanos ambíguos) | resultados discriminados `created` / `created-without-login` / `already-exists`, testados por T-007/T-008 ([ADR-0009](../../adr/0009-framework-agnostic-client.md)) |
| 7 | major | `src/modules/people-context/client/role-management/*.view-model.ts` | UI oferece vínculo que o backend negará: sistema fora de `adminSystems(roles)` (`ROL-007`), auto-assign (`ROL-008`), role `superadmin` p/ não-superadmin (`ROL-006`) | `skills_citar` → Fowler, *Refactoring* (replace conditional with explicit state) | mapa papel→ações derivado dos groups do token, testado por T-009; erros 403 mapeados mesmo assim (defesa em profundidade) |
| 8 | major | `src/modules/people-context/client/access-management/erase-*.ts` e componente Solid | Erasure sem dupla confirmação (nome + irreversibilidade), visível fora de `superadmin`, ou `IDP-005` comunicado como sucesso parcial | `skills_citar` → OWASP (destructive action confirmation) | organismo de ação destrutiva com confirmação tipada; RBAC `superadmin`; `IDP-005` → "nada foi alterado" |
| 9 | minor | `src/modules/people-context/client/**` | Strings de UI fora do catálogo i18n ou identificadores de código em PT | `skills_citar` → constituição Princípio V (idioma: código EN, mensagens PT) | mover para o catálogo; código EN, mensagens PT |
| 10 | blocker | `src/` (qualquer arquivo) | **Presença de `node_modules` importados que duplicam Bun/Solid/Elysia nativo** — ex.: Zod no lugar de TypeBox, Vitest no lugar de `bun:test`, pnpm em scripts, MSW no lugar de fakes in-memory | Princípio IV: Bun-Native/Zero-NPM-Utility (NON-NEGOTIABLE — [ADR README](../../adr/README.md)) | remover dependência; usar o equivalente nativo listado na tabela de substituições |

**Citação de um achado relevante** (literal ≥4 linhas):
> "Error handling is important, but if it obscures logic, it's wrong. (...) In fact, exception
> handling done badly is one of the main sources of duplication and confusion in a code base.
> Returning error codes forces the caller to deal with the error immediately — make the handling
> explicit, named and exhaustive instead of scattering magic values."
> — *(localização exata no corpus a registrar via `skills_citar`; Robert C. Martin, *Clean Code*, cap. 7 — base para o mapper exaustivo `PEO/ROL/IDP/AUTH → AppError → i18n`)*

## Checklist (Princípios da Constituição web_02)

- [ ] **Princípio I — BFF-Orchestrated Boundary**: browser nunca vê token; `Authorization: Bearer` e `X-Actor-Id` injetados exclusivamente em rotas Elysia do BFF ([ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)); link de reset jamais em HTTP (ADR-030)
- [ ] **Princípio II — Errors as Values**: domínio puro sem classes/throw; `Result<T,E>`; branded types; mapper exaustivo com fallback nomeado ([ADR-0002](../../adr/0002-errors-as-values.md))
- [ ] **Princípio III — Vertical-Modular · Client (MVVM) × Server (DDD)**: cross-módulo só via `public-api`; a feature não importa internals de outra slice ([ADR-0001](../../adr/0001-vertical-modular-architecture.md)); ViewModel puro não importa `solid-js`/`@solidjs/*` ([ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] **Princípio IV — Bun-Native/Zero-NPM-Utility (NON-NEGOTIABLE)**: sem Zod (TypeBox), sem Vitest/`node:test` (`bun:test`), sem pnpm (Bun), sem MSW (fakes in-memory), sem @fontsource (`.woff2` manual), sem `eslint-plugin-boundaries` (governance tests) — [ADR README](../../adr/README.md)
- [ ] **Princípio V — Strict TypeScript & End-to-End Type Safety**: `bunx tsc --noEmit` limpo; sem `any` implícito; Eden Treaty propaga o tipo do schema TypeBox ao client sem redeclarar Model
- [ ] **Princípio VI — Honesty in Production (No Mocks)**: sem `mock`/`stub`/dados fabricados em `src/`; operação sem rota no backend retorna `'not-implemented'`; fixtures só em `tests/` ([ADR-0011](../../adr/0011-no-mocks-in-production.md))
- [ ] **LGPD**: CPF em telemetria/analytics/logs = blocker imediato; CPF mascarado por padrão na UI; erasure restrito a `superadmin` com dupla confirmação; fixtures 100% sintéticas
- [ ] **RBAC coerente com o backend**: visibilidade worker/owner/admin/admin escopado/superadmin espelha o AuthGuard e as regras ROL-006/007/008 (CT-016 de [bdd.md](./bdd.md))
- [ ] **Estados de UI completos**: loading/vazio/erro/sucesso + 207 com retry de provisão, 409 com ação contextual, 422 com correção guiada, 502 `IDP-*` comunicando IdP-first (CT-004, CT-011…CT-013)
- [ ] **Testes** de [tdd.md](./tdd.md) todos verdes pelo motivo certo (`bun test` limpo); nenhum teste desabilitado/skipped sem issue vinculada

## Decisão

- **APPROVED** → seguir para o gate W3 (GREEN): `bunx tsc --noEmit && bun test && bun build` + [checklist.md](./checklist.md).
- **REJECTED** → endereçar issues (round++); regressão zero (Princípio II). Round 3 esgotado → escalar ao humano.

## Referências

- [Constitution web_02](../../../.specify/memory/constitution.md) — Princípios I–VI
- [ADR README (índice + tabela de substituições)](../../adr/README.md)
- [ADR-0001 — Vertical-Modular Architecture](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md)
- [ADR-0004 — Client×Server Split](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 — Auth/Session](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 — BFF Orchestration / fn naming](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [BDD (cenários)](./bdd.md)
- [TDD (test list RED)](./tdd.md)
- [QA Test Plan](./qa-test-plan.md)
- [Checklist](./checklist.md)
- [Tasks](./tasks.md)
