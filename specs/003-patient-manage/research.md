# Research — Fase 0 (003-patient-manage)

Decisões de design da feature de **escrita** do setor Pacientes. Cada decisão registra contexto, escolha e alternativas descartadas. Fonte da superfície real: leitura do código Swift do `social-care` (controllers + command handlers + eventos) — ver [contracts/upstream-social-care-write.md](./contracts/upstream-social-care-write.md).

## D1 — Estender o módulo `patients` (não criar módulo novo)

**Contexto**: cadastro, ciclo de vida, família e identidade social agem sobre o **mesmo agregado** (paciente) já modelado na 002.

**Decisão**: estender `src/modules/patients/` com sub-features `create/`, `lifecycle/`, `family/`, `social-identity/`, reusando `client/data/patient-status.ts` e o detalhe (`/patients/:id`) da 002. Manter um único `public-api`.

**Descartado**: criar `patient-manage` separado — fragmentaria o bounded context, duplicaria tipos de situação e violaria a coesão vertical do ADR-0001.

## D2 — Máquina de estados e quais transições oferecer

**Contexto**: o `social-care` define `PatientStatus { waitlisted → active → discharged }` com 4 comandos de transição, cada um com pré-condição de estado.

**Decisão**: o ViewModel `lifecycle.view-model.ts` (puro) calcula, dada a situação atual, **somente** a transição cabível:

| Situação atual | Transição oferecida | Comando | Vai para |
|---|---|---|---|
| `WAITLISTED` (em fila) | Admitir · Retirar da fila | admit · withdraw | `ACTIVE` · saída |
| `ACTIVE` (em atendimento) | Dar alta | discharge | `DISCHARGED` |
| `DISCHARGED` (desligado) | Readmitir | readmit | `ACTIVE` |

A UI nunca oferece transição inválida; ainda assim, o backend é a autoridade e seu erro de estado (`ADM-002/003`, `DISC-001/007`, `READM-001/005`, `WDR-002/003`) é tratado graciosamente. `ADMITTED`/`WITHDRAWN` aparecem como rótulos de leitura (002) mas não são estados-fonte de transição aqui.

**Descartado**: oferecer todas as transições e deixar o backend recusar — pior UX e mais ida-e-volta.

## D3 — Dependência de people-context no cadastro (personId)

**Contexto**: `POST /patients` exige `personId` de uma pessoa que **já existe** no people-context; o `social-care` valida isso (REGP-029) e falha fail-secure se o people-context estiver fora (REGP-031, 503).

**Decisão**: nesta feature o `personId` é **entrada** (assume-se pessoa existente). O formulário aceita o identificador da pessoa; a busca/seleção de pessoa é o setor **Pessoas & Identidade** (feature futura), que depois alimentará este passo. O BFF repassa o erro: REGP-029 → "pessoa não encontrada"; REGP-031 → "não foi possível validar a pessoa agora, tente novamente" (dependência fora). Nunca cria paciente órfão.

**Descartado**: criar a pessoa aqui — fora do bounded context do social-care; é responsabilidade do people-context.

## D4 — Mapa de erros estruturados → tags semânticas

**Contexto**: cada comando tem seu prefixo de erro. O cliente decide por **tag** (i18n), nunca por código cru (Princ. II / ADR-0002).

**Decisão**: estender `src/shared/http/upstream-error.ts` para mapear, por `status` + `error.code`:

| Família | Exemplos | Tag semântica | UX |
|---|---|---|---|
| Validação (422/400) | `REGP-003..028`, `DISC-002/003/005`, `WDR-004..006`, `READM-004`, `USIA-003..007`, `APP-009/011` | `validation` | aponta campo / aviso de regra |
| Conflito (409) | `REGP-001/030`, `ADM-002/003`, `DISC-001/007`, `READM-001/005`, `WDR-002/003`, `APP-008/010`, `APC-005`, `USIA-008`, `RFM-005` | `conflict` | aviso de estado/duplicidade |
| Não encontrado (404) | `ADM-001`, `DISC-004`, `READM-002`, `WDR-001`, `RFM-001/002`, `APC-001/002`, `USIA-001`, `APP-007` | `notFound` | "não encontrado" |
| Sem permissão (403) | RBAC (sem role) | `forbidden` | "sem permissão" |
| Dependência fora (503) | `REGP-031` | `dependencyUnavailable` | preservar form + "tentar novamente" |
| Pessoa inexistente (422) | `REGP-029` | `validation` (campo pessoa) | "pessoa não encontrada" |
| Interno (500) | `*-006`/persistência | `unknown` | genérico + correlação |

