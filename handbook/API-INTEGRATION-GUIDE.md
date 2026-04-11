# Guia de Integracao — People Context + Social Care

> Documento para o desenvolvedor frontend (BFF Deno).
> Explica como os dois servicos se conectam, qual a ordem correta de chamadas,
> e o que cada endpoint espera/retorna.

---

## Visao Geral da Arquitetura

```
Browser (Conecta Web)
  |
  | Cookie: __Host-session (opaco)
  | X-Requested-With: XMLHttpRequest
  |
  v
BFF Deno (Hono) — porta 8081
  |
  | Authorization: Bearer <JWT>  (injetado da sessao)
  | X-Actor-Id: <sub do JWT>
  |
  +---> People Context (Bun/Elysia)    http://people-context:3000
  |       "Quem e essa pessoa?"
  |       Registro de identidade + roles por sistema
  |
  +---> Social Care (Swift/Vapor)       http://social-care:3000
          "Qual o historico social dela?"
          Prontuario, avaliacoes, atendimentos, protecao
```

**Regra de ouro:** People Context e a fonte de verdade sobre **quem a pessoa e**.
Social Care e a fonte de verdade sobre o **prontuario social** dela.

---

## Conceitos Fundamentais

### Person vs Patient

| Conceito | Servico | O que representa |
|----------|---------|------------------|
| **Person** | People Context | Identidade civil: nome, CPF, data de nascimento. Existe independente de qualquer sistema. |
| **Patient** | Social Care | Prontuario social vinculado a uma Person. So existe se a pessoa foi cadastrada como paciente no social-care. |

Uma Person pode ter **roles** em diferentes sistemas:
- `social-care` / `patient` — e paciente do assistencial
- `social-care` / `professional` — e profissional do assistencial
- `queue-manager` / `patient` — e paciente do sistema de filas
- etc.

### PersonId — o elo entre os dois

O `personId` (UUID) gerado pelo People Context e usado como chave estrangeira logica no Social Care. Quando voce cria um Patient, voce **passa o personId** que veio do People Context.

---

## Autenticacao (para todas as chamadas)

Todas as requests do BFF para os backends incluem:

```
Authorization: Bearer <access_token_do_zitadel>
X-Actor-Id: <sub_do_jwt>     # obrigatorio em POST/PUT/DELETE
Content-Type: application/json
```

O BFF extrai o `access_token` da sessao do usuario e injeta nos headers.
O `X-Actor-Id` e o `sub` do JWT (ID do usuario Zitadel que esta logado).

### Roles necessarias

| Role | People Context | Social Care |
|------|---------------|-------------|
| `social_worker` | CRUD people + assign roles | CRUD completo (patients, assessments, care, protection) |
| `owner` | Leitura | Leitura |
| `admin` | CRUD people + manage roles | Leitura + CRUD lookup tables |

---

## Formato Padrao de Resposta

Ambos os servicos usam o mesmo envelope:

**Sucesso (com body):**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-10T14:30:00Z"
  }
}
```

**Sucesso (lista paginada):**
```json
{
  "data": [ ... ],
  "meta": {
    "timestamp": "2026-04-10T14:30:00Z",
    "pageSize": 20,
    "totalCount": 42,
    "hasMore": true,
    "nextCursor": "uuid-do-ultimo-item"
  }
}
```

**Sucesso (sem body):** HTTP 204 No Content

**Erro:**
```json
{
  "error": {
    "code": "PAT-001",
    "message": "Patient not found"
  }
}
```

---

## Fluxo Completo: Cadastro de Novo Paciente

Este e o fluxo principal. Siga a ordem exata.

### Passo 1 — Verificar se a pessoa ja existe (People Context)

Antes de cadastrar, buscar por CPF para evitar duplicatas:

```
GET /api/v1/people/by-cpf/52998224725
Host: people-context:3000
Authorization: Bearer <token>
```

**Se 200:** A pessoa ja existe. Use o `id` retornado como `personId`.
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "fullName": "Maria Silva Santos",
    "cpf": "52998224725",
    "birthDate": "1990-05-15"
  },
  "meta": { "timestamp": "..." }
}
```

**Se 404:** A pessoa nao existe. Prossiga para o Passo 2.

### Passo 2 — Registrar a pessoa (People Context)

