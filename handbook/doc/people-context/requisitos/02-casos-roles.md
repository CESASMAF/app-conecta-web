# Casos de Teste — System Roles

O people-context rastreia que um `personId` tem uma role (`patient`, `professional`, …) num sistema (`social-care`, `queue-manager`, …). A atribuição tem **três regras compostas de autorização** além do guard `admin` — são o coração destes testes.

## Funcionalidade: Atribuir role — `POST /api/v1/people/:personId/roles` (role base: `admin`)

```gherkin
Funcionalidade: Atribuição de role de sistema
  Contexto:
    Dado uma pessoa P cadastrada
    E o header X-Actor-Id presente em toda mutação

  Cenário: ROL-A001 Atribuição válida por admin do sistema
    Dado um token com role "social-care:admin"
    Quando envio POST /api/v1/people/{P}/roles
      com { "system": "social-care", "role": "patient" }
    Então recebo 201 com data.id (UUID da role)
    E o outbox contém "people.role.assigned"
      com data { personId, system, role }

  Cenário: ROL-A002 Regra 1 — só superadmin atribui superadmin
    Dado um token com role "admin" (não superadmin)
    Quando envio POST .../roles com { "system": "x", "role": "superadmin" }
    Então recebo 403 e error.code "ROL-006"

  Cenário: ROL-A003 Regra 1 — superadmin pode
    Dado um token com role "superadmin"
    Quando envio POST .../roles com role "superadmin"
    Então recebo 201

  Cenário: ROL-A004 Regra 2 — admin restrito aos próprios sistemas
    Dado um token com role "social-care:admin" (e nenhuma role em queue-manager)
    Quando envio POST .../roles com { "system": "queue-manager", "role": "professional" }
    Então recebo 403 e error.code "ROL-007"

  Cenário: ROL-A005 Regra 3 — não pode auto-atribuir
    Dado um token cujo sub corresponde ao idpUserId da pessoa P
    Quando envio POST /api/v1/people/{P}/roles com qualquer role
    Então recebo 403 e error.code "ROL-008"

  Cenário: ROL-A006 Idempotência — role já ativa
    Dado a pessoa P já com a role ativa { social-care, patient }
    Quando envio POST .../roles com o mesmo par system/role
    Então recebo 204 No Content
    E NENHUM novo evento "people.role.assigned" entra no outbox

  Cenário: ROL-A007 Reativação implícita de role inativa
    Dado a pessoa P com a role { social-care, patient } INATIVA
    Quando envio POST .../roles com o mesmo par
    Então recebo 201 e a role volta a active=true
    E o outbox registra o evento de atribuição

  Esquema do Cenário: ROL-A008 Validações de payload
    Quando envio POST .../roles com <payload>
    Então recebo 400 e error.code "ROL-001"
    Exemplos:
      | payload               |
      | sem system            |
      | system vazio          |
      | sem role              |
      | role vazia            |

  Cenário: ROL-A009 Sincronização com grupo do Authentik
    Dado a pessoa P com login no IdP (idpUserPk preenchido)
    Quando a role { social-care, patient } é atribuída com sucesso
    Então o usuário é adicionado ao grupo "social-care:patient" no Authentik

  Cenário: ROL-A010 Corrida entre verificação e mutação
    Quando duas requisições concorrentes atribuem/alteram a mesma role
    Então uma delas pode receber 409 "ROL-009" (nunca 500, nunca estado duplicado)
```

## Funcionalidade: Listar roles de uma pessoa — `GET /api/v1/people/:personId/roles`

```gherkin
Funcionalidade: Consulta de roles por pessoa
  Contexto:
    Dado um token com role "worker"
    E a pessoa P com roles: { social-care, patient, ativa } e { therapies, patient, inativa }

  Cenário: ROL-L001 Listar todas
    Quando envio GET /api/v1/people/{P}/roles
    Então recebo 200 com 2 itens
      { id, personId, system, role, active, assignedAt }

  Esquema do Cenário: ROL-L002 Filtro por ativo
    Quando envio GET /api/v1/people/{P}/roles?active=<valor>
    Então recebo <n> item(ns)
    Exemplos:
      | valor | n |
      | true  | 1 |
      | false | 1 |

  Cenário: ROL-L003 UUIDs inválidos no path
    Quando envio GET /api/v1/people/nao-uuid/roles
    Então recebo 400 e error.code "ROL-005"
```

## Funcionalidade: Desativar/Reativar role — `PUT .../roles/:roleId/{deactivate,reactivate}` (role: `admin`)

```gherkin
Funcionalidade: Ciclo de vida da role
  Contexto:
    Dado um token "admin" com X-Actor-Id
    E a pessoa P com a role ativa R = { social-care, patient }

  Cenário: ROL-V001 Desativar role
    Quando envio PUT /api/v1/people/{P}/roles/{R}/deactivate
    Então recebo 204
    E GET .../roles?active=true não contém mais R
    E o usuário é removido do grupo "social-care:patient" no Authentik
    E o outbox contém "people.role.deactivated"

  Cenário: ROL-V002 Desativar role inexistente ou já inativa
    Quando envio PUT .../roles/{R}/deactivate com R já inativa
    Então recebo 404 e error.code "ROL-002"

  Cenário: ROL-V003 Reativar role
    Dado a role R inativa
    Quando envio PUT .../roles/{R}/reactivate
    Então recebo 204, R volta a active=true
    E o usuário volta ao grupo no Authentik
    E o outbox contém "people.role.reactivated"

  Cenário: ROL-V004 Reativar role ativa
    Quando envio PUT .../roles/{R}/reactivate com R já ativa
    Então recebo 404 e error.code "ROL-003"

  Cenário: ROL-V005 Worker não mexe em roles
    Dado um token "worker"
    Quando envio PUT .../roles/{R}/deactivate
    Então recebo 403
```

## Funcionalidade: Query cross-pessoa — `GET /api/v1/roles`

```gherkin
Funcionalidade: Consulta de roles entre pessoas
  Contexto:
    Dado um token com role "worker"
    E 3 pessoas com role ativa { social-care, patient }
    E 1 pessoa com role inativa { social-care, patient }
    E 2 pessoas com role ativa { queue-manager, professional }

  Cenário: ROL-Q001 system é obrigatório
    Quando envio GET /api/v1/roles sem query param
    Então recebo 400 e error.code "ROL-004"

  Cenário: ROL-Q002 Filtro por sistema
    Quando envio GET /api/v1/roles?system=social-care
    Então recebo 200 com 3 itens (active default = true)
    E cada item tem person { id, fullName, cpf, birthDate }
      e role { id, personId, system, role, active, assignedAt }

  Cenário: ROL-Q003 Filtro por sistema + role + inativas
    Quando envio GET /api/v1/roles?system=social-care&role=patient&active=false
    Então recebo 200 com 1 item (a role inativa)
```
