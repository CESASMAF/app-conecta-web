# ADR-0002: Mapeamento de erros estruturados (`PAT-XXX`/`AppError`) para tags i18n na UI

**Feature**: `specs/001-social-care-web/` · **Status**: Aceito
**Data**: 2026-06-12 · **Consultor**: `/acdg-skills:software-architect`

> ADR de feature (frontend). Decisões arquiteturais relevantes exigem **citação canônica** via
> `skills_citar`. Não contraria ADR aceito do `web_02/handbook/adr/` — aplica
> [ADR-0001](../../adr/0001-vertical-modular-architecture.md) (arquitetura vertical-modular),
> [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md) (split client/server, MVVM × DDD) e
> [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md) (BFF Elysia orquestrador; `*.query.fn` /
> `*.service.fn`). Por ser transversal a todas as telas do módulo, é candidato a subir para o
> handbook ao estabilizar.

## Contexto

O `social-care` devolve erros num envelope estruturado `{ error: { code, message, details? } }`
com códigos `{BC}-{SEQ}` por bounded context: `PAT-001` (paciente não encontrado, 404),
`PAT-002`/`ADM-002` (já ativo, 409), `DISC-007` (não desliga waitlisted — use withdraw, 409),
`READM-005` (não readmite waitlisted — use admit, 409), `FAM-002` (membro já na família),
`HOUSING-001`, `SOCIO-001` (renda negativa), `HEALTH-001` (gestação em idade inválida),
`REF-001` (data futura), `VIO-002` (descrição obrigatória), `PLACE-002`, `LOOKUP-002`,
`LREQ-001` etc. O campo `message` é user-facing, porém: (a) vem no vocabulário e tom do
backend, sem garantia de locale nem de adequação à UI; (b) `details` só existe com
`VERBOSE_ERRORS=true`; (c) exibi-lo cru acopla a UI a strings que o Swift pode mudar em
patch.