```
POST /api/v1/people
Host: people-context:3000
Authorization: Bearer <token>
X-Actor-Id: user-sub-do-jwt

{
  "fullName": "Maria Silva Santos",
  "cpf": "52998224725",
  "birthDate": "1990-05-15"
}
```

**Resposta 201:**
```json
{
  "data": { "id": "a1b2c3d4-..." },
  "meta": { "timestamp": "..." }
}
```

**Idempotencia por CPF:** Se voce chamar novamente com o mesmo CPF, retorna 201 com o `id` existente (sem criar duplicata, sem publicar evento).

**Validacoes:**
- `fullName`: 1-200 caracteres, obrigatorio
- `cpf`: 11 digitos, checksum Mod 11 validado, opcional mas unico
- `birthDate`: formato YYYY-MM-DD, nao pode ser futuro

**Evento publicado (NATS):** `people.person.registered`
```json
{
  "metadata": { "eventId": "...", "occurredAt": "...", "schemaVersion": "1.0.0" },
  "actorId": "user-sub-do-jwt",
  "data": {
    "personId": "a1b2c3d4-...",
    "fullName": "Maria Silva Santos",
    "cpf": "52998224725",
    "birthDate": "1990-05-15"
  }
}
```

> **O que acontece nos bastidores:** O Social Care escuta esse evento via NATS.
> Se ja existir um paciente com o mesmo CPF (cadastrado antes da integracao),
> o Social Care vincula automaticamente o `personId` ao prontuario existente
> via `LinkPersonIdCommandHandler`. Isso e transparente para o frontend.

### Passo 3 — Atribuir role de paciente (People Context)

```
POST /api/v1/people/a1b2c3d4-.../roles
Host: people-context:3000
Authorization: Bearer <token>
X-Actor-Id: user-sub-do-jwt

{
  "system": "social-care",
  "role": "patient"
}
```

**Resposta 201:** Role criada (primeira vez)
```json
{
  "data": { "id": "role-uuid-..." },
  "meta": { "timestamp": "..." }
}
```

**Resposta 204:** Role ja existe e esta ativa (idempotente, sem erro).

### Passo 4 — Buscar lookup tables (Social Care)

Antes de criar o paciente, voce precisa dos IDs das lookup tables para preencher os campos obrigatorios:

```
GET /api/v1/dominios/dominio_parentesco
Host: social-care:3000
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "data": [
    { "id": "uuid-1", "codigo": "PR", "descricao": "Pessoa de Referencia", "ativo": true },
    { "id": "uuid-2", "codigo": "CONJUGE", "descricao": "Conjuge/Companheiro(a)", "ativo": true },
    { "id": "uuid-3", "codigo": "FILHO", "descricao": "Filho(a)", "ativo": true }
  ],
  "meta": { "timestamp": "..." }
}
```

**Tabelas de lookup disponiveis:**
- `dominio_parentesco` — tipos de parentesco (PR, CONJUGE, FILHO, etc.)
- `dominio_tipo_identidade` — tipos de identidade social (Indigena, Quilombola, etc.)
- `dominio_beneficios` — beneficios sociais (BPC, Bolsa Familia, etc.)
- `dominio_ocupacao` — ocupacoes profissionais
- `dominio_nivel_educacao` — niveis de escolaridade
- `dominio_tipo_deficiencia` — tipos de deficiencia

> **Dica:** Faca cache dessas tabelas no BFF. Elas mudam raramente.

### Passo 5 — Registrar o paciente (Social Care)

Agora sim, com o `personId` do People Context e o `prRelationshipId` da lookup table:

