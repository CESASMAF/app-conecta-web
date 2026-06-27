# BDD: Interface Web Social-Care (front+BFF)

**Feature**: `specs/001-social-care-web/` · **Consultores**: `/acdg-skills:requirements-engineer` + `/acdg-skills:tdd-strategist`

> Fase 6 da pipeline `core-api-sdd`. Cenários Given-When-Then derivados dos critérios de
> aceitação (descoberta/spec). Cada cenário vira teste na fase 7 (TDD/RED). Idioma: PT
> (negócio); identificadores no código permanecem EN. Grave os `.feature` em `specs/001-social-care-web/bdd/`.
>
> **Stack**: SolidStart + Elysia (BFF) + Bun + Eden Treaty + TypeBox. Constituição: [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md).

## Cobertura

| História (US) | Cenário(s) | Prioridade |
|---|---|---|
| US-001 Cadastrar paciente (prontuário) | CT-001, CT-002, CT-003 | P1 |
| US-002 Listar e buscar pacientes (paginação) | CT-004, CT-005 | P1 |
| US-003 Transições de status do paciente | CT-006, CT-007, CT-008 | P1 |
| US-004 Avaliação socioeconômica | CT-009, CT-010, CT-011 | P1 |
| US-005 Medidas de proteção (encaminhamento/violação) | CT-012, CT-013, CT-014 | P2 |
| US-006 RBAC e LGPD na interface | CT-015, CT-016 | P1 |

---

