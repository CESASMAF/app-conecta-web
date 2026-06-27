# Contrato upstream — social-care (escrita de Pacientes)

Os **9 comandos** de paciente que o BFF orquestra. Superfície **lida no código Swift** (`PatientController.swift` + command handlers + `PatientEvents.swift`), não inferida. Base: `/api/v1`. Envelope de sucesso `{ data, meta }`; erros `{ error: { code, message, kind, category, … }, meta }`. **Ator**: derivado do `JWT.sub` validado (ADR-023) — o BFF envia só `Authorization: Bearer <jwt>`, **nunca** header de ator. Toda mutação bem-sucedida persiste evento via **Transactional Outbox** → NATS `social-care.events.<EventType>`.

| # | Método · Path | Role | Pré-estado | Sucesso | Evento NATS |
|---|---|---|---|---|---|
| 1 | `POST /patients` | worker | — | 201 `{id}` → `WAITLISTED` | `PatientCreated` |
| 2 | `POST /patients/:id/admit` | worker, admin | `WAITLISTED` | 204 → `ACTIVE` | `PatientAdmitted` |
| 3 | `POST /patients/:id/discharge` | worker, admin | `ACTIVE` | 204 → `DISCHARGED` | `PatientDischarged` |
| 4 | `POST /patients/:id/readmit` | worker, admin | `DISCHARGED` | 204 → `ACTIVE` | `PatientReadmitted` |
| 5 | `POST /patients/:id/withdraw` | worker, admin | `WAITLISTED` | 204 → saída | `PatientWithdrawnFromWaitlist` |
| 6 | `POST /patients/:id/family-members` | worker | paciente ativo | 204 | `FamilyMemberAdded` |
| 7 | `DELETE /patients/:id/family-members/:memberId` | worker | paciente ativo | 204 | `FamilyMemberRemoved` |
| 8 | `PUT /patients/:id/primary-caregiver` | worker | paciente ativo | 204 | `PrimaryCaregiverAssigned` |
| 9 | `PUT /patients/:id/social-identity` | worker | paciente ativo | 204 | `SocialIdentityUpdated` |

## 1. POST /api/v1/patients — registrar

**Request** (campos `*` = opcional): `personId`, `initialDiagnoses:[{icdCode,date,description}]` (≥1), `personalData*:{firstName,lastName,motherName,nationality,sex(M|F|O),socialName*,birthDate,phone*}`, `civilDocuments*:{cpf*,nis*,rgDocument*,cns*}`, `address*:{cep*,isShelter,isHomeless*,residenceLocation,street*,neighborhood*,number*,complement*,state,city}`, `socialIdentity*:{typeId,description*}`, `prRelationshipId`.

**Erros** (HTTP · código): 409 `REGP-001` (pessoa já tem paciente), 400 `REGP-002` (personId inválido), 400 `REGP-003` (CID inválido), 422 `REGP-004..006` (diagnóstico data-futura/sem-descrição/obrigatório), 422 `REGP-009..014` (nome/nome-mãe/nacionalidade/sexo/nascimento), 422 `REGP-015..018` (CPF/NIS/RG/sem-documento), 422 `REGP-019..022` (residência/endereço/indígena), 422 `REGP-025` (descrição p/ tipo identidade), 422 `REGP-026` (lookup), 422 `REGP-027/028` (CNS/CPF≠CNS), 422 `REGP-029` (pessoa não existe no people-context), 409 `REGP-030` (CPF já registrado), **503 `REGP-031`** (people-context indisponível — fail-secure ADR-011).

## 2–5. Ciclo de vida

- **admit** (sem corpo): 404 `ADM-001`, 409 `ADM-002` (já ativo), 409 `ADM-003` (desligado→use readmit), 400 `ADM-004`.
- **discharge** `{reason: improved|deceased|transferred|abandoned|other, notes?}` (`notes` obrigatório se `other`, ≤1000): 404 `DISC-004`, 409 `DISC-001` (já desligado), 400 `DISC-002` (reason), 400 `DISC-003` (notes p/ "outro"), 400 `DISC-005` (>1000), 400 `DISC-006` (id), 409 `DISC-007` (em fila→use withdraw).
- **readmit** `{notes?}` (≤1000): 404 `READM-002`, 409 `READM-001` (já ativo), 400 `READM-003` (id), 400 `READM-004` (>1000), 409 `READM-005` (em fila→use admit).
- **withdraw** `{reason: refused_service|moved_location|other, notes?}`: 404 `WDR-001`, 409 `WDR-002` (já desligado), 409 `WDR-003` (ativo→use discharge), 400 `WDR-004` (reason), 400 `WDR-005` (notes p/ "outro"), 400 `WDR-006` (>1000), 400 `WDR-007` (id).

## 6–8. Núcleo familiar

- **add** `{memberPersonId, relationship, isResiding, isCaregiver, hasDisability, requiredDocuments:[CN|RG|CTPS|CPF|TE], birthDate, prRelationshipId}`: 400 `APP-007` (paciente), 409 `APP-008` (já existe), 422 `APP-009` (lookup), 409 `APP-010` (não ativo), 422 `APP-011` (documento), 500 `APP-006`.
- **remove** (`:memberId` = personId do membro): 404 `RFM-001/002` (paciente/membro), 400 `RFM-003` (id), 409 `RFM-005` (não ativo), 500 `RFM-004`.
- **primary-caregiver** `{memberPersonId}`: 404 `APC-001/002` (paciente/membro), 400 `APC-003` (id), 409 `APC-005` (não ativo), 500 `APC-004`.

## 9. Identidade social

- **social-identity** `{typeId, description?}`: 404 `USIA-001`, 400 `USIA-002` (id), 422 `USIA-003/004` (indígena em/fora de aldeia sem descrição), 422 `USIA-006` (descrição obrigatória), 422 `USIA-007` (lookup), 409 `USIA-008` (não ativo), 500 `USIA-005`. Evento carrega `before`/`after`.

## Notas de integração

- **Lookups** (`prRelationshipId`, `socialIdentity.typeId`, `relationship`, `residenceLocation`) referenciam catálogos de domínio — o client usa o **cache da 002** para popular os selects e envia o `id`/código esperado.
- **Risco de aceite E2E** (research D9): bugs de contrato conhecidos no `social-care` (header de ator em GET, serialização do relay de Outbox `uuid`→`json`, decode de evento) bloqueiam o caminho real `criar → evento`. O **stub** (`tests/`) implementa o contrato correto; o aceite end-to-end depende da correção desses bugs no backend.
