# Integração — como 3 serviços viram UM app `web_02`

> **Hub de navegação da documentação do `web_02`.** Este README explica como `social-care`,
> `people-context` e `analysis-bi` — três serviços de backend independentes — se unem em **um único
> aplicativo web** (front SolidStart + **um** BFF Elysia), e linka toda a documentação de cada serviço,
> os ADRs e a constituição. Comece por aqui.
>
> **Idioma:** PT-BR (diálogo/docs). Código (módulos, tipos, paths, rotas) em EN.
> **Datado:** 2026-06-12. Stack validada no spike do mesmo dia (ver [índice de ADRs](../adr/README.md)).

---

## 1. Visão — 3 serviços, 3 módulos verticais, 1 app

O ecossistema ACDG tem **3 backends de domínio**, cada um seu próprio repositório, runtime e banco:

| Serviço backend | Stack | Papel no domínio |
|---|---|---|
| `svc-social-care` | Swift · Vapor · PostgreSQL · CQRS+ES+Outbox | Prontuário socioassistencial — **fonte de verdade** + audit trail |
| `svc-people-context` | Bun · Elysia · PostgreSQL · NATS | Registro de identidade (pessoas, vínculos `system:role`, acesso/IdP) |
| `svc-analysis-bi` | Go · chi · pgx · NATS · K-anonymity | Indicadores agregados e **anonimizados** (somente leitura) |

O `web_02` **não** é um agregador de 3 aplicações separadas. É **um único aplicativo** (front + BFF
unificado) onde cada serviço vira um **módulo vertical** dentro de `src/modules/`:

```
web_02/  (UM app: SolidStart + UM BFF Elysia + Bun)
└── src/
    ├── modules/
    │   ├── social-care/      ← consome svc-social-care   (prontuário, avaliação, cuidado, proteção)
    │   ├── people-context/   ← consome svc-people-context (pessoas, vínculos, acesso/IdP)
    │   ├── analysis-bi/      ← consome svc-analysis-bi    (5 dashboards + central de exports)
    │   ├── auth/             ← OIDC+PKCE / sessão (feature-modelo; ADR-0005)
    │   └── shell/            ← TELA `root`: sidebar+topbar+container (ADR-0012)
    ├── shared/ui/            ← design system vanilla-extract (tokens → atoms → … → organisms; ADR-0007)
    └── routes/
        ├── api/[...path].ts  ← catch-all: mount do BFF Elysia (UM app.fetch)
        ├── social-care/      ← rotas SolidStart (file-based) do módulo
        ├── people/           ← idem
        └── analysis-bi/      ← idem
```

Cada módulo é **vertical e auto-contido** ([ADR-0001](../adr/0001-vertical-modular-architecture.md)):
`server/` (BFF · DDD · onde o token vive) + `client/` (MVVM agnóstico) + `public-api/` (único ponto de
import cross-módulo). Não há fan-out cross-módulo no client; não há acoplamento entre os internals de dois
módulos. Um governance test em `bun:test` reprova violações de fronteira (não há ESLint — regra Bun-native).

> **Por que módulos e não 3 apps?** Uma **única borda pública** (o BFF), **uma** sessão, **um** design
> system, **uma** navegação (shell). O usuário vê um produto só; a topologia de 3 backends fica invisível —
> exatamente o Princípio I da [constituição](../../.specify/memory/constitution.md).

---

## 2. Como os módulos linkam — a "cola" do app único

Os 3 módulos não se conhecem diretamente: eles compartilham **cinco camadas transversais**. É isso que os
transforma em um app só em vez de três.

### 2.1. Shell único — a moldura de navegação (ADR-0012)

O shell autenticado (sidebar + topbar + container do conteúdo) é uma **TELA MVVM de 1ª classe** chamada
`root`, em `src/modules/shell/client/` — **não** um layout solto nem um organism do design system. Ele
filtra o menu por permissão (RBAC via claim `groups`), resolve o título por rota e hospeda o `<Outlet/>`
onde cada módulo renderiza. Os três módulos entram no **mesmo** shell pelo `<Outlet/>`; o usuário troca
entre prontuário, pessoas e indicadores sem trocar de aplicação. O shell é **client-only** e consome
`user`/`permissions`/`logout` do BFF do `auth` via `public-api` — ver
[ADR-0012](../adr/0012-shell-as-root-screen-mvvm.md).

