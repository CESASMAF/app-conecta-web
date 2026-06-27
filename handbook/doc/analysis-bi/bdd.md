# BDD: Dashboards Web Analysis-BI (front+BFF)

**Feature**: `specs/003-analysis-bi-web/` · **Consultores**: `/acdg-skills:requirements-engineer` + `/acdg-skills:tdd-strategist`

> Fase 6 da pipeline `core-api-sdd`. Cenários Given-When-Then derivados dos critérios de
> aceitação (descoberta/spec). Cada cenário vira teste na fase 7 (TDD/RED). Idioma: PT
> (negócio); identificadores no código permanecem EN. Grave os `.feature` em `specs/003-analysis-bi-web/bdd/`.

## Cobertura

| História (US) | Cenário(s) | Prioridade |
|---|---|---|
| US-001 Visualizar indicadores demográficos (pirâmide etária) | CT-001, CT-004 | P1 |
| US-002 Transparência de privacidade (supressão K=5) | CT-002 | P1 |
| US-003 Períodos sem dados e séries esparsas | CT-003, CT-010 | P1 |
| US-004 Top N diagnósticos CID-10 (epidemiológico) | CT-005 | P1 |
| US-005 Exportar dados nos 8 formatos | CT-006, CT-011 | P1 |
| US-006 Robustez frente a erros do contrato (400/429/503) | CT-007, CT-008, CT-009 | P1 |
| US-007 Acessibilidade de dataviz (alternativa textual) | CT-012 | P1 |

---

