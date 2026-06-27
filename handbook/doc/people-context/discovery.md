# Descoberta: Gestão de Pessoas e Identidade — Web (visão core-api · `svc-people-context`)

**Feature**: `specs/002-people-context-web/` · **Consultor**: `/acdg-skills:requirements-engineer`

> Fase 0 da pipeline `core-api-sdd`. Elicitação ancorada em Gerenciamento de Requisitos
> (Moraes & Lopes) + Histórias de Usuário. Saída alimenta a SPEC (fase 1 — `spec.md`).
> Esta é a visão **CORE-API**: o serviço `people-context` (Bun 1.3 · Elysia · PostgreSQL · NATS ·
> TypeScript funcional) como registro de identidade de pessoas do ecossistema ACDG. A visão de
> interface (frontend + BFF Elysia) está em [`discovery.fe.md`](./discovery.fe.md).
> ADRs globais: [índice](../../adr/README.md).
> [Constituição web_02](../../../.specify/memory/constitution.md).

## Problema / Oportunidade

O ecossistema ACDG-BV precisa de um registro único de identidade: a mesma pessoa (paciente de doença rara, familiar, profissional) aparece em vários sistemas (`social-care`, `queue-manager`, `therapies`, `timesheet`) e, sem uma fonte central, surgem cadastros duplicados, vínculos inconsistentes e contas de acesso criadas à mão no IdP. O serviço `people-context` já resolve isso no backend — agregado `Person` com deduplicação por CPF, vínculos `system:role` (`SystemRole`), provisão de login no Authentik e apagamento LGPD —, porém seu contrato HTTP ainda não é consumido por nenhuma interface. Esta feature consolida esse contrato como base estável para a interface web (`002-people-context-web`), permitindo que a equipe da associação gerencie pessoas, vínculos e acessos sem operar API ou IdP diretamente.

## Stakeholders

| Stakeholder | Interesse / o que espera | Decisor? |
|---|---|---|
| Assistente social / operadora (`worker`) | Buscar e cadastrar pessoas sem duplicar (dedup por CPF), atualizar dados, provisionar login retroativo | não |
| Supervisor / gestor (`owner`) | Consultar pessoas e vínculos (somente leitura) para supervisão | não |
| Administrador de sistema (`admin`, escopado por `system:admin`) | Atribuir/desativar/reativar vínculos no(s) seu(s) sistema(s), desativar/reativar pessoas, disparar reset de senha | sim |
| Superadministrador (`superadmin`) | Atribuir role `superadmin`, operar cross-system e executar apagamento total LGPD (Art. 18 V) | sim |
| DPO / compliance LGPD | CPF nunca em eventos/logs, reset link nunca em resposta HTTP, erasure restrito e irreversível | sim |
| Equipe web (consumidora do contrato) | Contrato estável: envelope `{ data, meta }`, erros `PEO-XXX`/`ROL-XXX`/`IDP-XXX`/`AUTH-XXX`, paginação por cursor | não |
| Serviços consumidores (`social-care`, `analysis-bi`, queue-manager) | Eventos `people.*` confiáveis via Outbox → NATS | não |

## Histórias de usuário (INVEST)

- **US-001** (P1): Como operadora (`worker`), quero cadastrar uma pessoa informando nome, CPF (opcional), data de nascimento e e-mail, com deduplicação automática por CPF, para garantir registro único no ecossistema.
  - **Valor / prioridade**: P1 — `Person` é a raiz de tudo; sem registro único, vínculos e acessos não existem.
  - **Critérios de aceitação** (viram BDD na fase 6): dado um CPF inédito válido (MOD-11), quando envio `POST /people` com `X-Actor-Id`, então recebo `201 { data: { id } }` e o evento `people.person.registered` é publicado sem CPF; dado um CPF já cadastrado, quando envio `POST /people` com o mesmo CPF, então recebo `201` com o `id` da pessoa **existente** (idempotência, sem erro).
