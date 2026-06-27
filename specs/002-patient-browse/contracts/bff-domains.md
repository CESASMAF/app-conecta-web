# Contrato BFF — Catálogos de domínio (downstream: browser ↔ BFF)

Rota que o BFF expõe ao client para os catálogos de referência (selects das features futuras). Exige sessão válida; a **allowlist das 13 tabelas é enforçada no BFF** (defesa contra `tableName` arbitrário — proteção a la SQL-injection que o backend também faz, LKP-001).

## GET /api/domains/:tableName

**Path param**: `tableName` ∈ allowlist (13 tabelas — ver [data-model.md](../data-model.md#domaintable-allowlist--13)).

**200** — envelope padrão:
```jsonc
{
  "data": [
    { "id": "…", "codigo": "BPC", "descricao": "Benefício de Prestação Continuada" }
  ],
  "meta": { "timestamp": "ISO" }
}
```
- Somente itens `ativo=true`, **ordenados por `codigo`** (LKP-T001).

**Erros**:
- `400` — `tableName` fora da allowlist → `error.code` derivado de `LKP-001` (tag `bad-request`). **(LKP-T002)** — o BFF rejeita **antes** de chamar o upstream.
- `401` — sem sessão.
- `403` — sem papel autorizado (matriz RBAC: leitura de domínios exige worker/owner/admin).
- `503`/`500` — dependência/intero.

## Cache (client)

- O client cacheia por **sessão** (chave = `tableName`) via `query` do Solid (dedup). Um 2º pedido na sessão não recarrega da origem (Acceptance US4-2).
- Nunca hardcodar opções (FR-008): toda opção vem desta rota.

## Invariantes

- A allowlist é a **única** porta para `tableName`; qualquer valor fora dela é 400, sem repasse ao upstream.
- Envelope `{ data, meta }`; sem vazamento de detalhe técnico ao client.
