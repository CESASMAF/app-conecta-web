# ADR-0002: Mapeamento de erros estruturados (`PEO`/`ROL`/`IDP`/`AUTH`) para tags i18n e estados de UI

**Feature**: `specs/002-people-context-web/` · **Status**: Aceito
**Data**: 2026-06-12 · **Consultor**: `/acdg-skills:software-architect`

> ADR de feature (frontend). Decisões arquiteturais relevantes exigem **citação canônica** via
> `skills_citar`. Não contraria ADR aceito do `web_02/handbook/adr/` — aplica
> o [Princípio I (BFF-Orchestrated Boundary)](../../../.specify/memory/constitution.md) e o
> [ADR-0001 local](./adr.md). Segue o precedente do ADR-0002 de `001-social-care-web`
> (mapeamento `PAT-XXX` → tags), estendido aos estados especiais de orquestração IdP deste
> conjunto. ADRs globais do web_02: [índice](../../adr/README.md).

## Contexto

O `people-context` devolve erros num envelope estruturado
`{ success: false, error: { code, message } }` com códigos por área: `PEO-001` (validação,
400), `PEO-002` (pessoa não encontrada, 404), `PEO-004` (CPF ≠ 11 dígitos, 400), `PEO-005`/
`PEO-006` (já inativa/já ativa, 409), `PEO-007` (sem login no IdP — password reset, 422),
`PEO-008` (já tem login — login retroativo, 409), `PEO-009` (e-mail obrigatório para criar
login, 422), `PEO-010` (erasure só superadmin, 403), `ROL-001..005` (validação/UUID/role não
encontrada/`system` ausente), `ROL-006` (só superadmin atribui `superadmin`, 403), `ROL-007`
(admin fora do escopo do próprio sistema, 403), `ROL-008` (auto-assign proibido, 403),
`ROL-009` (role mudou durante o request, 409), `IDP-001..005` (falhas no Authentik, 502 —
mensagem **genérica de propósito**: erros do IdP não vazam, AppSec HIGH-7), `AUTH-001..003`
(401/403/400) e `ADM-001` (403). O campo `message` vem em EN, no vocabulário do backend, sem
garantia de locale — exibi-lo cru acopla a UI a strings que o serviço pode mudar em patch.

Além dos erros, o contrato tem **dois estados que não são erro** e não podem cair em toast
genérico: o `207 Multi-Status` de `POST /people` (pessoa criada, provisão de login falhou —
recuperável via `POST /people/:id/login`) e o `202 Accepted` de
`request-password-reset`, cujo body **não contém o link** (ADR-030/AppSec CRITICAL-2 — o
`recoveryLink` viaja só no evento NATS `people.user.password_reset_requested` para o
`queue-manager` enviar por e-mail).

Forças da constituição ([`constitution.md`](../../../.specify/memory/constitution.md)):
Princípio II (errors-as-values — `Result<T,E>`, unions de string literais, sem `Error`
subclass; `throw` proibido fora da borda de framework), Princípio V (TypeScript estrito —
switch exaustivo via `never`; TypeBox `Elysia.t` na borda; Eden propaga o tipo ao client),
Princípio I (BFF-Orchestrated Boundary — i18n custom, dicionários TS tipados, sem biblioteca
externa de i18n — e eventos de estado de UI emitidos pelo binding Solid, ver
[`domain.fe.md`](./domain.fe.md)).
A UI é PT-BR primário com estrutura pronta para EN/ES sem refatoração.

## Decisão

**O handler Elysia do BFF traduz `error.code` para uma união de string literals kebab-case
por contexto (via TypeBox [`Elysia.t`](../../adr/0004-client-server-split-mvvm-ddd.md)), e os
estados de orquestração IdP (207, 202, 502 `IDP-XXX`) viram estados de UI com semântica
própria — a `message` crua do backend nunca chega ao usuário, e o link de password reset
nunca chega ao browser.**