- **US-002** (P1): Como operadora ou supervisor, quero buscar pessoas por nome (parcial) ou por CPF, com paginação por cursor, para localizar registros rapidamente.
  - **Valor / prioridade**: P1 — a busca é pré-condição de todas as demais operações (atualizar, vincular, provisionar).
  - **Critérios de aceitação**: dado registros existentes, quando consulto `GET /people?search=<termo>&limit=20`, então recebo `200` com `data: Person[]` e `meta: { pageSize, totalCount, hasMore, nextCursor }`; dado um CPF completo, quando consulto `GET /people/by-cpf/:cpf`, então recebo `200` com a pessoa ou `404 PEO-002`.
- **US-003** (P2): Como administrador escopado, quero atribuir, desativar e reativar vínculos `system:role` de uma pessoa, para controlar quem é o quê em cada sistema.
  - **Valor / prioridade**: P2 — depende da pessoa existir; é o que dá significado ao registro nos demais sistemas.
  - **Critérios de aceitação**: dado pessoa existente e `auth.roles` contendo `social-care:admin`, quando envio `POST /people/:personId/roles { system: "social-care", role: "patient" }`, então recebo `201` (ou `204` se vínculo já ativo — noop) e `people.role.assigned` é publicado; dado admin de `social-care` tentando atribuir em `therapies`, então recebo `403 ROL-007`; dado atribuição da role `superadmin` por não-superadmin, então `403 ROL-006`; dado `person.idpUserId === auth.sub` (auto-assign), então `403 ROL-008`.
- **US-004** (P2): Como operadora ou administrador, quero provisionar login no Authentik para uma pessoa (na criação via `createLogin` ou retroativamente), para que ela acesse os sistemas do ecossistema.
  - **Valor / prioridade**: P2 — habilita o acesso real; o fluxo `207 Multi-Status` (pessoa criada, IdP falhou) exige a retomada retroativa.
  - **Critérios de aceitação**: dado `POST /people` com `createLogin: true` e e-mail, quando o IdP responde com sucesso, então `people.user.provisioned` é publicado; quando o IdP falha, então recebo `207 Multi-Status` com a pessoa criada; dado pessoa sem login, quando envio `POST /people/:personId/login`, então recebo `201 { data: { id, idpUserId } }`; dado pessoa que já tem login, então `409 PEO-008`; dado pessoa sem e-mail, então `422 PEO-009`.
- **US-005** (P3): Como administrador, quero disparar a recuperação de senha de uma pessoa, para destravá-la sem manipular o IdP manualmente.
  - **Valor / prioridade**: P3 — operacional, menos frequente; assíncrono por desenho de segurança (ADR-030).
  - **Critérios de aceitação**: dado pessoa com login no IdP, quando envio `POST /people/:personId/request-password-reset`, então recebo `202 Accepted` **sem** o link no body (viaja apenas no evento NATS `people.user.password_reset_requested`); dado pessoa sem login, então `422 PEO-007`.
- **US-006** (P3): Como administrador, quero desativar e reativar pessoas (soft-delete via `active`, IdP primeiro), para bloquear acesso preservando histórico.
  - **Valor / prioridade**: P3 — ciclo de vida reversível; ordem IdP-first (ADR-HIGH-5) impede conta ativa órfã no Authentik.
  - **Critérios de aceitação**: dado pessoa ativa, quando envio `PUT /people/:personId/deactivate`, então o IdP é desativado primeiro e depois `active=false` (`204`); dado IdP fora, então `502 IDP-002` e o banco **não** é tocado; dado pessoa já inativa, então `409 PEO-005`; reativação espelhada com `409 PEO-006` / `502 IDP-003`.
- **US-007** (P3): Como superadministrador, quero apagar totalmente uma pessoa (LGPD Art. 18 V), para atender solicitações de eliminação de dados.
  - **Valor / prioridade**: P3 — obrigação legal, frequência baixa, risco alto (irreversível).
  - **Critérios de aceitação**: dado token sem `superadmin`, quando envio `DELETE /people/:personId`, então `403 PEO-010`; dado superadmin, então o usuário é removido do Authentik primeiro (sem rollback), depois roles + pessoa em transação (`204`) e `people.person.deleted` é publicado contendo apenas `personId`.

