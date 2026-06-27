# Implementation Plan: Navegação de pacientes (leitura) + catálogos de domínio

**Branch**: `002-patient-browse` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-patient-browse/spec.md`

## Summary

Primeiro incremento vertical de domínio sobre o `social-care`: o profissional autenticado percorre a lista de pacientes (busca por nome, filtro por situação, rolagem infinita por cursor), abre um paciente (destino reservado + tratamento de 404), e a aplicação disponibiliza/cacheia os catálogos de domínio para os formulários futuros. **Somente leitura.**

Abordagem técnica: o **BFF (Elysia)** ganha rotas de leitura que **orquestram** o `social-care` — lê a sessão (feature 001), injeta `Authorization: Bearer <accessToken>` outbound, desembrulha os envelopes (`StandardResponse`/`PaginatedResponse`) e mapeia erros upstream para tags semânticas. O **client** ganha dois módulos verticais MVVM (`patients`, `domains`) com núcleo agnóstico (ViewModel puro + repository-porta via Eden) e bindings Solid (`createAsync` + `IntersectionObserver` nativo para o scroll infinito; cache de domínio por sessão). Zero dependência npm nova (Princ. IV): scroll, cache, debounce e HTTP outbound usam built-ins (Web API / `fetch` / Solid nativo).

## Technical Context

**Language/Version**: TypeScript estrito · Bun 1.4 · Solid 1.9 / SolidStart 1.3 (Vinxi · Nitro preset `bun`)

**Primary Dependencies**: stack-base existente (SolidStart, Elysia, Eden Treaty, TypeBox `Elysia.t`, vanilla-extract). **Nenhuma dep nova** — cliente HTTP outbound ao `social-care` usa `fetch` nativo; scroll infinito usa `IntersectionObserver`; cache usa `Map`/`query` do Solid.

**Storage**: nada novo persistente. O `accessToken` para o Bearer outbound vem da sessão server-side da feature 001 (`Bun.redis`/in-memory). Cache de catálogos de domínio é em memória, escopo de sessão (client).

**Testing**: `bun:test` — governance (boundaries/agnostic/no-mocks/no-leak), **contract tests do BFF contra um stub HTTP upstream** (fixture em `tests/support/`, permitido — Princ. VI proíbe mock em `src/`, não em `tests/`), ViewModels puros. Smoke SSR no build + **aceite em DEV contra o `social-care` real** (Gherkin `01`/`04`).

**Target Platform**: VPS única (Caddy → web BFF, único serviço público). Navegadores modernos.

**Project Type**: Web (front+BFF num só serviço SolidStart+Elysia).

**Performance Goals**: primeira página da lista renderiza no SSR; scroll infinito carrega páginas sob demanda sem recarga; catálogos servidos do cache após o 1º acesso na sessão.

**Constraints**: fronteira BFF (browser nunca vê token/URL/segredo); LGPD (zero PII de paciente em logs); Bun-native/zero-npm; envelopes padrão `{data, meta}`; erros por semântica (tag i18n), nunca por status.

**Scale/Scope**: single-tenant (associação de Boa Vista); centenas/milhares de pacientes; 13 catálogos de domínio (allowlist); 2 telas (lista + detalhe-stub) + a camada de catálogos.

## Constitution Check

*GATE: passa antes da Fase 0 e revalidado após a Fase 1.*

| Princípio | Conformidade nesta feature |
|---|---|
| **I. BFF-Orchestrated Boundary** | ✅ Toda chamada ao `social-care` parte do BFF, que injeta o Bearer (do `accessToken` da sessão) e desembrulha envelopes. O client fala só com o BFF (Eden); nunca vê token, URL do `social-care` nem faz fan-out. |
| **II. Errors as Values** | ✅ Repositórios devolvem `Result<T, tag>`; Eden devolve `{data,error}`; o BFF mapeia status+`error.code` upstream → tag semântica; a UI decide por tag (i18n), não por HTTP. Única travessia valor→exceção é o `createAsync`. |
| **III. Vertical-Modular · MVVM×DDD** | ✅ Módulos `patients` e `domains` (`client`/`public-api`); import cross-módulo só via `public-api`; ViewModel puro (recorte/merge/vazio testáveis sem Solid) + binding (único ponto reativo) + view burra; núcleo `data/*.view-model.ts` sem `@solidjs/*`. |
| **IV. Bun-Native / Zero-NPM (NON-NEGOTIABLE)** | ✅ Sem dep nova. Scroll infinito = `IntersectionObserver` (Web API); estado/fetch = `createAsync`/`action` (Solid) — **não** TanStack Query; cache = `Map`/`query`; HTTP outbound = `fetch`; validação = TypeBox. |
| **V. Strict TS & E2E Type Safety** | ✅ Query/params e resposta das rotas BFF tipados com `Elysia.t`; Eden propaga ao client (sem redeclarar Model); `tsc --noEmit` é gate; tokens de design checados em compilação (vanilla-extract). |
| **VI. Honesty / No Mocks** | ✅ BFF fala com o `social-care` real; stub upstream só em `tests/`. O conteúdo do prontuário (feature 003) é `'not-implemented'` honesto no stub de detalhe — nada de paciente fabricado. |

**Resultado do gate**: PASS (sem violações; sem entradas em Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/002-patient-browse/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões D1..D9
├── data-model.md        # Fase 1 — entidades
├── quickstart.md        # Fase 1 — guia de validação
├── contracts/           # Fase 1 — contratos BFF (downstream) + social-care (upstream)
│   ├── bff-patients.md
│   ├── bff-domains.md
│   └── upstream-social-care.md
└── tasks.md             # Fase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── app.ts                          # + registra grupos patients/domains
│   ├── deps.ts                         # + socialCare client na composição (AppDeps)
│   └── routes/
│       ├── patients-list.query.fn.ts   # GET /api/patients?search&status&limit&cursor
│       ├── patient-get.query.fn.ts     # GET /api/patients/:id  (existência p/ stub; 404)
│       └── domains-get.query.fn.ts     # GET /api/domains/:tableName  (allowlist 13)
├── external/
│   └── social-care-client.ts           # porta SocialCareClient + adapter HTTP (fetch); Bearer
├── shared/http/
│   ├── envelope.ts                     # StandardResponse/PaginatedResponse + unwrap tipado
│   └── upstream-error.ts               # status+error.code upstream → AppError tag (CPF-/REGP-/LKP-/…)
├── modules/
│   ├── patients/
│   │   ├── client/
│   │   │   ├── data/
│   │   │   │   ├── patient-summary.model.ts
│   │   │   │   ├── patient-status.ts            # enum + ordem + i18n de situação
│   │   │   │   └── patient-list.repository.ts   # porta → BFF (Eden) — AGNÓSTICA
│   │   │   ├── list/
│   │   │   │   ├── patient-list.view-model.ts   # PURO: recorte, merge de páginas, vazio, tem-mais
│   │   │   │   ├── patient-list.binding.ts      # Solid: createAsync + cursor + IntersectionObserver + debounce
│   │   │   │   ├── patient-list.page.tsx
│   │   │   │   ├── patient-list.css.ts
│   │   │   │   └── components/{patient-row,search-bar,status-filter,empty-state,list-skeleton}.component.tsx
│   │   │   └── detail/
│   │   │       ├── patient-detail.binding.ts    # checa existência (404 → volta à lista)
│   │   │       ├── patient-detail-stub.page.tsx # placeholder honesto (prontuário = feature 003)
│   │   │       └── patient-detail.css.ts
│   │   └── public-api/index.ts
│   ├── domains/
│   │   ├── client/
│   │   │   ├── data/
│   │   │   │   ├── domain-catalog.model.ts
│   │   │   │   └── domain-catalog.repository.ts # porta → BFF (Eden)
│   │   │   └── cache/domain-cache.ts            # cache por sessão (query do Solid, dedup)
│   │   └── public-api/index.ts                  # accessor de catálogo p/ features futuras
│   └── shell/client/root/root.view-model.ts     # + entrada de menu "Pacientes" → /patients
└── routes/(app)/patients/
    ├── index.tsx                       # lista (protegida pelo guard da 001)
    └── [id].tsx                        # detalhe-stub

tests/
├── support/social-care-stub.ts         # stub HTTP upstream (FIXTURE, tests-only — Princ. VI)
├── contract/
│   ├── patients-list.contract.test.ts  # paginação/filtro/limite/Bearer/envelope/erros (REG-010..013, 012)
│   ├── patient-get.contract.test.ts    # 200 + 404 (REG-014)
│   └── domains-get.contract.test.ts    # itens ativos ordenados + allowlist (LKP-T001/T002)
├── modules/patients/patient-list.view-model.test.ts
└── modules/domains/domain-cache.test.ts
```

**Structure Decision**: mantém o padrão da feature 001 — **rotas Elysia do BFF em `src/server/routes/*.query.fn.ts`** (registradas em `app.ts`), **adapter outbound em `src/external/`**, e **módulos verticais de client em `src/modules/<f>/{client,public-api}`** com núcleo agnóstico. A composição (`AppDeps` em `src/server/deps.ts`) ganha o `SocialCareClient`, mantendo as rotas testáveis por injeção (stub upstream em `tests/`).

## Complexity Tracking

> Sem violações de constituição — seção vazia.