```
POST /api/v1/patients
Host: social-care:3000
Authorization: Bearer <token>
X-Actor-Id: user-sub-do-jwt

{
  "personId": "a1b2c3d4-...",
  "initialDiagnoses": [
    {
      "icdCode": "E70.0",
      "date": "2026-01-15",
      "description": "Fenilcetonuria classica"
    }
  ],
  "prRelationshipId": "uuid-do-lookup-PR",
  "personalData": {
    "firstName": "Maria",
    "lastName": "Silva Santos",
    "motherName": "Ana Santos",
    "nationality": "Brasileira",
    "sex": "F",
    "birthDate": "1990-05-15",
    "phone": "11999887766",
    "socialName": null
  },
  "civilDocuments": {
    "cpf": "52998224725",
    "nis": "12345678901",
    "rgDocument": {
      "number": "123456789",
      "issuingState": "SP",
      "issuingAgency": "SSP",
      "issueDate": "2010-03-20"
    },
    "cns": {
      "number": "123456789012345",
      "cpf": "52998224725",
      "qrCode": null
    }
  },
  "address": {
    "cep": "01001000",
    "isShelter": false,
    "isHomeless": false,
    "residenceLocation": "URBANA",
    "street": "Rua da Consolacao",
    "neighborhood": "Centro",
    "number": "100",
    "complement": "Apt 12",
    "state": "SP",
    "city": "Sao Paulo"
  },
  "socialIdentity": {
    "typeId": "uuid-do-lookup-tipo-identidade",
    "description": "Comunidade quilombola do Vale"
  }
}
```

**Resposta 201:**
```json
{
  "data": { "id": "patient-uuid-..." },
  "meta": { "timestamp": "..." }
}
```

**Campos obrigatorios:**
- `personId` — UUID valido, deve existir no People Context (validacao opcional, fail-open)
- `initialDiagnoses` — array de diagnosticos iniciais (ao menos 1)
- `prRelationshipId` — ID da lookup table `dominio_parentesco` (codigo "PR")

**Campos opcionais (mas recomendados):**
- `personalData` — dados pessoais completos
- `civilDocuments` — documentos civis (CPF, NIS, RG, CNS)
- `address` — endereco
- `socialIdentity` — identidade social (etnia, comunidade)

**Validacoes importantes:**
- `personId` nao pode estar duplicado (um Patient por Person)
- CPF nao pode estar duplicado entre pacientes
- IDs de lookup (`prRelationshipId`, `socialIdentity.typeId`) devem existir e estar ativos
- Se `PEOPLE_API_URL` estiver configurado, valida que o personId existe no People Context (fail-open: se o servico estiver fora, nao bloqueia)

### Passo 6 — Adicionar membros da familia (Social Care)

```
POST /api/v1/patients/patient-uuid-.../family-members
Host: social-care:3000
Authorization: Bearer <token>
X-Actor-Id: user-sub-do-jwt

{
  "memberPersonId": "outro-person-uuid",
  "relationship": "uuid-do-lookup-parentesco-CONJUGE",
  "isResiding": true,
  "isCaregiver": false,
  "hasDisability": false,
  "requiredDocuments": ["RG", "CPF"],
  "birthDate": "1988-03-22",
  "prRelationshipId": "uuid-do-lookup-parentesco-CONJUGE"
}
```

**Resposta 204:** No Content (sucesso)

> **Nota:** O `memberPersonId` e o `personId` do membro da familia no People Context.
> Antes de adicionar, o membro tambem precisa estar registrado la (Passos 1-2).

### Passo 7 — Preencher avaliacoes (Social Care)

As avaliacoes sao independentes entre si. Podem ser preenchidas em qualquer ordem.
Todas usam `PUT` (idempotente — sobrescreve o valor anterior).

#### 7.1 Condicao Habitacional

```
PUT /api/v1/patients/patient-uuid-.../housing-condition
Host: social-care:3000
Authorization: Bearer <token>
X-Actor-Id: user-sub-do-jwt

{
  "type": "ALVENARIA",
  "wallMaterial": "TIJOLO",
  "numberOfRooms": 5,
  "numberOfBedrooms": 2,
  "numberOfBathrooms": 1,
  "waterSupply": "REDE_PUBLICA",
  "hasPipedWater": true,
  "electricityAccess": "REDE_REGULAR",
  "sewageDisposal": "REDE_PUBLICA",
  "wasteCollection": "COLETA_REGULAR",
  "accessibilityLevel": "PARCIAL",
  "isInGeographicRiskArea": false,
  "hasDifficultAccess": false,
  "isInSocialConflictArea": false,
  "hasDiagnosticObservations": true
}
```

**Resposta 204**

#### 7.2 Situacao Socioeconomica

```
PUT /api/v1/patients/patient-uuid-.../socioeconomic-situation

{
  "totalFamilyIncome": 3200.00,
  "incomePerCapita": 800.00,
  "receivesSocialBenefit": true,
  "socialBenefits": ["uuid-beneficio-bpc", "uuid-beneficio-bolsa-familia"],
  "mainSourceOfIncome": "EMPREGO_FORMAL",
  "hasUnemployed": false
}
```

