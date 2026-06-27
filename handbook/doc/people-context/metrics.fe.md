# Métricas & NFRs: Interface Web People-Context — frontend (browser)

**Feature**: `specs/002-people-context-web/` · **Consultores**: `/acdg-skills:software-architect` + `/acdg-skills:requirements-engineer`

> Fase de NFRs (frontend, máximo rigor). NFRs ancorados com **citação canônica** via `skills_citar`.
> Toda métrica deve ser **mensurável**. Foco do front: experiência (latência de tela, acessibilidade),
> integridade (validação na borda), e segurança (token nunca no browser; CPF nunca em telemetria).
> Visão do contrato/backend em [`metrics.md`](./metrics.md).
> [Constituição web_02](../../../.specify/memory/constitution.md) — ADRs: [índice](../../adr/README.md).

## Métricas funcionais

> "Faz a coisa certa" — verificáveis por teste/cenário.

| ID | Métrica | Alvo | Como medir |
|---|---|---|---|
| MF-001 | VO `Cpf` rejeita CPF inválido (MOD-11 + repdigits como `11111111111`) antes de qualquer chamada de rede | 100% (CT-002b) | teste de domínio (`bun:test`, T-001) |
| MF-002 | switch exaustivo em `AppError` → tag i18n para todos os códigos do contrato (`PEO-001`…`PEO-010`, `ROL-001`…`ROL-009`, `IDP-001`…`IDP-005`, `AUTH-001`…`AUTH-003`, `ADM-001`) | sem `default` solto; fallback nomeado `unknown-error` | typecheck TypeBox (`never`) + teste do view-model em `bun:test` (T-005) |
| MF-003 | 207 Multi-Status exibido como sucesso parcial com ação de retry (`POST /people/:id/login`), nunca como falha total nem reenvio do cadastro | 100% (CT-004) | teste de view-model (`bun:test`, T-008) + E2E |
| MF-004 | Busca por CPF antes do cadastro (dedup proativo): CPF existente leva ao registro, `PEO-002` libera o formulário | 100% (CT-006) | teste de integração com fake in-memory (`bun:test`, T-012) |
| MF-005 | Paginação por cursor concatena páginas sem duplicar/perder `id` de pessoa | 0 duplicata (CT-005) | teste de view-model (`bun:test`, T-006) |
| MF-006 | Ações de vínculo oferecidas seguem o papel: sistemas de `adminSystems(roles)`, sem auto-assign, `superadmin` só para superadmin | 0 ação inválida oferecida (CT-008…CT-010) | teste de view-model (`bun:test`, T-009) |

## NFRs

| ID | Categoria | Alvo mensurável | Como medir |
|---|---|---|---|
| NFR-001 | Performance (UI) | lista de pessoas interativa p95 < 1 s @ 500 itens carregados (com virtualização); busca por CPF responde < 500 ms percebidos | trace/Lighthouse + profiling do presenter |
| NFR-002 | Segurança | bundle do client sem `accessToken`/`refreshToken`/`Bearer`/`X-Actor-Id` | grep no bundle no CI (SC-002 da auth) |
| NFR-003 | LGPD em telemetria | 0 CPF (mascarado ou cru) em eventos RUM, analytics, URLs reportadas e logs de erro do client; erros TypeBox reportados por **nome de campo EN**, nunca pelo valor digitado | grep automatizado dos payloads de telemetria em CI + review do reporter |
| NFR-004 | Acessibilidade | navegável por teclado de ponta a ponta (incl. diálogo de erasure com focus trap); contraste AA; 0 violações sérias/críticas no axe | axe / Lighthouse a11y nas 5 telas principais |
| NFR-005 | i18n | 0 string literal de UI fora do catálogo (inclui mensagens dos 27 códigos de erro) | governance test em `bun:test` |
| NFR-006 | Design system | 0 hex/rgb/px cru em `ui/` (só tokens vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) | governance test em `bun:test` (so-tokens) |
| NFR-007 | Web Vitals | LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1 (p75, hardware modesto da associação) | Lighthouse CI + web-vitals RUM reportado ao BFF |
| NFR-008 | Resiliência de UI | 100% das telas com estados loading/vazio/erro/sucesso; 207 com banner de retry; 409/422 com ação contextual; `IDP-*` comunicando "nada foi alterado" | testes de componente + checklist CHK026…CHK031 |

**Citação que sustenta os NFRs** (obrigatória):
> "Your best bet is to remember two things from Cook's original test pyramid:
> 1. Write tests with different granularity
> 2. The more high-level you get the fewer tests you should have.
> A healthy, fast and maintainable test suite is what lets you verify these qualities continuously
> instead of discovering regressions in production."
> — *(localização exata no corpus a registrar via `skills_citar` em `practical-test-pyramid--vocke.md`, Ham Vocke — base da verificação contínua dos NFRs de UI)*