- `server/adapters/people-context-error.mapper.ts` mantém o mapa exaustivo
  `code → PeopleContextError`:
  `'PEO-001' → 'person-validation-failed'`, `'PEO-002' → 'person-not-found'`,
  `'PEO-003' → 'person-id-invalid'`, `'PEO-004' → 'cpf-invalid-format'`,
  `'PEO-005' → 'person-already-inactive'`, `'PEO-006' → 'person-already-active'`,
  `'PEO-007' → 'person-without-idp-login'`, `'PEO-008' → 'person-already-has-login'`,
  `'PEO-009' → 'email-required-for-login'`, `'PEO-010' → 'erasure-superadmin-only'`,
  `'ROL-004' → 'role-system-required'`, `'ROL-006' → 'superadmin-role-restricted'`,
  `'ROL-007' → 'admin-scope-forbidden'`, `'ROL-008' → 'self-assign-forbidden'`,
  `'ROL-009' → 'role-changed-concurrently'`, `'IDP-001' → 'idp-provision-failed'`,
  `'IDP-002' → 'idp-deactivation-failed'`, `'IDP-003' → 'idp-reactivation-failed'`,
  `'IDP-004' → 'idp-password-reset-failed'`, `'IDP-005' → 'idp-erasure-failed'`,
  `'AUTH-002' → 'forbidden'`, `'ADM-001' → 'superadmin-only'`, …
- O tipo `PeopleContextError` é uma union de literais; consumo em `switch` exaustivo com
  `never` — código novo do backend sem mapeamento **não compila** ao ser adicionado ao
  schema TypeBox do envelope de erro (Princípio V — end-to-end type safety via Eden Treaty;
  ver [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md)).
- Código desconhecido em runtime → `'unknown-people-context-error'` (fallback), preservando
  o `code` bruto em `meta` para exibição discreta ("Erro PEO-123 — informe o suporte") e log
  estruturado no BFF (sem PII).
- **Erros `IDP-XXX` carregam a flag `retryable: true`**: pela ordem IdP-first do backend
  (ADR-HIGH-5), um 502 garante que o banco **não** foi alterado — a UI exibe estado de erro
  com botão "Tentar novamente" reexecutando o mesmo `action` do Solid, sem risco de
  duplicação. A mensagem i18n é genérica ("Falha de comunicação com o provedor de login") —
  o backend já não expõe detalhes do Authentik (HIGH-7) e a UI não tenta adivinhá-los.
- **Caso especial 207 (não é envelope de erro)**: o handler Elysia de `registerPerson` trata
  `207 Multi-Status` como **sucesso parcial** — `MutationAckModel` com
  `provisionPending: true` — e o binding Solid emite `LoginProvisionPending`
  ([Princípio III — ViewModel + binding](../../../.specify/memory/constitution.md)). A ficha
  da pessoa renderiza banner persistente com a tag `'login-provision-pending'` ("Pessoa
  cadastrada, mas o login não foi criado") e a ação "Provisionar login" (rota Elysia
  `provisionLogin.query.fn.ts` → `POST /people/:id/login`). Jamais toast destrutivo: a
  pessoa **existe** e recadastrá-la cairia na dedup por CPF.
- **Fluxo de password reset sem link**: `202 Accepted` → tag de sucesso
  `'password-reset-requested'` ("O link de recuperação será enviado por e-mail ao usuário");
  o schema TypeBox da rota Elysia **não declara campo de link** — se o backend um dia
  vazá-lo, a validação de borda o descarta. Pré-condições viram estados, não surpresas:
  `PEO-007` (422) → `'person-without-idp-login'` com call-to-action "Provisionar login
  primeiro" (a UI já esconde a ação quando `loginStatus === 'none'` — o erro cobre apenas a
  corrida).
- Erros com semântica de fluxo acionam reatividade Solid:
  `AUTH-001` → `SessionExpired` — o binding do módulo de auth executa `logout()` e
  `invalidate()` via `createEffect`; `'role-changed-concurrently'` (`ROL-009`, 409) →
  `createAsync` refaz os vínculos com aviso de edição concorrente.
- O client resolve a tag via dicionário TS tipado por chave
  (`src/i18n/pt-BR/errors.ts` — chave inexistente = erro de compilação TypeScript):
  `errors['people-context']['person-already-has-login'] = 'Esta pessoa já possui login.'`
  Formulários Solid mapeiam tags para o campo correspondente (ex.:
  `'cpf-invalid-format'` → campo `cpf`, `'email-required-for-login'` → campo `email`),
  mantendo a validação TypeBox da borda como primeira linha.