#### 7.3 Trabalho e Renda

```
PUT /api/v1/patients/patient-uuid-.../work-and-income

{
  "individualIncomes": [
    {
      "memberId": "family-member-uuid",
      "occupationId": "uuid-lookup-ocupacao",
      "hasWorkCard": true,
      "monthlyAmount": 1800.00
    }
  ],
  "socialBenefits": ["uuid-beneficio-bpc"],
  "hasRetiredMembers": false
}
```

#### 7.4 Situacao Educacional

```
PUT /api/v1/patients/patient-uuid-.../educational-status

{
  "memberProfiles": [
    {
      "memberId": "family-member-uuid",
      "canReadWrite": true,
      "attendsSchool": true,
      "educationLevelId": "uuid-lookup-nivel-educacao"
    }
  ],
  "programOccurrences": [
    {
      "memberId": "family-member-uuid",
      "date": "2026-03-15",
      "effectId": "uuid-efeito",
      "isSuspensionRequested": false
    }
  ]
}
```

#### 7.5 Situacao de Saude

```
PUT /api/v1/patients/patient-uuid-.../health-status

{
  "deficiencies": [
    {
      "memberId": "family-member-uuid",
      "deficiencyTypeId": "uuid-lookup-tipo-deficiencia",
      "needsConstantCare": true,
      "responsibleCaregiverName": "Ana Santos"
    }
  ],
  "gestatingMembers": [
    {
      "memberId": "family-member-uuid-gestante",
      "monthsGestation": 6,
      "startedPrenatalCare": true
    }
  ],
  "constantCareNeeds": ["Fisioterapia diaria", "Acompanhamento nutricional"],
  "foodInsecurity": "MODERADA"
}
```

> **Validacao cruzada:** Cada `memberId` em `gestatingMembers` deve existir como membro da familia do paciente. O backend valida isso.

#### 7.6 Rede de Apoio Comunitaria

```
PUT /api/v1/patients/patient-uuid-.../community-support-network

{
  "hasReligiousSupport": true,
  "hasNeighborhoodAssociation": false,
  "hasSocialAssistanceReference": true,
  "hasHealthServiceReference": true,
  "participatesInCommunityGroups": false,
  "hasFamilySupport": true,
  "observations": "Familia participa de grupo de apoio na UBS local"
}
```

#### 7.7 Resumo de Saude Social

```
PUT /api/v1/patients/patient-uuid-.../social-health-summary

{
  "requiresConstantCare": true,
  "hasMobilityImpairment": false,
  "functionalDependencies": ["Alimentacao assistida", "Medicacao continua"],
  "hasRelevantDrugTherapy": true
}
```

### Passo 8 — Informacoes de Acolhimento (Social Care)

```
PUT /api/v1/patients/patient-uuid-.../intake-info

{
  "ingressTypeId": "uuid-lookup-tipo-ingresso",
  "originName": "CRAS Centro",
  "originContact": "(11) 3333-4444",
  "serviceReason": "Encaminhamento para acompanhamento social por vulnerabilidade",
  "linkedSocialPrograms": [
    {
      "programId": "uuid-programa-social",
      "observation": "Beneficiaria desde 2024"
    }
  ]
}
```

### Passo 9 — Atendimentos (Social Care)

```
POST /api/v1/patients/patient-uuid-.../appointments

{
  "professionalId": "uuid-do-profissional",
  "summary": "Primeiro atendimento. Paciente apresenta quadro de vulnerabilidade...",
  "actionPlan": "1. Encaminhar para CRAS\n2. Agendar retorno em 15 dias",
  "type": "PRIMEIRO_ATENDIMENTO",
  "date": "2026-04-10"
}
```

**Resposta 201:**
```json
{
  "data": { "id": "appointment-uuid-..." },
  "meta": { "timestamp": "..." }
}
```

### Passo 10 — Protecao (Social Care)

#### 10.1 Encaminhamento (Referral)

