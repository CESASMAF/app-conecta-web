# Superfície dos backends para o BFF (web_02) — inventário completo

> Fonte para construir o **server-side completo** do web_02 (o BFF/facade que cobre os 3 micro-serviços).
> Lido no **código real** dos serviços (controllers/rotas/handlers/DTOs/eventos), não inferido. Cada item
> rastreável ao serviço de origem. **~55 endpoints HTTP · 9 setores · 3 serviços.**
>
> Regem este BFF: ADR-0010 (facade view-ready — composição, domínio→rótulo no servidor, mutação devolve view-state)
> e a constituição (Bun-native, errors-as-values, MVVM×DDD). Ver `handbook/adr/`.

## Política de autenticação por serviço — ⚠️ NÃO é uniforme

O ponto que torna o BFF mais que um proxy. Cada backend trata o **ator** e a **autorização** de forma diferente:

| Serviço | Como deriva o ator | Header de ator do BFF? | Autorização (RBAC) | O que o BFF DEVE fazer |
|---|---|---|---|---|
| **social-care** | do `JWT.sub` validado (ADR-023) | **NÃO** enviar (`RoleGuardMiddleware` lê o token) | Enforça role no middleware (`worker`/`owner`/`admin`) | Só injetar `Bearer`; **nunca** header de ator |
| **people-context** | `X-Actor-Id` **ou** deriva de `JWT.sub` (ADR-023) | **SIM** em mutações (`X-Actor-Id` = `sub` validado) | Enforça role via claim `groups` (`<sys>:<role>` + `superadmin`) | Injetar `Bearer` **+** `X-Actor-Id` derivado do `sub` validado |
| **analysis-bi** | — (consumidor; sem ator) | — | ⚠️ **RBAC e `iss`/`aud` podem estar DESLIGADOS** (HIGH-001/002/003): se `JWKS_URL` vazio, auth é pulada | **O BFF É A DEFESA**: validar `iss`/`aud`, enforçar role (`analyst`/`exporter`) e **sempre** injetar `Bearer` antes de encaminhar |

Modelo de papéis (people-context + analysis-bi): grupos `<system>:<role>` (ex. `social-care:admin`, `analysis-bi:analyst`) **+** `superadmin` (bypass). social-care usa roles simples (`worker`/`owner`/`admin`). O BFF precisa entender ambos ao decidir o que oferecer/encaminhar.

**Segredos viajam por NATS, não HTTP**: ex. o link de reset de senha do people-context sai só no evento `people.user.password_reset_requested` (consumido pelo queue-manager → e-mail); o BFF **não** vê o link. Nunca expor.

---

## social-care (Swift) — ~33 endpoints · base `/api/v1`

Envelope `{data,meta}`; erros `{code: "PREFIXO-NNN", message, http}`. Ator do `JWT.sub` (sem header). Toda escrita emite evento via Outbox → `social-care.events.<EventType>`.

### Setor 1 — Pacientes (escrita: feature 003 · leitura: feature 002)
9 comandos + leitura. Ver `specs/003-patient-manage/contracts/upstream-social-care-write.md` e `specs/002-patient-browse/`. Erros: `REGP/ADM/DISC/READM/WDR/APP/RFM/APC/USIA`.

### Setor 2 — Avaliação Social (7 PUTs · role `worker`) — `AssessmentController.swift`
| Endpoint | Erros | Evento | Lookups |
|---|---|---|---|
| `PUT /patients/:id/housing-condition` | `UHC-001..016` | `HousingConditionUpdated` | tipo_moradia, material_parede, fonte_agua, acesso_eletricidade, coleta_esgoto, coleta_lixo, nivel_acessibilidade |
| `PUT /patients/:id/socioeconomic-situation` | `USES-001..016` | `SocioEconomicSituationUpdated` | tipo_beneficio, fonte_renda |
| `PUT /patients/:id/work-and-income` | `UWI-001..016` | `WorkAndIncomeUpdated` | condicao_ocupacao, tipo_beneficio |
| `PUT /patients/:id/educational-status` | `UES-001..016` | `EducationalStatusUpdated` | escolaridade, efeito_condicionalidade |
| `PUT /patients/:id/health-status` | `UHS-001..016` | `HealthStatusUpdated` | tipo_deficiencia |
| `PUT /patients/:id/community-support-network` | `UCSN-001..016` | `CommunitySupportNetworkUpdated` | — |
| `PUT /patients/:id/social-health-summary` | `USHS-001..016` | `SocialHealthSummaryUpdated` | — |

Padrão de erro comum por PUT: `-001` PatientNotFound(404), `-003` InvalidLookupId(422), `-016` PatientNotActive(409), `-015` PersistenceFailure(500), + validações específicas. Eventos carregam `before/after`.

