# Quickstart — Validação (002-patient-browse)

Guia executável que prova a feature ponta a ponta. Não contém implementação — só pré-requisitos, comandos e resultado esperado. Detalhes em [data-model.md](./data-model.md) e [contracts/](./contracts/).

## Pré-requisitos

- Feature 001 (sessão + shell) funcionando.
- `bun install` ok; `SOCIAL_CARE_URL` definido (em DEV apontando ao `social-care`; nos testes, ao stub).

## Gates locais (sem o social-care de pé)

```bash
bunx tsc --noEmit          # type-safety ponta a ponta (Eden/TypeBox)
bun test                   # governança + contract (BFF vs stub) + ViewModels puros
bun audit --audit-level=high
bun run build              # bundle Nitro; v-e compilado
```

Esperado:
- `tsc` limpo; `bun test` verde incluindo:
  - **Governança**: boundaries (patients/domains só via public-api), núcleo agnóstico (data/view-model sem `@solidjs/*`), no-mocks-in-src (stub só em `tests/`), no-secret-leak.
  - **Contract (BFF ↔ stub upstream)**: `patients-list` (paginação default ≤20 + meta; cursor → `hasMore=false`; `limit` 0/101 → 400; `search`+`status`; Bearer encaminhado; envelope `{data,meta}`), `patient-get` (200 + 404), `domains-get` (itens ativos ordenados por `codigo`; tabela fora da allowlist → 400 `LKP-001` sem tocar o upstream).
  - **ViewModel puro**: `patient-list.view-model` (merge de páginas, `isEmpty`, `isExhausted`), `domain-cache` (dedup na sessão).

## Smoke SSR (render real, build) — sem PII em log

Subir `.output/server` (como na feature 001, com Redis efêmero + sessão plantada) apontando `SOCIAL_CARE_URL` ao **stub** e verificar:
- `/patients` (com sessão) → **200**, renderiza a lista do stub (linhas com nome/diagnóstico/membros/situação), barra de busca e filtro de situação; estado vazio quando o stub devolve lista vazia.
- `/patients` **sem** sessão → **302 → /login** (guard 001).
- `/patients/:id` inexistente → volta à lista com aviso; existente → stub do prontuário ("em construção — feature 003").
- **Leak/LGPD**: `.output/public` sem `SOCIAL_CARE_URL`/token/`jose`/redis; logs do servidor sem nome/diagnóstico de paciente.

## Aceite em DEV (contra o social-care real)

Os Gherkin são o aceite (rodam contra o serviço com Postgres do compose):
- Registry: **REG-010, REG-011, REG-012, REG-013, REG-014** (`01-casos-registry.md`).
- Configuration/RBAC: **LKP-T001, LKP-T002** + **matriz RBAC** (leituras de patients e dominios: worker/owner/admin ✅; sem role → 403) (`04-casos-lookup-rbac.md`).

Critério de encerramento do incremento: os cenários acima passam contra o `social-care` em DEV; gates locais verdes; smoke SSR ok.

## Mapeamento Success Criteria → verificação

| SC | Como verificar |
|---|---|
| SC-001 | Smoke: login → `/patients` → abrir um paciente (≤3 ações) |
| SC-002 | Contract `patients-list` (cursor/`hasMore`, sem duplicado) + smoke scroll |
| SC-003 | Contract `patients-list` (search/status) + REG-013 |
| SC-004 | Governança: grep de opções hardcoded; tudo vem de `domains-get` |
| SC-005 | Contract/RBAC: sem role → 403 → tag `forbidden` (toast), nunca dado |
| SC-006 | Smoke leak-check (`.output/public` + logs) |
| SC-007 | Sessão expira → `refreshIfNeeded` renova; senão → login preservando destino |