**Fundamentação canônica** (citação ≥4 linhas):
> Create an isolating layer to provide clients with functionality in terms of their own
> domain model. The layer talks to the other system through its existing interface,
> requiring little or no modification to the other system. Internally, the layer translates
> in both directions as necessary between the two models.
> — *(Linha 5654, p. 365, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

## Consequências

- **Positivas**: UI 100% desacoplada do texto e do tom do backend; locale-ready (EN/ES =
  novo dicionário, zero refactor); exaustividade verificada em compile-time (TypeBox +
  `never` — Princípio V); os estados recuperáveis do contrato (207, 502 IdP-first, 409
  idempotentes) viram fluxos guiados em vez de becos sem saída; o link de recuperação de
  senha é estruturalmente incapaz de chegar ao browser (schema TypeBox sem o campo);
  mensagens consistentes com o vocabulário do design (linguagem ubíqua de
  [`domain.fe.md`](./domain.fe.md)).
- **Negativas / custo**: o mapa exige manutenção quando o `people-context` cria código novo
  — mitigado pelo fallback `'unknown-people-context-error'` + governance test em `bun:test`
  que compara o mapa com a tabela de erros do [`api-readiness.fe.md`](./api-readiness.fe.md)
  (Princípio III — sem ESLint, boundary via teste executável; ver
  [ADR-0009](../../adr/0009-framework-agnostic-client.md) e
  [ADR-0011](../../adr/0011-no-mocks-in-production.md)); o caso 207 cria um caminho de
  sucesso "bifurcado" que todo teste de `registerPerson` precisa cobrir (fake/in-memory com
  handler de 207 — sem MSW, conforme Princípio VI Honesty/No Mocks); duplicação aparente de
  "mensagem" (backend tem `message`, frontend tem dicionário) é o preço do desacoplamento.
- **Ponto de troca / reversibilidade**: toda a tradução vive em
  `people-context-error.mapper.ts` (server) + namespace `errors.people-context` (i18n) +
  o tratamento de 207 no handler Elysia de `registerPerson`. Se um dia o backend publicar
  catálogo de mensagens localizadas ou trocar 207 por outro contrato de provisão assíncrona,
  troca-se mapper/handler sem tocar em nenhuma tela.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Exibir `error.message` do backend diretamente na UI | Acopla locale/tom da UI ao serviço (mensagens em EN); mudança de string no backend altera UX sem PR no front; impossibilita EN/ES sem mudar o backend. |
| Mapear apenas por HTTP status (404/409/422 genéricos) | Perde granularidade essencial: `PEO-005`, `PEO-006`, `PEO-008` e `ROL-009` são todos 409 mas pedem ações opostas (reativar vs desativar vs "já tem login" vs refetch); 422 cobre tanto `PEO-007` ("provisione o login") quanto `PEO-009` ("informe o e-mail"); UX de formulário precisa do código para apontar o campo. |
| Tratar 207 como erro (`'provision-failed'`) | Mente para o operador: a pessoa **foi criada**; um "erro" induz recadastro, que colide com a dedup por CPF (201 com id existente) e gera confusão; perde o retry dirigido via `provisionLogin` que o contrato oferece de propósito. |
| Exibir/aguardar o link de password reset na UI do admin | O contrato não devolve o link em HTTP (ADR-030/AppSec CRITICAL-2) e o schema TypeBox da rota Elysia não o declara; reintroduzi-lo exigiria violar o [ADR-0001 local](./adr.md) (acesso direto ao IdP) e colocaria credencial de recuperação no browser. |
| Adotar biblioteca externa de i18n (react-i18next/ICU) | Contraria o Princípio IV (Bun-Native/Zero-NPM-Utility — proibido adicionar dependência npm que duplique algo já disponível); plural/ICU complexo não existe no catálogo de erros v1; dicionário TS tipado já entrega type-safety em compile-time. |
| Tradução no client (mapa code→texto dentro de `ui/`) | Vaza o contrato do backend através do BFF (viola o [ADR-0001 local](./adr.md) e o Princípio I — BFF-Orchestrated Boundary); o client passaria a conhecer `PEO-XXX`, quebrando a ACL. |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, II, III, IV, V, VI
- [ADR-0001 (people-context): BFF como única fronteira de identidade](./adr.md)
- [ADR-0002 (web_02): Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0004 (web_02): Client-Server Split MVVM×DDD](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0009 (web_02): Framework-Agnostic Client — ViewModel + binding Solid](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 (web_02): BFF Elysia — nomenclatura de funções](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 (web_02): No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [domain.fe.md — modelo e eventos do client](./domain.fe.md)
- [Índice de ADRs web_02](../../adr/README.md)