### Setor 3 — Cuidado Clínico (role `worker`) — `CareController.swift`
| Endpoint | Resp | Erros | Evento | Lookups |
|---|---|---|---|---|
| `POST /patients/:id/appointments` | 201 `{id}` | `REGA-001..011` (≥1 de summary/actionPlan; date não-futura; type válido) | `SocialCareAppointmentRegistered` | tipo_atendimento |
| `PUT /patients/:id/intake-info` | 204 | `RII-001..005` | `IntakeInfoUpdated` | tipo_ingresso, programa_social |

### Setor 4 — Proteção de Direitos (role `worker`) — `ProtectionController.swift`
| Endpoint | Resp | Erros | Evento | Lookups |
|---|---|---|---|---|
| `PUT /patients/:id/placement-history` | 204 | `UPH-001..007` | `PlacementHistoryUpdated` | — |
| `POST /patients/:id/violation-reports` | 201 `{id}` | `RRV-001..010` (víctima no núcleo; descrição condicional) | `RightsViolationReported` | tipo_violacao (`exige_descricao`) |
| `POST /patients/:id/referrals` | 201 `{id}` | `CREF-001..011` (pessoa no núcleo; data não-futura) | `ReferralCreated` | servico_vinculo |

### Setor 7 — Domínios & Governança — `LookupController.swift`
Allowlist (13): `dominio_tipo_identidade, parentesco, condicao_ocupacao, escolaridade, efeito_condicionalidade, tipo_deficiencia, programa_social, tipo_ingresso, tipo_beneficio, tipo_violacao, servico_vinculo, tipo_medida, unidade_realizacao`. Metadados condicionais em `tipo_beneficio` (exige_registro_nascimento/exige_cpf_falecido) e `tipo_violacao` (exige_descricao).
| Endpoint | Role | Erros |
|---|---|---|
| `GET /dominios/:table` (já na 002) | worker/owner/admin | 404 fora da allowlist |
| `POST /dominios/:table` | admin | `LKP-001..006` |
| `PUT /dominios/:table/:itemId` | admin | `LKP-*` |
| `PATCH /dominios/:table/:itemId/toggle` | admin | `LKP-*` (LKP-005 se referenciado) |
| `POST /dominios/requests` | worker/admin | `LKR-001..009` (justificativa obrigatória) |
| `GET /dominios/requests?status=` | worker/owner/admin | worker vê só as próprias; admin vê todas |
| `PUT /dominios/requests/:id/approve` | admin | `LKR-001/002` |
| `PUT /dominios/requests/:id/reject` | admin | `LKR-001/002/007` (reviewNote obrigatório) |

### Setor 9 — Auditoria & Admin
| Endpoint | Role | Notas |
|---|---|---|
| `GET /patients/:id/audit-trail?eventType&limit&offset` | worker/owner/admin | Audit centralizado aqui; o BFF lê via REST (não consome NATS) |
| `GET /health` · `GET /ready` | público | probes (não passam pelo BFF) |

---

## people-context (Bun/Elysia) — ~16 endpoints · base `/api/v1`

Envelope `{data,meta}`; erro `{success:false, error:{code,message}}`. Auth: JWT Authentik (issuer/JWKS de `AUTHENTIK_URL`+`AUTHENTIK_APP_SLUG`); roles na claim `groups`. **Mutações: o BFF envia `X-Actor-Id` = `sub` validado.** Eventos → `people.*`. `index/routes/{people,roles,admin,health}.ts`.

### Setor 5 — Pessoas & Identidade (`routes/people.ts`)
| Endpoint | Role | Resp | Erros | Evento |
|---|---|---|---|---|
| `POST /people` (cria + provisiona login opcional) | worker/admin | 201 `{id}` / **207** se IdP falha | `PEO-001`, `IDP-001` | `person.registered` (+`user.provisioned`) |
| `GET /people?search&cursor&limit` | worker/owner/admin | 200 paginado | — | — |
| `GET /people/by-cpf/:cpf` | worker/owner/admin | 200 | `PEO-004/002` | — |
| `GET /people/:id` | worker/owner/admin | 200 | `PEO-003/002` | — |
| `PUT /people/:id` | worker/admin | 204 | `PEO-003/001/002` | `person.updated` |
| `PUT /people/:id/deactivate` (IdP-first) | admin | 204 | `PEO-003/002/005`, `IDP-002` | `user.deactivated` |
| `PUT /people/:id/reactivate` (IdP-first) | admin | 204 | `PEO-006`, `IDP-003` | `user.reactivated` |
| `POST /people/:id/request-password-reset` | admin | 202 (**sem link** no HTTP) | `PEO-007`, `IDP-004` | `user.password_reset_requested` (link viaja aqui) |
| `POST /people/:id/login` (provisão retroativa) | worker/admin | 201 `{id,idpUserId}` | `PEO-008/009`, `IDP-001` | `user.provisioned` |
| `DELETE /people/:id` (erasure LGPD) | **superadmin** | 204 | `PEO-010` (não-superadmin), `IDP-005` | `person.deleted` |