```
POST /api/v1/patients/patient-uuid-.../referrals

{
  "referredPersonId": "person-uuid-do-encaminhado",
  "professionalId": "uuid-do-profissional",
  "destinationService": "CREAS Regional Sul",
  "reason": "Situacao de risco identificada durante visita domiciliar",
  "date": "2026-04-10"
}
```

**Resposta 201:** `{ "data": { "id": "referral-uuid" } }`

#### 10.2 Relato de Violacao de Direitos

```
POST /api/v1/patients/patient-uuid-.../violation-reports

{
  "victimId": "family-member-uuid-da-vitima",
  "violationType": "NEGLIGENCIA",
  "violationTypeId": "uuid-lookup-tipo-violacao",
  "reportDate": "2026-04-10",
  "incidentDate": "2026-04-08",
  "descriptionOfFact": "Descricao detalhada do ocorrido...",
  "actionsTaken": "Acionado Conselho Tutelar"
}
```

#### 10.3 Historico de Acolhimento Institucional

```
PUT /api/v1/patients/patient-uuid-.../placement-history

{
  "registries": [
    {
      "memberId": "family-member-uuid",
      "startDate": "2025-01-10",
      "endDate": "2025-06-15",
      "reason": "Acolhimento institucional por medida protetiva"
    }
  ],
  "collectiveSituations": {
    "homeLossReport": "Incendio em 2024",
    "thirdPartyGuardReport": null
  },
  "separationChecklist": {
    "adultInPrison": false,
    "adolescentInInternment": false
  }
}
```

---

## Consultas (Leitura)

### Buscar pacientes (Social Care)

```
GET /api/v1/patients?search=Maria&limit=20
Host: social-care:3000
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "data": [
    {
      "patientId": "patient-uuid",
      "personId": "person-uuid",
      "firstName": "Maria",
      "lastName": "Silva Santos",
      "fullName": "Maria Silva Santos",
      "primaryDiagnosis": "E70.0 - Fenilcetonuria classica",
      "memberCount": 4
    }
  ],
  "meta": {
    "timestamp": "...",
    "pageSize": 20,
    "totalCount": 1,
    "hasMore": false,
    "nextCursor": null
  }
}
```

### Buscar pessoas (People Context)

```
GET /api/v1/people?search=Maria&limit=20
Host: people-context:3000
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "person-uuid",
      "fullName": "Maria Silva Santos",
      "cpf": "52998224725",
      "birthDate": "1990-05-15"
    }
  ],
  "meta": {
    "timestamp": "...",
    "pageSize": 20,
    "totalCount": 1,
    "hasMore": false,
    "nextCursor": null
  }
}
```

### Obter prontuario completo (Social Care)

```
GET /api/v1/patients/patient-uuid
Host: social-care:3000
Authorization: Bearer <token>
```

Retorna o **agregado completo** com todos os dados:

```json
{
  "data": {
    "patientId": "patient-uuid",
    "personId": "person-uuid",
    "version": 12,
    "personalData": { "firstName": "...", "lastName": "...", ... },
    "civilDocuments": { "cpf": "...", "nis": "...", "rgDocument": {...}, "cns": {...} },
    "address": { "cep": "...", "street": "...", ... },
    "socialIdentity": { "typeId": "...", "description": "..." },
    "familyMembers": [
      {
        "id": "member-uuid",
        "personId": "person-uuid-do-membro",
        "relationship": "CONJUGE",
        "isResiding": true,
        "isCaregiver": false,
        "hasDisability": false,
        "birthDate": "1988-03-22"
      }
    ],
    "diagnoses": [
      { "icdCode": "E70.0", "date": "2026-01-15", "description": "Fenilcetonuria classica" }
    ],
    "housingCondition": { ... },
    "socioeconomicSituation": { ... },
    "workAndIncome": { ... },
    "educationalStatus": { ... },
    "healthStatus": { ... },
    "communitySupportNetwork": { ... },
    "socialHealthSummary": { ... },
    "placementHistory": { ... },
    "intakeInfo": { ... },
    "appointments": [ ... ],
    "referrals": [ ... ],
    "violationReports": [ ... ],
    "computedAnalytics": {
      "housing": { "density": 2.5, "isOvercrowded": false },
      "financial": {
        "totalWorkIncome": 3600.00,
        "perCapitaWorkIncome": 900.00,
        "totalGlobalIncome": 4800.00,
        "perCapitaGlobalIncome": 1200.00
      },
      "ageProfile": {
        "range_0_6": 0, "range_7_14": 1, "range_15_17": 0,
        "range_18_29": 0, "range_30_59": 2, "range_60_64": 0,
        "range_65_69": 0, "range_70_plus": 1, "totalMembers": 4
      },
      "educationalVulnerabilities": {
        "notInSchool": 0,
        "illiteracy": 0
      }
    }
  },
  "meta": { "timestamp": "..." }
}
```