```gherkin
# language: pt
Funcionalidade: Dashboard demográfico (pirâmide etária)
  Como gestora da associação (papel autorizado a indicadores)
  Quero visualizar a pirâmide etária dos pacientes por faixa etária, sexo e mesorregião
  Para orientar decisões de política assistencial sem nunca acessar dados individuais

  Contexto:
    Dado que estou autenticada via Authentik com papel autorizado a dashboards
    E o BFF possui sessão válida em cookie HttpOnly, sem token exposto ao browser
    E o BFF injeta Authorization: Bearer no servidor em toda chamada ao analysis-bi
    E o RBAC é aplicado no BFF, pois o serviço ainda não enforça roles (HIGH-003)

  # CT-001 — pirâmide etária com filtros (P1)
  Cenário: Visualizar pirâmide etária filtrada por período e mesorregião
    Dado que seleciono period_start "2025-01", period_end "2025-06" e a mesorregião "Norte de Roraima"
    Quando abro o dashboard demográfico
    Então o BFF envia GET /api/v1/indicators/demographics?period_start=2025-01&period_end=2025-06&mesoregion=<code>
    E recebo 200 com o envelope { data: [...], meta: { k_threshold: 5, suppressed_groups, total_records, period } }
    E cada item traz labels { age_band, sex, mesoregion_name }, value e period
    E a pirâmide renderiza as 17 faixas etárias ("0-4" … "75-79", "80+") por sexo (MALE | FEMALE | UNKNOWN)
    E a legenda exibe o total de registros (meta.total_records) e o K-anonimato (K=5)

  # CT-002 — supressão K=5 comunicada (P1)
  Cenário: Grupos suprimidos por privacidade são comunicados de forma visível
    Dado que a resposta do eixo demográfico traz meta.suppressed_groups igual a 3
    Quando o dashboard é renderizado
    Então um banner exibe "3 grupos suprimidos por privacidade (K-anonimato, K=5)"
    E o banner explica que grupos com menos de 5 pacientes são omitidos para impedir reidentificação
    E o banner é anunciado a leitores de tela com role="status"
    E quando meta.suppressed_groups é 0, nenhum banner de supressão aparece

  # CT-003 — período sem dados → estado vazio (P1)
  Cenário: Período sem nenhum dado exibe estado vazio honesto
    Dado que seleciono period_start "2030-01" e period_end "2030-03"
    Quando o BFF consulta o eixo demográfico e recebe 200 com data vazio e meta.total_records 0
    Então o dashboard exibe o estado vazio "Sem dados para o período selecionado"
    E sugere ampliar o período ou remover o filtro de mesorregião
    E nenhum gráfico vazio ou eixo sem série é renderizado como se fosse "zero casos suprimidos"

  # CT-004 — granularidade trimestral (P1)
  Cenário: Alternar para granularidade trimestral reagrupa a série
    Dado que o dashboard demográfico está em granularidade mensal com period "2025-01" a "2025-12"
    Quando seleciono a granularidade "Trimestral"
    Então o BFF envia GET /api/v1/indicators/demographics?period_start=2025-01&period_end=2025-12&granularity=quarterly
    E os itens retornam com period no formato "2025-Q1" … "2025-Q4"
    E o eixo temporal exibe os rótulos formatados "T1 2025" … "T4 2025"
    E trimestres ausentes na resposta são preenchidos no client com valor zero e marca visual de "sem dados"

Funcionalidade: Dashboard epidemiológico (top N CID-10)
  Como gestora da associação
  Quero ver os N diagnósticos CID-10 mais frequentes no período
  Para entender o perfil epidemiológico agregado dos pacientes raros

  # CT-005 — top N CID-10 (P1)
  Cenário: Listar top 10 diagnósticos CID-10 do período
    Dado que estou no dashboard epidemiológico com period_start "2025-01" e period_end "2025-06"
    Quando seleciono "Top 10"
    Então o BFF envia GET /api/v1/indicators/epidemiological?period_start=2025-01&period_end=2025-06&top=10
    E cada item traz labels { icd_code, icd_label } com value agregado
    E o gráfico de barras exibe no máximo 10 diagnósticos ordenados por value decrescente
    E cada barra mostra o código CID-10 e o rótulo do diagnóstico
    E grupos com menos de 5 casos não aparecem (já suprimidos pelo backend via K=5)

Funcionalidade: Export de dados agregados
  Como gestora da associação
  Quero exportar o dataset agregado em formatos abertos e padrões do SUS
  Para usar os dados em TABWIN/DataSUS, planilhas e integrações FHIR/RNDS

  # CT-006 — export CSV com filename correto (P1)
  Cenário: Exportar o dataset demográfico em CSV baixa arquivo nomeado pelo backend
    Dado que estou no dashboard demográfico com period_start "2025-01" e period_end "2025-06"
    Quando aciono "Exportar" e escolho o formato "CSV"
    Então o BFF envia GET /api/v1/export/csv?dataset=demographics&period_start=2025-01&period_end=2025-06
    E a resposta traz Content-Disposition: attachment; filename="acdg-demographics-2025-01_2025-06.csv"
    E o browser inicia o download preservando exatamente o filename do backend
    E o BFF repassa o corpo como binário, sem tentar parse JSON
    E a UI confirma "Export gerado com K-anonimato aplicado (K=5)"

  # CT-011 — os 8 formatos disponíveis (P1)
  Esquema do Cenário: Cada formato de export usa o endpoint e o rótulo amigável corretos
    Dado que abro o menu de export do dataset "demographics"
    Quando escolho o formato "<rotulo>"
    Então o BFF envia GET /api/v1/export/<format>?dataset=demographics&period_start=2025-01&period_end=2025-06
    E o download usa a extensão "<ext>"

    Exemplos:
      | format  | rotulo        | ext     |
      | csv     | CSV           | csv     |
      | json    | JSON          | json    |
      | xml     | XML           | xml     |
      | parquet | Parquet       | parquet |
      | dbf     | DBF (TABWIN)  | dbf     |
      | dbc     | DBC (DataSUS) | dbc     |
      | ods     | ODS           | ods     |
      | fhir    | FHIR (RNDS)   | json    |

Funcionalidade: Robustez frente a erros do contrato
  Como sistema
  Quero traduzir os erros HTTP do analysis-bi (sem códigos estruturados) em mensagens acionáveis
  Para que a gestora nunca veja um erro técnico cru nem perca o dashboard por um erro transitório

  # CT-007 — 400 de período malformado (P1)
  Cenário: Período malformado é bloqueado na borda e o 400 do backend é mapeado mesmo assim
    Dado que o seletor de período só produz valores YYYY-MM válidos
    E a validação TypeBox (Elysia.t) do BFF rejeita period_start "2025-13" e range invertido (period_end anterior a period_start)
      antes de qualquer chamada de rede, com mensagem i18n associada ao campo
    Quando, por defesa em profundidade, uma chamada chega ao backend com period_start malformado
    Então o backend responde 400 com o body { data: { error: "Bad Request", status: 400,
      message: "invalid period_start: expected YYYY-MM format" }, meta: { ... } }
    E o mapper converte o status 400 em AppError com a mensagem "Período inválido — use o formato AAAA-MM"
    E nenhum texto técnico em EN do backend é exibido à usuária

  # CT-009 — 429 com retry/backoff (P1)
  Cenário: Rate limit do serviço dispara retry com backoff sem quebrar o dashboard
    Dado que o analysis-bi responde 429 (rate limit global do serviço — MED-002)
    Quando o dashboard consulta um eixo de indicadores
    Então a UI mantém os últimos dados válidos visíveis com o aviso "Muitas consultas — tentando novamente"
    E o BFF re-tenta com backoff exponencial respeitando Retry-After quando presente
    E após exceder o teto de tentativas, exibe erro com ação manual "Tentar novamente"
    E nenhuma mutação é envolvida (somente leitura — retry é seguro)

  # CT-008 — 503 do /ready (P1)
  Cenário: Serviço não pronto exibe estado degradado com diagnóstico
    Dado que GET /ready responde 503 com { data: { status, database: false, nats: true } }
    Quando abro qualquer dashboard
    Então a UI exibe o estado degradado "Indicadores temporariamente indisponíveis"
    E informa que os dados voltarão sem perda (a ingestão NATS é at-least-once)
    E re-sonda o /ready em intervalo crescente, restaurando o dashboard quando voltar 200
    E nenhum detalhe interno (database/nats) é exposto à usuária — apenas registrado no log do BFF

  # CT-010 — gap filling de séries esparsas (P1)
  Cenário: Meses sem dados aparecem no eixo temporal sem inventar valores
    Dado que a resposta mensal do range "2025-01" a "2025-06" só contém os periods "2025-01", "2025-03" e "2025-06"
    Quando a série temporal é renderizada
    Então os meses "2025-02", "2025-04" e "2025-05" aparecem no eixo com valor zero e marca de "sem dados"
    E nenhuma interpolação visual liga os pontos como se houvesse medição nos meses ausentes
    E os rótulos do eixo exibem "jan/2025" … "jun/2025" na ordem cronológica completa

Funcionalidade: Acessibilidade de dataviz
  Como pessoa usuária de leitor de tela
  Quero uma alternativa textual equivalente a cada gráfico
  Para acessar os mesmos indicadores agregados sem depender da visualização

  # CT-012 — alternativa textual/tabela (P1)
  Cenário: Todo gráfico oferece tabela equivalente acessível
    Dado que o dashboard demográfico renderizou a pirâmide etária
    Quando aciono "Ver como tabela"
    Então uma tabela com cabeçalhos (faixa etária, sexo, mesorregião, valor) apresenta os mesmos dados do gráfico
    E a tabela é navegável por teclado e anunciada por leitores de tela
    E o banner de supressão, quando presente, também precede a tabela
    E o gráfico em si possui descrição resumida via aria-label com eixo, período e total de registros
```

