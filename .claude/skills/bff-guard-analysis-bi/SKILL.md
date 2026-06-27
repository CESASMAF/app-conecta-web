---
name: "bff-guard-analysis-bi"
description: "A camada de defesa do BFF para o analysis-bi — validar iss/aud e enforçar role (analyst/exporter) ANTES de encaminhar, porque o backend pode rodar sem auth (HIGH-001/002/003). Use em toda rota do BFF que fala com o analysis-bi."
user-invocable: true
---

# Defesa do BFF para o analysis-bi

O `analysis-bi` pode estar configurado **sem** validação de `iss`/`aud` e **sem** RBAC efetivo (gaps HIGH-001/002/003 em `handbook/bff-backend-surface.md`). Portanto o **BFF é a autoridade de acesso**. Toda rota que encaminha ao analysis-bi executa esta defesa **antes** de chamar o `AnalysisBiClient`.

## Defesa (ordem)
1. **Sessão válida** (guard 001) → 401 se ausente.
2. **Validar o token de acesso** que será encaminhado: `iss == <Authentik esperado>` e `aud` esperado. Divergiu → **401 no BFF**, não encaminha. (Não confie no backend para isso.)
3. **Enforçar role no BFF**, por endpoint:
   - `GET /api/v1/indicators/*` → exige `analyst` (aceita `analysis-bi:analyst`, `admin`, `superadmin`).
   - `GET /api/v1/export/*` → exige `exporter` (aceita `analysis-bi:exporter`, `admin`, `superadmin`).
   - `GET /api/v1/metadata/*` → qualquer autenticado.
   - Sem a role → **403 no BFF**, **sem** tocar o upstream.
4. **Sempre injetar `Authorization: Bearer`** outbound. Nunca encaminhar sem token.
5. Erros do upstream (401/403/503) → traduza para mensagem de negócio; nunca proxie erro cru.

## Implementação
- Um helper reutilizável (ex.: `src/server/guards/analysis-bi-access.ts`) que recebe a sessão + o tipo de recurso e devolve `Result<void, AppError('forbidden'|'unauthorized')>`. As rotas `*.query.fn.ts` chamam-no no topo.
- Roles vêm da sessão (claim `groups`). Reuse o parser de roles do `social-care`/`people-context` se já existir; senão, peça ao `bff-foundation` um util compartilhado.

## Testes de segurança (obrigatórios — via `bff-contract-tester`)
- Sem role `analyst` → `GET /indicators/*` → **403 sem chamar o stub**.
- Sem role `exporter` → `GET /export/*` → **403**.
- `iss`/`aud` inválido → **401 sem encaminhar**.
- Toda chamada encaminhada carrega `Bearer`.
- Dados retornados são os anonimizados do backend (K-anonymity); o BFF nunca tenta des-anonimizar nem loga PII (não há PII aqui, mas garanta).

## Checklist
- [ ] Nenhuma rota do analysis-bi encaminha sem passar pela defesa.
- [ ] Role enforçada no BFF (não confiando no upstream).
- [ ] iss/aud validados no BFF.
- [ ] Bearer sempre presente outbound.
