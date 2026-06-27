# Feature Specification: Atendimento Socioassistencial — Web

**Feature Branch**: `001-social-care-web`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Interface web (front + BFF Elysia, projeto `web_02/`) para o atendimento socioassistencial de pacientes de doenças raras, consumindo a API do `svc-social-care` via BFF Elysia — o browser nunca vê token; o BFF injeta `Authorization: Bearer` (OIDC/Authentik) e é consumido via Eden treaty."

> **Variante `-fe` (frontend / web-app).** Espelha o [spec.md](./spec.md) (contrato core-api) mas troca a
> semântica de backend pela do **front + BFF unificado** (SolidStart + Elysia + Bun). A spec descreve o **quê**
> (jornadas, requisitos, critérios) — o **como** (handlers Elysia `*.query.fn`/`*.service.fn`, módulos, MVVM
> com ViewModel puro + binding Solid) fica no [plan.fe.md](./plan.fe.md).
> Governa `src/`; conformidade verificada no "Constitution Check" do `plan.fe.md` (princípios I–VI da
> [constituição web_02](../../../.specify/memory/constitution.md)).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e prontuário do paciente (Registry) (Priority: P1)

A assistente social acessa a lista de pacientes (busca textual + filtro por status `waitlisted`/`active`/`discharged`), cadastra um novo paciente (dados pessoais, CPF/NIS/RG/CNS, endereço, diagnósticos CID, identidade social) e navega pelo prontuário completo em seções, incluindo a composição familiar (adicionar/remover membro, designar pessoa de referência) e a timeline do audit trail.

**Why this priority**: É o MVP — sem cadastro e prontuário navegável, nenhuma outra jornada tem onde acontecer. Entrega valor sozinha: a associação sai do papel.

**Independent Test**: Fluxo completo via `/patients` → `/patients/new` → `/patients/:patientId`: cadastrar, visualizar prontuário com indicadores e gerenciar família, com BFF Elysia testado via fakes in-memory (`bun:test` + happy-dom).

**Acceptance Scenarios**:

1. **Given** a lista de pacientes carregada, **When** a usuária busca por nome e filtra por status "Lista de espera", **Then** a lista exibe somente os resultados correspondentes com paginação "carregar mais" (cursor de `meta.nextCursor`).
2. **Given** o formulário de cadastro, **When** a usuária digita um CPF com dígito verificador inválido, **Then** o campo exibe erro de validação em PT-BR antes de qualquer request ao BFF.
3. **Given** o formulário válido (CPF mascarado `123.456.789-00`, data `dd/MM/yyyy`), **When** submetido, **Then** o BFF Elysia recebe valores crus (dígitos, ISO 8601) via Eden, chama `POST /api/v1/patients` e a usuária é redirecionada ao prontuário recém-criado com badge de status "Lista de espera".
4. **Given** o prontuário aberto, **When** a usuária adiciona um membro familiar escolhendo parentesco do select populado por `GET /dominios/dominio_parentesco`, **Then** o membro aparece na seção "Composição familiar" sem reload completo da página (reatividade Solid via `createAsync`/invalidação).
5. **Given** uma família já com pessoa de referência, **When** a usuária designa outra, **Then** a UI mostra a substituição (nunca duas pessoas de referência) refletindo a invariante do backend.
6. **Given** um prontuário anonimizado por LGPD, **When** aberto, **Then** a UI exibe o aviso "Dados pessoais removidos por solicitação LGPD", oculta PII e desabilita todas as ações de edição.
7. **Given** a aba "Histórico" do prontuário, **When** a usuária filtra por tipo de evento (ex.: `HousingConditionUpdated`), **Then** a timeline exibe entradas com ator, data/hora PT-BR e diff `before/after`.

---

### User Story 2 - Avaliação socioeconômica (Assessment) (Priority: P2)

A assistente social preenche a avaliação socioeconômica do núcleo familiar em seções salváveis de forma independente — condição habitacional, situação socioeconômica (renda e benefícios), trabalho e renda por membro, escolaridade, saúde/deficiências, rede de apoio comunitário e resumo de saúde social — e acompanha os indicadores calculados (densidade habitacional, renda per capita, perfil etário, vulnerabilidades educacionais) como badges/cards no prontuário.

**Why this priority**: É o instrumento central do trabalho técnico e a origem dos indicadores de vulnerabilidade; depende do prontuário (P1) existir.

