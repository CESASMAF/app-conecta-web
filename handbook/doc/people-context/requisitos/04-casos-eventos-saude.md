# Casos de Teste — Eventos (Transactional Outbox) e Saúde do Serviço

## 1. Catálogo de eventos (AsyncAPI: 9 subjects NATS)

| Subject | Disparado por | data |
|---|---|---|
| `people.person.registered` | `POST /people` (pessoa nova) | `personId, fullName, birthDate` |
| `people.person.updated` | `PUT /people/:id` | `personId, fullName?, birthDate?` |
| `people.user.provisioned` | `POST /people` com `createLogin=true` | `personId, idpUserId` |
| `people.user.deactivated` | `PUT .../deactivate` | `personId, idpUserId` |
| `people.user.reactivated` | `PUT .../reactivate` | `personId, idpUserId` |
| `people.user.password_reset_requested` | `POST .../request-password-reset` | `personId, idpUserId, recoveryLink` |
| `people.role.assigned` | `POST .../roles` | `personId, system, role` |
| `people.role.deactivated` | `PUT .../roles/:rid/deactivate` | `personId, system, role` |
| `people.role.reactivated` | `PUT .../roles/:rid/reactivate` | `personId, system, role` |

Envelope comum: `{ metadata: { eventId, occurredAt, schemaVersion }, actorId, data }`.

```gherkin
Funcionalidade: Outbox transacional
  Cenário: EVT-001 Evento na mesma transação da mutação
    Quando crio uma pessoa com sucesso
    Então a linha em people E a linha em outbox_events existem (commit atômico)

  Cenário: EVT-002 Mutação rejeitada não gera evento
    Quando envio POST /people com payload inválido (400)
    Então nenhuma linha entra em outbox_events

  Cenário: EVT-003 Relay publica e marca
    Dado o NATS disponível
    Quando um evento entra no outbox
    Então em até ~2s (polling 1000ms) ele é publicado no subject correto
      e a linha fica published=true com published_at preenchido

  Cenário: EVT-004 NATS fora → outbox acumula sem perder
    Dado o NATS indisponível
    Quando executo 10 mutações
    Então as 10 linhas ficam published=false
    E ao religar o NATS, todas são publicadas na ordem de created_at
      (batch de 50 por ciclo) e marcadas published=true

  Cenário: EVT-005 Envelope completo
    Quando inspeciono qualquer evento publicado
    Então ele contém metadata.eventId (UUID), metadata.occurredAt (ISO-8601),
      metadata.schemaVersion, actorId e data
    E NÃO contém cpf nem recoveryLink (exceto password_reset_requested,
      que é o ÚNICO a carregar recoveryLink)

  Cenário: EVT-006 Consumo pelo social-care
    Dado o social-care inscrito em people.role.assigned
    Quando atribuo a role { social-care, patient } a uma pessoa
    Então o social-care recebe o evento e pode criar o Patient correspondente
      (ver handbook/domain/03-integration-map.md)
```

## 2. Probes de saúde

```gherkin
Funcionalidade: Health e readiness
  Cenário: SAU-001 Liveness sempre responde
    Quando envio GET /health sem nenhum header
    Então recebo 200 { status: "alive" }

  Cenário: SAU-002 Readiness com tudo saudável
    Dado Postgres e NATS disponíveis e outbox com backlog < 1000
    Quando envio GET /ready
    Então recebo 200 com checks { database: "ok", nats: "ok", outbox: "ok" }

  Cenário: SAU-003 Banco fora derruba readiness
    Dado o Postgres indisponível
    Quando envio GET /ready
    Então recebo 503 com checks.database != "ok"

  Cenário: SAU-004 NATS fora NÃO derruba readiness
    Dado o NATS indisponível e o Postgres saudável
    Quando envio GET /ready
    Então recebo 200 com checks.nats = "disconnected"
      (degradação tolerada: outbox segura os eventos)

  Cenário: SAU-005 Backlog alto sinaliza warning
    Dado mais de 1000 eventos published=false no outbox
    Quando envio GET /ready
    Então recebo 200 com checks.outbox = "backlog_high"
      e checks.outboxBacklog com a contagem

  Cenário: SAU-006 Probes sem auth
    Quando chamo /health e /ready sem Authorization
    Então nunca recebo 401 (security: [] por design)
```
