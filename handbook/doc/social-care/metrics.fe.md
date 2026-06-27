# Métricas & NFRs: Interface Web Social-Care — frontend (browser)

**Feature**: `specs/001-social-care-web/` · **Consultores**: `/acdg-skills:software-architect` + `/acdg-skills:requirements-engineer`

> Fase de NFRs (frontend, máximo rigor). NFRs ancorados com **citação canônica** via `skills_citar`.
> Toda métrica deve ser **mensurável**. Foco do front: experiência (latência de tela, acessibilidade),
> integridade (validação na borda), e segurança (token nunca no browser). Visão do contrato/backend
> em [`metrics.md`](./metrics.md).

## Métricas funcionais

> "Faz a coisa certa" — verificáveis por teste/cenário.

| ID | Métrica | Alvo | Como medir |
|---|---|---|---|
| MF-001 | VO rejeita CPF inválido (dígito verificador) antes de qualquer chamada de rede | 100% (CT-002) | teste de domínio (`bun:test`, T-001) |
| MF-002 | switch exaustivo em `AppError` → tag i18n para todos os códigos do contrato (`PAT-001`…`PLACE-002`, `LOOKUP-*`) | sem `default` solto; fallback nomeado `unknown-error` | typecheck (união de literais TypeBox) + teste do ViewModel (`bun:test`, T-005) |
| MF-003 | Ações de ciclo de vida exibidas seguem `PatientStatus` (`waitlisted`→admit/withdraw; `active`→discharge; `discharged`→readmit) | 0 ação inválida oferecida | teste de ViewModel (`bun:test`, T-006) + E2E CT-006/CT-007 |
| MF-004 | Campos metadata-driven de benefício (`exigeCpfFalecido`, `exigeRegistroNascimento`) aparecem e validam quando o lookup exige | 100% (CT-010) | teste de componente Solid (`bun:test`, T-010) |
| MF-005 | Paginação por cursor concatena páginas sem duplicar/perder `patientId` | 0 duplicata (CT-004) | teste de ViewModel (`bun:test`, T-007) |

## NFRs

| ID | Categoria | Alvo mensurável | Como medir |
|---|---|---|---|
| NFR-001 | Performance (UI) | lista de pacientes interativa p95 < 1 s @ 500 itens carregados (com virtualização) | trace/Lighthouse + profiling do ViewModel |
| NFR-002 | Segurança | bundle do client sem `accessToken`/`refreshToken`/`Bearer` | grep no bundle no CI (SC-002 da auth) |
| NFR-003 | Acessibilidade | navegável por teclado de ponta a ponta; contraste AA; 0 violações sérias/críticas no axe | axe / Lighthouse a11y nas 5 telas principais |
| NFR-004 | i18n | 0 string literal de UI fora do catálogo (inclui mensagens de todos os códigos de erro) | governance test (`bun:test`) |
| NFR-005 | Design system | 0 hex/rgb/px cru em `ui/` (tokens obrigatórios via vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) | governance test (`bun:test`) "só-tokens" |
| NFR-006 | Web Vitals | LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1 (p75, hardware modesto da associação) | Lighthouse CI + web-vitals RUM reportado ao BFF |
| NFR-007 | Resiliência de UI | 100% das telas com estados loading/vazio/erro/sucesso; 409 de `version` com fluxo de reconciliação | testes de componente Solid (`bun:test`) + checklist CHK027/CHK028 |

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
| MP-001 | TTI da rota de listagem (`/patients`) | N/A (pré-Sprint 0) | < 2 s | 3 s |
| MP-002 | TTI da rota do prontuário (`/patients/:patientId`, agregado completo) | N/A | < 2,5 s | 3,5 s |
| MP-003 | tamanho do chunk da feature `001-social-care-web` (gzip) | N/A | < 150 kB | 200 kB |
| MP-004 | JS total inicial (gzip) | N/A | < 300 kB | 400 kB |
| MP-005 | tempo de submissão percebido dos formulários de assessment (clique → toast) p95 | N/A | < 1 s | 2 s |
| MP-006 | tempo de conclusão da jornada de cadastro de paciente (formulário completo) p75 | N/A | < 5 min | 8 min |

## Critérios de sucesso (mensuráveis, tech-agnostic)

- **SC-001**: assistente social completa o cadastro de um paciente (CT-001) em < 5 min na primeira tentativa, sem ajuda externa.
- **SC-002**: taxa de erro por tela < 2% das sessões (erros exibidos / sessões que abrem a tela), com 0 ocorrência de `unknown-error` em jornada crítica.
- **SC-003**: taxa de abandono dos formulários de avaliação socioeconômica < 20%; ≤ 2 erros de validação por submissão bem-sucedida (médias semanais).
- **SC-004**: 0 incidente de exposição de token ou de PII anonimizada no browser durante o ciclo da feature.

## Observabilidade

- **RUM leve**: `web-vitals` (LCP/INP/CLS) reportado a um endpoint do BFF Elysia (`/api/vitals`) com rota normalizada — sem PII, sem identificadores de paciente na URL reportada.
- **Erros de UI**: o binding Solid (`*.binding.ts`) captura erros via `ErrorBoundary` / `createAsync` e envia ao BFF `{ rota normalizada, código `AppError`, timestamp }` → contadores de **taxa de erro por tela** e **por código** (alimenta SC-002 e o MF-002 de [`metrics.md`](./metrics.md)).
- **Métricas de formulário**: eventos de início/submissão/abandono e contagem de erros TypeBox por campo (nome do campo EN, nunca o valor digitado) → abandono e fricção por campo (SC-003); destaque para campos metadata-driven de benefício.
- **Jornadas**: marcação de início/fim das jornadas críticas (cadastro, admissão, avaliação, encaminhamento) via `performance.mark`/`measure` agregadas no relatório RUM (MP-006).
- **Logs do BFF Elysia**: correlação `requestId` entre erro visto na tela e chamada outbound registrada em [`metrics.md`](./metrics.md) — nunca logar token, corpo de formulário ou PII.

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0002 Errors as Values: [`../../adr/0002-errors-as-values.md`](../../adr/0002-errors-as-values.md)
- ADR-0007 vanilla-extract (design system): [`../../adr/0007-design-system-vanilla-extract.md`](../../adr/0007-design-system-vanilla-extract.md)
- ADR-0009 Framework-agnostic client (ViewModel puro + binding Solid): [`../../adr/0009-framework-agnostic-client.md`](../../adr/0009-framework-agnostic-client.md)
- ADR-0011 No mocks em produção: [`../../adr/0011-no-mocks-in-production.md`](../../adr/0011-no-mocks-in-production.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Métricas do contrato (visão core-api): [`./metrics.md`](./metrics.md)
- Domínio frontend: [`./domain.fe.md`](./domain.fe.md)
- Mapeamento de erros (ADR de feature): [`./adr.fe.md`](./adr.fe.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- SolidStart: [`../../reference/framework/solidstart/`](../../reference/framework/solidstart/)
- vanilla-extract: [`../../reference/ui/vanilla-extract/`](../../reference/ui/vanilla-extract/)
- GSAP: [`../../reference/ui/gsap/`](../../reference/ui/gsap/)
- Bun (runtime/test): [`../../reference/runtime/bun/`](../../reference/runtime/bun/)
