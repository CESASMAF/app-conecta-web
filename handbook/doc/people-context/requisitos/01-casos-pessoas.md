# Casos de Teste — Pessoas (registro de identidade)

> Convenção Gherkin deste documento, conforme a referência canônica:
>
> "`Given` steps are used to describe the initial context of the system - the *scene* of the scenario.
> It is typically something that happened in the *past*.
> When Cucumber executes a `Given` step, it will configure the system to be in a well-defined state,
> such as creating and configuring objects or adding data to a test database."
> — *(Linha 319, p. ?, Cucumber (SmartBear), *Gherkin Reference*)*
>
> Todo `Dado` descreve estado pré-existente (token emitido, pessoa já cadastrada, Authentik disponível ou não); todo `Quando` é a chamada HTTP; todo `Então` é asserção sobre status + corpo + eventos no outbox.

## Funcionalidade: Cadastrar pessoa — `POST /api/v1/people` (roles: `worker`, `admin`)

```gherkin
Funcionalidade: Cadastro de pessoa
  Contexto:
    Dado um token JWT válido com role "worker"
    E o header X-Actor-Id presente

  Cenário: PES-001 Cadastro mínimo
    Quando envio POST /api/v1/people com fullName "Ana Costa Silva"
      e birthDate "1990-05-15"
    Então recebo 201 com data.id (UUID) e meta.timestamp
    E o outbox contém um evento "people.person.registered"
      com data { personId, fullName, birthDate } e SEM o campo cpf

  Cenário: PES-002 Cadastro com CPF
    Quando envio POST /api/v1/people com fullName, birthDate e cpf "52998224725"
    Então recebo 201
    E GET /api/v1/people/by-cpf/52998224725 devolve 200 com a mesma pessoa

  Cenário: PES-003 Dedup por CPF (idempotência)
    Dado uma pessoa P já cadastrada com cpf "52998224725"
    Quando envio POST /api/v1/people com o mesmo cpf e outro fullName
    Então recebo 201 com data.id = id de P (pessoa existente, sem duplicar)
    E NENHUM novo evento "people.person.registered" entra no outbox

  Esquema do Cenário: PES-004 Validações de campo (PEO-001, 400)
    Quando envio POST /api/v1/people com <payload>
    Então recebo 400 e error.code "PEO-001"
    Exemplos:
      | payload                                          |
      | fullName vazio                                   |
      | fullName com 201 caracteres                      |
      | fullName só com espaços                          |
      | birthDate "1990/05/15"                           |
      | birthDate "15-05-1990"                           |
      | birthDate no futuro                              |
      | birthDate "2026-02-30"                           |
      | cpf "11111111111" (dígitos repetidos)            |
      | cpf "12345678900" (checksum inválido)            |
      | cpf "123" (curto)                                |
      | email "sem-arroba"                               |
      | createLogin=true sem email                       |
      | createLogin=true com initialPassword de 7 chars  |

  Cenário: PES-005 Cadastro com provisionamento de login (Authentik OK)
    Dado o Authentik de DEV disponível
    Quando envio POST /api/v1/people com fullName, birthDate,
      email "ana.costa@example.com", createLogin true e initialPassword válida
    Então recebo 201
    E o GET da pessoa devolve idpUserId e idpUserPk preenchidos
    E o outbox contém "people.person.registered" E "people.user.provisioned"

  Cenário: PES-006 Provisionamento falha → sucesso parcial (207)
    Dado o Authentik indisponível
    Quando envio POST /api/v1/people com createLogin true e dados válidos
    Então recebo 207 Multi-Status com data.id preenchido
      e warnings contendo { code: "IDP-001" }
    E a pessoa existe no banco (GET devolve 200, idpUserId null)
    E a resposta NÃO contém detalhes internos do erro do Authentik (AppSec HIGH-7)

  Cenário: PES-007 Colisão de username no IdP
    Dado um usuário no Authentik cujo username colide com o derivado do email
    Quando envio POST /api/v1/people com createLogin true e esse email
    Então recebo 207 com warning IDP-001 (pessoa criada, login não)
```

## Funcionalidade: Consulta e listagem

```gherkin
Funcionalidade: Consulta de pessoas
  Contexto:
    Dado um token JWT válido com role "worker"

  Cenário: CON-001 Listagem paginada default
    Dado 25 pessoas cadastradas
    Quando envio GET /api/v1/people
    Então recebo 200 com no máximo 20 itens
    E meta.pageSize=20, meta.totalCount=25, meta.hasMore=true, meta.nextCursor presente

  Cenário: CON-002 Paginação por cursor
    Quando envio GET /api/v1/people?cursor={meta.nextCursor anterior}
    Então recebo os 5 itens restantes e meta.hasMore=false

  Cenário: CON-003 Busca textual
    Quando envio GET /api/v1/people?search=Ana
    Então todos os itens têm fullName contendo "Ana" (case-insensitive)
    E search com prefixo de CPF (ex: "529") também encontra por CPF

  Esquema do Cenário: CON-004 Validação de path params
    Quando envio GET <path>
    Então recebo <status> e error.code "<codigo>"
    Exemplos:
      | path                                   | status | codigo  |
      | /api/v1/people/nao-e-uuid              | 400    | PEO-003 |
      | /api/v1/people/{uuid inexistente}      | 404    | PEO-002 |
      | /api/v1/people/by-cpf/123              | 400    | PEO-004 |
      | /api/v1/people/by-cpf/{cpf sem cadastro} | 404  | PEO-002 |

  Cenário: CON-005 Shape completo da pessoa
    Quando envio GET /api/v1/people/{personId}
    Então data contém id, fullName, cpf|null, birthDate, email|null,
      idpUserId|null, idpUserPk|null, active, createdAt, updatedAt
```