## Mapeamento BDD → testes (preenchido na fase 7/TDD)

| Cenário | Arquivo de teste | Nível (domínio/app/integração) |
|---|---|---|
| CT-001 | `src/features/003-analysis-bi-web/infrastructure/__tests__/get-indicators.query.fn.test.ts` + `application/__tests__/age-pyramid.view-model.test.ts` + `e2e/demographics-dashboard.spec.ts` | integração (fake in-memory) + application + E2E |
| CT-002 | `application/__tests__/suppression-notice.view-model.test.ts` + `ui/__tests__/suppression-banner.test.tsx` | application + componente |
| CT-003 | `ui/__tests__/empty-period-state.test.tsx` | componente |
| CT-004 | `domain/__tests__/gap-filling.test.ts` (quarterly) + `infrastructure/__tests__/get-indicators.query.fn.test.ts` (granularity) | domínio + integração |
| CT-005 | `application/__tests__/top-diagnoses.view-model.test.ts` + `infrastructure/__tests__/get-indicators.query.fn.test.ts` (top) | application + integração |
| CT-006 | `infrastructure/__tests__/export-download.service.fn.test.ts` + `e2e/export-csv.spec.ts` | integração (fake in-memory) + E2E |
| CT-007 | `domain/__tests__/period.vo.test.ts` + `application/__tests__/app-error-mapper.test.ts` (400) | domínio + application |
| CT-008 | `infrastructure/__tests__/readiness.query.fn.test.ts` + `ui/__tests__/degraded-state.test.tsx` | integração + componente |
| CT-009 | `infrastructure/__tests__/get-indicators.query.fn.test.ts` (429 retry/backoff) | integração (fake in-memory) |
| CT-010 | `domain/__tests__/gap-filling.test.ts` (monthly) + `ui/__tests__/sparse-series-chart.test.tsx` | domínio + componente |
| CT-011 | `infrastructure/__tests__/export-download.service.fn.test.ts` (parametrizado nos 8 formatos) | integração (fake in-memory) |
| CT-012 | `ui/__tests__/chart-table-alternative.test.tsx` + axe nas 5 telas | componente + Q4 |

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípios I–VI (BFF-Orchestrated Boundary, Errors as Values, Vertical-Modular, Bun-Native, Type Safety, Honesty/No Mocks)
- [ADR-0010 — BFF Elysia orquestrador; fn naming](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts` / `*.service.fn.ts`; handler Elysia via Eden treaty
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md) — `Result<T,E>`; Eden devolve `{ data, error }`; ponte p/ ErrorBoundary do Solid
- [ADR-0004 — Client-Server Split MVVM/DDD](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira Eden treaty → rota Elysia; ViewModel puro + binding Solid
- [ADR-0009 — Framework-agnostic client](../../adr/0009-framework-agnostic-client.md) — ViewModel puro (*.view-model.ts) + binding Solid (*.binding.ts)
- [ADR-0011 — No mocks in production](../../adr/0011-no-mocks-in-production.md) — fakes/in-memory em vez de MSW
- [ADR-0003 — Bun supply chain](../../adr/0003-bun-supply-chain.md) — `bun:test`; `bun test` como runner
- [ADR-README](../../adr/README.md) — tabela de substituições e regra-mãe Bun-native
- Docs irmãos: [tdd.md](./tdd.md) · [qa-test-plan.md](./qa-test-plan.md) · [checklist.md](./checklist.md) · [review.md](./review.md) · [tasks.md](./tasks.md)
- Referência offline BFF: `../../reference/framework/elysia/` · `../../reference/framework/solidstart/` · `../../reference/runtime/bun/`