### 2.2. Auth OIDC única — Authentik (ADR-0005)

Há **uma** sessão para o app inteiro. O BFF faz **OIDC Authorization Code + PKCE** contra o **Authentik**
(IdP único do deploy BV), valida o `id_token` com `jose` (JWKS do Authentik), e guarda os tokens
**server-side** (`Bun.redis`); o browser só carrega um cookie opaco `__Host-session` (HttpOnly). O **mesmo**
access token é injetado como `Authorization: Bearer` em **toda** chamada outbound — para os 3 backends. Os
papéis vêm do claim **`groups`**. Cada módulo apenas **consome** a sessão (não reimplementa login). Ver
[ADR-0005](../adr/0005-auth-session-refresh-decisions.md).

> ⚠️ **Pré-condição de produção (ver §4):** para o BFF injetar **um** Bearer que os 3 backends aceitem, o
> Authentik precisa emitir tokens com issuer/audience consistentes e o claim `groups`. Hoje cada serviço
> deriva issuer do próprio app-slug — risco mapeado em [CONEXOES-ENTRE-SERVICOS.md](../../../CONEXOES-ENTRE-SERVICOS.md) §3E.

### 2.3. Design system compartilhado — vanilla-extract (ADR-0007)

Todos os módulos estilizam a partir de `src/shared/ui/` (tokens → atoms → molecules → organisms), engine
**vanilla-extract** (CSS-in-TS zero-runtime). Referenciar um token inexistente é **erro de compilação**;
hex/px cru em `ui/` é barrado por governance test "só-tokens". O `001-social-care-web` estabelece o shell,
os tokens e os átomos base; `002-people-context-web` e `003-analysis-bi-web` **reaproveitam** e catalogam
apenas componentes novos. Resultado: visual e interação coesos entre os três domínios. Ver
[ADR-0007](../adr/0007-design-system-vanilla-extract.md).

### 2.4. BFF Elysia ÚNICO — o orquestrador (ADR-0010)

Há **um** BFF Elysia para o app inteiro, montado em `src/routes/api/[...path].ts` (catch-all →
`app.fetch`). Cada módulo registra seus handlers nesse mesmo Elysia (agrupados por `group`/plugin):
leituras em `*.query.fn.ts`, escritas/orquestração em `*.service.fn.ts`. **O BFF é o único que fala com os
3 backends** — ele injeta o Bearer, valida input/output com **TypeBox** (`Elysia.t`) na borda, e devolve
uma resposta simples e completa. **O client nunca compõe, agrega nem faz fan-out**, e não conhece a
topologia de backends. O client consome o BFF via **Eden Treaty** (type-safe, isomorphic no SSR) — o tipo
do schema flui do Elysia ao client sem redeclarar Model. Ver
[ADR-0010](../adr/0010-bff-orchestration-fn-naming.md) e [ADR-0004](../adr/0004-client-server-split-mvvm-ddd.md).

### 2.5. Routing SolidStart + Erros como valor (ADR-0002)

As rotas file-based do SolidStart (`src/routes/<módulo>/`) importam **apenas** de `public-api/index.ts` de
cada módulo. O server-state é **Solid nativo** (`createAsync`/`query`/`action`/`useSubmission` — sem
TanStack Query). Erros são **valores** (`Result<T,E>`): o Eden devolve `{ data, error }`; a **única**
travessia valor→exceção é a derivação do `createAsync` para o `<ErrorBoundary>` do Solid. A UI decide por
**semântica** (`AppError.kind` → tag i18n PT-BR), **nunca** por status HTTP. Ver
[ADR-0002](../adr/0002-errors-as-values.md).

---

## 3. Tabela de integração — módulo → backend → contratos → eventos → docs

Cada módulo do `web_02` mapeia 1:1 a um backend. A coluna "eventos NATS" é **contexto de fundo**: o
`web_02` é síncrono (HTTP via BFF) e **não** publica nem consome NATS — os eventos abaixo são a cola
**entre backends**, que alimentam o que o módulo lê depois.