> **Nota:** `computedAnalytics` e calculado em tempo real pelo backend a cada GET.
> Nao precisa ser preenchido manualmente.

### Buscar paciente por personId (Social Care)

Util quando voce tem o `personId` do People Context e quer saber se ja existe prontuario:

```
GET /api/v1/patients/by-person/person-uuid
Host: social-care:3000
Authorization: Bearer <token>
```

**200:** Retorna o prontuario completo (mesma estrutura acima).
**404:** Nao existe prontuario para essa pessoa.

### Consultar roles de uma pessoa (People Context)

```
GET /api/v1/people/person-uuid/roles?active=true
Host: people-context:3000
Authorization: Bearer <token>
```

**Resposta 200:**
```json
{
  "data": [
    {
      "id": "role-uuid",
      "personId": "person-uuid",
      "system": "social-care",
      "role": "patient",
      "active": true,
      "assignedAt": "2026-04-10T14:30:00Z"
    }
  ],
  "meta": { "timestamp": "..." }
}
```

### Buscar todos os pacientes no sistema (People Context)

```
GET /roles?system=social-care&role=patient&active=true
Host: people-context:3000
Authorization: Bearer <token>
```

Retorna todas as pessoas com role `patient` no sistema `social-care`, com dados basicos da pessoa incluidos.

---

## Diagrama de Sequencia — Fluxo Completo

```
Usuario (Browser)          BFF Deno              People Context         Social Care
    |                        |                        |                      |
    |  1. Buscar por CPF     |                        |                      |
    |----------------------->|                        |                      |
    |                        |  GET /people/by-cpf/X  |                      |
    |                        |----------------------->|                      |
    |                        |    200 ou 404           |                      |
    |                        |<-----------------------|                      |
    |                        |                        |                      |
    |  (se 404)              |                        |                      |
    |  2. Cadastrar pessoa   |                        |                      |
    |----------------------->|                        |                      |
    |                        | POST /people           |                      |
    |                        |----------------------->|                      |
    |                        |  201 { id: personId }  |                      |
    |                        |<-----------------------|                      |
    |                        |                        |                      |
    |                        |                        |--- NATS: people.person.registered -->
    |                        |                        |                      |
    |                        |                        |            (LinkPersonId se CPF match)
    |                        |                        |                      |
    |  3. Atribuir role      |                        |                      |
    |----------------------->|                        |                      |
    |                        | POST /people/{id}/roles|                      |
    |                        |----------------------->|                      |
    |                        |  201 ou 204            |                      |
    |                        |<-----------------------|                      |
    |                        |                        |                      |
    |  4. Buscar lookups     |                        |                      |
    |----------------------->|                        |                      |
    |                        |        GET /dominios/dominio_parentesco       |
    |                        |---------------------------------------------->|
    |                        |        200 [items]                            |
    |                        |<----------------------------------------------|
    |                        |                        |                      |
    |  5. Criar paciente     |                        |                      |
    |----------------------->|                        |                      |
    |                        |                POST /patients                 |
    |                        |---------------------------------------------->|
    |                        |                201 { id: patientId }          |
    |                        |<----------------------------------------------|
    |                        |                        |                      |
    |  6-10. Avaliacoes      |                        |                      |
    |----------------------->|                        |                      |
    |                        |     PUT /patients/{id}/housing-condition      |
    |                        |---------------------------------------------->|
    |                        |                204                            |
    |                        |<----------------------------------------------|
    |                        |                        |                      |
```

---

## Tabela Completa de Endpoints

### People Context — `http://people-context:3000`