## Requisitos

### Funcionais
- **RF-001**: O sistema DEVE expor registro de pessoa (`POST /people`) com deduplicação idempotente por CPF (retorna o registro existente com `201`) e validação na borda (fullName 1–200, CPF MOD-11 sem repdigits, birthDate não-futura, e-mail válido, `createLogin=true` ⇒ e-mail obrigatório → `400 PEO-001`).
- **RF-002**: O sistema DEVE expor consulta de pessoa por id (`GET /people/:personId`), por CPF (`GET /people/by-cpf/:cpf`) e listagem com busca (`GET /people?search&cursor&limit≤100`) paginada por cursor (`meta.hasMore`/`meta.nextCursor`/`meta.totalCount`).
- **RF-003**: O sistema DEVE atualizar pessoa via `PUT /people/:personId` com semântica COALESCE (campo omitido preserva o valor atual) e sincronizar nome/e-mail com o Authentik best-effort quando houver `idpUserPk`.
- **RF-004**: O sistema DEVE gerenciar vínculos `SystemRole` (`POST /people/:personId/roles`, `PUT .../roles/:roleId/deactivate|reactivate`, `GET /people/:personId/roles`, `GET /roles?system=…`) com invariante UNIQUE(person, system, role), reativação em vez de duplicação e noop `204` para vínculo já ativo.
- **RF-005**: O sistema DEVE aplicar a autorização de vínculos **antes** de qualquer mutação: só `superadmin` atribui `superadmin` (`ROL-006`); admin escopado só opera no próprio sistema (`ROL-007`); auto-assign proibido (`ROL-008`).
- **RF-006**: O sistema DEVE provisionar login no Authentik (na criação ou retroativo via `POST /people/:personId/login`) com username único resolvido automaticamente, respondendo `207 Multi-Status` quando a pessoa é criada mas a provisão falha.
- **RF-007**: O sistema DEVE disparar recuperação de senha de forma assíncrona (`202 Accepted`), com o link de recuperação trafegando exclusivamente no evento NATS `people.user.password_reset_requested` — nunca na resposta HTTP.
- **RF-008**: O sistema DEVE desativar/reativar pessoa com ordem IdP-first (falha no IdP aborta antes do banco — `502 IDP-002`/`IDP-003`) e estados conflitantes respondendo `409 PEO-005`/`PEO-006`.
- **RF-009**: O sistema DEVE executar erasure LGPD (`DELETE /people/:personId`) somente para `superadmin` (`403 PEO-010` caso contrário), IdP primeiro sem rollback, removendo roles + pessoa em transação.
- **RF-010**: O sistema DEVE publicar todos os eventos `people.*` via Transactional Outbox (at-least-once para NATS), sem CPF em nenhum payload.
- **RF-011**: O sistema DEVE exigir header `X-Actor-Id` (UUID) em toda mutação (`400 AUTH-003` na ausência) e derivar o ator de `JWT.sub`.

### Não-funcionais (viram métricas na fase 4)
- **RNF-001**: Segurança — toda rota (exceto `/health`, `/ready`) exige `Authorization: Bearer <jwt>` RS256 validado via JWKS do Authentik (claim de roles `groups`; matching `r === required || r.endsWith(":" + required)`); falha → `401 AUTH-001` / `403 AUTH-002`.
- **RNF-002**: LGPD — CPF nunca em eventos/logs; link de reset nunca em resposta HTTP; erasure irreversível restrito a `superadmin`.
- **RNF-003**: Consistência — atribuição de role usa transação `FOR UPDATE` (idempotência sob requests paralelos; corrida residual responde `409 ROL-009`).
- **RNF-004**: Disponibilidade — `/health` (liveness) e `/ready` (readiness com checks de database, NATS e backlog do outbox; `503` se o banco está fora).
- **RNF-005**: Performance — `GET /people` com busca e `limit=20` responde em p95 < 300 ms na VPS BV; relay do outbox publica em ≤ 2 s (poll 1 s, batch 50).

## Restrições e premissas