## Funcionalidade: Atualizar pessoa — `PUT /api/v1/people/:personId` (roles: `worker`, `admin`)

```gherkin
Funcionalidade: Atualização de dados
  Contexto:
    Dado um token "worker" com X-Actor-Id e uma pessoa P cadastrada

  Cenário: ATU-001 Atualização válida
    Quando envio PUT /api/v1/people/{P} com fullName e birthDate válidos
    Então recebo 204 No Content (sem body)
    E o GET reflete os novos dados e updatedAt avança
    E o outbox contém "people.person.updated"

  Cenário: ATU-002 CPF inválido na atualização
    Quando envio PUT com cpf "12345678900"
    Então recebo 400 e error.code "PEO-001"

  Cenário: ATU-003 Pessoa inexistente
    Quando envio PUT /api/v1/people/{uuid aleatório} com payload válido
    Então recebo 404 e error.code "PEO-002"
```

## Funcionalidade: Desativar/Reativar — `PUT .../deactivate` e `.../reactivate` (role: `admin`)

Ordem crítica (AppSec HIGH-5): o serviço chama o **IdP primeiro** e só então altera o banco. Falha no IdP deve deixar o estado do banco intacto.

```gherkin
Funcionalidade: Ciclo de vida da pessoa
  Contexto:
    Dado um token JWT com role "admin" e X-Actor-Id
    E uma pessoa P ativa com login no IdP (idpUserPk preenchido)

  Cenário: VID-001 Desativação
    Dado o Authentik disponível
    Quando envio PUT /api/v1/people/{P}/deactivate
    Então recebo 204
    E o GET devolve active=false
    E o usuário correspondente no Authentik está desativado
    E o outbox contém "people.user.deactivated"

  Cenário: VID-002 Desativação dupla é conflito
    Dado a pessoa P já inativa
    Quando envio PUT /api/v1/people/{P}/deactivate
    Então recebo 409 e error.code "PEO-005"

  Cenário: VID-003 IdP fora → nada muda no banco
    Dado o Authentik indisponível
    Quando envio PUT /api/v1/people/{P}/deactivate
    Então recebo 502 e error.code "IDP-002"
    E o GET ainda devolve active=true (DB intacto — ordem IdP primeiro)

  Cenário: VID-004 Reativação
    Dado a pessoa P inativa
    Quando envio PUT /api/v1/people/{P}/reactivate
    Então recebo 204, active=true e o outbox contém "people.user.reactivated"

  Cenário: VID-005 Reativação de pessoa ativa
    Quando envio PUT /api/v1/people/{P}/reactivate com P já ativa
    Então recebo 409 e error.code "PEO-006"

  Cenário: VID-006 Worker não desativa
    Dado um token com role "worker"
    Quando envio PUT /api/v1/people/{P}/deactivate
    Então recebo 403
```

## Funcionalidade: Reset de senha — `POST .../request-password-reset` (role: `admin`)

Invariante CRÍTICO (AppSec CRITICAL-2 / ADR-030): o recovery link **nunca** aparece na resposta HTTP — viaja apenas no evento NATS, consumido pelo queue-manager que envia o e-mail.

```gherkin
Funcionalidade: Solicitação de reset de senha
  Contexto:
    Dado um token JWT com role "admin" e X-Actor-Id

  Cenário: SEN-001 Reset para pessoa com login
    Dado uma pessoa P com idpUserPk preenchido e Authentik disponível
    Quando envio POST /api/v1/people/{P}/request-password-reset
    Então recebo 202 Accepted com corpo contendo APENAS meta.timestamp (sem data)
    E a resposta NÃO contém nenhuma URL de recovery
    E o outbox contém "people.user.password_reset_requested"
      cujo payload contém recoveryLink

  Cenário: SEN-002 Pessoa sem login no IdP
    Dado uma pessoa P com idpUserPk null
    Quando envio POST /api/v1/people/{P}/request-password-reset
    Então recebo 422 e error.code "PEO-007"

  Cenário: SEN-003 Authentik fora
    Dado o Authentik indisponível
    Quando envio POST /api/v1/people/{P}/request-password-reset
    Então recebo 502 e error.code "IDP-004"

  Cenário: SEN-004 Worker não solicita reset
    Dado um token com role "worker"
    Quando envio POST /api/v1/people/{P}/request-password-reset
    Então recebo 403
```