| Metodo | Path | Role | Descricao |
|--------|------|------|-----------|
| GET | `/health` | — | Liveness probe |
| GET | `/ready` | — | Readiness probe |
| POST | `/api/v1/people` | social_worker, admin | Registrar pessoa |
| GET | `/api/v1/people` | social_worker, owner, admin | Listar pessoas (paginado) |
| GET | `/api/v1/people/:personId` | social_worker, owner, admin | Buscar pessoa por ID |
| GET | `/api/v1/people/by-cpf/:cpf` | social_worker, owner, admin | Buscar pessoa por CPF |
| PUT | `/api/v1/people/:personId` | social_worker, admin | Atualizar pessoa |
| POST | `/api/v1/people/:personId/roles` | social_worker, admin | Atribuir role |
| GET | `/api/v1/people/:personId/roles` | social_worker, owner, admin | Listar roles da pessoa |
| PUT | `/api/v1/people/:personId/roles/:roleId/deactivate` | admin | Desativar role |
| PUT | `/api/v1/people/:personId/roles/:roleId/reactivate` | admin | Reativar role |
| GET | `/roles` | social_worker, owner, admin | Buscar roles cross-people (requer `?system=`) |

### Social Care — `http://social-care:3000`

| Metodo | Path | Role | Descricao |
|--------|------|------|-----------|
| GET | `/health` | — | Liveness probe |
| GET | `/ready` | — | Readiness probe |
| **Registry** | | | |
| POST | `/api/v1/patients` | social_worker | Registrar paciente |
| GET | `/api/v1/patients` | sw, owner, admin | Listar pacientes (paginado) |
| GET | `/api/v1/patients/:patientId` | sw, owner, admin | Prontuario completo |
| GET | `/api/v1/patients/by-person/:personId` | sw, owner, admin | Prontuario por personId |
| GET | `/api/v1/patients/:patientId/audit-trail` | sw, owner, admin | Trilha de auditoria |
| POST | `/api/v1/patients/:patientId/family-members` | social_worker | Adicionar membro familiar |
| DELETE | `/api/v1/patients/:patientId/family-members/:memberId` | social_worker | Remover membro familiar |
| PUT | `/api/v1/patients/:patientId/primary-caregiver` | social_worker | Definir cuidador principal |
| PUT | `/api/v1/patients/:patientId/social-identity` | social_worker | Atualizar identidade social |
| **Assessment** | | | |
| PUT | `/api/v1/patients/:patientId/housing-condition` | social_worker | Condicao habitacional |
| PUT | `/api/v1/patients/:patientId/socioeconomic-situation` | social_worker | Situacao socioeconomica |
| PUT | `/api/v1/patients/:patientId/work-and-income` | social_worker | Trabalho e renda |
| PUT | `/api/v1/patients/:patientId/educational-status` | social_worker | Situacao educacional |
| PUT | `/api/v1/patients/:patientId/health-status` | social_worker | Situacao de saude |
| PUT | `/api/v1/patients/:patientId/community-support-network` | social_worker | Rede de apoio |
| PUT | `/api/v1/patients/:patientId/social-health-summary` | social_worker | Resumo saude social |
| **Care** | | | |
| POST | `/api/v1/patients/:patientId/appointments` | social_worker | Registrar atendimento |
| PUT | `/api/v1/patients/:patientId/intake-info` | social_worker | Info de acolhimento |
| **Protection** | | | |
| PUT | `/api/v1/patients/:patientId/placement-history` | social_worker | Historico de acolhimento |
| POST | `/api/v1/patients/:patientId/violation-reports` | social_worker | Relatar violacao de direitos |
| POST | `/api/v1/patients/:patientId/referrals` | social_worker | Criar encaminhamento |
| **Lookup** | | | |
| GET | `/api/v1/dominios/:tableName` | sw, owner, admin | Listar itens de lookup |
| GET | `/api/v1/dominios/requests` | sw, owner, admin | Listar solicitacoes de lookup |
| POST | `/api/v1/dominios/requests` | social_worker, admin | Solicitar novo item |
| PUT | `/api/v1/dominios/requests/:requestId/approve` | admin | Aprovar solicitacao |
| PUT | `/api/v1/dominios/requests/:requestId/reject` | admin | Rejeitar solicitacao |
| POST | `/api/v1/dominios/:tableName` | admin | Criar item de lookup |
| PUT | `/api/v1/dominios/:tableName/:itemId` | admin | Atualizar item de lookup |
| PATCH | `/api/v1/dominios/:tableName/:itemId/toggle` | admin | Ativar/desativar item |