## Métricas de performance (orçamento)

| ID | Indicador | Baseline | Alvo | Orçamento |
|---|---|---|---|---|
| MP-001 | TTI da rota de listagem (`/people`) | N/A (pré-Sprint 0) | < 2 s | 3 s |
| MP-002 | TTI da rota de detalhe (`/people/:personId`, com vínculos) | N/A | < 2 s | 3 s |
| MP-003 | tamanho do chunk da feature `002-people-context-web` (gzip) | N/A | < 120 kB | 180 kB |
| MP-004 | JS total inicial (gzip) | N/A | < 300 kB | 400 kB |
| MP-005 | tempo de submissão percebido do cadastro (clique → confirmação/banner 207) p95 | N/A | < 1,5 s | 3 s |
| MP-006 | tempo de conclusão da jornada de cadastro de pessoa (busca por CPF → formulário → confirmação) p75 | N/A | < 3 min | 5 min |

## Critérios de sucesso (mensuráveis, tech-agnostic)

- **SC-001**: administradora completa o cadastro de uma pessoa (CT-001/CT-002) em < 3 min na primeira tentativa, sem ajuda externa.
- **SC-002**: taxa de dedup na busca prévia ≥ 90% — das tentativas de cadastrar CPF já existente, ao menos 90% são interceptadas pela busca por CPF **antes** do submit (o restante cai no 201 idempotente do backend, nunca em duplicata).
- **SC-003**: taxa de retry pós-207 = 100% — toda pessoa criada com falha de provisão (banner 207) tem o retry de login acionado em ≤ 7 dias; 0 reenvio do cadastro nesses casos.
- **SC-004**: ≤ 2 erros de validação TypeBox por submissão bem-sucedida (média semanal), com fricção por campo monitorada (campo `cpf` esperado como o de maior taxa — máscara deve reduzi-la semana a semana).
- **SC-005**: 0 incidente de exposição de token, CPF em telemetria ou link de recuperação de senha no browser durante o ciclo da feature.

## Observabilidade

- **RUM leve**: `web-vitals` (LCP/INP/CLS) reportado a um endpoint do BFF (`/api/vitals`) com rota normalizada (`/people/:personId`, nunca o id real nem CPF na URL reportada) — sem PII.
- **Erros de UI**: o binding Solid captura `useSubmission` com status de erro e envia ao BFF
  `{ rota normalizada, código AppError, timestamp }` → contadores de **taxa de erro por
  tela** e **por código** (alimenta SC-004 e o MF-002 de [`metrics.md`](./metrics.md));
  dimensão dedicada para 207 (sucesso parcial, não erro).
- **Métricas de formulário**: eventos de início/submissão/abandono e contagem de erros
  TypeBox **por nome de campo EN** (`cpf`, `fullName`, `birthDate`, `email`,
  `initialPassword`) — nunca o valor digitado, nunca o CPF — → fricção por campo e SC-004.
- **Funil de dedup**: contadores `cpf-search-hit` (registro existente aberto) vs
  `cpf-search-miss → submit` vs `dedup-201` (backend devolveu id existente) → SC-002.
- **Funil de provisão**: contadores `multi-status-shown` → `retry-clicked` →
  `retry-succeeded` (taxa de retry pós-207, SC-003), correlacionados por `requestId` com o
  NFR-004 de [`metrics.md`](./metrics.md).
- **Jornadas**: marcação de início/fim das jornadas críticas (busca → cadastro, vínculo,
  reset de senha) via `performance.mark`/`measure` agregadas no relatório RUM (MP-006).
- **Logs do BFF Elysia**: correlação `requestId` entre erro visto na tela e chamada outbound
  registrada em [`metrics.md`](./metrics.md) — nunca logar token, corpo de formulário, CPF
  ou link de recuperação.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, II, IV, V, VI
- [ADR-0002 (web_02): Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0007 (web_02): vanilla-extract — design system](../../adr/0007-design-system-vanilla-extract.md)
- [ADR-0009 (web_02): Framework-Agnostic Client — ViewModel + binding Solid](../../adr/0009-framework-agnostic-client.md)
- [ADR-0011 (web_02): No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [metrics.md — NFRs do contrato/backend](./metrics.md)
- [domain.fe.md — modelo e eventos do client](./domain.fe.md)
- [adr.fe.md — mapeamento de erros](./adr.fe.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [Índice de ADRs web_02](../../adr/README.md)
