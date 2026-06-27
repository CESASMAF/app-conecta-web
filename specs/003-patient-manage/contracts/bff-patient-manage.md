# Contrato BFF — Gestão de Pacientes (downstream: browser ↔ BFF)

Rotas que o **BFF (Elysia)** expõe ao client (via **Eden**, tipadas com `Elysia.t`). O browser fala **só** com estas. **Princípio (ADR-0010, adendo 2026-06-25 — facade view-ready):** o BFF compõe a resposta **inteira** que cada tela precisa (fan-out cross-service + merge + **domínio→rótulo resolvido no servidor** + ações/transições disponíveis); o client recebe **pronto** e só gerencia estado de UI. Toda mutação: (1) exige sessão (guard 001) → 401; (2) passa pelo guard **CSRF** (`X-Requested-With` + `Origin`) → 403; (3) **valida o corpo com `Elysia.t` antes** do upstream → 400; (4) injeta `Authorization: Bearer <accessToken>` outbound (ator do `JWT.sub` — **nenhum** header de ator); (5) mapeia erro upstream → tag semântica (ver [upstream-social-care-write.md](./upstream-social-care-write.md) e research D4). Erro: `{ error: { code, message } }` — client decide por **tag**.

**Convenção de retorno (facade):**
- Criação → **201** `{ data: <PatientOverview view-ready>, meta }`.
- Demais mutações → **200** `{ data: <fragmento view-ready recomposto>, meta }` — **nunca `204`** (ADR-0010 §3). O client troca o estado com o retorno, **sem refetch**.

---

## Leitura composta (screen-shaped)

### GET /api/patients/:patientId/overview — visão do paciente (view-ready)

Substitui/enriquece o detalhe-stub da 002. O BFF **compõe** numa só resposta tudo o que a tela de paciente mostra — hoje a partir do `social-care` (e, quando entrarem, `people-context` para a identidade da pessoa e `analysis-bi` para indicadores), mesclando e **resolvendo os códigos de domínio em rótulos**.

**200** — envelope com o agregado view-ready:
```jsonc
{
  "data": {
    "patientId": "uuid",
    "fullName": "…",
    "status": "ACTIVE",
    "statusLabel": "Em atendimento",
    "availableTransitions": [ { "action": "discharge", "label": "Dar alta", "requiresReason": true } ],
    "socialIdentity": { "typeId": "…", "typeLabel": "Indígena (em aldeia)", "description": "…|null" },
    "family": {
      "members": [
        { "memberPersonId": "uuid", "fullName": "…", "relationshipLabel": "Mãe",
          "isResiding": true, "isCaregiver": true, "isPrimaryCaregiver": true }
      ],
      "primaryCaregiverId": "uuid|null"
    }
    // ganchos futuros: person (people-context), indicators (analysis-bi) — mesclados aqui, não no client
  },
  "meta": { "timestamp": "ISO", "partial": false }
}
```
> **Degradação parcial no BFF**: se uma origem secundária (ex.: futura identidade do `people-context`) estiver fora, o BFF devolve o que tem com `meta.partial: true` e omite só a seção indisponível — a tela não quebra (constante). **Erros**: 401/403/404 (paciente)/500 como nas demais.

### GET /api/patients/new/form-context — contexto do cadastro (view-ready)

O BFF entrega, numa resposta, **os catálogos que o formulário de cadastro precisa** (parentesco, tipo de identidade, localização de residência…), já filtrados (ativos, ordenados) — o client não orquestra múltiplos catálogos. (Internamente reusa o acesso a domínios da 002; a composição/seleção é do BFF.)

**200** `{ data: { relationships: [...], identityTypes: [...], residenceLocations: [...] }, meta }`.

---

## Mutações (devolvem view-state recomposto)

### POST /api/patients — registrar paciente (US1)

**Body** (`Elysia.t`): `personId`, `initialDiagnoses[≥1]`, `personalData?`, `civilDocuments?`, `address?`, `socialIdentity?`, `prRelationshipId`.