**Independent Test**: Com paciente existente (fixture/fake in-memory), preencher e salvar cada seção isoladamente verificando feedback de sucesso, atualização dos badges de `computedAnalytics` e tratamento dos erros `400` por seção.

**Acceptance Scenarios**:

1. **Given** a seção "Condição habitacional" preenchida, **When** salva, **Then** a UI confirma o sucesso (`204` no BFF) e os badges de indicadores atualizam — ex.: densidade > 3.0 exibe "Risco de sobrelotação".
2. **Given** o select de benefícios populado por `GET /dominios/dominio_tipo_beneficio`, **When** a usuária seleciona um benefício com metadata `exigeCpfFalecido = true`, **Then** o campo "CPF do falecido" aparece e torna-se obrigatório antes do envio.
3. **Given** renda total negativa digitada, **When** a usuária tenta salvar, **Then** a validação de borda do BFF (TypeBox `Elysia.t`) bloqueia o envio (espelho de `SOCIO-001`) com mensagem PT-BR no campo.
4. **Given** outra usuária salvou a mesma seção segundos antes (`409` de optimistic locking), **When** o salvamento falha, **Then** a UI exibe "Outro usuário editou este registro" e oferece recarregar o prontuário sem perder o rascunho local da seção.
5. **Given** gestação informada para membro com idade incompatível, **When** o backend responde `400 HEALTH-001`, **Then** a UI traduz o código em mensagem i18n apontando o campo do membro afetado.

---

### User Story 3 - Cuidado e ciclo de vida (Care) (Priority: P3)

A equipe registra as informações de ingresso/triagem (tipo de ingresso, origem, motivo do atendimento, programas sociais vinculados) e os atendimentos realizados (profissional, resumo, plano de ação, tipo, data), visualizando-os como linha do tempo do caso. O administrador executa as ações de ciclo de vida — admitir, desligar, readmitir, retirar da fila — com diálogo de confirmação e motivo.

**Why this priority**: Documenta o plano de cuidado e a gestão da fila; valiosa, mas só faz sentido com prontuário e avaliação operantes.

**Independent Test**: Com paciente `waitlisted` (fixture fake), registrar intake, admitir, registrar atendimento e desligar, verificando mudanças de badge de status e bloqueios da UI por transição inválida.

**Acceptance Scenarios**:

1. **Given** um prontuário sem ingresso registrado, **When** a usuária preenche o intake com tipo de ingresso de `dominio_tipo_ingresso` e motivo do atendimento, **Then** a seção "Ingresso" passa a exibir os dados salvos.
2. **Given** o formulário de atendimento, **When** a usuária escolhe data futura, **Then** a UI bloqueia o envio (espelho da regra `date ≤ now`).
3. **Given** paciente "Lista de espera" e usuária com role `admin` ou `worker`, **When** clica "Admitir" e confirma, **Then** o badge de status muda para "Ativo" e a timeline registra a admissão.
4. **Given** o diálogo de desligamento com motivo "Outro", **When** o campo de observações está vazio, **Then** o botão de confirmação permanece desabilitado (notes obrigatório, máx. 1000 caracteres com contador).
5. **Given** paciente "Lista de espera", **When** a UI renderiza as ações, **Then** "Desligar" não é oferecido (apenas "Admitir" e "Retirar da fila") — a UI nunca convida a uma transição que renderia `409 DISC-007`.

---

### User Story 4 - Medidas de proteção (Protection) (Priority: P3)

A assistente social registra encaminhamentos para a rede (CRAS, CREAS, saúde, educação, jurídico), relatórios de violação de direitos contra membros da família e o histórico de acolhimento/afastamento do convívio familiar, com os formulários espelhando as validações cruzadas do domínio.

**Why this priority**: Fluxo de alta sensibilidade (compliance e proteção de crianças/adolescentes), porém de menor frequência que cadastro e avaliação.

**Independent Test**: Com paciente e membros (fixture fake), criar um encaminhamento, registrar uma violação e editar o placement history, verificando estados, erros traduzidos e imutabilidade do relatório na UI.

**Acceptance Scenarios**:

1. **Given** o formulário de encaminhamento, **When** a usuária seleciona destino (CRAS/CREAS/…) e preenche a justificativa, **Then** o encaminhamento aparece na seção com status "Pendente".
2. **Given** o formulário de violação sem "Descrição do fato", **When** a usuária tenta enviar, **Then** a validação de borda do BFF (TypeBox) bloqueia (espelho de `VIO-002`) com mensagem no campo.
3. **Given** um relatório de violação já registrado, **When** exibido no prontuário, **Then** a UI o apresenta como somente-leitura (imutável após criação).
4. **Given** o checklist de separação com "Adolescente em internação" marcado numa família sem membro de 12–18 anos, **When** o backend responde `400 PLACE-002`, **Then** a UI traduz o erro indicando a inconsistência com a composição familiar.