| Módulo `web_02` | Backend consumido | Rotas / contratos consumidos (via BFF, `/api/v1`) | Eventos NATS (entre backends, contexto) | Docs do serviço |
|---|---|---|---|---|
| `src/modules/social-care/` | `svc-social-care` (porta interna; fonte de verdade) | `patients` (lista/ficha/by-person/audit-trail), `patients/:id/family-members`, lifecycle (`admit`/`discharge`/`readmit`/`withdraw`), 7 PUT de avaliação, `appointments`/`intake-info`, `referrals`/`violation-reports`/`placement-history`, `dominios/:tableName` + `dominios/requests` — ~24 handlers Elysia | **Publica** `social-care.events.*` (JetStream, stream `SOCIAL_CARE_EVENTS`) → consumido por `analysis-bi`. **Consome** `people.person.registered`/`deleted` (vincula paciente↔pessoa; anonimiza PII na exclusão — LGPD) | [spec.fe.md](./social-care/spec.fe.md) · [plan.fe.md](./social-care/plan.fe.md) · [api-readiness.fe.md](./social-care/api-readiness.fe.md) · [domain.fe.md](./social-care/domain.fe.md) |
| `src/modules/people-context/` | `svc-people-context` (porta interna) | `people` (lista/busca/by-cpf/cadastro/edição), `people/:id/roles` (assign/listar/deactivate/reactivate), `roles` (discovery por sistema), acesso/IdP (`login`, `request-password-reset`, `deactivate`/`reactivate`, `DELETE` erasure) — 15 handlers Elysia | **Publica** `people.person.registered\|updated\|deleted`, `people.role.*`, `people.user.*` (consumidos por `social-care`). É o **registro de identidade** que provê o `personId` usado pelo `social-care` | [spec.fe.md](./people-context/spec.fe.md) · [plan.fe.md](./people-context/plan.fe.md) · [api-readiness.fe.md](./people-context/api-readiness.fe.md) · [domain.fe.md](./people-context/domain.fe.md) |
| `src/modules/analysis-bi/` | `svc-analysis-bi` (porta interna; read-only) | `indicators/{demographics,epidemiological,socioeconomic,protection,care}`, `export/{format}` (8 formatos, proxy streaming), `metadata/datasets\|formats` — 8 handlers Elysia (RBAC aplicado no BFF; gap-filling no client) | **Consome** `social-care.events.*` (JetStream, consumer durável `analysis-bi`): anonimiza PII na ingestão (SHA-256 salgado, K-anonymity K=5) e **nunca armazena PII** | [spec.fe.md](./analysis-bi/spec.fe.md) · [plan.fe.md](./analysis-bi/plan.fe.md) · [api-readiness.fe.md](./analysis-bi/api-readiness.fe.md) · [domain.fe.md](./analysis-bi/domain.fe.md) |

**Dependência cross-módulo no `web_02`:** o `social-care` precisa de um `personId` existente para cadastrar
um paciente. Esse `personId` é provido pelo `people-context`. No app, isso é uma dependência **via
`public-api`** (ex.: um picker de pessoa exposto por `people-context` e consumido pelo `social-care`) — nunca
um import de internals. A composição de "pessoa + vínculos + paciente", quando necessária numa tela, é papel
do **BFF** (uma rota Elysia que faz o fan-out), nunca do client ([ADR-0010](../adr/0010-bff-orchestration-fn-naming.md)).

---

## 4. Estado real vs. alvo — honestidade

O `web_02` (este projeto) é o **alvo**: o BFF unificado que orquestra os 3 backends. Mas o documento
[CONEXOES-ENTRE-SERVICOS.md](../../../CONEXOES-ENTRE-SERVICOS.md) (leitura direta do código dos 4 repos em
2026-06-12) mostra que, **hoje, os serviços em grande parte NÃO conversam**. Resumo honesto:

**O que hoje NÃO conversa (diagnóstico do CONEXOES):**

- 🔴 **Não existe infra compartilhada.** Cada repo sobe um `docker-compose.yml` standalone que assume a
  máquina inteira: 3 apps disputam a porta `3000`, 2 Postgres disputam `5432`, e há **dois NATS distintos**
  (people-context e analysis-bi sobem o seu). Os eventos do `social-care` e os do `people-context` nem
  sequer estão no **mesmo** broker. Sem Postgres/NATS/Caddy/Authentik únicos (ADR-009), os canais não têm
  onde se encontrar.
- 🔴 **O BFF antigo (repo `web`/React) quase não fala com os backends.** Só **uma** chamada existe
  (`social-care`), e está quebrada: rota `pii/reveal` inexistente, sem prefixo `/api/v1`, porta errada
  (`4001` ≠ `3000`), e JWT literal `"stub-jwt"` → 401. Para `people-context` e `analysis-bi` **não há
  cliente HTTP** — só a env var.