---

## Codigos de Erro

### People Context

| Codigo | HTTP | Significado |
|--------|------|-------------|
| AUTH-001 | 401 | Token ausente ou invalido |
| AUTH-002 | 403 | Role insuficiente |
| AUTH-003 | 400 | X-Actor-Id ausente |
| PEO-001 | 400 | Validacao de pessoa (nome, CPF, data) |
| PEO-002 | 404 | Pessoa nao encontrada |
| PEO-003 | 400 | PersonId invalido (nao e UUID) |
| PEO-004 | 400 | CPF invalido (formato ou checksum) |
| ROL-001 | 400 | Validacao de role (system/role vazios) |
| ROL-002 | 404 | Role ativa nao encontrada |
| ROL-003 | 404 | Role inativa nao encontrada |
| ROL-004 | 400 | Parametro `system` ausente na query |
| ROL-005 | 400 | UUID invalido |

### Social Care

| Prefixo | Contexto |
|---------|----------|
| PAT-* | Patient (registro, familia) |
| SES-* | Situacao socioeconomica |
| DIA-* | Diagnostico |
| HTTP-422 | Violacao de regra de negocio |
| SYS-500 | Erro interno |

---

## URLs por Ambiente

| Servico | Dev Local | HML | Producao |
|---------|-----------|-----|----------|
| People Context | `http://localhost:3000` | `https://people-hml.acdgbrasil.com.br` | `https://people.acdgbrasil.com.br` |
| Social Care | `http://localhost:8080` | `https://social-care-hml.acdgbrasil.com.br` | `https://social-care.acdgbrasil.com.br` |
| Zitadel (OIDC) | `https://auth.acdgbrasil.com.br` | (compartilhado) | (compartilhado) |
| BFF Deno | `https://localhost` (Caddy) | `https://conecta-hml.acdgbrasil.com.br` | `https://conecta.acdgbrasil.com.br` |

No BFF Deno (`.env`):
```env
API_BASE_URL=http://social-care:3000          # intra-cluster
PEOPLE_CONTEXT_BASE_URL=http://people-context:3000  # intra-cluster
```

---

## Eventos NATS (referencia)

O frontend nao interage diretamente com NATS, mas e util saber o que acontece nos bastidores:

### People Context publica:

| Evento | Quando |
|--------|--------|
| `people.person.registered` | POST /people (primeira vez) |
| `people.person.updated` | PUT /people/:id |
| `people.role.assigned` | POST /people/:id/roles |
| `people.role.deactivated` | PUT .../deactivate |
| `people.role.reactivated` | PUT .../reactivate |

### Social Care consome:

| Evento | Acao |
|--------|------|
| `people.person.registered` | Vincula personId ao paciente existente (por CPF) |

### Social Care publica:

| Evento | Quando |
|--------|--------|
| `social-care.patient.created` | POST /patients |
| `social-care.family-member.added` | POST .../family-members |
| `social-care.family-member.removed` | DELETE .../family-members/:id |
| + 12 outros eventos | Cada mutacao gera evento |

---

## Dicas para o BFF

1. **Sempre buscar por CPF primeiro** antes de criar uma pessoa. A API e idempotente por CPF, mas e mais limpo verificar antes.

2. **Cache as lookup tables.** Elas mudam muito raramente. Invalide o cache quando um admin criar/atualizar item.

3. **O `personId` e o elo.** Guarde-o apos criar a pessoa. Voce vai usa-lo em todas as chamadas subsequentes.

4. **Avaliacoes sao PUT (idempotentes).** Pode chamar quantas vezes quiser — sempre sobrescreve o valor anterior.

5. **Atendimentos e protecao sao POST (criam recursos).** Cada chamada cria um novo registro.

6. **`computedAnalytics` e somente leitura.** Calculado pelo backend no GET. Nao tente enviar esses dados.

7. **Validacoes cruzadas existem.** O backend valida que `memberId` referenciados em avaliacoes existem como membros da familia do paciente. Adicione os membros antes de preencher avaliacoes que os referenciam.

8. **Fail-open na validacao de personId.** Se o People Context estiver fora do ar, o Social Care aceita o registro mesmo assim. Nao dependa dessa validacao para UX.
