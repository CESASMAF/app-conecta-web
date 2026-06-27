# ADR-0002 (feature): Tratamento de séries esparsas e supressão K=5 na camada de view model

**Feature**: `specs/003-analysis-bi-web/` · **Status**: Aceito
**Data**: 2026-06-12 · **Consultor**: `/acdg-skills:software-architect`

> ADR de feature (frontend). Decisões arquiteturais relevantes exigem **citação canônica** via
> `skills_citar`. Não contraria ADR aceito da constituição web_02 — aplica
> [Princípio I (BFF-Orchestrated Boundary)](../../../.specify/memory/constitution.md),
> [Princípio III (MVVM × DDD)](../../../.specify/memory/constitution.md) e o
> [ADR-0001 local](./adr.md). Segue o precedente dos ADR-0002 de `001-social-care-web` e
> `002-people-context-web` (mapeamento de erros → tags i18n), adaptado a um contrato **sem
> códigos estruturados** e com semântica estatística própria (supressão e gaps).

## Contexto

O contrato do `analysis-bi` tem três particularidades que nenhum outro serviço do
ecossistema tem:

1. **Séries esparsas**: períodos sem dados **não aparecem** na resposta de
   `GET /api/v1/indicators/{axis}` — uma série de jan/2025 a jun/2025 pode voltar só com
   `2025-01`, `2025-03` e `2025-06`. Gráficos de linha/barra que renderizassem o payload
   cru colapsariam o eixo temporal e fariam "mar/2025" parecer vizinho de "jun/2025",
   distorcendo tendências. Há ainda ambiguidade semântica: período ausente ≠ zero reportado
   (pode ser "nenhum caso" ou "nenhum grupo sobreviveu ao K=5 naquele mês").
2. **Supressão K=5 como metadado**: o envelope traz
   `meta: { k_threshold: 5, suppressed_groups, total_records }`; quando
   `suppressed_groups > 0`, células foram omitidas por privacidade (`HAVING COUNT(*) >= 5`)
   e a constituição ([Princípio I — Iron Frontier](../../../.specify/memory/constitution.md))
   **obriga** a UI a comunicar isso — sem inventar os dados que faltam, sem permitir contorno
   ([ADR-0001 local](./adr.md)).
3. **Erros sem código estruturado**: diferente do `social-care` (`PAT-XXX`) e do
   `people-context` (`PEO/ROL/IDP/AUTH-XXX`), o body de erro é
   `{ data: { error: "Bad Request", status: 400, message: "invalid period_start: expected YYYY-MM format" }, meta: {…} }`
   — só HTTP status + `message` em EN, livre para mudar em patch. Status relevantes: 400
   (params inválidos), 401 (JWT inválido/ausente), 404 (eixo desconhecido), 429 (rate limit
   **global**, token bucket — MED-002 do FINAL-REPORT), 500, 501 (`metadata/regions`
   planejado) e 503 (`/ready` — DB/NATS indisponível).

Forças da constituição ([`constitution.md`](../../../.specify/memory/constitution.md)):
[Princípio I (BFF-Orchestrated Boundary)](../../../.specify/memory/constitution.md) — o BFF
orquestra e o componente recebe a série **pronta**, não corrige eixo temporal no JSX;
[Princípio II (Errors as Values)](../../../.specify/memory/constitution.md) — unions de
string literais, sem `Error` subclass, switch exaustivo via `never`;
[Princípio III (MVVM × DDD)](../../../.specify/memory/constitution.md) — ViewModel puro com
binding Solid separado; [Princípio IV (Bun-Native)](../../../.specify/memory/constitution.md)
— i18n custom em vez de biblioteca npm; [Princípio V (TypeBox/Eden end-to-end type
safety)](../../../.specify/memory/constitution.md) — TypeBox na borda, Eden propaga o tipo;
[Princípio VI (Honesty — no mocks)](../../../.specify/memory/constitution.md) — fakes in-memory
em `tests/` apenas, não em `src/`.