Forças da constituição ([`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)):
**Princípio II** (Errors as Values — `Result<T,E>`, unions de literais, sem `throw` fora da borda de
framework), **Princípio V** (Strict TypeScript — switch exaustivo via `never`; TypeBox `Elysia.t` na
borda do BFF) e **Princípio I** (BFF-Orchestrated Boundary — a `message` crua do backend nunca chega
ao client). A UI é PT-BR primário com estrutura pronta para EN/ES sem refatoração.

## Decisão

**O handler Elysia (`*.service.fn.ts`) que consome o `social-care` traduz `AppError.code` para uma
união de string literals kebab-case por contexto, e a UI resolve essas tags em dicionários i18n
tipados — a `message` crua do backend nunca chega ao usuário.**

- `server/adapters/social-care-error.mapper.ts` mantém o mapa exaustivo
  `code → SocialCareError`:
  `'PAT-001' → 'patient-not-found'`, `'PAT-002' → 'patient-already-active'`,
  `'DISC-007' → 'cannot-discharge-waitlisted'`, `'READM-005' → 'cannot-readmit-waitlisted'`,
  `'FAM-002' → 'family-member-already-exists'`, `'SOCIO-001' → 'income-negative'`,
  `'HEALTH-001' → 'pregnancy-invalid-age'`, `'VIO-002' → 'violation-description-required'`, …
- O tipo `SocialCareError` é uma union de literais; consumo em `switch` exaustivo com
  `never` — código novo do backend sem mapeamento **não compila** ao ser adicionado ao
  schema TypeBox (`Elysia.t`) do envelope de erro.
- Código desconhecido em runtime → `'unknown-social-care-error'` (fallback), preservando o
  `code` bruto em `meta` para exibição discreta ("Erro PAT-123 — informe o suporte") e log
  estruturado no BFF (sem PII).
- O client resolve a tag via dicionário i18n tipado (ADR-018 do `social-care`):
  `errors['social-care']['patient-not-found'] = 'Prontuário não encontrado.'` — dicionário
  `src/i18n/pt-BR/errors.ts` tipado por chave (chave inexistente = erro de compilação).
- Erros com semântica de fluxo disparam o `createAsync`/`ErrorBoundary` do Solid (Princípio II):
  HTTP 409 de optimistic locking → `VersionConflictDetected`; `unauthorized` →
  `SessionExpired`.
- Formulários mapeiam tags de validação para o campo correspondente (ex.:
  `'income-negative'` → campo `totalFamilyIncome` via binding Solid no ViewModel), mantendo
  a validação TypeBox (`Elysia.t`) da borda como primeira linha.

**Fundamentação canônica** (citação ≥4 linhas):
> Create an isolating layer to provide clients with functionality in terms of their own
> domain model. The layer talks to the other system through its existing interface,
> requiring little or no modification to the other system. Internally, the layer translates
> in both directions as necessary between the two models.
> — *(Linha 5654, p. 365, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

## Consequências

- **Positivas**: UI 100% desacoplada do texto e do tom do backend; locale-ready (EN/ES =
  novo dicionário, zero refactor); exaustividade verificada em compile-time; mensagens
  consistentes com o vocabulário do design (linguagem ubíqua de [`domain.fe.md`](./domain.fe.md));
  nenhum detalhe interno do Swift (stack, contexto verbose) vaza para o browser.
- **Negativas / custo**: o mapa exige manutenção quando o `social-care` cria código novo —
  mitigado pelo fallback `'unknown-social-care-error'` + teste de contrato (em `bun:test`) que
  compara o mapa com a tabela de erros do [`api-readiness.fe.md`](./api-readiness.fe.md);
  duplicação aparente de "mensagem" (backend tem `message`, frontend tem dicionário) é o
  preço do desacoplamento.
- **Ponto de troca / reversibilidade**: toda a tradução vive em
  `social-care-error.mapper.ts` (server) + namespace `errors.social-care` (i18n). Se um dia
  o backend publicar catálogo de mensagens localizadas por locale negociado, troca-se o
  mapper por passthrough sem tocar em nenhuma tela.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Exibir `error.message` do backend diretamente na UI | Acopla locale/tom da UI ao Swift; mudança de string no backend altera UX sem PR no front; risco de vazar `details` verbose; impossibilita EN/ES sem mudar o backend. |
| Mapear apenas por HTTP status (404/409/400 genéricos) | Perde granularidade essencial: `DISC-007` e `READM-005` são ambos 409 mas pedem ações opostas ("use retirar" vs "use admitir"); UX de formulário precisa do código para apontar o campo. |
| Adotar biblioteca i18n externa para o catálogo de erros | Contraria o Princípio IV (Bun-Native/Zero-NPM-Utility — [ADR-0003](../../adr/0003-bun-supply-chain.md)); plural/ICU complexo não existe no catálogo de erros v1. |
| Tradução no client (mapa code→texto dentro de `ui/`) | Vaza o contrato do backend através do BFF (viola [ADR-0001](../../adr/0001-vertical-modular-architecture.md) e o Princípio I); o client passaria a conhecer `PAT-XXX`, quebrando a ACL. |

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0001 Arquitetura vertical-modular: [`../../adr/0001-vertical-modular-architecture.md`](../../adr/0001-vertical-modular-architecture.md)
- ADR-0002 Errors as Values: [`../../adr/0002-errors-as-values.md`](../../adr/0002-errors-as-values.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- ADR-0009 Framework-agnostic client (ViewModel puro + binding Solid): [`../../adr/0009-framework-agnostic-client.md`](../../adr/0009-framework-agnostic-client.md)
- ADR-0010 BFF orquestrador / nomenclatura fn: [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md)
- ADR-0011 No mocks em produção: [`../../adr/0011-no-mocks-in-production.md`](../../adr/0011-no-mocks-in-production.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Domínio frontend (modelo, eventos, anti-corrupção): [`./domain.fe.md`](./domain.fe.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Domínio core-api: [`./domain.md`](./domain.md)
- Elysia (BFF framework): [`../../reference/framework/elysia/`](../../reference/framework/elysia/)