- Serviço existente: Bun 1.3 · Elysia · PostgreSQL (database `people`) · NATS JetStream · TypeScript funcional (no-class) → **a feature consome o contrato, não altera o domínio**.
- Envelope obrigatório `{ data, meta: { timestamp } }` (paginação só em listas); erros `{ success: false, error: { code, message } }` com códigos `PEO-XXX`/`ROL-XXX`/`IDP-XXX`/`AUTH-XXX`/`ADM-XXX`.
- Datas em ISO 8601 (`YYYY-MM-DD`); CPF como 11 dígitos sem máscara na API; senha inicial mínimo 8 caracteres; rate limit e CORS delegados ao gateway.
- IdP-alvo da instância BV é **Authentik** (`auth.acdg-bv.org.br`); o serviço já migrou hard-switch (sem Zitadel); sync de grupos `system:role` é best-effort (DB é source of truth).
- Soft-delete via `active` em pessoa e vínculo; única exclusão física é o erasure LGPD por `superadmin`.
- Premissas: grupos do Authentik (`worker`, `superadmin`, `social-care:admin`, …) já provisionados via blueprint (ADR-029); consumidores NATS são idempotentes por `eventId`.

## Fora de escopo

- Prontuário, avaliação e atendimento socioassistencial (responsabilidade do `social-care` — ver conjunto `001-social-care-web`).
- Indicadores agregados/anonimizados (responsabilidade do `analysis-bi`).
- Envio do e-mail de recuperação de senha (responsabilidade do queue-manager, consumidor do evento).
- Administração direta do Authentik (criação de grupos, flows, blueprints) — o serviço apenas sincroniza.
- Qualquer mudança de schema, evento novo ou rota nova no `people-context`.

## Rastreabilidade (inicial)

| Requisito | História | Critério → BDD | Teste (TDD — `bun:test`) |
|---|---|---|---|
| RF-001 | US-001 | CPF duplicado → `201` com id existente (idempotência) | a definir na fase 7 (`tasks.md`) |
| RF-002 | US-002 | Busca paginada retorna `meta.nextCursor`/`hasMore` | a definir |
| RF-004, RF-005 | US-003 | Admin fora de escopo → `403 ROL-007`; vínculo ativo → `204` noop | a definir |
| RF-006 | US-004 | IdP falhou na criação → `207`; retroativo `201`; `409 PEO-008` / `422 PEO-009` | a definir |
| RF-007 | US-005 | Reset → `202` sem link no body; sem login → `422 PEO-007` | a definir |
| RF-008 | US-006 | IdP fora → `502 IDP-002`, banco intacto; já inativa → `409 PEO-005` | a definir |
| RF-009 | US-007 | Não-superadmin → `403 PEO-010`; erasure publica só `personId` | a definir |
| RF-010, RF-011 | US-001…US-007 | Mutação sem `X-Actor-Id` → `400 AUTH-003`; eventos sem CPF | a definir |

## Perguntas em aberto

- [ ] [NEEDS CLARIFICATION: a role `owner` da instância BV deve poder consultar `GET /roles` com `PersonSummary` incluindo CPF (hoje exposto para discovery), ou esse campo deveria ser mascarado para não-admin?] → resolver na fase de clarificação (`/speckit-clarify`).
- [ ] [NEEDS CLARIFICATION: `KnownSystem`/`KnownRole` não são exaustivos no domínio — a UI deve oferecer listas fechadas (apenas os 4 sistemas e roles conhecidos) ou campo livre com sugestões?]
- [ ] [NEEDS CLARIFICATION: há requisito de notificar a pessoa por e-mail quando o login é provisionado com `initialPassword` definida pela operadora, ou a entrega da credencial é processo offline da associação?]

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md)
- [ADR-0001 (people-context): BFF como única fronteira](./adr.md)
- [discovery.fe.md — visão frontend/BFF](./discovery.fe.md)
- [domain.md — modelo de domínio CORE](./domain.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [Índice de ADRs web_02](../../adr/README.md)
- Docs offline: `../../reference/messaging/nats/` · `../../reference/database/postgresql/`
