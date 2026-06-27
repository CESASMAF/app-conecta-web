# BDD: Interface Web People-Context (front+BFF)

**Feature**: `specs/002-people-context-web/` · **Consultores**: `/acdg-skills:requirements-engineer` + `/acdg-skills:tdd-strategist`

> Fase 6 da pipeline `core-api-sdd`. Cenários Given-When-Then derivados dos critérios de
> aceitação (descoberta/spec). Cada cenário vira teste na fase 7 (TDD/RED). Idioma: PT
> (negócio); identificadores no código permanecem EN. Grave os `.feature` em `specs/002-people-context-web/bdd/`.

## Cobertura

| História (US) | Cenário(s) | Prioridade |
|---|---|---|
| US-001 Cadastrar pessoa (com e sem login) | CT-001, CT-002, CT-003, CT-004 | P1 |
| US-002 Listar e buscar pessoas (paginação por cursor) | CT-005, CT-006 | P1 |
| US-003 Vínculos de sistema (roles) | CT-007, CT-008, CT-009, CT-010 | P1 |
| US-004 Provisão retroativa de login e reset de senha | CT-011, CT-012 | P1 |
| US-005 Desativação e reativação de pessoa | CT-013 | P2 |
| US-006 Apagamento total LGPD (erasure) | CT-014, CT-015 | P1 |
| US-007 RBAC na interface | CT-016 | P1 |

---