- 🟠 **`people-context → social-care` é frágil:** publica em **NATS core** (at-most-once, sem stream/ack).
  Uma exclusão de pessoa perdida deixa PII viva no `social-care` — **risco LGPD**.
- 🟠 **Auth OIDC ainda não é compartilhada:** cada serviço deriva issuer do próprio app-slug; o token do
  front pode não validar nos backends. Claim de papéis divergente (`roles` vs `groups`).
- 🟢 **O único elo saudável:** `social-care → analysis-bi` via **JetStream durável** (stream
  `SOCIAL_CARE_EVENTS`, consumer `analysis-bi`) — nomes batem; ressalva: o stream ainda não é provisionado
  por ninguém, e o BI ignora ~5 dos 23 tipos de evento.

**O que o `web_02` unifica (o alvo deste projeto):**

- ✅ **Um único BFF público** (Elysia) que orquestra os 3 backends — substitui a "uma chamada stub" por
  clientes HTTP reais e tipados (Eden), apontando para as portas internas corretas, atrás do Caddy.
- ✅ **Uma sessão OIDC/Authentik** — o BFF injeta **um** Bearer válido em todas as chamadas (pré-condição:
  Authentik único com issuer/audience/`groups` consistentes — ver §2.2).
- ✅ **Um design system + um shell** — três domínios, uma experiência coesa.
- ✅ **No-mocks honesto** ([ADR-0011](../adr/0011-no-mocks-in-production.md)): operação sem rota no backend
  retorna o valor `'not-implemented'`, nunca dado fabricado. A UI nunca mostra dado falso.

> **Importante:** o `web_02` resolve a camada **front + BFF**. Ele **não** resolve, sozinho, os canais
> assíncronos entre backends (NATS core frágil, stream não provisionado, infra compartilhada inexistente).
> Esses são trabalho de **infra/orquestração** (ADR-009, fora deste repo) — ver as recomendações priorizadas
> em [CONEXOES-ENTRE-SERVICOS.md](../../../CONEXOES-ENTRE-SERVICOS.md) §6. As specs de cada módulo assumem
> que o contrato do backend está "implantado e estável" e tratam divergências como bloqueio em
> `api-readiness.fe.md`, não como contorno no front.

---

## 5. Índice / hub de navegação

### Governança do projeto

- **[Constituição `web_02`](../../.specify/memory/constitution.md)** — lei máxima (Princípios I–VI).
- **[Índice de ADRs](../adr/README.md)** — registro de decisões; a regra-mãe Bun-native está aqui.

### ADRs citados neste documento