- **201** `{ data: <PatientOverview>, meta }` — paciente criado (`WAITLISTED`), já recomposto pelo BFF (relê o agregado + resolve rótulos) → a tela navega direto ao overview sem novo GET.
- **400** validação BFF (sem tocar upstream) · **409** conflito (REGP-001/030) · **422** validação/pessoa inexistente (REGP-002..029) · **503** people-context fora (REGP-031) · **401/403/500**.

### POST /api/patients/:patientId/admit — admitir (US2)

Sem corpo. Pré: `WAITLISTED`.
- **200** `{ data: { patientId, status, statusLabel, availableTransitions }, meta }` — cabeçalho recomposto (situação `ACTIVE` + novas transições).
- **404** (ADM-001) · **409** (já ativo ADM-002; desligado→readmit ADM-003) · **400** (ADM-004).

### POST /api/patients/:patientId/discharge — dar alta (US2)

**Body**: `{ reason, notes? }` — `notes` obrigatório se `reason='other'` (validado no BFF).
- **200** — cabeçalho recomposto (`DISCHARGED` + transições).
- **400** (DISC-002/003/005/006) · **404** (DISC-004) · **409** (DISC-001/007).

### POST /api/patients/:patientId/readmit — readmitir (US2)

**Body**: `{ notes? }` (≤1000). Pré: `DISCHARGED`.
- **200** — cabeçalho recomposto (`ACTIVE` + transições).
- **404** (READM-002) · **409** (READM-001/005) · **400** (READM-003/004).

### POST /api/patients/:patientId/withdraw — retirar da fila (US2)

**Body**: `{ reason, notes? }` — `notes` obrigatório se `reason='other'`. Pré: `WAITLISTED`.
- **200** — cabeçalho recomposto (saída da fila + transições).
- **400** (WDR-004/005/006/007) · **404** (WDR-001) · **409** (WDR-002/003).

### POST /api/patients/:patientId/family-members — adicionar membro (US3)

**Body**: `{ memberPersonId, relationship, isResiding, isCaregiver, hasDisability, requiredDocuments[], birthDate, prRelationshipId }`.
- **200** `{ data: <Family view-ready: members[] com relationshipLabel + primaryCaregiverId>, meta }` — núcleo familiar recomposto.
- **404** (APP-007) · **409** (já existe APP-008; não ativo APP-010) · **422** (lookup APP-009; documento APP-011).

### DELETE /api/patients/:patientId/family-members/:memberId — remover membro (US3)

Sem corpo.
- **200** — `Family` recomposto (sem o membro).
- **404** (RFM-001/002) · **400** (RFM-003) · **409** (RFM-005).

### PUT /api/patients/:patientId/primary-caregiver — cuidador principal (US3)

**Body**: `{ memberPersonId }`.
- **200** — `Family` recomposto (novo `primaryCaregiverId` + flags).
- **404** (APC-001/002) · **400** (APC-003) · **409** (APC-005).

### PUT /api/patients/:patientId/social-identity — atualizar identidade social (US4)

**Body**: `{ typeId, description? }` — `description` exigida quando o tipo requer.
- **200** `{ data: { typeId, typeLabel, description }, meta }` — identidade recomposta **com o rótulo resolvido**.
- **404** (USIA-001) · **400** (USIA-002) · **422** (USIA-003/004/006/007) · **409** (USIA-008).

## Invariantes

- Browser **nunca** recebe token, URL do `social-care`, header de ator, código de domínio cru não-resolvido onde a tela mostra texto, nem `error` cru do upstream com stack.
- **Composição no BFF**: o client nunca faz fan-out cross-service nem resolve código→rótulo de exibição (ADR-0010 + adendo). Cache de domínio do client = **só** para popular selects (input).
- Toda mutação passa pelo CSRF guard; o BFF **não** envia `X-Actor-Id` (ator do `JWT.sub`, ADR-023).
- Validação de corpo no BFF (`Elysia.t`) **antes** do upstream (entrada inválida não consome o backend — SC-002).
- **Mutação devolve view-state recomposto** (ADR-0010 §3) — o client troca estado sem refetch; quem releu/recompôs foi o servidor (Princ. VI, sem dado fabricado).
- Nada de PII de paciente/membro em logs (FR-015/SC-006).