```gherkin
# language: pt
Funcionalidade: Cadastro de pessoa (registro de identidade)
  Como administradora da associação (papel admin)
  Quero registrar uma nova pessoa, com ou sem login no Authentik
  Para que ela exista como identidade única no ecossistema ACDG

  Contexto:
    Dado que estou autenticada via Authentik com o papel "admin"
    E o BFF possui sessão válida em cookie HttpOnly, sem token exposto ao browser
    E o BFF injeta Authorization: Bearer e X-Actor-Id no servidor em toda mutação

  # CT-001 — cadastro sem login (P1)
  Cenário: Registrar pessoa sem login entra no registro com identidade própria
    Dado que preencho fullName "Maria das Dores", cpf "39053344705" e birthDate "1985-03-20"
    E não marco a opção "Criar login de acesso"
    Quando submeto o formulário
    Então o BFF envia POST /api/v1/people sem createLogin
    E recebo 201 com o envelope { data: { id }, meta: { timestamp } }
    E sou redirecionada ao detalhe da pessoa com a indicação "Sem login de acesso"
    E o backend publica people.person.registered sem o CPF no payload

  # CT-002 — cadastro com login (P1)
  Cenário: Registrar pessoa com login provisiona usuário no Authentik
    Dado que preencho fullName, birthDate e email "maria@example.org" válidos
    E marco "Criar login de acesso" com initialPassword de 8+ caracteres
    Quando submeto o formulário
    Então o BFF envia POST /api/v1/people com createLogin true
    E recebo 201 e o detalhe da pessoa exibe "Login provisionado"
    E se eu marcar "Criar login de acesso" sem informar email, a validação TypeBox no BFF bloqueia na borda
      com a mensagem i18n "E-mail é obrigatório para criar login" antes de qualquer chamada de rede

  # CT-003 — deduplicação por CPF (P1)
  Cenário: Cadastrar CPF já existente retorna a pessoa existente sem erro
    Dado que já existe uma pessoa com o cpf "39053344705"
    Quando submeto o cadastro com o mesmo CPF
    Então o backend responde 201 com o id da pessoa JÁ existente (idempotência, sem erro)
    E a interface me leva ao registro existente com o aviso "Pessoa já cadastrada com este CPF"
    E nenhum registro duplicado aparece na listagem

  # CT-004 — 207 Multi-Status com retry (P1)
  Cenário: Pessoa criada mas provisão no IdP falhou oferece retry
    Dado que submeto o cadastro com createLogin true
    E o Authentik está indisponível
    Quando o backend responde 207 Multi-Status (pessoa criada, IdP falhou)
    Então a interface confirma "Pessoa cadastrada" e alerta "Login não pôde ser criado"
    E a ação "Provisionar login" fica disponível no detalhe, chamando POST /api/v1/people/:personId/login
    E o cadastro NÃO é reenviado (sem risco de duplicação)

  # CT-002b — validação de CPF na borda (P1)
  Esquema do Cenário: CPF inválido é rejeitado pelo TypeBox antes de chegar à API
    Dado que preencho o campo CPF com "<cpf>"
    Quando tento submeter o formulário
    Então a validação client-side espelhando MOD-11 rejeita o valor por "<motivo>"
    E vejo a mensagem i18n "CPF inválido" associada ao campo cpf
    E nenhuma requisição é enviada a POST /api/v1/people

    Exemplos:
      | cpf         | motivo               |
      | 11111111111 | repdigit             |
      | 12345678900 | dígito verificador   |
      | 123456789   | tamanho ≠ 11 dígitos |

Funcionalidade: Listagem e busca de pessoas
  Como operadora autorizada (worker, owner, admin)
  Quero listar, buscar por nome ou CPF e paginar pessoas
  Para localizar um registro antes de qualquer cadastro ou vínculo

  Contexto:
    Dado que estou autenticada com um papel autorizado em GET /people

  # CT-005 — paginação por cursor (P1)
  Cenário: Carregar próxima página sem duplicar registros
    Dado que a listagem retornou meta.pageSize 20, meta.hasMore true e meta.nextCursor "0a1b..."
    Quando aciono "Carregar mais"
    Então o BFF envia GET /api/v1/people?cursor=0a1b...&limit=20
    E os novos itens são concatenados sem duplicar nenhum id de pessoa
    E o botão desaparece quando meta.hasMore é false

  # CT-006 — busca por CPF antes do cadastro (dedup proativo) (P1)
  Cenário: Buscar por CPF antes de cadastrar evita duplicidade
    Dado que digito o CPF "39053344705" na busca da tela de cadastro
    Quando a busca é disparada
    Então o BFF envia GET /api/v1/people/by-cpf/39053344705
    E se a resposta é 200, a interface oferece "Abrir registro existente" em vez do cadastro
    E se a resposta é 404 com código "PEO-002", o formulário de cadastro é liberado
    E se o CPF tem formato inválido, o backend nem é consultado (TypeBox na borda; no servidor seria 400 "PEO-004")

Funcionalidade: Vínculos de sistema (roles)
  Como administradora (papel admin, escopado por sistema)
  Quero atribuir, desativar e reativar vínculos system:role de uma pessoa
  Para controlar o acesso dela aos sistemas do ecossistema (social-care, queue-manager, therapies, timesheet)

  Contexto:
    Dado uma pessoa existente aberta no detalhe
    E que estou autenticada com papel de administração

  # CT-007 — vínculo duplicado é noop (P1)
  Cenário: Atribuir vínculo já ativo não cria duplicata
    Dado que a pessoa já possui o vínculo ativo "social-care:patient"
    Quando atribuo novamente system "social-care" e role "patient" via POST /api/v1/people/:personId/roles
    Então o backend responde 204 No Content (noop idempotente)
    E a interface informa "Vínculo já estava ativo" sem adicionar linha duplicada na lista

  # CT-008 — admin escopado em outro sistema (P1)
  Cenário: Admin de um sistema não atribui vínculo em outro sistema
    Dado que meu token possui apenas o grupo "social-care:admin"
    Quando tento atribuir system "therapies" e role "therapist"
    Então o backend responde 403 com o código "ROL-007"
    E o mapper AppError exibe "Você não administra o sistema therapies"
    E a interface já evita o erro: o seletor de sistema só oferece os sistemas em que sou admin
      (derivados de adminSystems(roles)), exceto para superadmin

  # CT-009 — auto-assignment proibido (P1)
  Cenário: Administradora não atribui vínculo a si mesma
    Dado que a pessoa aberta no detalhe possui idpUserId igual ao sub do meu token
    E eu não sou superadmin
    Quando tento atribuir qualquer vínculo a essa pessoa
    Então o backend responde 403 com o código "ROL-008"
    E o mapper exibe "Não é permitido atribuir vínculos a si mesmo"
    E a interface desabilita preventivamente a ação "Atribuir vínculo" no meu próprio registro

  # CT-010 — role superadmin é restrita (P1)
  Cenário: Apenas superadmin atribui a role superadmin
    Dado que não possuo o grupo "superadmin"
    Quando tento atribuir a role "superadmin" a uma pessoa
    Então o backend responde 403 com o código "ROL-006"
    E o mapper exibe "Apenas superadmin pode atribuir este papel"
    E a opção "superadmin" nem aparece no seletor de roles para quem não é superadmin

Funcionalidade: Provisão retroativa de login e recuperação de senha
  Como administradora (papel admin)
  Quero provisionar login para pessoa já cadastrada e disparar recuperação de senha
  Para dar acesso ao ecossistema sem nunca manusear links sensíveis

  # CT-011 — login retroativo (P1)
  Cenário: Provisionar login para pessoa sem acesso
    Dado uma pessoa com idpUserId nulo e email cadastrado
    Quando aciono "Provisionar login" no detalhe
    Então o BFF envia POST /api/v1/people/:personId/login
    E recebo 201 com { data: { id, idpUserId } } e o badge muda para "Login provisionado"
    E se a pessoa já tem login, o backend responde 409 "PEO-008" e o mapper exibe "Esta pessoa já possui login"
    E se a pessoa não tem e-mail, o backend responde 422 "PEO-009" e a interface pede o e-mail antes de reenviar

  # CT-012 — reset de senha sem link no HTTP (P1)
  Cenário: Solicitar recuperação de senha nunca exibe o link
    Dado uma pessoa com login provisionado no Authentik
    Quando aciono "Enviar recuperação de senha"
    Então o BFF envia POST /api/v1/people/:personId/request-password-reset
    E o backend responde 202 Accepted SEM nenhum link no body (ADR-030 — o link viaja
      somente no evento NATS people.user.password_reset_requested)
    E a interface exibe apenas "Instruções de recuperação enviadas por e-mail"
    E se a pessoa não tem login, o backend responde 422 "PEO-007" e o mapper sugere provisionar login primeiro

Funcionalidade: Desativação e reativação de pessoa
  Como administradora (papel admin)
  Quero desativar e reativar pessoas preservando o histórico
  Para suspender acessos sem apagar dados (soft-delete)

  # CT-013 — desativação IdP-first (P2)
  Cenário: Desativar pessoa ativa respeita IdP-first
    Dado uma pessoa com active true
    Quando confirmo a ação "Desativar"
    Então o BFF envia PUT /api/v1/people/:personId/deactivate
    E recebo 204 e o badge muda para "Inativa", com a ação "Reativar" disponível
    E se a pessoa já estava inativa, o backend responde 409 "PEO-005" ("Pessoa já está inativa")
    E se o Authentik falha, o backend responde 502 "IDP-002" e a interface explica que NADA foi
      alterado (IdP-first aborta antes do banco) e oferece tentar novamente

Funcionalidade: Apagamento total LGPD (erasure)
  Como superadmin
  Quero apagar definitivamente uma pessoa (LGPD Art. 18 V)
  Para atender ao direito de eliminação do titular, de forma irreversível e auditável

  # CT-014 — erasure com dupla confirmação (P1)
  Cenário: Superadmin apaga pessoa com dupla confirmação
    Dado que estou autenticada com o grupo "superadmin"
    E abro a ação "Apagamento total (LGPD)" no detalhe da pessoa
    Quando o diálogo exige digitar o nome completo da pessoa e marcar "Entendo que é irreversível"
    E confirmo
    Então o BFF envia DELETE /api/v1/people/:personId
    E recebo 204; a pessoa e seus vínculos somem da listagem definitivamente
    E o backend publica people.person.deleted contendo somente o personId (zero PII)
    E se o Authentik falha, o backend responde 502 "IDP-005" e a interface informa que o banco
      não foi tocado (IdP-first, sem rollback) e mantém a pessoa visível

  # CT-015 — erasure negado a não-superadmin (P1)
  Cenário: Admin comum não consegue apagar pessoa
    Dado que estou autenticada apenas com o papel "admin"
    Então a ação "Apagamento total (LGPD)" não é exibida na interface
    E se a chamada DELETE /api/v1/people/:personId for forçada, o backend responde 403 com o código "PEO-010"
    E o mapper exibe "Apenas superadmin pode realizar o apagamento total"

Funcionalidade: RBAC na interface
  Como sistema
  Quero refletir as permissões do AuthGuard do backend
  Para nunca oferecer ações que serão negadas (401 AUTH-001, 403 AUTH-002)

  # CT-016 — RBAC por papel (P1)
  Esquema do Cenário: Ações visíveis seguem a matriz endpoint × roles
    Dado que estou autenticada com o papel "<papel>"
    Quando abro "<tela>"
    Então a ação "<acao>" está "<visibilidade>"

    Exemplos:
      | papel             | tela     | acao                     | visibilidade |
      | owner             | listagem | Cadastrar pessoa         | oculta       |
      | worker            | listagem | Cadastrar pessoa         | visível      |
      | worker            | detalhe  | Desativar pessoa         | oculta       |
      | admin             | detalhe  | Desativar pessoa         | visível      |
      | worker            | detalhe  | Atribuir vínculo         | oculta       |
      | social-care:admin | detalhe  | Atribuir vínculo         | visível      |
      | admin             | detalhe  | Recuperação de senha     | visível      |
      | worker            | detalhe  | Recuperação de senha     | oculta       |
      | admin             | detalhe  | Apagamento total (LGPD)  | oculta       |
      | superadmin        | detalhe  | Apagamento total (LGPD)  | visível      |
```

