# Plano de Testes — people-context

> Persona: especialista de QA (ACDG Agent Skills). Metodologia ancorada nos livros canônicos de `skills_base/shared-references/tdd/` e `requirements/`.

## 1. Fundamentação canônica

### 1.1 Pirâmide de testes

> "If you want to get serious about automated tests for your software there
> is one key concept you should know about: the **test pyramid**. Mike
> Cohn came up with this concept in his book *Succeeding with Agile*.
> It's a great visual metaphor telling you to think about different layers
> of testing. It also tells you how much testing to do on each layer."
> — *(Linha 67, p. ?, Ham Vocke, *The Practical Test Pyramid (martinfowler.com)*)*

Aplicação ao people-context:

| Camada | O que já existe | O que este plano adiciona |
|---|---|---|
| **Unidade** (base, maior volume) | `tests/domain/` (CPF, birthDate, fullName, email, system/role), `tests/middleware/`, `tests/idp/`, `tests/events/` — `bun test` com gate de ≥95% no CI, padrão de fakes sem mocks pesados | Nada a adicionar — manter o gate |
| **Integração/Serviço** (meio) | `tests/routes/` (people, roles) com fakes | Casos de API documentados nos arquivos `01`–`04` (Gherkin), executáveis contra o serviço rodando com Postgres do `docker-compose` e Authentik de DEV |
| **E2E/UI** (topo, menor volume) | — | Fluxos de jornada do `05-fluxo-frontend.md` (console de identidade + triagem integrada com social-care) |

Consequência prática: as validações de formato (dígito verificador de CPF, regex de data/e-mail) já têm cobertura de unidade — os cenários de API abaixo as exercitam **uma vez cada** para validar o mapeamento HTTP (status + código de erro), não exaustivamente. O que a camada de API precisa cobrir de verdade aqui é o que a unidade não alcança: **integração com o IdP** (Authentik), **outbox → NATS** e as **regras compostas de autorização** de roles.

### 1.2 Quadrantes ágeis

> "The agile testing quadrants model helps teams think through test-
> ing activities that are needed to give confidence to the product they
> are building. It also helps to build a common testing language with
> the team and with the organization if used to help communicate
> across teams. Janet's favorite thing about this model is that it not
> only represents a holistic view into testing but also makes the whole"
> — *(Linha 1693, p. ?, Janet Gregory, Lisa Crispin, *Agile Testing Condensed*)*

| Quadrante | Atividade neste projeto |
|---|---|
| Q1 — tecnologia, suporte ao time | Testes `bun test` existentes (domain/routes/middleware/idp/events, gate 95%) |
| Q2 — negócio, suporte ao time | Cenários Gherkin dos arquivos `01`–`04` — critérios de aceite das telas do console de identidade |
| Q3 — negócio, crítica ao produto | Sessões exploratórias (seção 3); validação do fluxo de reset de senha de ponta a ponta (e-mail PT-BR via queue-manager) |
| Q4 — tecnologia, crítica ao produto | Segurança (RBAC composto, invariantes LGPD — arquivo `03`), resiliência (Authentik fora → 502/207; NATS fora → outbox acumula — arquivo `04`) |

### 1.3 Testes exploratórios

> "Include Exploratory Testing in your testing portfolio. It is a manual testing approach that emphasises the tester's freedom and creativity to spot quality issues in a running system. Simply take some time on a regular schedule, roll up your sleeves and try to break your application. Use a destructive mindset and come up with ways to provoke issues and errors in your application. Document everything you find for later. Watch out for bugs, design issues, slow response times, missing or misleading error messages and everything else that would annoy you as a user of your software."
> — *(Linha 957, p. ?, Ham Vocke, *The Practical Test Pyramid (martinfowler.com)*)*

Sessões exploratórias sugeridas (charters de ~60 min, registrar achados em issue):

1. **Charter "identidade hostil"** — nomes com 200 caracteres exatos/201, caracteres não-latinos e emoji em `fullName`, e-mails limítrofes, CPFs válidos raros (terminados em 0), `birthDate` 29/02 em ano não-bissexto.
2. **Charter "IdP degradado"** — derrubar/atrasar o Authentik de DEV e percorrer criação com `createLogin=true` (esperar 207), deactivate (esperar 502 **sem** mudança no DB — ordem IdP-primeiro), reset de senha (esperar 502).
3. **Charter "corrida de roles"** — duas sessões admin atribuindo/desativando a mesma role simultaneamente; procurar `ROL-009` e estados inconsistentes entre DB e grupo do Authentik.
4. **Charter "mensagens de erro"** — provocar cada família (`PEO-*`, `ROL-*`, `AUTH-*`, `IDP-*`) e avaliar se `error.message` é acionável; conferir que **nenhuma** mensagem vaza detalhes internos do Authentik (AppSec HIGH-7).

## 2. Escopo e ambientes

- **Sob teste**: API HTTP do `people-context` (15 endpoints: 8 pessoas, 5 roles, 2 health) atrás de JWT OIDC + relay de eventos NATS.
- **Ambiente local**: `docker compose up postgres -d` + `cp .env.example .env` + `bun run dev` (porta 3000). Authentik de DEV para os fluxos de IdP (`AUTHENTIK_URL`/`AUTHENTIK_TOKEN` — ambos ou nenhum, AppSec HIGH-10).
- **Dependências externas a simular indisponíveis**: Authentik (casos 207/502) e NATS (outbox acumulando, `/ready` com warning).
- **Fora de escopo deste plano**: carga, migração de dados Zitadel→Authentik.

## 3. Dados de teste

| Massa | Valor |
|---|---|
| CPF válido | `52998224725` (dígitos verificadores corretos) |
| CPF inválido (checksum) | `12345678900` |
| CPF inválido (repetido) | `11111111111` |
| CPF malformado | `123`, `123abc456de` |
| birthDate inválida | `1990/05/15`, `15-05-1990`, data futura, `2026-02-30` |
| fullName limite | 200 caracteres (aceita) / 201 (rejeita) / `"   "` (rejeita) |
| email inválido | `sem-arroba`, `a@b` (sem TLD) |
| initialPassword | 7 caracteres (rejeita) / 8 (aceita) |
| JWT | quatro tokens: `worker`, `admin` simples, `social-care:admin` (composto), `superadmin`; + um expirado e um de issuer errado |
| Header | mutações com e sem `X-Actor-Id` |

## 4. Critérios de saída

- 100% dos cenários dos arquivos `01`–`04` executados e com veredito.
- Matriz RBAC (arquivo `03`) integralmente verificada — incluindo as 3 regras compostas de atribuição de role.
- Invariantes de AppSec verificados: CPF ausente de **todos** os payloads de evento; recovery link ausente de **toda** resposta HTTP.
- Sessões exploratórias 1–4 realizadas com achados registrados.
- Zero falha aberta de severidade alta em autorização ou vazamento de dados (LGPD).
