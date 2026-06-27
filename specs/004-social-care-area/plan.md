# Implementation Plan: Área do Assistente Social (telas)

**Branch**: `004-social-care-area` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md) · [screen-map.md](./screen-map.md)

## Summary

Camada de **telas** da área do Assistente Social, consumindo o **server-side já construído** (lista, `overview` composto, cadastro, ciclo de vida, avaliações, atendimentos, proteção, auditoria). Nasce aqui o **shell de navegação por papel** (reusado pelas áreas futuras de RH e Donos). Tudo **mobile-first**.

Abordagem: o **client é só tela** (ADR-0010/0004/0009) — cada tela consome **uma** `fn` do BFF via `createAsync`/`action` e gerencia só estado de UI; a composição já vem pronta do servidor (o Resumo = `composePatientOverview`). O único trabalho de servidor é **uma orquestração de cadastro** (criar pessoa + paciente). Zero dep npm nova (Princ. IV): wizard/abas/validação usam Solid nativo + `@solidjs/router`; estilos em vanilla-extract.

## Technical Context

**Stack**: TypeScript estrito · Bun 1.4 · SolidStart 1.3 (Vinxi/Nitro preset `bun`) · Elysia (BFF) · Eden · vanilla-extract. **Nenhuma dep nova.**

**Reuso direto**: shell (`modules/shell`, 001) · lista/busca + cache de domínio (`modules/patients/client/list`, `modules/domains`, 002) · composição `patient-overview.compose.ts` (server, já construída) · todas as rotas do BFF dos 3 serviços.

**Testing**: `bun:test` — ViewModels de validação puros (wizard, avaliação), governance (boundaries/agnostic/no-mocks/no-leak), contract test da nova rota de cadastro orquestrado (contra stubs people+social), smoke SSR. Telas (Solid) via happy-dom onde fizer sentido.

**Target/Perf**: mobile-first; SSR na 1ª carga; abas trocam sem recarregar; escrita devolve view-state (sem refetch). **Constraints**: fronteira BFF (sem token/URL no browser); CSRF nas escritas; LGPD (zero PII em log); sem dado fabricado.

**Scope**: 1 shell de navegação por papel + 3 telas-mãe (home, wizard, prontuário c/ 5 abas) + 1 ajuste server-side. 5 incrementos (US1–US5).

## Constitution Check

| Princípio | Conformidade |
|---|---|
| **I. BFF-Orchestrated Boundary** | ✅ Telas consomem só `fn`s do BFF; o cadastro orquestrado (pessoa+paciente) acontece **no servidor**, não no client. |
| **II. Errors as Values** | ✅ `Result`/tags na borda; `action`/`createAsync` cruzam valor→UI; validação do wizard é lista de erros de campo, sem `throw`. |
| **III. Vertical-Modular · MVVM×DDD** | ✅ Estende `modules/patients/client` (`create/`, `detail/` com abas) e `modules/shell` (nav por papel). ViewModel puro de validação + binding (único ponto reativo) + view burra. |
| **IV. Bun-Native / Zero-NPM** | ✅ Wizard/abas/validação = Solid nativo (`action`/`useSubmission`/`createAsync`/signals) — sem lib de form/router extra. |
| **V. Strict TS & E2E Type Safety** | ✅ Tipos do BFF fluem via Eden; `tsc --noEmit` gate; tokens vanilla-extract checados em compilação. |
| **VI. Honesty / No Mocks** | ✅ Telas mostram só o que o servidor entrega; sem dado fabricado. Abas ainda não ligadas mostram estado honesto ("em construção"), nunca mock. |

**Resultado**: PASS (sem violações).

## O ajuste no server-side (cadastro orquestrado) — único endpoint novo

O `POST /api/patients` atual exige `personId` (pessoa existente). Para o assistente social criar o paciente **sem passar pelo RH**, o contrato passa a aceitar **OU** `personId` (existente) **OU** `person: {...}` (dados para criar):

