# Casos de Teste — Segurança e RBAC

## 1. Matriz RBAC (verificar endpoint × role)

Roles vêm do JWT (claim `urn:zitadel:iam:org:project:<id>:roles`; service accounts via introspection RFC 7662 com allowlist). `superadmin` bypassa todos os guards. Matching composto: `social-care:admin` satisfaz guard `admin`.

| Endpoint | worker | owner | admin | superadmin | sem role |
|---|---|---|---|---|---|
| `GET /health`, `GET /ready` | ✅ (sem JWT) | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/people` | ✅ | 403 | ✅ | ✅ | 403 |
| `GET /api/v1/people` (+ `/:id`, `/by-cpf/:cpf`) | ✅ | ✅ | ✅ | ✅ | 403 |
| `PUT /api/v1/people/:id` | ✅ | 403 | ✅ | ✅ | 403 |
| `PUT .../deactivate`, `.../reactivate` | 403 | 403 | ✅ | ✅ | 403 |
| `POST .../request-password-reset` | 403 | 403 | ✅ | ✅ | 403 |
| `POST .../roles` | 403 | 403 | ✅ (+ regras compostas, ver arquivo 02) | ✅ | 403 |
| `GET .../roles` | ✅ | ✅ | ✅ | ✅ | 403 |
| `PUT .../roles/:rid/{deactivate,reactivate}` | 403 | 403 | ✅ | ✅ | 403 |
| `GET /api/v1/roles` | ✅ | ✅ | ✅ | ✅ | 403 |

```gherkin
Funcionalidade: Autenticação
  Cenário: SEC-001 Sem header Authorization
    Quando chamo qualquer endpoint /api/v1/* sem Authorization
    Então recebo 401 e error.code "AUTH-001"

  Esquema do Cenário: SEC-002 Tokens inválidos
    Quando chamo GET /api/v1/people com <token>
    Então recebo 401 "AUTH-001"
    Exemplos:
      | token                                |
      | JWT expirado                         |
      | JWT com assinatura adulterada        |
      | JWT de issuer diferente do ZITADEL_ISSUER |
      | string que não é JWT                 |

  Cenário: SEC-003 Role insuficiente
    Dado um token sem nenhuma role
    Quando chamo GET /api/v1/people
    Então recebo 403 e error.code "AUTH-002"

  Cenário: SEC-004 Matching de role composta
    Dado um token cuja única role é "social-care:admin"
    Quando chamo PUT /api/v1/people/{id}/deactivate (guard "admin")
    Então recebo 2xx/404 — a role composta satisfaz o guard simples

  Cenário: SEC-005 Cada célula da matriz
    Quando executo cada endpoint da matriz com cada um dos 5 tokens
    Então o status corresponde exatamente à célula (✅ = 2xx/404, demais = 403)
```

## 2. Header `X-Actor-Id` (mutações)

Diferente do social-care (que deriva o ator exclusivamente do `JWT.sub` — ADR-023), o people-context **exige o header `X-Actor-Id` em toda mutação** (POST/PUT/DELETE) para trilha de auditoria nos eventos. O BFF deve preencher esse header com o `sub` do JWT validado — nunca com valor vindo do cliente.

```gherkin
Funcionalidade: X-Actor-Id obrigatório
  Cenário: ACT-001 Mutação sem X-Actor-Id
    Dado um token válido com role adequada
    Quando envio POST /api/v1/people sem o header X-Actor-Id
    Então recebo 400 e error.code "AUTH-003"

  Cenário: ACT-002 Leituras não exigem o header
    Quando envio GET /api/v1/people sem X-Actor-Id
    Então recebo 200

  Cenário: ACT-003 actorId propaga aos eventos
    Quando crio uma pessoa com X-Actor-Id = "uid-abc"
    Então o evento "people.person.registered" no outbox tem actorId "uid-abc"
```

## 3. Invariantes de AppSec (não-funcionais, verificar em TODO ciclo)

```gherkin
Funcionalidade: Invariantes de segurança e LGPD
  Cenário: INV-001 CPF nunca em payload de evento (AppSec HIGH-8)
    Quando executo todos os fluxos de mutação com pessoas que têm CPF
    Então NENHUM evento em outbox_events contém o campo cpf no payload
      (inspecionar via SQL: SELECT payload FROM outbox_events)

  Cenário: INV-002 Recovery link nunca em resposta HTTP (CRITICAL-2 / ADR-030)
    Quando solicito reset de senha com sucesso
    Então a resposta 202 não contém URL alguma
    E somente o evento "people.user.password_reset_requested" carrega recoveryLink

  Cenário: INV-003 legacy sub nunca em evento (HIGH-9)
    Então nenhum payload de evento contém legacy_zitadel_sub

  Cenário: INV-004 Erros do Authentik não vazam (HIGH-7)
    Dado o Authentik devolvendo erro com corpo detalhado
    Quando uma operação de IdP falha
    Então a resposta HTTP contém apenas o código IDP-* e mensagem genérica
      (detalhes apenas em log do serviço)

  Cenário: INV-005 Config parcial do Authentik derruba o boot (HIGH-10)
    Dado AUTHENTIK_URL definida e AUTHENTIK_TOKEN ausente
    Quando o serviço sobe
    Então o boot falha imediatamente (fail-fast), não inicia em estado parcial

  Cenário: INV-006 Auth antes de mutação (HIGH-1)
    Dado um token com role insuficiente
    Quando envio qualquer mutação
    Então recebo 403 e NENHUMA linha é alterada no banco
      e NENHUM evento entra no outbox

  Cenário: INV-007 SQL injection por parâmetros
    Quando envio search com payloads de injeção (', --, ;DROP TABLE, %)
    Então recebo 200 com resultado vazio/normal — nunca 500 de sintaxe SQL
      (queries usam tagged templates parametrizadas do postgres.js)
```

## 4. Introspection de service accounts (se habilitado no ambiente)

```gherkin
Funcionalidade: Token de service account via introspection
  Contexto:
    Dado ZITADEL_INTROSPECT_* configurados e ALLOWED_SERVICE_ACCOUNTS contendo "svc-1"

  Cenário: SVC-001 Service account na allowlist
    Dado um token sem roles cujo sub é "svc-1"
    Quando chamo um endpoint com guard
    Então o serviço resolve as roles via introspection e autoriza conforme matriz

  Cenário: SVC-002 Service account fora da allowlist
    Dado um token sem roles cujo sub é "svc-desconhecido"
    Quando chamo qualquer endpoint com guard
    Então recebo 401/403 sem chamada de introspection

  Cenário: SVC-003 Introspection lenta
    Dado o endpoint de introspection demorando mais que INTROSPECT_TIMEOUT_MS
    Quando chamo a API com token de service account
    Então recebo 401 dentro do timeout configurado (não trava o request)
```
