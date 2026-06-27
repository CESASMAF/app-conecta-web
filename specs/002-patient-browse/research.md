# Research — Fase 0 (002-patient-browse)

Decisões que resolvem o Technical Context. Formato: **Decisão / Justificativa / Alternativas rejeitadas**. Tudo ancorado na constituição e nas docs offline (`handbook/reference/`).

## D1 — Cliente HTTP outbound ao `social-care`

**Decisão**: porta `SocialCareClient` + adapter com **`fetch` nativo** em `src/external/social-care-client.ts`. Base URL de `env.socialCareUrl` (`SOCIAL_CARE_URL`); timeout via `AbortSignal` (reusar `withTimeout` da feature 001); devolve `Result<T, UpstreamError>`.

**Justificativa**: Princ. IV (zero-npm) — `fetch` + `AbortSignal` cobrem tudo; não há motivo para axios/got/undici. Porta injetável (em `AppDeps`) mantém as rotas testáveis contra o stub (D9). Princ. I — só o BFF conhece a URL/topologia.

**Alternativas rejeitadas**: axios/got (dep redundante, Princ. IV); o client chamar o `social-care` direto (viola Princ. I — exporia URL/token ao browser).

## D2 — Bearer forwarding + sessão/refresh

**Decisão**: cada rota BFF roda o **`requireSession`** da feature 001 (getSession → `refreshIfNeeded` → `touchActivity`), pega `session.accessToken` e injeta `Authorization: Bearer <accessToken>` na chamada outbound. Sem sessão → 401 do BFF → client volta ao login. `social-care` deriva o `actorId` do `JWT.sub` (ADR-023); o BFF **não** envia header custom de ator.

**Justificativa**: o `refreshIfNeeded` já renova o access próximo do vencimento (single-flight), cobrindo o "401 → refresh+repete 1x" do guia (seção 6) na camada de sessão. Se o upstream devolver 401 com token válido (ex.: revogado), o BFF mapeia para `unauthorized` → login.

**Alternativas rejeitadas**: repassar o cookie/sessão ao backend (o backend espera Bearer OIDC, não cookie); refresh no client (viola Princ. I — refresh é server-side).

## D3 — Envelopes e re-empacotamento

**Decisão**: tipar os envelopes do `social-care` em `src/shared/http/envelope.ts` — `StandardResponse<T> = { data: T, meta: { timestamp } }` e `PaginatedResponse<T> = { data: T[], meta: { pageSize, totalCount, hasMore, nextCursor } }`. O BFF **desembrulha** o upstream e **re-emite o envelope padrão** `{ data, meta }` para o client (tipado com `Elysia.t` → Eden propaga).

**Justificativa**: Princ. V (TypeBox como fonte única do tipo; Eden ao client sem redeclarar Model). Mantém o contrato do BFF estável mesmo se o upstream mudar forma.

**Alternativas rejeitadas**: repassar o corpo cru do upstream (acopla o client à forma do backend; quebra o boundary).

## D4 — Mapa de erro upstream → tag semântica

**Decisão**: `src/shared/http/upstream-error.ts` converte `(status, error.code)` do upstream em **tag de `AppError`** (Princ. II — UI decide por semântica):

| status (upstream) | tag | ação UI (guia §6) |
|---|---|---|
| 401 | `session-expired` | refresh já tentado na sessão; senão → login |
| 403 | `forbidden` | toast "sem permissão" + revisar visibilidade |
| 404 | `not-found` | volta à lista com aviso |
| 400 (`LKP-001`) | `bad-request` | erro tratado (catálogo fora da allowlist) |
| 422 (`CPF-*`/`REGP-*`/…) | `validation` (+ `code`) | mensagem no campo (relevante nas features de escrita) |
| 409 | `conflict` | recarregar dado |
| 503 (`REGP-031`) | `dependency-unavailable` | preservar estado + "tentar novamente" |
| 500 / outros | `internal` | mensagem genérica + correlação |

`error.code` é preservado no valor para mensagens específicas; **nunca** vaza URL/stack ao client.

**Justificativa**: Princ. II; tabela de erros do guia (arquivo 05, §6) e prefixos (`CPF-`/`NIS-`/`CEP-`/`REGP-`/`LKP-`).

**Alternativas rejeitadas**: UI ramificar por status HTTP (proibido — Princ. II).

## D5 — Scroll infinito

**Decisão**: **`IntersectionObserver`** (Web API) observando um *sentinel* no fim da lista → dispara o carregamento da próxima página (cursor). `createAsync` busca a página; as páginas acumulam num `signal`; `cleanup` no `onCleanup`.

**Justificativa**: Princ. IV — `IntersectionObserver` é nativo (sem react-intersection-observer nem virtualização externa). Reatividade só no binding (Princ. III).

**Alternativas rejeitadas**: TanStack Virtual/Query (Princ. IV); scroll listener com `getBoundingClientRect` (mais custoso que `IntersectionObserver`).

## D6 — Modelo de paginação por cursor (ViewModel puro)