```
POST /api/patients
  body: { person?: {fullName, cpf?, birthDate, ...}  // criar identidade nos bastidores
          | personId?: string                         // reusar existente
          initialDiagnoses[], prRelationshipId, ... }
  → BFF: se `person`, chama people-context createPerson (createLogin=false) → usa o id devolvido
         → chama social-care createPatient(personId, ...) → recompõe e devolve o PatientOverview (201)
```

**Segurança do passo em 2 fases** (sem transação distribuída): o `createPerson` do people-context é **idempotente por CPF** (mapeado na superfície). Então, se o `createPatient` falhar após criar a pessoa, uma nova tentativa **reaproveita** a mesma pessoa (não duplica) — fail-secure, sem pessoa órfã útil. O BFF reporta o erro por tag; o rascunho do wizard é preservado no client.

## Project Structure (Source Code)

```text
src/
├── modules/shell/client/root/
│   └── root.view-model.ts            # + áreas POR PAPEL (worker→Pacientes; RH/Donos futuras) — menu derivado de session.groups
├── modules/patients/client/
│   ├── list/                          # (002) vira a HOME da área — só ajustes (landing + botão Novo)
│   ├── create/                        # NOVO — wizard
│   │   ├── patient-create.view-model.ts   # PURO: passos, validação por passo, montagem do input
│   │   ├── patient-create.binding.ts      # action/useSubmission, anti-duplo-submit, rascunho, on success→prontuário
│   │   ├── wizard.page.tsx + steps/{identification,diagnosis}.step.tsx + components/
│   └── detail/                        # prontuário com ABAS (evolui o detalhe-stub da 002)
│       ├── prontuario.page.tsx            # casca de abas (Resumo|Avaliação|Atend|Proteção|Histórico)
│       ├── tabs/resumo.tab.tsx            # consome o overview (já pronto) + ações ciclo de vida/família/identidade
│       ├── tabs/avaliacao.tab.tsx         # 7 seções (US4)
│       ├── tabs/atendimentos.tab.tsx · protecao.tab.tsx · historico.tab.tsx  (US5)
│       └── *.binding.ts + *.view-model.ts (por aba)
├── server/
│   ├── composition/patient-register.compose.ts   # NOVO — orquestra createPerson(idempotente)→createPatient→overview
│   └── routes/patient-create.service.fn.ts       # estender: aceita person|personId; usa a composição
└── routes/(app)/patients/
    ├── index.tsx                      # home (já existe)
    ├── new.tsx                        # NOVO — wizard
    └── [id].tsx                       # prontuário com abas (evolui o stub)

tests/
├── modules/patients/patient-create.view-model.test.ts   # validação por passo
├── contract/patient-register.contract.test.ts           # cria pessoa+paciente; idempotência; fail-secure
└── modules/patients/prontuario-tabs.*.test.ts           # estado das abas
```

**Structure Decision**: estende os módulos existentes (`shell`, `patients`) — mesmo bounded context. A navegação por papel vive no `shell` (reuso pelos 3 perfis). O prontuário evolui o detalhe-stub da 002 para abas. O único servidor novo é a composição/rota de cadastro orquestrado.

## Incrementos (tasks por US, detalhados em tasks.md quando aprovado)

1. **US1 Esqueleto** — nav por papel no shell + home (busca) + prontuário casca-de-abas com **Resumo** ligado ao `overview`. *(só server-side pronto)*
2. **US2 Cadastro** — composição+rota de cadastro orquestrado + wizard (2 passos) + rascunho.
3. **US3 Ações no Resumo** — ciclo de vida (transições do overview) + família + identidade.
4. **US4 Avaliação** — aba com as 7 seções (selects do cache de domínio).
5. **US5 Clínico/Proteção/Histórico** — abas restantes.

## Complexity Tracking

> Sem violações de constituição. Única nota: o cadastro orquestrado é um passo em 2 fases — mitigado pela **idempotência por CPF** do `createPerson` (sem transação distribuída, sem órfão útil).