```gherkin
# language: pt
Funcionalidade: Cadastro de paciente (prontuário)
  Como assistente social (papel worker)
  Quero registrar um novo paciente com dados pessoais, documentos civis e endereço
  Para abrir o prontuário socioassistencial na lista de espera

  Contexto:
    Dado que estou autenticada via Authentik com o papel "worker"
    E o BFF Elysia possui sessão válida em cookie HttpOnly, sem token exposto ao browser

  # CT-001 — caminho feliz (P1)
  Cenário: Registrar paciente válido entra na lista de espera
    Dado que preencho o formulário de cadastro com personalData, civilDocuments (CPF "39053344705"), address e prRelationshipId válidos
    Quando submeto o formulário
    Então a rota Elysia (handler *.service.fn.ts) envia POST /api/v1/patients com Authorization: Bearer injetado pelo servidor
    E recebo o envelope { data: { id }, meta: { timestamp } } com 201
    E sou redirecionada ao prontuário com status exibido como "Lista de espera" (waitlisted)
    E o backend emite PatientCreatedEvent visível depois no audit trail

  # CT-002 — validação na borda (P1)
  Cenário: CPF inválido é rejeitado pelo TypeBox antes de chegar à API
    Dado que preencho o campo CPF com "11111111111"
    Quando tento submeter o formulário
    Então a validação TypeBox (Elysia.t) na borda do BFF rejeita o valor por dígito verificador
    E vejo a mensagem i18n "CPF inválido" associada ao campo cpf
    E nenhuma requisição é enviada a POST /api/v1/patients

  # CT-003 — regra de negócio do backend (P1)
  Cenário: Membro familiar duplicado retorna FAM-002
    Dado que o prontuário do paciente já possui o membro com memberPersonId "a3f1..."
    Quando adiciono novamente o mesmo memberPersonId via POST /patients/:patientId/family-members
    Então o backend responde 409 com código de erro "FAM-002"
    E o mapper AppError exibe a mensagem i18n "Este membro já faz parte da composição familiar"
    E o formulário permanece preenchido para correção

Funcionalidade: Listagem e busca de pacientes
  Como assistente social ou supervisora (worker, owner, admin)
  Quero listar, filtrar e paginar pacientes
  Para localizar rapidamente um prontuário

  Contexto:
    Dado que estou autenticada com um papel autorizado em GET /patients

  # CT-004 — paginação por cursor (P1)
  Cenário: Carregar próxima página sem duplicar registros
    Dado que a listagem retornou meta.pageSize 20, meta.hasMore true e meta.nextCursor "eyJv..."
    Quando aciono "Carregar mais"
    Então o BFF Elysia envia GET /api/v1/patients?cursor=eyJv...&limit=20
    E os novos itens são concatenados sem duplicar nenhum patientId
    E o botão desaparece quando meta.hasMore é false

  # CT-005 — filtro por status (P1)
  Cenário: Filtrar pacientes ativos
    Dado que seleciono o filtro de status "Ativo"
    Quando a listagem é recarregada
    Então o BFF Elysia envia GET /api/v1/patients?status=active
    E todos os cards exibidos mostram o badge de status "Ativo"

Funcionalidade: Transições de status do paciente
  Como assistente social ou administradora (worker, admin)
  Quero admitir, desligar, readmitir ou retirar pacientes
  Para refletir a máquina de estados waitlisted → active → discharged

  # CT-006 — admissão (P1)
  Cenário: Admitir paciente da lista de espera
    Dado um paciente com status "waitlisted"
    Quando confirmo a ação "Admitir" no prontuário
    Então o BFF Elysia envia POST /api/v1/patients/:patientId/admit
    E o status exibido muda para "Ativo"
    E a entrada PatientAdmittedEvent aparece no audit trail do prontuário

  # CT-007 — invariante de desligamento (P1)
  Cenário: Desligamento de paciente em lista de espera é bloqueado
    Dado um paciente com status "waitlisted"
    Então a ação "Desligar" não é oferecida na interface
    E se a chamada POST /patients/:patientId/discharge for forçada, o backend responde 409 com código "DISC-007"
    E o mapper exibe "Paciente em lista de espera não pode ser desligado — use a retirada (withdraw)"

  # CT-008 — variações tabeladas das transições inválidas (P1)
  Esquema do Cenário: Transição inválida retorna o código estruturado correto
    Dado um paciente com status "<status>"
    Quando a ação "<acao>" é enviada ao backend
    Então a resposta é 409 com o código de erro "<codigo>"
    E a mensagem i18n correspondente ao código é exibida em um toast de erro

    Exemplos:
      | status     | acao     | codigo    |
      | active     | admit    | ADM-002   |
      | discharged | admit    | ADM-003   |
      | discharged | discharge| DISC-001  |
      | active     | withdraw | WDR-003   |
      | waitlisted | readmit  | READM-005 |

Funcionalidade: Avaliação socioeconômica
  Como assistente social (worker)
  Quero atualizar habitação, renda, trabalho, educação e saúde da família
  Para manter a avaliação socioeconômica do prontuário em dia

  Contexto:
    Dado um paciente ativo aberto no prontuário

  # CT-009 — caminho feliz (P1)
  Cenário: Atualizar situação socioeconômica com benefício social
    Dado que informo totalFamilyIncome 2000.00 e o benefício "Bolsa Família" com benefitTypeId válido
    Quando salvo o formulário de situação socioeconômica
    Então o BFF Elysia envia PUT /api/v1/patients/:patientId/socioeconomic-situation
    E recebo 204 No Content e o toast de sucesso
    E o prontuário recarregado exibe computedAnalytics.financial.incomePerCapita calculado pelo backend, sem cálculo no frontend

  # CT-010 — campos metadata-driven (P1)
  Cenário: Benefício com exigeCpfFalecido revela campos obrigatórios
    Dado que o item selecionado em dominio_tipo_beneficio possui exigeCpfFalecido true e exigeRegistroNascimento true
    Quando o benefício é escolhido no formulário
    Então os campos deceasedCpf e birthCertificateNumber tornam-se visíveis e obrigatórios
    E submeter sem preenchê-los é bloqueado pelo TypeBox (Elysia.t) na borda com mensagens i18n por campo

  # CT-011 — erros do backend (P1)
  Esquema do Cenário: Erro de validação do backend é mapeado para o campo certo
    Dado que o formulário "<formulario>" foi submetido com "<entrada_invalida>"
    Quando o backend responde "<http>" com o código "<codigo>"
    Então a mensagem i18n do código "<codigo>" é exibida junto ao campo correspondente

    Exemplos:
      | formulario              | entrada_invalida                  | http | codigo      |
      | socioeconomic-situation | totalFamilyIncome -100            | 400  | SOCIO-001   |
      | socioeconomic-situation | benefitTypeId inexistente         | 400  | SOCIO-002   |
      | housing-condition       | numberOfRooms 0                   | 400  | HOUSING-001 |
      | health-status           | gestação em membro com 10 anos    | 400  | HEALTH-001  |
      | work-and-income         | occupationId inexistente          | 400  | WORK-001    |

  Cenário: Conflito de edição concorrente (optimistic locking)
    Dado que outra usuária salvou o mesmo prontuário e incrementou Patient.version
    Quando salvo minha edição com a versão desatualizada
    Então o backend responde 409 (CONFLICT)
    E a interface oferece "Recarregar dados" preservando meus valores digitados para reconciliação

Funcionalidade: Medidas de proteção
  Como assistente social (worker)
  Quero registrar encaminhamentos, violações de direitos e histórico de acolhimento
  Para documentar as medidas de proteção da família

  # CT-012 — encaminhamento (P2)
  Cenário: Criar encaminhamento para o CREAS
    Dado que informo referredPersonId, destinationService "CREAS" e a justificativa técnica em reason
    Quando submeto o formulário de encaminhamento
    Então o BFF Elysia envia POST /api/v1/patients/:patientId/referrals
    E recebo 201 com { data: { id } } e o encaminhamento aparece na lista com status "PENDING"

  # CT-013 — erros de proteção (P2)
  Esquema do Cenário: Regras de proteção violadas exibem o código correto
    Dado o formulário "<formulario>" com "<violacao>"
    Quando submetido ao backend
    Então a resposta é 400 com o código "<codigo>" e a mensagem i18n correspondente

    Exemplos:
      | formulario        | violacao                                          | codigo    |
      | referrals         | date no futuro                                    | REF-001   |
      | referrals         | reason vazio                                      | REF-002   |
      | violation-reports | descriptionOfFact ausente                         | VIO-002   |
      | violation-reports | violationType fora de dominio_tipo_violacao       | VIO-001   |
      | placement-history | endDate anterior a startDate                      | PLACE-001 |
      | placement-history | adolescentInInternment sem membro de 12 a 18 anos | PLACE-002 |

  # CT-014 — imutabilidade do relatório de violação (P2)
  Cenário: Relatório de violação não é editável após criação
    Dado um relatório de violação já registrado no prontuário
    Quando visualizo o relatório
    Então a interface o exibe em modo somente leitura, sem ação de edição ou exclusão
    E o registro consta no audit trail como RightsViolationReportedEvent

Funcionalidade: RBAC e LGPD na interface
  Como sistema
  Quero refletir as permissões do backend e o estado de anonimização
  Para nunca oferecer ações que serão negadas nem exibir PII removida

  # CT-015 — RBAC por papel (P1)
  Esquema do Cenário: Ações visíveis seguem o RoleGuardMiddleware
    Dado que estou autenticada com o papel "<papel>"
    Quando abro "<tela>"
    Então a ação "<acao>" está "<visibilidade>"

    Exemplos:
      | papel  | tela              | acao                  | visibilidade |
      | owner  | listagem          | Cadastrar paciente    | oculta       |
      | owner  | prontuário        | Editar avaliação      | oculta       |
      | worker | prontuário        | Cadastrar paciente    | visível      |
      | worker | prontuário        | Desligar (active)     | visível      |
      | admin  | domínios          | Aprovar solicitação   | visível      |
      | worker | domínios          | Aprovar solicitação   | oculta       |

  # CT-016 — paciente anonimizado (LGPD, ADR-039) (P1)
  Cenário: Prontuário anonimizado preserva histórico sem PII
    Dado um paciente cujo PatientPIIAnonymizedEvent já ocorreu
    Quando abro o prontuário
    Então vejo o aviso "Dados pessoais removidos por solicitação LGPD"
    E personalData, civilDocuments e address não são exibidos
    E diagnoses, appointments e o audit trail continuam visíveis
    E os formulários de avaliação ficam bloqueados para edição
```

