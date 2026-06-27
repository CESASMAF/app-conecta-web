# Review W2 (🟡→🟢): Interface Web Social-Care (front+BFF)

**Feature**: `specs/001-social-care-web/` · **Ticket**: `[CTR-001-social-care-web]` · **Round**: 1/3
**Consultores**: `/acdg-skills:clean-code-reviewer` + `/acdg-skills:security-reviewer` (superfície sensível: dados de saúde LGPD + sessão/token no BFF)

> Fase 9 da pipeline `core-api-sdd` (máximo rigor). Audit **read-only** do código de W1.
> Achados ancorados com **citação canônica** (Uncle Bob/Fowler/Valente; OWASP p/ segurança) via
> `skills_citar` — Princípio VI da [constituição](../../../.specify/memory/constitution.md). Máx. 3 rounds antes de escalar.

## Veredito

**[ PENDENTE — registrar APPROVED | REJECTED ao fim do round ]**

## Issues

> Pontos de inspeção obrigatórios desta feature. Cada um vira linha de achado se violado;
> severidade indicada é a severidade **caso o ponto falhe**.

| # | Severidade | Arquivo:linha | Problema | Citação (regra) | Sugestão |
|---|---|---|---|---|---|
| 1 | blocker | `src/modules/social-care/server/adapters/*.service.fn.ts` | Token/`Bearer` retornado ao client ou logado; sessão fora de cookie HttpOnly | `skills_citar` → OWASP ASVS (session management) | manter injeção de `Authorization` exclusivamente no handler Elysia; resposta tipada sem campos de credencial (Princípio I — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)) |
| 2 | blocker | `src/modules/social-care/server/adapters/*.query.fn.ts` e `*.service.fn.ts` | Input/response sem parse TypeBox (`Elysia.t`) na borda (dados do `social-care` confiados às cegas) | `skills_citar` → OWASP (input validation na fronteira) | schema TypeBox de request e de `StandardResponse` em todo handler do BFF ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)); o tipo flui ao client via Eden — sem redeclarar Model |
| 3 | blocker | `src/modules/social-care/client/domain/app-error-mapper.ts` | switch de códigos (`PAT-001`…`PLACE-002`) com `default` silencioso ou código sem tag i18n | `skills_citar` → Uncle Bob, *Clean Code* (tratamento de erro explícito) | união de literais TypeBox + exaustividade verificada pelo typecheck (`tsc --noEmit`); fallback nomeado `unknown-error` ([ADR-0002](../../adr/0002-errors-as-values.md)) |
| 4 | major | `src/modules/social-care/server/domain/**` e `client/domain/**` | Domínio impuro: classes, `throw`, tipos sem brand, `Date`/IO dentro de VO | `skills_citar` → Valente, *Engenharia de Software Moderna* (domínio independente de infraestrutura) | smart constructors com `Result<T, E>`; branded types; postfix [ADR-0002](../../adr/0002-errors-as-values.md) |
| 5 | major | `src/modules/social-care/client/**` | UI calcula analytics (densidade, renda per capita) em vez de exibir `computedAnalytics` do backend | `skills_citar` → Fowler (duplicação de regra de negócio entre camadas) | exibir somente valores computados pelo `social-care` |
| 6 | major | `src/modules/social-care/client/patient-record/patient-lifecycle.view-model.ts` | UI oferece transição fora da máquina de estados (ex.: discharge em `waitlisted` → `DISC-007` garantido) | `skills_citar` → Fowler, *Refactoring* (replace conditional with explicit state) | mapa status→ações derivado de `PatientStatus`, testado por T-006 do [tdd.md](./tdd.md) ([ADR-0009](../../adr/0009-framework-agnostic-client.md)) |
| 7 | minor | `src/modules/social-care/client/**` | Strings de UI fora do catálogo i18n ou identificadores de código em PT | `skills_citar` → constituição Princípio III (idioma EN no código) | mover para o catálogo; código EN, mensagens PT |
| 8 | blocker | `src/modules/social-care/client/**` | Import de `solid-js`/`@solidjs/*` dentro de `*.view-model.ts` ou `client/domain/` | Princípio III da [constituição](../../../.specify/memory/constitution.md); [ADR-0009](../../adr/0009-framework-agnostic-client.md) | núcleo (`data`/`domain`/`*.view-model.ts`) deve ser Solid-free; reatividade só em `*.binding.ts` |
| 9 | blocker | `src/modules/social-care/**` | Mock ou dado fabricado em `src/` (fora de `tests/`) | Princípio VI — Honesty/No Mocks; [ADR-0011](../../adr/0011-no-mocks-in-production.md) | mover para `tests/`; operação não implementada retorna valor `'not-implemented'` |