- [ADR-0001 — Arquitetura Vertical-Modular](../adr/0001-vertical-modular-architecture.md) — `modules`/`shared`/`public-api`.
- [ADR-0002 — Errors as Values](../adr/0002-errors-as-values.md) — `Result`; Eden `{ data, error }`; `<ErrorBoundary>`.
- [ADR-0003 — Bun Supply-Chain](../adr/0003-bun-supply-chain.md) — Bun como PM + hardening.
- [ADR-0004 — Client × Server Split (MVVM × DDD)](../adr/0004-client-server-split-mvvm-ddd.md) — a fronteira é o Eden treaty.
- [ADR-0005 — Auth/Session/Refresh](../adr/0005-auth-session-refresh-decisions.md) — OIDC+PKCE (Authentik), sessão opaca.
- [ADR-0006 — Security Headers & CSP](../adr/0006-security-headers-csp.md) — CSP/HSTS (Elysia + SolidStart + Caddy).
- [ADR-0007 — Design System vanilla-extract](../adr/0007-design-system-vanilla-extract.md) — engine só-tokens.
- [ADR-0008 — Self-host Webfonts](../adr/0008-self-host-webfonts.md) — `.woff2` manual (zero IP a terceiros, LGPD).
- [ADR-0009 — Framework-Agnostic Client (MVVM)](../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid + Command.
- [ADR-0010 — BFF Elysia Orquestrador / fn naming](../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn` / `*.service.fn`.
- [ADR-0011 — No Mocks in Production](../adr/0011-no-mocks-in-production.md) — `'not-implemented'` como valor.
- [ADR-0012 — Shell como TELA `root` MVVM](../adr/0012-shell-as-root-screen-mvvm.md) — moldura de navegação única.

### Documentação por serviço (módulo)

Cada serviço tem o conjunto completo de docs frontend (`.fe.md`) e core-api. Os mais relevantes para
integração:

**`social-care/`** (prontuário — fonte de verdade)
- [spec.fe.md](./social-care/spec.fe.md) · [plan.fe.md](./social-care/plan.fe.md) · [api-readiness.fe.md](./social-care/api-readiness.fe.md)
- [domain.fe.md](./social-care/domain.fe.md) · [discovery.fe.md](./social-care/discovery.fe.md) · [adr.fe.md](./social-care/adr.fe.md) · [metrics.fe.md](./social-care/metrics.fe.md)
- Design: [design-tokens.fe.md](./social-care/design-tokens.fe.md) · [design-atoms.fe.md](./social-care/design-atoms.fe.md) · [design-molecules.fe.md](./social-care/design-molecules.fe.md) · [design-organisms.fe.md](./social-care/design-organisms.fe.md) · [design-pages.fe.md](./social-care/design-pages.fe.md) · [design-governance.fe.md](./social-care/design-governance.fe.md)
- Core-api: [spec.md](./social-care/spec.md) · [plan.md](./social-care/plan.md) · [domain.md](./social-care/domain.md) · [tasks.md](./social-care/tasks.md)

**`people-context/`** (identidade — provê `personId`)
- [spec.fe.md](./people-context/spec.fe.md) · [plan.fe.md](./people-context/plan.fe.md) · [api-readiness.fe.md](./people-context/api-readiness.fe.md)
- [domain.fe.md](./people-context/domain.fe.md) · [discovery.fe.md](./people-context/discovery.fe.md) · [adr.fe.md](./people-context/adr.fe.md) · [metrics.fe.md](./people-context/metrics.fe.md)
- Design: [design-tokens.fe.md](./people-context/design-tokens.fe.md) · [design-atoms.fe.md](./people-context/design-atoms.fe.md) · [design-molecules.fe.md](./people-context/design-molecules.fe.md) · [design-organisms.fe.md](./people-context/design-organisms.fe.md) · [design-pages.fe.md](./people-context/design-pages.fe.md) · [design-governance.fe.md](./people-context/design-governance.fe.md)
- Core-api: [spec.md](./people-context/spec.md) · [plan.md](./people-context/plan.md) · [domain.md](./people-context/domain.md) · [tasks.md](./people-context/tasks.md)

**`analysis-bi/`** (indicadores — read-only, anonimizado)
- [spec.fe.md](./analysis-bi/spec.fe.md) · [plan.fe.md](./analysis-bi/plan.fe.md) · [api-readiness.fe.md](./analysis-bi/api-readiness.fe.md)
- [domain.fe.md](./analysis-bi/domain.fe.md) · [discovery.fe.md](./analysis-bi/discovery.fe.md) · [adr.fe.md](./analysis-bi/adr.fe.md) · [metrics.fe.md](./analysis-bi/metrics.fe.md)
- Design: [design-tokens.fe.md](./analysis-bi/design-tokens.fe.md) · [design-atoms.fe.md](./analysis-bi/design-atoms.fe.md) · [design-molecules.fe.md](./analysis-bi/design-molecules.fe.md) · [design-organisms.fe.md](./analysis-bi/design-organisms.fe.md) · [design-pages.fe.md](./analysis-bi/design-pages.fe.md) · [design-governance.fe.md](./analysis-bi/design-governance.fe.md)
- Core-api: [spec.md](./analysis-bi/spec.md) · [plan.md](./analysis-bi/plan.md) · [domain.md](./analysis-bi/domain.md) · [tasks.md](./analysis-bi/tasks.md)

### Estado real cross-serviço

- **[CONEXOES-ENTRE-SERVICOS.md](../../../CONEXOES-ENTRE-SERVICOS.md)** — o que de fato conversa hoje (canal
  a canal, com arquivos de origem) vs. o que a ADR-009 promete. Leia antes de assumir que algo "já funciona".

### Docs offline da stack (lidas por inteiro, não resumos)

- [framework/solidstart](../reference/framework/solidstart/) · [framework/elysia](../reference/framework/elysia/) · [runtime/bun](../reference/runtime/bun/) · [ui/vanilla-extract](../reference/ui/vanilla-extract/)