O **código** segue no corpo para observabilidade (não exibido cru ao usuário). A i18n (`src/shared/i18n/patients.ts`) ganha as mensagens por tag/contexto.

## D5 — CSRF e identidade do ator nas mutações

**Contexto**: o app já bloqueia mutações sem `X-Requested-With` e checa `Origin` (ADR-0005). O `social-care` deriva o ator do `JWT.sub` validado (ADR-023), **não** de header customizado.

**Decisão**: reutilizar o guard CSRF existente (toda rota POST/PUT/DELETE entra nele). O BFF injeta **apenas** `Authorization: Bearer <accessToken>` outbound — **não** envia `X-Actor-Id` nem qualquer header de ator. Teste de segurança garante: (a) mutação sem `X-Requested-With` → 403; (b) nenhum header de ator do cliente é encaminhado ao upstream.

> **Nota de risco** (ver D9): a memória de E2E registra que o `social-care` em certo ponto exigiu `X-Actor-Id` indevidamente em um GET — bug de contrato do backend. Aqui o frontend **não** envia header de ator (correto por ADR-023); se o backend exigir, é correção do backend, não desta feature.

**Descartado**: enviar `X-Actor-Id` derivado no BFF — violaria o ADR-023 do social-care e abriria spoofing de ator.

## D6 — Validação pré-submit (ViewModel puro)

**Contexto**: FR-002 exige barrar entrada inválida **antes** de ir ao backend (campos obrigatórios, CPF, datas não-futuras, regras condicionais como descrição exigida para certos tipos de identidade, observações exigidas quando motivo = "outro").

**Decisão**: cada sub-feature tem um `*.view-model.ts` **puro** com `validateField`/`validateForm` devolvendo `ValidationError[]` (tags i18n), testável sem Solid. A mesma forma de regra condicional do backend é replicada no client para feedback imediato; o **BFF revalida com `Elysia.t`** (defesa em profundidade) e o backend é a autoridade final.

**Descartado**: Zod/Yup/react-hook-form — violam Princ. IV (zero-npm); built-ins + TypeBox cobrem.

## D7 — Prevenção de submissão dupla

**Contexto**: FR-010/SC-007 — uma mutação nunca pode executar em duplicidade por clique repetido/reenvio.

**Decisão**: usar `action` + `useSubmission` do `@solidjs/router`: enquanto `submission.pending`, a ação fica desabilitada; o binding ignora reentradas. Sem biblioteca de formulário.

**Descartado**: flag manual ad-hoc — `useSubmission` já é o mecanismo nativo e SSR-aware.

## D8 — Sem dado fabricado: BFF recompõe e devolve view-state (não revalidar no client)

**Contexto**: Princ. VI / FR-016 — refletir o estado da fonte de verdade, sem derivar no cliente. **Correção (2026-06-25)**: a 1ª versão previa `204` + `revalidate` no client, o que **contraria o ADR-0010 §3** (e a diretriz facade — ver D12).

**Decisão**: após uma mutação bem-sucedida, o **BFF relê da fonte e devolve o view-state recomposto** (ADR-0010 §3); o client **troca o estado** com o retorno, **sem refetch/revalidate manual**. Cadastro → `PatientOverview` (201) e a tela navega ao overview com o dado já em mãos; transições → cabeçalho recomposto (situação + transições disponíveis); família → `FamilyView`; identidade → fragmento resolvido. Sem dado fabricado: quem releu e recompôs foi o **servidor**, não o cliente.

**Descartado**: (a) `204` + `revalidate` no client — refetch manual, fere ADR-0010 §3; (b) update otimista que sintetiza o estado no cliente — arriscaria divergir da fonte (proibido).

## D12 — BFF como facade view-ready (composição screen-shaped)