## Mapeamento BDD → testes (preenchido na fase 7/TDD)

| Cenário | Arquivo de teste | Nível (domínio/app/integração) |
|---|---|---|
| CT-001 | `src/modules/social-care/server/adapters/__tests__/register-patient.service.fn.test.ts` + `e2e/register-patient.spec.ts` | integração (fake in-memory) + E2E |
| CT-002 | `src/modules/social-care/server/domain/__tests__/cpf.vo.test.ts` | domínio |
| CT-003 | `src/modules/social-care/client/domain/__tests__/app-error-mapper.test.ts` | domínio/application |
| CT-004 | `src/modules/social-care/client/patient-list/__tests__/patient-list.view-model.test.ts` | application |
| CT-005 | idem CT-004 (casos de filtro) | application |
| CT-006 | `src/modules/social-care/client/patient-record/__tests__/patient-lifecycle.view-model.test.ts` | application |
| CT-007 | idem CT-006 + `app-error-mapper.test.ts` (`DISC-007`) | application |
| CT-008 | `app-error-mapper.test.ts` (parametrizado por código) | application |
| CT-009 | `src/modules/social-care/server/adapters/__tests__/update-socioeconomic.service.fn.test.ts` | integração (fake) |
| CT-010 | `src/modules/social-care/client/assessment/__tests__/social-benefit-form.metadata.test.ts` | application |
| CT-011 | `app-error-mapper.test.ts` + `assessment-forms.view-model.test.ts` | application |
| CT-012 | `src/modules/social-care/server/adapters/__tests__/create-referral.service.fn.test.ts` | integração (fake) |
| CT-013 | `app-error-mapper.test.ts` (parametrizado) | application |
| CT-014 | `src/modules/social-care/client/protection/__tests__/violation-report-readonly.test.ts` | application/componente |
| CT-015 | `src/modules/social-care/client/patient-record/__tests__/rbac-visibility.view-model.test.ts` | application |
| CT-016 | `src/modules/social-care/client/patient-record/__tests__/patient-anonymized.view-model.test.ts` | application |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (BFF-Boundary, Errors as Values, Vertical-Modular, Bun-Native, Type Safety, Honesty)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, Eden `{ data, error }`, ponte p/ `<ErrorBoundary>`
- [ADR-0004 — Client/Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira Eden→Elysia; ViewModel puro
- [ADR-0009 — Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command
- [ADR-0010 — BFF Orchestration / Fn Naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`; rota Elysia por caso de uso
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory nos testes; `not-implemented` como valor
- [Índice de ADRs](../../adr/README.md)
- [tdd.md](./tdd.md) — test list RED (fase 7); mapeamento cenário→teste
- [qa-test-plan.md](./qa-test-plan.md) — plano amplo de QA (quadrantes, pirâmide, riscos)
- [tasks.md](./tasks.md) — waves W0→W3 com gates
- [checklist.md](./checklist.md) — prontidão de feature antes do release
- [review.md](./review.md) — audit W2 (🟡→🟢)
- [spec.fe.md](./spec.fe.md) — histórias US-001…US-006
- [plan.fe.md](./plan.fe.md) — vertical slice e padrão BFF
- [constitution.md](./constitution.md) — constituição local do serviço
- Docs offline: [../../reference/framework/solidstart/](../../reference/framework/solidstart/) · [../../reference/framework/elysia/](../../reference/framework/elysia/) · [../../reference/runtime/bun/](../../reference/runtime/bun/)