**Decisão**: o **ViewModel puro** detém a lógica: `mergeNextPage(state, page)` (append + atualiza `nextCursor`/`hasMore`), `isExhausted(state)`, `isEmpty(state)`. O binding só dispara e guarda flag de *in-flight* (anti-duplo-fetch). Reset total ao mudar o recorte (D7).

**Justificativa**: Princ. III — núcleo testável sem Solid (`patient-list.view-model.test.ts` cobre merge/vazio/fim).

**Alternativas rejeitadas**: estado de paginação dentro do componente (não testável puro).

## D7 — Busca + filtro (debounce nativo)

**Decisão**: busca por nome com **debounce via `setTimeout`** (helper próprio no binding, ~300ms) + filtro de situação imediato. Qualquer mudança de recorte **reinicia** a paginação (cursor nulo, páginas zeradas).

**Justificativa**: Princ. IV — debounce é trivial com `setTimeout`/`clearTimeout`, sem lodash. Reiniciar evita misturar páginas de recortes diferentes (SC-003).

**Alternativas rejeitadas**: `lodash.debounce`/`rxjs` (Princ. IV).

## D8 — Cache de catálogos de domínio (por sessão)

**Decisão**: `domain-cache.ts` usa **`query` do Solid Router** com chave = `tableName` (dedup + cache na sessão de navegação); a allowlist das 13 tabelas é **enforçada no BFF** (400 `LKP-001`). O accessor é exposto por `modules/domains/public-api` para os selects das features de escrita.

**Justificativa**: Princ. IV — `query` já memoiza/dedup; não precisa de cache-lib. Guia §3 (cache TTL=sessão; só `ativo=true`; nunca hardcodar).

**Alternativas rejeitadas**: store global manual com invalidação por tempo (reinventa o `query`); cachear no BFF com Redis (desnecessário p/ dados de referência pequenos; TTL de sessão no client basta neste incremento).

## D9 — Testar o BFF sem o `social-care` (Princ. VI)

**Decisão**: **stub HTTP upstream** em `tests/support/social-care-stub.ts` (via `Bun.serve`) devolvendo os envelopes/fixtures documentados; os contract tests injetam um `SocialCareClient` apontado ao stub (ou injetam um fake da porta). Cobrem: Bearer encaminhado, mapeamento de query (`search/status/limit/cursor`), desembrulho de envelope, paginação, allowlist e mapa de erro. **Aceite real** = Gherkin `01`/`04` contra o `social-care` em DEV.

**Justificativa**: Princ. VI proíbe mock em **`src/`**, não em **`tests/`**; o stub é fixture de teste. Mantém o BFF honesto (sem fallback fabricado) e ainda testável sem o backend de pé (que hoje não sobe local — imagens GHCR indisponíveis).

**Alternativas rejeitadas**: mock do `fetch` dentro de `src/` (viola Princ. VI); pular o teste de orquestração (perda de cobertura do contrato).

## D11 — Transporte de dados client↔BFF (server function, não Eden-HTTP no SSR)

**Decisão**: o client acessa as rotas BFF via **SolidStart `query` + `"use server"`** (server functions em `modules/<f>/server/*.fn.ts`) que chamam **`app.handle('/api/...', { cookie })`** in-process — **espelhando o `getCurrentUserFn` da feature 001**. O cookie de sessão vem do `getRequestEvent()` no SSR (e automático no RPC do browser). As **rotas Elysia continuam sendo a fronteira e a orquestração** (requireSession + Bearer + `SocialCareClient` + envelope + mapa de erro), testadas por contract test com `SocialCareClient` fake injetado em `createApp(deps)`.

**Justificativa**: a lista renderiza no SSR (createAsync), o que com Eden-HTTP exigiria (a) um hop HTTP do servidor a si mesmo e (b) encaminhar o cookie da requisição de entrada — além do prefixo `/api` duplicado do `treaty<App>`. O `app.handle` in-process evita o hop, o `"use server"` mantém `~/server/app` (jose/social-care/segredos) **fora do bundle do browser** (Princ. I), e é o padrão **já provado** na 001. O Eden (`~/lib/eden`) permanece disponível como referência de tipo; a otimização `treaty(app)` fica para depois (como já anotado em `eden.ts`).

**Alternativas rejeitadas**: Eden-HTTP no SSR (hop + cookie-forward + prefixo duplicado); fetch client-only com skeleton no SSR (perde o render server-side da lista); `treaty(app)` direto (leaka o servidor ao client se não for guardado por `isServer`).

## D10 — Navegação no shell

**Decisão**: adicionar a entrada **"Pacientes" → `/patients`** no `root.view-model.ts` do shell (feature 001), substituindo o placeholder `/people`. A lista vive em `routes/(app)/patients/index.tsx` (já protegida pelo guard 001); o detalhe-stub em `routes/(app)/patients/[id].tsx`.

**Justificativa**: o menu da 001 era placeholder; esta feature dá significado real. `/patients` (pacientes do `social-care`) ≠ `/people` (identidades do people-context, feature futura).

**Alternativas rejeitadas**: manter `/people` (confunde paciente com identidade); pôr a lista na home `/` (a home permanece a saudação; pacientes têm rota própria, escalável p/ sub-rotas `/patients/:id`).