---

### Edge Cases

- Lista de pacientes vazia (0 resultados de busca/filtro): estado vazio com orientação ("Nenhum paciente encontrado") e ação de limpar filtros.
- Erro do BFF → código estruturado (`PAT-001`, `DISC-007`, `VIO-002`, `LOOKUP-001`…) → `AppError.kind` → tag i18n; código desconhecido cai em mensagem genérica segura sem vazar payload. A UI nunca olha status HTTP.
- Falha de rede / `social-care` indisponível (`EXTERNALAPI_FAILURE`): banner de indisponibilidade com retry; nunca tela branca; erro aparece via `<ErrorBoundary>` do Solid.
- Estados de carregamento por seção (skeleton no prontuário, spinner em saves via `command.running`); reentrância: todo submit desabilita o botão até a resposta (sem duplo `POST` — não há idempotency key no contrato).
- `409` em ação de ciclo de vida (estado mudou em outra sessão): recarregar status e reapresentar somente as ações válidas.
- Sessão expirada no meio de um formulário longo: redirecionar ao login preservando rascunho local da seção em edição (via `Bun.redis` server-side ou `sessionStorage` client-only, nunca em `localStorage`).
- Usuária `owner`: nenhum botão de escrita renderizado; deep-link para rota de edição responde com tela de acesso negado (espelho do `403`).
- Lookup table sem itens ativos: select desabilitado com aviso e link para "Solicitar novo item" (fluxo `POST /dominios/requests` quando a role permite).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir a lista de pacientes com busca, filtro por status e paginação por cursor, consumindo `GET /patients` via handler Elysia `listPatients` acessado pelo client via Eden.
- **FR-002**: Usuários DEVEM conseguir cadastrar paciente em formulário com máscaras PT-BR (CPF, NIS, CEP, telefone, datas) que envia valores crus (dígitos / ISO 8601) ao BFF Elysia.
- **FR-003**: O sistema DEVE validar todo input na borda do handler Elysia com **TypeBox** (`Elysia.t`) — espelhando regras do domínio: CPF com dígito verificador, renda ≥ 0, `date ≤ now`, notes ≤ 1000 — antes de chamar o `social-care`.
- **FR-004**: O sistema DEVE renderizar o prontuário em seções (dados pessoais, documentos, endereço, família, diagnósticos, avaliação, ingresso, atendimentos, encaminhamentos, violações, acolhimento, histórico) a partir de um único `GET /patients/:patientId` orquestrado no BFF Elysia (`getPatient.query.fn.ts`).
- **FR-005**: O sistema DEVE exibir `computedAnalytics` como badges/cards (densidade, RPC, perfil etário, vulnerabilidades educacionais) sem nenhum cálculo no client.
- **FR-006**: O sistema DEVE popular selects de domínio via lookup tables (`GET /dominios/:tableName`) com cache via `query` do Solid (+ BFF) e reagir às metadata flags exibindo campos condicionais obrigatórios.
- **FR-007**: O sistema DEVE permitir salvar cada uma das 7 seções da avaliação de forma independente, com feedback de sucesso/erro por seção.
- **FR-008**: O sistema DEVE oferecer as ações de ciclo de vida condicionadas ao status atual e à role, com diálogos de confirmação e captura de motivo/observações.
- **FR-009**: O sistema DEVE mapear todo erro estruturado do backend para mensagem i18n PT-BR via `AppError.kind`/`AppError.code`, sem nunca expor status HTTP à usuária.
- **FR-010**: O sistema DEVE tratar `409` (locking/transição) com aviso de edição concorrente e recarga assistida, preservando rascunho local.
- **FR-011**: O sistema DEVE exibir a timeline do audit trail com filtro por `eventType`, ator e diff `before/after` em formato legível.
- **FR-012**: O sistema DEVE espelhar o RBAC na UI: `worker` opera cadastro/avaliação/proteção/cuidado; `admin` também governa `dominios` e aprova solicitações; `owner` é somente-leitura.
- **FR-013**: O sistema DEVE apresentar o estado LGPD-anonimizado: aviso visual, PII oculta, edições bloqueadas, histórico clínico/social preservado.