## Mapeamento BDD → testes (preenchido na fase 7/TDD)

| Cenário | Arquivo de teste | Nível (domínio/app/integração) |
|---|---|---|
| CT-001 | `src/modules/people-context/server/adapters/__tests__/register-person.query.fn.test.ts` + `e2e/register-person.spec.ts` | integração (fake in-memory) + E2E |
| CT-002 | `server/adapters/__tests__/register-person.query.fn.test.ts` + `server/domain/__tests__/create-person.schema.test.ts` | integração + domínio |
| CT-002b | `src/modules/people-context/server/domain/__tests__/cpf.vo.test.ts` | domínio |
| CT-003 | `client/person-registration/__tests__/person-registration.view-model.test.ts` + `e2e/dedup-cpf.spec.ts` | application + E2E |
| CT-004 | `server/adapters/__tests__/register-person.query.fn.test.ts` (207) + `client/person-registration/__tests__/provision-retry.view-model.test.ts` | integração + application |
| CT-005 | `client/person-list/__tests__/person-list.view-model.test.ts` | application |
| CT-006 | `server/adapters/__tests__/find-person-by-cpf.query.fn.test.ts` | integração (fake in-memory) |
| CT-007 | `server/adapters/__tests__/assign-role.service.fn.test.ts` (204 noop) | integração (fake in-memory) |
| CT-008 | `client/role-management/__tests__/role-management.view-model.test.ts` + `app-error-mapper.test.ts` (`ROL-007`) | application |
| CT-009 | `client/role-management/__tests__/role-management.view-model.test.ts` (`ROL-008`) | application |
| CT-010 | `client/role-management/__tests__/role-management.view-model.test.ts` + `app-error-mapper.test.ts` (`ROL-006`) | application |
| CT-011 | `server/adapters/__tests__/provision-login.service.fn.test.ts` (201/409 `PEO-008`/422 `PEO-009`) | integração (fake in-memory) |
| CT-012 | `server/adapters/__tests__/request-password-reset.service.fn.test.ts` (202 sem link) | integração (fake in-memory) |
| CT-013 | `server/adapters/__tests__/deactivate-person.service.fn.test.ts` (204/409 `PEO-005`/502 `IDP-002`) | integração (fake in-memory) |
| CT-014 | `client/access-management/__tests__/erasure-double-confirm.test.ts` + `e2e/erasure.spec.ts` | componente + E2E |
| CT-015 | `client/access-management/__tests__/rbac-visibility.test.ts` + `app-error-mapper.test.ts` (`PEO-010`) | componente + application |
| CT-016 | `client/access-management/__tests__/rbac-visibility.test.ts` | componente |

## Referências

- [Constitution web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (BFF Boundary, Errors as Values, MVVM×DDD, Bun-Native, Type Safety, Honesty)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`, ponte para `ErrorBoundary` Solid
- [ADR-0004 — Client×Server Split](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira Eden treaty → rota Elysia
- [ADR-0005 — Auth/Session](../../adr/0005-auth-session-refresh-decisions.md) — sessão server-side, cookie opaco, `jose`
- [ADR-0010 — BFF Orchestration / fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md) — fakes in-memory em testes, `not-implemented` como valor
- [TDD (test list RED)](./tdd.md)
- [QA Test Plan](./qa-test-plan.md)
- [Checklist](./checklist.md)
- [Review W2](./review.md)
- [Tasks](./tasks.md)
- Referência offline BFF: `../../reference/framework/elysia/`
- Referência offline SolidStart: `../../reference/framework/solidstart/`
