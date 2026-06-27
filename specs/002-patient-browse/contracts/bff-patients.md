# Contrato BFF — Pacientes (downstream: browser ↔ BFF)

Rotas que o **BFF (Elysia)** expõe ao client (consumidas via **Eden**, tipadas com `Elysia.t`). O browser fala **só** com estas. Toda rota exige sessão válida (guard da feature 001); o BFF injeta o Bearer outbound (ver [upstream-social-care.md](./upstream-social-care.md)).

## GET /api/patients

Lista paginada de resumos de paciente.

**Query params** (TypeBox):
- `search?: string` — busca por nome (substring).
- `status?: PatientStatus` — `ACTIVE|DISCHARGED|WITHDRAWN|WAITLISTED|ADMITTED`.
- `limit?: integer` — **1–100**, default 20. Fora da faixa → **400** (entrada inválida, sem tocar o upstream).
- `cursor?: string` — opaco (de `meta.nextCursor`).

**200** — envelope padrão:
```jsonc
{
  "data": [
    { "patientId": "uuid", "fullName": "…", "primaryDiagnosis": "…|null", "memberCount": 0, "status": "ACTIVE" }
  ],
  "meta": { "pageSize": 20, "totalCount": 25, "hasMore": true, "nextCursor": "…|null", "timestamp": "ISO" }
}
```

**Erros** (corpo `{ error: { code, message } }`; o client mapeia por tag — ver D4):
- `400` — `limit`/params inválidos (bug de cliente).
- `401` — sem sessão / sessão expirada → client refaz login.
- `403` — papel sem permissão de leitura (sem role) → toast "sem permissão".
- `503` — dependência upstream fora → preservar estado + "tentar novamente".
- `500` — interno → mensagem genérica + correlação.

**Aceite**: REG-010 (default ≤20 + meta completo), REG-011 (cursor → `hasMore=false` no fim), REG-012 (limit 1/100 ok; 0/101 → 400), REG-013 (search+status).

## GET /api/patients/:patientId

Confirma existência do paciente (alimenta o **detalhe-stub**; o prontuário completo é a feature 003).

**200** — envelope padrão com o mínimo para o stub:
```jsonc
{ "data": { "patientId": "uuid", "fullName": "…", "status": "ACTIVE" }, "meta": { "timestamp": "ISO" } }
```
> Nesta feature o BFF devolve só o essencial para o stub (existência + cabeçalho). O agregado completo (`personalData`, `diagnoses`, as 7 avaliações, `computedAnalytics`, …) entra na feature 003.

**Erros**:
- `404` — paciente inexistente → client volta à lista com aviso. **(REG-014)**
- `401`/`403`/`500` — como acima.

## Invariantes

- Browser **nunca** recebe token, URL do `social-care` nem `error` cru do upstream com stack.
- Resposta sempre no envelope `{ data, meta }` (Princ. I/V).
- Nada de PII de paciente em logs do BFF (FR-015).