### Key Entities *(inclua se a feature envolve dados)*

- **Paciente (prontuário)**: visão agregada do `PatientResponse` — status, dados pessoais, documentos, endereço, família, diagnósticos, seções de avaliação, indicadores calculados, históricos.
- **Membro familiar**: parentesco (lookup), reside com titular, cuidador, deficiência, documentos pendentes, idade derivada de `birthDate`.
- **Seção de avaliação**: unidade de edição/salvamento independente (habitação, renda, trabalho, educação, saúde, rede de apoio, resumo de saúde social).
- **Encaminhamento**: destino na rede, justificativa, status (Pendente/Concluído/Cancelado).
- **Relatório de violação**: vítima, tipo, descrição do fato — somente-leitura após criação.
- **Atendimento / Ingresso**: itens da linha do tempo de cuidado.
- **Item de domínio (lookup)**: opção de select com `codigo`/`descricao` e metadata flags que condicionam campos do formulário.
- **Entrada de audit trail**: evento, ator, instante, diff `before/after`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Assistente social completa o cadastro de um paciente (dados pessoais + documentos + endereço) em menos de 5 minutos na primeira utilização.
- **SC-002**: Prontuário completo interativo em p95 < 2 s em conexão 4G; lista de 20 pacientes renderiza em < 1 s.
- **SC-003**: Zero ocorrências de token OIDC, URL de backend ou secret observáveis no browser (bundle, network, storage) — verificado em E2E.
- **SC-004**: 100% dos códigos de erro do `social-care` usados nas jornadas possuem mensagem i18n PT-BR (nenhum código cru exibido à usuária).
- **SC-005**: 90% das usuárias salvam uma seção de avaliação na primeira tentativa sem erro de validação evitável (máscaras e campos condicionais corretos).
- **SC-006**: Nenhum duplo-submit registrado em produção (mutações duplicadas em < 2 s para o mesmo formulário = 0).

## Impacto Arquitetural (web-app / BFF) *(obrigatório se a feature toca `src/`)*

- **Módulo(s) vertical(is) afetado(s)**: [x] novo `src/modules/social-care/` (prontuário, avaliação, cuidado, proteção, lookups) · [ ] estende `auth` (apenas consome sessão existente) · [x] `shared/ui` (design system — novos organismos de formulário seccional e timeline)
  - Cross-módulo só via `public-api` (Princ. III — [ADR-0001](../../adr/0001-vertical-modular-architecture.md)). A feature vive num único módulo vertical; acesso à sessão via public-api de `auth`.
- **Handlers Elysia novos/alterados (a fronteira, Princ. I — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))?**:
  - `patients.query.fn.ts` — `listPatients`, `getPatient`, `getPatientByPerson`, `getAuditTrail`.
  - `patient-commands.service.fn.ts` — `registerPatient`, family, caregiver, socialIdentity, lifecycle.
  - `assessment.service.fn.ts` — 7 mutations PUT (uma por seção ou discriminated union — decidir no `plan.fe.md`).
  - `care.service.fn.ts` — `registerAppointment`, `registerIntakeInfo`.
  - `protection.service.fn.ts` — `createReferral`, `reportRightsViolation`, `updatePlacementHistory`.
  - `lookups.query.fn.ts` — `listLookupItems` (cacheada via `query` Solid), `createLookupRequest`.
  - Todas leem a sessão (cookie HttpOnly no BFF Elysia), injetam `Authorization: Bearer`, validam input/output com **TypeBox** (`Elysia.t`) e preservam o `AppError` do backend; client consome via **Eden treaty**.