**Citação de um achado relevante** (literal ≥4 linhas):
> "Error handling is important, but if it obscures logic, it's wrong. (...) In fact, exception
> handling done badly is one of the main sources of duplication and confusion in a code base.
> Returning error codes forces the caller to deal with the error immediately — make the handling
> explicit, named and exhaustive instead of scattering magic values."
> — *(localização exata no corpus a registrar via `skills_citar`; Robert C. Martin, *Clean Code*, cap. 7 — base para o mapper exaustivo `PAT-XXX → AppError → i18n`)*

## Checklist (Princípios da constituição)

- [ ] Domínio puro: sem classes/throw; `Result<T,E>`; branded types (Princípio II — [ADR-0002](../../adr/0002-errors-as-values.md))
- [ ] Isolamento de módulo: cross-módulo só via `public-api`; a feature não importa internals de outra slice (Princípio III — [ADR-0001](../../adr/0001-vertical-modular-architecture.md)); governance test verde
- [ ] ViewModel Solid-free: `*.view-model.ts` e `client/domain/` não importam `solid-js`/`@solidjs/*`; reatividade só em `*.binding.ts` (Princípio III — [ADR-0009](../../adr/0009-framework-agnostic-client.md))
- [ ] TS strict: sem `any` implícito; `tsc --noEmit` limpo (Princípio V); `import type` onde aplicável; extensões `.ts`/`.tsx`
- [ ] Idioma: código EN, mensagens PT (Princípio III da [constituição](../../../.specify/memory/constitution.md))
- [ ] Bun-native: sem `npm`/`yarn`/`npx`/`pnpm`; só `bun`; sem dependência npm que duplique nativo (Princípio IV — [ADR-0003](../../adr/0003-bun-supply-chain.md)) — NON-NEGOTIABLE
- [ ] Segurança (Princípio I): sem secret vazado; token jamais no browser (cookie HttpOnly + Bearer só no servidor — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)); input validado na borda com TypeBox (`Elysia.t`); `actorId` nunca via header customizado (JWT.sub — ADR-023)
- [ ] Auditabilidade e LGPD: nenhuma PII em logs/URLs/storage; estado anonimizado (ADR-039) respeitado na UI; audit trail exibido sem mutação
- [ ] RBAC coerente com o backend: visibilidade worker/owner/admin espelha o `RoleGuardMiddleware` (CT-015 do [bdd.md](./bdd.md))
- [ ] Estados de UI completos: loading/vazio/erro/sucesso + 409 de `version` com reconciliação (CT-011 do [bdd.md](./bdd.md))
- [ ] Testes do [tdd.md](./tdd.md) todos verdes pelo motivo certo; nenhum teste desabilitado/skipped sem issue vinculada
- [ ] Sem mocks em `src/`: fakes/in-memory exclusivamente em `tests/` (Princípio VI — [ADR-0011](../../adr/0011-no-mocks-in-production.md))

## Decisão

- **APPROVED** → seguir para o gate W3 (GREEN): `bun run format:check && bun run typecheck && bun test && bun run build` + [checklist.md](./checklist.md).
- **REJECTED** → endereçar issues (round++); regressão zero (Princípio II). Round 3 esgotado → escalar ao humano.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (lei de mais alto nível)
- [ADR-0001 — Vertical-Modular Architecture](../../adr/0001-vertical-modular-architecture.md) — boundaries, `public-api`
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, sem `throw`, mapper exaustivo
- [ADR-0003 — Bun Supply Chain](../../adr/0003-bun-supply-chain.md) — `bun test`, `bun build`; sem pnpm/npm
- [ADR-0004 — Client/Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — TypeBox/Eden, fronteira Elysia
- [ADR-0005 — Auth Session & Refresh](../../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE, cookie opaco, Bearer só no servidor
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid; núcleo Solid-free
- [ADR-0010 — BFF Orchestration / Fn Naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes apenas em `tests/`
- [Índice de ADRs](../../adr/README.md)
- [tdd.md](./tdd.md) — test list RED; mapeamento CT→T
- [bdd.md](./bdd.md) — cenários Given-When-Then
- [checklist.md](./checklist.md) — prontidão de feature
- [qa-test-plan.md](./qa-test-plan.md) — plano amplo de QA
- [tasks.md](./tasks.md) — waves W0→W3