**Contexto**: diretriz do Tech Lead (2026-06-25) reforçando o ADR-0010 — o BFF é **área própria de composição/facade**; o client recebe dados **prontos para a tela** e só gerencia estado de UI. Formalizado no **adendo 2026-06-25 ao ADR-0010**.

**Decisão**: nesta feature,
1. A tela de paciente é servida por `GET /api/patients/:id/overview` — o BFF **compõe** cabeçalho + situação + transições disponíveis + núcleo familiar + identidade social numa só resposta, **resolvendo os códigos de domínio em rótulos no servidor** e deixando ganchos para `people-context`/`analysis-bi` (fan-out mesclado no BFF, com **degradação parcial** via `meta.partial`).
2. O cadastro recebe seu **contexto de formulário** composto pelo BFF (`GET /api/patients/new/form-context`): os catálogos que o form precisa, já filtrados. O **cache de domínio da 002** serve **só** para popular selects (input), nunca para resolver exibição.
3. Toda mutação devolve **view-state recomposto** (D8).

**Consequência**: o cliente das sub-features fica "quase só estado" — ViewModel de validação puro + binding que dispara a `fn` e troca o estado com o retorno. A complexidade de composição/erro-parcial concentra-se no BFF (precisa de contract test de composição). Resource-shaped 1:1 (como a 002) só se aceita com serviço único + tela trivial.

**Descartado**: client orquestrando múltiplos serviços/catálogos e resolvendo labels — fere ADR-0004/0009/0010.

## D9 — Riscos de contrato conhecidos no social-care (aceite E2E)

**Contexto**: a memória de validação E2E (Authentik provisionado na VM) registra 3 bugs de contrato que bloquearam `criar paciente → evento`: (1) `X-Actor-Id` exigido indevidamente em GET; (2) serialização do relay de Outbox tratando `uuid` como `json`; (3) decode de evento no consumidor.

**Decisão**: esses são **bugs do backend**, fora do escopo do frontend. Desenvolver e validar esta feature contra o **stub** (`tests/`), que implementa o contrato correto. Registrar como **pré-condição do aceite end-to-end**: o caminho real só fecha quando os 3 bugs forem corrigidos no `social-care`. Não alterar o frontend para "acomodar" o bug (ex.: enviar `X-Actor-Id`) — isso violaria D5/ADR-023.

**Ação**: anotar a dependência na spec (§Dependencies) e neste research; acompanhar a correção no repo `social-care`.

## D10 — Naming das rotas de mutação

**Decisão**: ADR-0010 — escrita usa `*.service.fn.ts` (uma rota = um caso de uso): `patient-create`, `patient-admit`, `patient-discharge`, `patient-readmit`, `patient-withdraw`, `family-member-add`, `family-member-remove`, `primary-caregiver-set`, `social-identity-update`. Server-fns (`"use server"`) agrupadas por afinidade (`patient-lifecycle.fn.ts`, `family.fn.ts`).

## D11 — Formulário grande de cadastro

**Contexto**: `POST /patients` tem o maior payload (pessoa, diagnóstico, dados pessoais, documentos civis, endereço, identidade social, parentesco) e ~31 erros.

**Decisão**: decompor o formulário em **seções** (`form-section` components) — Identidade/Pessoa, Diagnóstico inicial, Dados pessoais, Documentos civis, Endereço, Identidade social, Responsável — cada uma com validação local. Selects (parentesco, tipo de identidade, localização) vêm do **cache de domínio da 002** (`modules/domains/public-api`). Campos opcionais claramente marcados; obrigatórios validados antes do submit (D6).

**Descartado**: wizard multi-passo com estado persistido — adia valor e adiciona complexidade; uma página seccionada com validação inline atende ao "simples + rápido" pedido.

## Referências

- Superfície real do `social-care`: `social-care/Sources/social-care-s/IO/HTTP/Controllers/PatientController.swift` + command handlers em `Application/Registry/*` + eventos `PatientEvents.swift`.
- ADRs do web_02: `handbook/adr/0001` (modular), `0002` (errors-as-values), `0004`/`0009` (MVVM client), `0005` (auth/CSRF), `0010` (bff naming), `0011` (no-mocks).
- Feature 002: `specs/002-patient-browse/` (cliente `SocialCareClient`, cache de domínio, padrão de contract test contra stub).