- **Integração core-api**: endpoints de `/api/v1` dos controllers `Patient`, `Assessment`, `Protection`, `Care` e `Lookup` do `svc-social-care` — prontidão endpoint a endpoint verificada em [api-readiness.fe.md](./api-readiness.fe.md).
- **Novos agregados / Value Objects (server/domain, Princ. III)?**: branded types + smart constructors `Result<T,E>` para `Cpf`, `Nis`, `Cep`, `Cns`, `PatientId`, `PersonId`, `LookupId`, `Money` (centavos) e `IsoDate` — espelhos client-side dos VOs do Kernel, sem lógica de negócio nova.
- **Eventos no client**: `PatientRegistered`, `AssessmentSectionSaved`, `PatientLifecycleChanged`, `FamilyCompositionChanged` — em EN-passado, vivem em `client/data/events/`, usados para invalidação de `query` do Solid (prontuário ↔ lista).
- **Design System**: [x] novos átomos/moléculas/organismos — inputs mascarados (CPF/NIS/CEP/data/moeda), badge de status do paciente, cards de indicador (`computedAnalytics`), formulário seccional salvável, timeline de audit com diff, diálogo de confirmação com motivo — catalogar em [design-atoms.fe.md](./design-atoms.fe.md), [design-molecules.fe.md](./design-molecules.fe.md), [design-organisms.fe.md](./design-organisms.fe.md), [design-pages.fe.md](./design-pages.fe.md); tokens em [design-tokens.fe.md](./design-tokens.fe.md); governança em [design-governance.fe.md](./design-governance.fe.md).
- **Possíveis violações da constituição (I–VI)?**: nenhuma prevista. Pontos de vigilância para o "Complexity Tracking" do `plan.fe.md`: (a) tentação de calcular indicadores no client (proibido — backend é fonte); (b) duplicar validação metadata-driven fora da borda TypeBox; (c) qualquer fetch direto do client ao `social-care` sem passar pelo BFF Elysia (token no browser — violação do Princ. I).

## Assumptions

- Autenticação web (login Authentik, sessão por cookie HttpOnly no BFF Elysia) já entregue por feature anterior; esta feature apenas consome a sessão e suas roles.
- O contrato do `social-care` descrito em [spec.md](./spec.md) está implantado e estável; divergências são tratadas como bloqueio em [api-readiness.fe.md](./api-readiness.fe.md), não contornadas no front.
- Perfis de uso: equipe pequena (< 20 usuárias simultâneas), desktop-first com responsividade básica para tablet.
- Vocabulário PT-BR do domínio segue a tabela canônica do serviço (paciente, prontuário, titular, pessoa de referência, acolhimento, afastamento, encaminhamento, evasão escolar, insegurança alimentar).
- Rascunho local de seção (preservação em `409`/sessão expirada) é estado de client volátil — não sincronizado entre dispositivos.

## Out of Scope

- Dashboards/indicadores agregados (virão do `analysis-bi` em feature própria — ver [../analysis-bi/spec.md](../analysis-bi/spec.md)).
- Busca e cadastro de pessoas (`people-context`) — o fluxo assume `personId` existente; a UI de seleção de pessoa é dependência externa (ver [../people-context/spec.md](../people-context/spec.md)).
- Upload de documentos digitalizados, impressão/PDF do prontuário, notificações e agendamento futuro de atendimentos.
- Edição/aprovação de lookup tables além do fluxo mínimo de solicitação (UI administrativa completa pode virar feature própria).
- Modo offline/PWA e suporte mobile nativo.

## Referências

- **Constituição web_02**: [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md)
- **ADRs**: [../../adr/README.md](../../adr/README.md)
  - [ADR-0001](../../adr/0001-vertical-modular-architecture.md) · [ADR-0002](../../adr/0002-errors-as-values.md) · [ADR-0003](../../adr/0003-bun-supply-chain.md)
  - [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) · [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) · [ADR-0008](../../adr/0008-self-host-webfonts.md)
  - [ADR-0009](../../adr/0009-framework-agnostic-client.md) · [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) · [ADR-0011](../../adr/0011-no-mocks-in-production.md)
- **Spec core-api**: [spec.md](./spec.md)
- **Plan**: [plan.fe.md](./plan.fe.md) · [plan.md](./plan.md)
- **Prontidão**: [api-readiness.fe.md](./api-readiness.fe.md)
- **Domínio**: [domain.fe.md](./domain.fe.md)
- **Design**: [design-tokens.fe.md](./design-tokens.fe.md) · [design-atoms.fe.md](./design-atoms.fe.md) · [design-organisms.fe.md](./design-organisms.fe.md)
- **Integração cross-service**: [../README.md](../README.md)
- **Outros serviços**: [../people-context/spec.md](../people-context/spec.md) · [../analysis-bi/spec.md](../analysis-bi/spec.md)
- **Docs offline**:
  - `../../reference/framework/solidstart/` (rotas file-based, `action`, `createAsync`, `query`, `useSubmission`, `<ErrorBoundary>`)
  - `../../reference/framework/elysia/` (TypeBox, Eden treaty, `group`/plugin, middleware)
  - `../../reference/ui/vanilla-extract/` (CSS-in-TS zero-runtime)
  - `../../reference/runtime/bun/` (Bun: `bun:test`, happy-dom, fakes in-memory)