### Setor 6 — Papéis & Acesso (`routes/roles.ts`)
| Endpoint | Role | Resp | Erros | Evento |
|---|---|---|---|---|
| `POST /people/:id/roles` `{system,role}` | admin (do sistema) | 201/204 | `ROL-001/006/007/008`, `PEO-002` | `role.assigned` |
| `GET /people/:id/roles?active=` | worker/owner/admin | 200 | `PEO-003/002` | — |
| `PUT /people/:id/roles/:roleId/deactivate` | admin (do sistema) | 204 | `ROL-005/002/007/009` | `role.deactivated` |
| `PUT /people/:id/roles/:roleId/reactivate` | admin (do sistema) | 204 | `ROL-003/007/009` | `role.reactivated` |
| `GET /roles?system=&role=&active=` | worker/owner/admin | 200 | `ROL-004` (system obrigatório) | — |
RBAC: só `superadmin` atribui `superadmin`; admin só atua no próprio sistema (`ROL-007`); sem auto-atribuição (`ROL-008`).

### Admin
| `POST /admin/reconcile-idp` | **superadmin** | 200 relatório | `ADM-001` |

---

## analysis-bi (Go/chi) — ~6 rotas · base `/api/v1` · ⚠️ O BFF É A DEFESA

Sem ator (consumidor NATS). **O BFF deve enforçar role + `iss`/`aud` e sempre injetar `Bearer`** (o backend pode rodar sem auth se mal configurado — HIGH-001/002).

| Endpoint | Role que o BFF enforça | Params | Notas |
|---|---|---|---|
| `GET /indicators/{axis}` (5 eixos: demographics/epidemiological/socioeconomic/protection/care) | **`analyst`** (`analysis-bi:analyst`/admin/superadmin) | `period_start`,`period_end` (YYYY-MM), `mesoregion?`, `granularity?`, `top?` | K-anonymity K=5 (`HAVING COUNT(*)>=5`); `meta.suppressed_groups` |
| `GET /export/{format}` (8: csv/json/xml/parquet/dbf/dbc/ods/fhir) | **`exporter`** (`analysis-bi:exporter`/admin/superadmin) | `dataset?`, +filtros dos indicators | `Content-Disposition: attachment`; FHIR R4 anonimizado |
| `GET /metadata/{datasets,formats,regions}` | qualquer autenticado | — | `regions` é placeholder vazio |
| `GET /health` · `GET /ready` | público | — | probes |

Defesa obrigatória no BFF antes de encaminhar: (1) `iss == Authentik` e `aud` esperado; (2) role correta por endpoint; (3) recusar 401/403 com mensagem de negócio; (4) nunca encaminhar sem `Bearer`. NUNCA armazena PII; consome ~17 eventos `social-care.events.*`.

---

## Mapa de erro unificado (famílias → tag semântica)

O BFF traduz **todos** estes prefixos para `AppErrorKind` (`validation`/`conflict`/`notFound`/`forbidden`/`dependencyUnavailable`/`unauthorized`/`unknown`), preservando o `code` para observabilidade:

- **social-care**: `REGP, ADM, DISC, READM, WDR, APP, RFM, APC, USIA` (pacientes) · `UHC, USES, UWI, UES, UHS, UCSN, USHS` (avaliação) · `REGA, RII` (clínico) · `UPH, RRV, CREF` (proteção) · `LKP, LKR` (domínios).
- **people-context**: `AUTH, PEO, ROL, IDP, ADM`.
- **analysis-bi**: HTTP puro (400/401/403/503) — o BFF gera o erro semântico (RBAC/iss/aud) **antes** de chamar.

Convenção HTTP comum: 400 validação · 404 não-encontrado · 409 conflito/estado · 422 regra de domínio · 500/503 infra/dependência.

---

## Cobertura atual do BFF (o que já existe)

- **002-patient-browse** (feito): `GET /patients` (lista), `GET /patients/:id` (header), `GET /dominios/:table` (catálogos) — resource-shaped.
- **003-patient-manage** (especificado): 9 comandos de paciente + overview composto + form-context (facade view-ready).
- **Falta**: setores 2,3,4 (escrita social-care), 7 (domínios admin+governança), 9 (audit), 5,6 (people-context inteiro), 8 (analysis-bi + camada de defesa). Mais os 2 adapter clients novos (`PeopleContextClient`, `AnalysisBiClient`) e o mapa de erro unificado.
