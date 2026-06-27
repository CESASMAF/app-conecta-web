# QA — people-context

Documentação de testes do serviço `people-context` (registro central de identidade do ecossistema ACDG), produzida sob a persona de **especialista de QA** das ACDG Agent Skills. Toda recomendação metodológica está ancorada em citação literal dos livros canônicos de `skills_base/shared-references/` (Vocke, Gregory & Crispin, Gherkin Reference), conforme a regra inviolável do workspace de skills. Estrutura espelhada em `social-care/docs/qa/`.

## Índice

| Documento | Conteúdo |
|---|---|
| [00-plano-de-testes.md](00-plano-de-testes.md) | Estratégia geral: pirâmide de testes aplicada ao people-context, quadrantes ágeis, testes exploratórios, ambientes e critérios de saída |
| [01-casos-pessoas.md](01-casos-pessoas.md) | Cenários Gherkin de **Pessoas**: cadastro com dedup por CPF, provisionamento de login no IdP (Authentik), consulta, atualização, desativação/reativação e reset de senha |
| [02-casos-roles.md](02-casos-roles.md) | Cenários Gherkin de **System Roles**: atribuição com regras compostas de autorização, ciclo de vida da role, query cross-pessoa e sincronização com grupos do Authentik |
| [03-casos-seguranca-rbac.md](03-casos-seguranca-rbac.md) | Matriz RBAC completa, JWT/JWKS, header `X-Actor-Id`, e os invariantes de AppSec (LGPD: CPF fora de eventos; recovery link fora do HTTP) |
| [04-casos-eventos-saude.md](04-casos-eventos-saude.md) | Cenários do **Transactional Outbox** (9 eventos NATS), envelope de evento e probes `/health`/`/ready` |
| [05-fluxo-frontend.md](05-fluxo-frontend.md) | **Guia de integração para o frontend**: telas do console de identidade, contratos por endpoint, tratamento de erros (incluindo 207 e 502), e o fluxo de triagem compartilhado com o social-care |

## Como ler os cenários

Os casos usam Gherkin (`Funcionalidade` / `Cenário` / `Dado` / `Quando` / `Então`). Cada cenário referencia:

- **Endpoint**: método + path real (ex.: `POST /api/v1/people`).
- **Código de erro esperado**: catálogo do serviço (`PEO-*`, `ROL-*`, `AUTH-*`, `IDP-*`).
- **Status HTTP esperado**: mapeado pelos handlers/middleware de erro.

Fontes de verdade no código:

- Rotas e roles: `src/routes/{people,roles,health}.ts`
- Validações de domínio: `src/domain/{person,system-role}.ts`
- Auth: `src/middleware/{jwt,auth}.ts`
- IdP (Authentik): `src/idp/client.ts` + `src/application/idp-sync.ts`
- Eventos: `src/events/{publisher,outbox-relay}.ts`
- Migrations/schema: `src/repository/migrations.ts`
