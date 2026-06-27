# Implementation Plan: Cadastro, ciclo de vida, núcleo familiar e identidade social do paciente (escrita)

**Branch**: `003-patient-manage` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-patient-manage/spec.md`

## Summary

Segundo incremento vertical sobre o `social-care`, agora de **escrita**, fechando o setor Pacientes: cadastrar paciente, conduzir o ciclo de vida (admitir/dar alta/readmitir/retirar da fila), gerir o núcleo familiar (adicionar/remover membro, cuidador principal) e atualizar a identidade social. Cobre os **9 comandos** de paciente do `social-care`.

Abordagem técnica: **BFF como facade view-ready (ADR-0010 + adendo 2026-06-25)** — o BFF compõe a resposta inteira que cada tela precisa e o client só gerencia estado de UI. O **BFF (Elysia)** ganha: (a) **2 rotas de leitura composta** — `GET /api/patients/:id/overview` (cabeçalho + situação + **transições disponíveis** + núcleo familiar + identidade social, **fan-out cross-service mesclado + códigos de domínio resolvidos em rótulos no servidor**, com degradação parcial via `meta.partial`) e `GET /api/patients/new/form-context` (catálogos do cadastro já filtrados); (b) **9 rotas de mutação** (`*.service.fn.ts`) que orquestram o `social-care`, validam com `Elysia.t` **antes** do upstream, injetam `Authorization: Bearer` (ator do `JWT.sub` — **nunca** header de ator), mapeiam `REGP/ADM/DISC/READM/WDR/APP/RFM/APC/USIA-xxx` → tag, e **devolvem o view-state recomposto** (ADR-0010 §3, **não `204`**) — o client troca o estado sem refetch. O **client estende o módulo `patients`** (mesmo bounded context) com quatro sub-features MVVM `create`/`lifecycle`/`family`/`social-identity` que ficam **"quase só estado"**: ViewModel de validação puro + binding que dispara a `fn` e troca o estado com o retorno. Selects de formulário consomem o `form-context`/cache de domínio da 002 (**input apenas** — exibição já vem resolvida do BFF). Anti-duplo-submit via `action`/`useSubmission`. **Zero dependência npm nova** (Princ. IV).

## Technical Context

**Language/Version**: TypeScript estrito · Bun 1.4 · Solid 1.9 / SolidStart 1.3 (Vinxi · Nitro preset `bun`)

**Primary Dependencies**: stack-base existente (SolidStart, Elysia, Eden Treaty, TypeBox `Elysia.t`, vanilla-extract). **Nenhuma dep nova** — submissão de formulário usa `action`/`useSubmission` do `@solidjs/router`; validação usa TypeBox (BFF) + ViewModel puro (client); HTTP outbound usa `fetch` (cliente `SocialCareClient` da 002, estendido).

**Storage**: nada novo persistente. O `accessToken` do Bearer outbound vem da sessão server-side da 001. As escritas não criam cache; cada mutação **devolve o view-state recomposto pelo BFF** (ADR-0010 §3) e o client troca o estado com o retorno — sem refetch/revalidate.

**Testing**: `bun:test` — governance (boundaries/agnostic/no-mocks/no-leak), **contract tests do BFF de cada mutação contra o stub HTTP upstream** (fixture em `tests/support/social-care-stub.ts`, estendido — Princ. VI proíbe mock em `src/`, não em `tests/`), ViewModels de validação puros, e testes de segurança (CSRF por mutação, ausência de header de ator do cliente, sem PII em log). Aceite em DEV contra o `social-care` real (Gherkin de cadastro/ciclo-de-vida/família).

**Target Platform**: VPS única (Caddy → web BFF, único serviço público). Navegadores modernos.

**Project Type**: Web (front+BFF num só serviço SolidStart+Elysia).

**Performance Goals**: validação local barra entradas inválidas sem ida ao backend; mutação confirma rápido e revalida só o necessário; selects servidos do cache de domínio da 002 (sem recarregar).

**Constraints**: fronteira BFF (browser nunca vê token/URL/segredo/header de ator); CSRF em toda mutação; LGPD (zero PII de paciente/membro em logs); Bun-native/zero-npm; envelopes padrão `{data, meta}`; erros por semântica (tag i18n), nunca por status; sem dado fabricado (revalida da fonte).

**Scale/Scope**: single-tenant (associação de Boa Vista); 9 comandos de mutação; 4 sub-features de UI (cadastro, ciclo de vida, família, identidade social) estendendo o módulo `patients`.

## Constitution Check

*GATE: passa antes da Fase 0 e revalidado após a Fase 1.*

| Princípio | Conformidade nesta feature |
|---|---|
| **I. BFF-Orchestrated Boundary** | ✅ Toda mutação parte do BFF, que injeta o Bearer (do `accessToken` da sessão) e desembrulha envelopes. O ator é derivado do `JWT.sub` pelo `social-care` — o BFF **não** envia header de ator do cliente (ADR-023 do social-care). O client fala só com o BFF (Eden); nunca vê token, URL do `social-care` nem segredo. |
| **II. Errors as Values** | ✅ `SocialCareClient` e repositórios devolvem `Result<T, AppError>`; o BFF mapeia status+`error.code` upstream → tag semântica; a UI decide por tag (i18n), não por HTTP/código cru. Validação client-side é `Result`/lista de erros de campo, sem `throw`. Única travessia valor→exceção é o `action`/`createAsync`. |
| **III. Vertical-Modular · MVVM×DDD** | ✅ Estende o módulo `patients` (mesmo bounded context) com sub-features `create`/`lifecycle`/`family`/`social-identity`; import cross-módulo só via `public-api`; ViewModel de validação **puro** (testável sem Solid) + binding (único ponto reativo: `action`/`useSubmission`) + view burra (formulário). Núcleo `data/*.view-model.ts` sem `@solidjs/*`. |
| **IV. Bun-Native / Zero-NPM (NON-NEGOTIABLE)** | ✅ Sem dep nova. Submissão = `action`/`useSubmission` (Solid) — **não** react-hook-form/formik/TanStack; validação = TypeBox (BFF) + funções puras (client) — **não** Zod/Yup; HTTP outbound = `fetch`; selects = cache de domínio da 002. |
| **V. Strict TS & E2E Type Safety** | ✅ Corpo/params de cada rota de mutação tipados com `Elysia.t`; Eden propaga ao client (sem redeclarar Model); `tsc --noEmit` é gate; tokens de design checados em compilação (vanilla-extract). |
| **VI. Honesty / No Mocks** | ✅ BFF fala com o `social-care` real; stub upstream só em `tests/`. Sem paciente/membro fabricado: após a mutação, relê da fonte. Onde um dado ainda não é exposto pelo backend, mantém-se honesto (sem inventar). |

**Resultado do gate**: PASS (sem violações; sem entradas em Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/003-patient-manage/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões D1..D11
├── data-model.md        # Fase 1 — entidades de escrita + máquina de estados
├── quickstart.md        # Fase 1 — guia de validação
├── contracts/           # Fase 1 — contratos BFF (downstream) + social-care (upstream)
│   ├── bff-patient-manage.md
│   └── upstream-social-care-write.md
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── server/
│   ├── app.ts                              # + registra 2 rotas de leitura composta + 9 de mutação (grupo /patients)
│   ├── composition/
│   │   └── patient-overview.compose.ts     # fan-out + merge + domínio→rótulo + transições (cross-service)
│   └── routes/
│       ├── patient-overview.query.fn.ts        # GET  /api/patients/:id/overview (view-ready, screen-shaped)
│       ├── patient-form-context.query.fn.ts    # GET  /api/patients/new/form-context (catálogos do cadastro)
│       ├── patient-create.service.fn.ts        # POST /api/patients
│       ├── patient-admit.service.fn.ts         # POST /api/patients/:id/admit
│       ├── patient-discharge.service.fn.ts     # POST /api/patients/:id/discharge
│       ├── patient-readmit.service.fn.ts       # POST /api/patients/:id/readmit
│       ├── patient-withdraw.service.fn.ts      # POST /api/patients/:id/withdraw
│       ├── family-member-add.service.fn.ts     # POST /api/patients/:id/family-members
│       ├── family-member-remove.service.fn.ts  # DELETE /api/patients/:id/family-members/:memberId
│       ├── primary-caregiver-set.service.fn.ts # PUT  /api/patients/:id/primary-caregiver
│       └── social-identity-update.service.fn.ts# PUT  /api/patients/:id/social-identity
├── external/
│   └── social-care-client.ts               # + métodos de escrita (create/admit/discharge/…); Bearer; Result
├── shared/
│   ├── http/upstream-error.ts              # + mapeia REGP/ADM/DISC/READM/WDR/APP/RFM/APC/USIA-xxx → tag
│   └── i18n/patients.ts                     # + tags de escrita (validação/conflito/sem-permissão/dependência)
├── modules/patients/
│   ├── server/
│   │   ├── patient-create.fn.ts            # "use server" → app.handle(POST /api/patients)
│   │   ├── patient-lifecycle.fn.ts         # "use server" → admit/discharge/readmit/withdraw
│   │   ├── family.fn.ts                     # "use server" → add/remove/caregiver
│   │   └── social-identity.fn.ts           # "use server" → update social identity
│   ├── client/
│   │   ├── data/
│   │   │   ├── patient-registration.model.ts   # tipos do cadastro (request) — PURO
│   │   │   ├── lifecycle.model.ts              # transições + motivos — PURO
│   │   │   ├── family.model.ts                 # membro/cuidador — PURO
│   │   │   └── social-identity.model.ts        # tipo/descrição — PURO
│   │   ├── create/
│   │   │   ├── patient-create.view-model.ts    # PURO: validação de campos/regras condicionais
│   │   │   ├── patient-create.binding.ts       # Solid: action/useSubmission, erro por campo, anti-duplo-submit
│   │   │   ├── patient-create.page.tsx
│   │   │   ├── patient-create.css.ts
│   │   │   └── components/{form-section,field,domain-select,submit-bar}.component.tsx
│   │   ├── lifecycle/
│   │   │   ├── lifecycle.view-model.ts         # PURO: transição válida p/ a situação + exigência de motivo
│   │   │   ├── lifecycle.binding.ts            # Solid: action por transição + revalidate da leitura
│   │   │   ├── lifecycle-actions.component.tsx # só a transição cabível à situação atual
│   │   │   └── discharge-dialog.component.tsx  # motivo + observações (obrigatórias se "outro")
│   │   ├── family/
│   │   │   ├── family.view-model.ts            # PURO: validação de membro/cuidador
│   │   │   ├── family.binding.ts               # Solid: add/remove/caregiver + revalidate
│   │   │   └── family-panel.page.tsx + components/
│   │   └── social-identity/
│   │       ├── social-identity.view-model.ts   # PURO: exigência condicional de descrição
│   │       ├── social-identity.binding.ts
│   │       └── social-identity-form.component.tsx
│   └── public-api/index.ts                  # + export das novas páginas/painéis
└── routes/(app)/patients/
    ├── new.tsx                              # cadastro (protegida pelo guard da 001)
    └── [id].tsx                             # detalhe-stub da 002 + monta lifecycle/family/social-identity

tests/
├── support/social-care-stub.ts             # + fixtures/handlers das 9 mutações (tests-only — Princ. VI)
├── contract/
│   ├── patient-create.contract.test.ts     # 201 + Bearer + envelope; 400 validação; 409 conflito; 503 dep
│   ├── patient-lifecycle.contract.test.ts  # admit/discharge/readmit/withdraw: 204 + pré-condições/erros de estado
│   ├── patient-family.contract.test.ts     # add/remove/caregiver: 204; já-existe/não-encontrado/não-ativo
│   └── patient-social-identity.contract.test.ts # 204; exigência de descrição
├── security/
│   └── patient-write.security.test.ts      # CSRF por mutação; sem header de ator do cliente; sem PII em log
└── modules/patients/
    ├── patient-create.view-model.test.ts
    ├── lifecycle.view-model.test.ts
    ├── family.view-model.test.ts
    └── social-identity.view-model.test.ts
```

**Structure Decision**: **estende o módulo `patients`** (não cria módulo novo) — cadastro, ciclo de vida, família e identidade são o mesmo agregado/bounded context da navegação (002). As rotas de mutação seguem o naming `*.service.fn.ts` (ADR-0010, escrita), registradas em `app.ts`; o `SocialCareClient` (`src/external/`) ganha os métodos de escrita; o mapa de erro upstream e a i18n de pacientes são estendidos. A composição (`AppDeps`) já injeta o `SocialCareClient`, mantendo as rotas testáveis por injeção (stub upstream em `tests/`).

## Complexity Tracking

> Sem violações de constituição — seção vazia.