Referências de ADR do ecossistema web_02:
[ADR-0002 (Errors as Values)](../../adr/0002-errors-as-values.md) ·
[ADR-0004 (Client/Server split MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) ·
[ADR-0009 (framework-agnostic client)](../../adr/0009-framework-agnostic-client.md) ·
[ADR-0010 (BFF orchestration / fn naming)](../../adr/0010-bff-orchestration-fn-naming.md) ·
[ADR-0011 (no mocks)](../../adr/0011-no-mocks-in-production.md)

## Decisão

**O ViewModel (BFF + binding Solid) absorve as três particularidades do contrato: preenche os
gaps das séries esparsas no client, deriva o estado de supressão (`suppressedGroups > 0` →
banner obrigatório) e traduz erros por HTTP status para `AppError.kind` (union de string
literals) resolvido em dicionário i18n — a `message` crua do backend nunca chega ao
usuário e nenhum componente de gráfico recebe série com eixo temporal furado.**

- **Gap filling como lógica pura de domain do BFF**
  (`fill-series-gaps.use-case.ts`, testada sem relógio real —
  [Princípio VI — Honesty](../../../.specify/memory/constitution.md)):
  a partir de `PeriodRange` + `Granularity`, gera a sequência completa de períodos
  (`2025-01 … 2025-06`; `2025-Q1 …`; `2025 …`) e funde com os pontos recebidos; período
  ausente vira `{ period, value: 0, gap: true }`. O componente de gráfico renderiza pontos
  `gap: true` com tratamento visual próprio (cor neutra/hachura + tooltip "sem dados
  publicáveis no período") e a tabela acessível equivalente exibe "—" em vez de "0".
  Zero real reportado pelo backend (`value: 0` presente no payload) permanece `gap: false`.
- **Supressão como estado derivado, não como dado**: o adapter propaga
  `kThreshold`/`suppressedGroups`/`totalRecords` para o Model; o ViewModel puro
  (`*.view-model.ts`) deriva `hasSuppression = suppressedGroups > 0` e emite
  `SuppressionNoticeRaised` ([Princípio III — MVVM](../../../.specify/memory/constitution.md)).
  A UI renderiza banner persistente com a tag `'k-anonymity-suppression'`
  ("X grupos suprimidos por privacidade — K=5") junto de **todo** gráfico/tabela/export do
  resultado afetado. O banner não é dismissível enquanto o resultado estiver na tela; o
  ViewModel **não** tenta estimar, somar ou redistribuir os grupos suprimidos
  ([ADR-0001 local](./adr.md)).
- **Mapeamento de erros por status → `AppError.kind`**
  (`analysis-bi-error.mapper.ts`): sem códigos estruturados, o mapa é por **HTTP status +
  contexto da chamada**, produzindo a union `AnalysisBiError`:
  `400 → 'invalid-indicator-query'` (com refinamento local: a validação TypeBox da borda já
  impede `YYYY-MM` malformado e `top < 0` de saírem do BFF — um 400 real indica drift de
  contrato e é logado como tal), `401 → 'unauthorized'` (vira evento `SessionExpired`),
  `404 → 'unknown-axis'`, `429 → 'rate-limited'` (flag `retryable: true` + `RateLimitHit`
  no Event Bus: o rate limit do serviço é **global**, não per-IP — MED-002 —, então o
  ViewModel pausa refetch e oferece retry manual via `action` do `@solidjs/router`),
  `500 → 'analysis-internal-error'`, `501 → 'not-implemented'` (ex.: `metadata/regions`,
  tratado como feature ausente, não como falha), `503 → 'analysis-unavailable'` (campo
  tolerável `| null` no ViewModel + `AnalysisServiceDegraded` — banner de degradação, sem
  derrubar o layout;
  [Princípio II — Errors as Values](../../../.specify/memory/constitution.md), fallback
  gracioso).
- O tipo `AnalysisBiError` é union de literais; consumo em `switch` exaustivo com `never`.
  Status fora do mapa → `'unknown-analysis-bi-error'` (fallback), preservando `status` e
  `message` em `meta` para log estruturado no BFF (payloads de indicadores não têm PII,
  mas o log segue a mesma política dos demais módulos).
- O client resolve a tag via dicionário i18n tipado (sem dependência npm extra —
  [Princípio IV — Bun-Native](../../../.specify/memory/constitution.md)):
  `errors['analysis-bi']['rate-limited'] = 'Muitas consultas em sequência. Aguarde alguns segundos e tente novamente.'`
  — dicionário `src/i18n/pt-BR/errors.ts` tipado por chave (chave inexistente = erro de
  compilação). Filtros mapeiam `'invalid-indicator-query'` para o campo correspondente do
  formulário de filtros, mantendo a validação TypeBox da borda como primeira linha.

O Eden Treaty propaga os tipos do schema TypeBox do BFF ao client — não há redeclaração de
Model no client ([ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md),
[ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)). O handler BFF segue a convenção
de naming `*.query.fn.ts` (leitura de indicadores) ou `*.service.fn.ts` (disparo de export)
([ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)).

**Fundamentação canônica** (citação ≥4 linhas):
> Create an isolating layer to provide clients with functionality in terms of their own
> domain model. The layer talks to the other system through its existing interface,
> requiring little or no modification to the other system. Internally, the layer translates
> in both directions as necessary between the two models.
> — *(Linha 5654, p. 365, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

## Consequências

- **Positivas**: componentes de gráfico recebem séries contínuas e ficam triviais (zero
  lógica temporal no JSX —
  [Princípio III — MVVM](../../../.specify/memory/constitution.md)); "sem dados" e "zero" são
  visualmente distintos, evitando leitura estatística errada; a supressão K=5 é comunicada de
  forma consistente e impossível de esquecer (estado derivado + evento, não convenção); UI
  desacoplada das `message` em EN do Go — locale-ready; 429 global vira fluxo controlado em
  vez de tempestade de retries; 503 degrada graciosamente; exaustividade dos kinds verificada
  em compile-time.
- **Negativas / custo**: o gap filling duplica no client um conhecimento de calendário
  (sequência de meses/trimestres) que o backend poderia entregar — preço aceito para manter
  o contrato do serviço enxuto e sem paginação; mapear por HTTP status é menos granular que
  códigos estruturados (um 400 de `period_start` e um de `mesoregion` inexistente viram o
  mesmo kind — diferenciação fica com a validação TypeBox da borda, que cobre os casos antes
  do request); se o `analysis-bi` um dia adotar códigos `ANA-XXX`, o mapper precisa ser
  reescrito (ver ponto de troca); testes com fakes in-memory obrigatórios para séries esparsas,
  `suppressed_groups > 0`, 429 e 503 em todo handler do módulo
  ([ADR-0011](../../adr/0011-no-mocks-in-production.md)).
- **Ponto de troca / reversibilidade**: toda a tradução vive em
  `analysis-bi-error.mapper.ts` (server) + namespace `errors.analysis-bi` (i18n) +
  `fill-series-gaps.use-case.ts` (domain do BFF). Se o backend passar a emitir códigos
  estruturados ou séries densas (períodos zerados incluídos), troca-se mapper/use case sem
  tocar em nenhuma tela — os componentes só conhecem `IndicatorSeriesModel` e
  `AnalysisBiError`.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| Exibir `message` do backend diretamente na UI | Strings em EN, no tom do serviço, mutáveis em patch; acopla UX ao Go; impossibilita EN/ES sem mudar o backend; viola o precedente dos ADR-0002 irmãos e o [Princípio II](../../../.specify/memory/constitution.md). |
| Gap filling dentro do componente de gráfico (`ui/`) | Lógica de calendário no JSX viola o [Princípio III](../../../.specify/memory/constitution.md) (MVVM — view burra); cada gráfico reimplementaria a regra (drift garantido); impossível testar puro sem DOM. |
| Pedir ao backend séries densas (períodos zerados) ou paginação | Exige mudança no serviço Go fora do escopo da feature; períodos zerados artificialmente apagariam a distinção "sem dados publicáveis" × "zero real", que a UI precisa comunicar (K=5). |
| Tratar `suppressed_groups` como detalhe de debug (sem banner) | Viola a Iron Frontier da [`constitution.md`](../../../.specify/memory/constitution.md) e a LGPD por omissão: o leitor assumiria que o agregado é completo; supressão silenciosa induz conclusão estatística errada e esconde o mecanismo de privacidade. |
| Interpolar/estimar valores dos gaps e células suprimidas | Fabricaria dado onde o serviço deliberadamente não publica; contorna o K=5 por inferência visual ([ADR-0001 local](./adr.md)); inaceitável em dado de saúde. |
| Parsear a `message` (regex) para recuperar granularidade do 400 | Acopla a frases livres do Go que mudam sem aviso; a validação TypeBox da borda já cobre os casos antes do request — o ganho seria nulo e a fragilidade, alta. |
| Retry automático agressivo no 429 | O rate limit é global (MED-002): retries automáticos de N usuários amplificam a exaustão do bucket e degradam todos; pausa + retry manual via `action` do `@solidjs/router` é o comportamento correto até o serviço adotar limite per-IP. |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I, II, III, IV, V, VI
- [ADR-0001 (análisis-bi local)](./adr.md) — sem drill-down individual, K=5 jamais contornado
- [ADR-0002 (Errors as Values)](../../adr/0002-errors-as-values.md) — Result<T,E>, switch exaustivo
- [ADR-0004 (Client/Server MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — ViewModel puro separado do binding
- [ADR-0009 (framework-agnostic client)](../../adr/0009-framework-agnostic-client.md) — ViewModel sem solid-js
- [ADR-0010 (BFF orchestration / fn naming)](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`
- [ADR-0011 (no mocks in production)](../../adr/0011-no-mocks-in-production.md) — fakes em `tests/` apenas
- [domain.fe.md](./domain.fe.md) — Model do client e eventos
- [domain.md](./domain.md) — domínio CORE Go (fonte de verdade das invariantes K=5)
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints e gaps do serviço
- [ADR index](../../adr/README.md) — todos os ADRs web_02
