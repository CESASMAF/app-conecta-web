# Feature Specification: Indicadores e BI — Web

**Feature Branch**: `003-analysis-bi-web`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Interface web (front + BFF SolidStart + Elysia, repo `web_02/`) de dashboards de indicadores agregados e anonimizados da ACDG, consumindo a API do `svc-analysis-bi` via BFF Elysia — o browser nunca vê token; o BFF injeta `Authorization: Bearer` (OIDC/Authentik). Domínio somente leitura: consultas e exports, nenhuma mutação."

> **Variante `-fe` (frontend / web-app).** Espelha o `spec.md` (contrato core-api) mas troca a
> semântica de backend pela do **front + BFF unificado** (SolidStart + Elysia). A spec descreve o **quê**
> (jornadas, requisitos, critérios) — o **como** (handlers Elysia, módulos, MVVM) fica no `plan.fe.md`.
> Governa `src/`; conformidade verificada no "Constitution Check" do `plan.fe.md` (Princípios I–VI da
> [constituição web_02](../../../.specify/memory/constitution.md)).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboards demográfico e epidemiológico com filtros (Priority: P1)

A gestora abre o dashboard de indicadores e explora o eixo demográfico (pirâmide etária: faixa etária × sexo, filtrável por mesorregião) e o eixo epidemiológico (top N diagnósticos CID-10 com código e descrição). Um painel de filtros compartilhado controla período (início/fim em mês/ano), mesorregião IBGE e granularidade (mensal/trimestral/anual); o estado dos filtros vive na URL (compartilhável). Sempre que o backend reportar `suppressed_groups > 0`, o aviso de supressão por privacidade é exibido junto à visualização.

**Why this priority**: É o MVP — o retrato demográfico + epidemiológico é o dashboard mínimo de gestão e advocacy. Entrega valor sozinho: substitui as planilhas manuais e estabelece os componentes (filtros, gráficos, aviso de supressão) que os demais eixos reusam.

**Independent Test**: Fluxo completo via `/indicators/demographics` e `/indicators/epidemiological` com BFF fake/in-memory: carregar com período padrão, alterar filtros, observar atualização dos gráficos, aviso de supressão e estados vazio/erro.

**Acceptance Scenarios**:

1. **Given** a rota do dashboard demográfico com período padrão, **When** a tela carrega, **Then** a pirâmide etária (faixas "0-4" … "80+" × sexo) é renderizada a partir de `GET /api/v1/indicators/demographics` via BFF, com `meta.total_records` visível como contexto ("N registros agregados").
2. **Given** uma resposta com `meta.suppressed_groups > 0`, **When** o gráfico é renderizado, **Then** um aviso OBRIGATÓRIO e não-dispensável é exibido junto à visualização: "N grupos suprimidos por privacidade (K-anonimato, K=5)" — também anunciado a leitores de tela.
3. **Given** uma resposta com `meta.suppressed_groups = 0`, **When** o gráfico é renderizado, **Then** o aviso de supressão NÃO aparece (sem alarme falso).
4. **Given** o painel de filtros, **When** a gestora altera o período (ex.: jan/2025 → mar/2026) ou seleciona uma mesorregião, **Then** a UI exibe estado de carregamento, refaz a consulta com `period_start`/`period_end`/`mesoregion` e atualiza gráfico + URL.
5. **Given** granularidade "Trimestral" selecionada, **When** os dados retornam com `period: "2025-Q1"`, **Then** os rótulos do eixo do tempo são exibidos em PT-BR ("T1 2025"); "Anual" exibe "2025".
6. **Given** o dashboard epidemiológico com "Top 10" selecionado, **When** os dados retornam, **Then** o ranking exibe `icd_label` com o `icd_code` (CID-10) como apoio, ordenado por valor, distinguindo casos novos de acumulados.
7. **Given** qualquer gráfico renderizado, **When** a usuária aciona "Ver como tabela", **Then** os mesmos dados aparecem em tabela acessível (navegável por teclado/leitor de tela) — alternativa textual obrigatória.

---

### User Story 2 - Eixos socioeconômico, proteção e cuidado (Priority: P2)

A gestora navega para os três eixos restantes, reusando o mesmo painel de filtros: socioeconômico (distribuição de renda nas 6 faixas de salário mínimo, cobertura de benefícios BPC/PBF, insegurança alimentar), proteção (encaminhamentos por destino — UPA, CRAS, CREAS — e violações de direitos por tipo) e cuidado (atendimentos por tipo e completude média de avaliações).

**Why this priority**: Completa os 5 eixos com os mesmos componentes do P1 (filtros, envelope, supressão); são os eixos que sustentam advocacy de vulnerabilidade e o monitoramento da operação, mas dependem da fundação do P1.

**Independent Test**: Com fakes/in-memory servindo fixtures dos três eixos, navegar `/indicators/socioeconomic|protection|care`, verificando visualizações por eixo, rótulos PT-BR das dimensões, aviso de supressão e estados vazios.

**Acceptance Scenarios**:

1. **Given** o dashboard socioeconômico carregado, **When** os dados retornam, **Then** a distribuição de renda é exibida nas 6 faixas com rótulos PT-BR ("0–0,5 SM", "0,5–1 SM", "1–2 SM", "2–3 SM", "3–5 SM", "5+ SM") e os indicadores de benefício (BPC, Bolsa Família) aparecem como cartões/colunas próprias.
2. **Given** o dashboard de proteção, **When** filtrado por mesorregião, **Then** encaminhamentos por destino (UPA, CRAS, CREAS…) e violações de direitos por tipo exibem apenas o território filtrado — e, por se tratar de dado sensível, o aviso de supressão segue a mesma regra obrigatória do P1.
3. **Given** o dashboard de cuidado, **When** os dados retornam, **Then** atendimentos por tipo são exibidos por período e a completude média de avaliações aparece como indicador percentual (0–100%, derivado de assessment_completeness 0–1).
4. **Given** um eixo com `data: []` e `suppressed_groups > 0`, **When** a tela renderiza, **Then** o estado vazio explica a supressão: "Sem dados exibíveis — N grupos foram suprimidos por privacidade (K=5)" — nunca um gráfico em branco sem explicação.
5. **Given** a navegação entre eixos, **When** a gestora troca de aba/rota, **Then** os filtros ativos (período, mesorregião, granularidade) são preservados entre os 5 dashboards.

---

### User Story 3 - Central de exports em 8 formatos (Priority: P3)

O pesquisador (ou a gestora) abre a central de exports, escolhe um dos 5 datasets, um dos 8 formatos com nome amigável e dica de uso — CSV, JSON, XML, Parquet, DBF (TABWIN), DBC (DataSUS), ODS (LibreOffice), FHIR (RNDS) — confirma o período/mesorregião (herdados dos filtros ativos) e baixa o arquivo via BFF. O resumo pré-download informa total de registros e grupos suprimidos.

**Why this priority**: Jornada distinta (download, não visualização) que pressupõe os filtros do P1; alto valor para pesquisa e interoperabilidade, frequência menor que a consulta diária.

**Independent Test**: Na rota `/indicators/export` com fake/in-memory, selecionar dataset/formato/período e verificar a chamada ao BFF (`GET /api/v1/export/{format}?dataset=…`), o disparo do download com o nome `acdg-{dataset}-{period}.{ext}` e os estados de progresso/erro.

**Acceptance Scenarios**:

1. **Given** a central de exports, **When** a tela carrega, **Then** os 5 datasets e os 8 formatos são listados (de `metadata/datasets` e `metadata/formats` via BFF, com fallback estático) com nomes amigáveis e dicas: "DBF — compatível com TABWIN", "DBC — padrão DataSUS", "FHIR — interoperabilidade RNDS", "ODS — LibreOffice/Excel".
2. **Given** dataset `epidemiological`, formato CSV e período válido, **When** o usuário aciona "Exportar", **Then** o BFF faz o streaming de `GET /api/v1/export/csv?dataset=epidemiological&period_start=…&period_end=…` e o browser baixa `acdg-epidemiological-{period}.csv` — sem nenhuma URL do backend exposta.
3. **Given** o resumo pré-download, **When** o dataset/filtros são selecionados, **Then** a UI exibe `total_records` e, se houver supressão, o mesmo aviso obrigatório ("o arquivo exclui N grupos suprimidos por privacidade").
4. **Given** um export em andamento, **When** o usuário tenta exportar de novo, **Then** o botão permanece desabilitado até concluir ou falhar (sem downloads duplicados).
5. **Given** um export que falha (`5xx`/timeout), **When** o erro retorna, **Then** a UI exibe "Não foi possível gerar o arquivo — tente novamente" preservando a seleção feita.
6. **Given** a sessão de um papel sem permissão de export (regra do BFF), **When** a central é acessada, **Then** a rota responde com tela de acesso negado — o controle é imposto no BFF, não apenas escondido na UI.

---

### Edge Cases

- Período sem dados (`data: []`, `suppressed_groups = 0`): estado vazio orientativo — "Sem dados no período selecionado" com sugestão de ampliar o intervalo; nunca gráfico quebrado ou eixo vazio sem mensagem.
- Período 100% suprimido (`data: []`, `suppressed_groups > 0`): estado vazio específico de privacidade (cenário 4 do US-2) — distinto do "sem dados".
- Gaps em séries esparsas: o backend omite períodos sem dados; o client preenche os meses/trimestres/anos ausentes do intervalo com valor zero/nulo explícito antes de renderizar séries temporais — sem "encurtar" o eixo do tempo nem interpolar valores falsos.
- `400` de período malformado ou inválido (YYYY-MM errado, mesorregião inexistente, `top < 0`): a UI valida na borda (TypeBox / `Elysia.t` no handler) ANTES de chamar o serviço; um `400` residual do backend é traduzido apontando o filtro problemático (a `message` descritiva orienta, mas a string exibida é i18n PT-BR).
- `429` rate limit (token bucket global do serviço): a UI exibe "Muitas consultas em sequência — aguarde alguns segundos" com retry automático com backoff; o BFF mitiga com cache por combinação de filtros e debounce de mudanças rápidas no painel.
- `401` (sessão expirada no BFF): redirecionar ao login preservando a URL do dashboard (filtros estão na URL — nada se perde).
- `503`/indisponibilidade do serviço (`/ready` em vermelho): banner "Indicadores temporariamente indisponíveis" com retry — o shell da aplicação permanece funcional.
- Sem paginação no contrato: payloads chegam completos; renderização deve suportar o pior caso realista (~1000 linhas) sem travar — agregação/limitação visual é decisão do client.
- Intervalo de período invertido (início > fim): a UI impede a seleção (o seletor não permite fim < início) — espelho do `400` do backend.
- Resposta com `k_threshold` diferente de 5 (mudança futura do serviço): o aviso usa o valor de `meta.k_threshold` dinamicamente, nunca o literal 5 hardcoded.
- Valores monetários (total de benefícios) chegam em centavos: a UI formata em R$ (pt-BR) — nunca exibe o inteiro cru.
- Nenhum estado otimista nem reentrância de mutação: o domínio é somente leitura — não existem formulários de escrita nesta feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir 5 dashboards de indicadores (demográfico, epidemiológico, socioeconômico, proteção, cuidado) consumindo `GET /api/v1/indicators/{axis}` via handlers Elysia (`*.query.fn.ts`), com visualização adequada a cada eixo (pirâmide etária, ranking CID-10, distribuição por faixas de SM, barras por destino/tipo, séries de atendimento + completude).
- **FR-002**: Usuários DEVEM conseguir filtrar por período (início/fim, seletor mês/ano PT-BR → `YYYY-MM` cru no BFF), mesorregião IBGE e granularidade (mensal/trimestral/anual), com filtros preservados entre eixos e refletidos na URL via rotas SolidStart (`src/routes/analysis-bi/`).
- **FR-003**: O sistema DEVE validar todo input de filtro na borda do handler Elysia com TypeBox (`Elysia.t`) (`period_start`/`period_end` em `^\d{4}-\d{2}$`, intervalo não invertido, `granularity` no enum, `top` inteiro ≥ 0, eixo/dataset/formato em enums fechados) antes de chamar o `analysis-bi`.
- **FR-004**: O sistema DEVE exibir o aviso de supressão por privacidade SEMPRE que `meta.suppressed_groups > 0`, em toda visualização e no resumo de export, usando `meta.k_threshold` dinamicamente — aviso não-dispensável, perceptível visualmente e por leitor de tela.
- **FR-005**: O sistema DEVE preencher gaps de séries temporais esparsas no client (períodos do intervalo ausentes da resposta viram pontos explícitos de valor zero/nulo), respeitando a granularidade ativa.
- **FR-006**: O sistema DEVE oferecer alternativa tabular acessível ("Ver como tabela") para toda visualização gráfica.
- **FR-007**: O sistema DEVE oferecer a central de exports com 5 datasets × 8 formatos (nomes amigáveis + dica de uso: CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS/LibreOffice, FHIR/RNDS), com resumo pré-download (`total_records`, supressão) e download via streaming do BFF preservando `Content-Disposition`.
- **FR-008**: O sistema DEVE descobrir datasets/formatos via `GET /api/v1/metadata/datasets|formats` com fallback estático tipado (o contrato é estável; a metadata evita hardcode, não é dependência dura).
- **FR-009**: O sistema DEVE traduzir erros HTTP do serviço (sem códigos estruturados) em mensagens i18n PT-BR por status: `400` aponta o filtro inválido, `401` renova sessão, `429` informa limite com retry/backoff, `5xx`/timeout exibem indisponibilidade com "tentar novamente" — preservando o status através do BFF; a UI nunca lê status HTTP, só `AppError.kind` via Eden `{ data, error }`.
- **FR-010**: O sistema DEVE refletir a natureza somente leitura do domínio: nenhuma ação de escrita, nenhum drill-down individual (só agregados ≥ K), nenhuma tentativa de reconstruir células suprimidas (ex.: exibir subtrações de totais que revelem grupos < K).
- **FR-011**: O sistema DEVE impor autorização por papel no BFF (compensação do HIGH-003 do serviço): a matriz papel × capacidade (ver dashboards / exportar) é checada no handler Elysia, não apenas na renderização — papel não autorizado recebe acesso negado mesmo via deep-link.
- **FR-012**: O sistema DEVE garantir que toda chamada saia do BFF com `Authorization: Bearer` injetado — o browser nunca envia nem conhece token, URL do `analysis-bi` ou secret (Princípio I — [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)).
- **FR-013**: O sistema DEVE formatar valores no padrão pt-BR: moeda (centavos → R$), percentuais (completude 0–1 → 0–100%), rótulos de período ("mar/2025", "T1 2025", "2025") e rótulos de dimensão (faixas etárias, faixas de SM, sexo).

### Key Entities *(inclua se a feature envolve dados)*

- **Célula de indicador**: item agregado `{ labels, value, period }` — dimensões generalizadas (faixa etária, sexo, mesorregião, CID-10, faixa de renda, destino, tipo de violação, tipo de atendimento) + valor inteiro + período.
- **Conjunto de filtros**: período início/fim (`YYYY-MM`), mesorregião IBGE (opcional), granularidade, top N (eixos que suportam) — estado de URL compartilhado entre os 5 dashboards e herdado pela central de exports.
- **Meta de privacidade**: `k_threshold` + `suppressed_groups` + `total_records` do envelope — alimenta o aviso obrigatório e o resumo de export.
- **Dataset/Formato de export**: par dataset (5) × formato (8) com nome amigável, dica de uso, `content_type` e extensão; resultado é arquivo `acdg-{dataset}-{period}.{ext}`.
- **Série temporal preenchida**: estrutura client-side derivada — intervalo completo de períodos na granularidade ativa, com gaps materializados como zero/nulo para renderização honesta do eixo do tempo.
- **Sessão / papel**: roles da usuária (claim `groups`) que condicionam acesso a dashboards e export — autoridade no BFF Elysia, conveniência na UI Solid.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Gestora encontra o número de pacientes por faixa etária de uma mesorregião num período em menos de 1 minuto na primeira utilização (sem treinamento).
- **SC-002**: Dashboard de um eixo fica interativo em p95 < 2 s em conexão 4G; troca de filtro atualiza a visualização em < 1 s (com cache do BFF aquecido).
- **SC-003**: 100% das respostas com `suppressed_groups > 0` exibem o aviso de supressão (zero visualizações com células suprimidas sem aviso) — verificado em testes `bun:test` de componente e E2E.
- **SC-004**: Zero ocorrências de token OIDC ou URL do `analysis-bi` observáveis no browser (bundle, network, storage, logs) — verificado em E2E.
- **SC-005**: 100% das séries temporais exibem o intervalo completo selecionado (gaps preenchidos) — nenhuma série "encolhida" por dados esparsos em testes de snapshot.
- **SC-006**: Pesquisador completa um export (escolher dataset, formato, período e baixar) em menos de 2 minutos; 100% dos downloads chegam com o nome de arquivo do contrato.
- **SC-007**: Zero erros crus exibidos: 100% dos status de erro (`400`, `401`, `429`, `5xx`) usados nas jornadas têm mensagem i18n PT-BR acionável.

## Impacto Arquitetural (web-app / BFF) *(obrigatório se a feature toca `src/`)*

- **Módulo(s) vertical(is) afetado(s)**: [x] novo `src/modules/analysis-bi/` (dashboards dos 5 eixos, filtros, central de exports) · [ ] estende `auth` (apenas consome sessão e roles existentes) · [x] `shared/ui` (design system — componentes de visualização novos catalogados; shell e tokens reutilizados dos conjuntos `001-social-care-web`/`002-people-context-web`)
  - Cross-módulo só via `public-api` (Princípio III — [ADR-0001](../../adr/0001-vertical-modular-architecture.md)). A feature vive num único módulo vertical; nenhum outro módulo consome `analysis-bi` nesta fase.
- **Handlers Elysia novos/alterados (a fronteira, Princípio I — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))**:
  - `get-indicators.query.fn.ts` — input `{ axis, periodStart, periodEnd, mesoregion?, granularity?, top? }` (TypeBox `Elysia.t`, enums fechados) → `{ items, meta: { kThreshold, suppressedGroups, totalRecords, period } }`.
  - `export-dataset.route.ts` — input `{ dataset, format, periodStart, periodEnd, mesoregion? }` → streaming do arquivo preservando `Content-Disposition` e Content-Type (download via BFF).
  - `get-export-catalog.query.fn.ts` — agrega `metadata/datasets` + `metadata/formats` com fallback estático tipado.
  - `get-regions.query.fn.ts` — lista de mesorregiões para o seletor [NEEDS CLARIFICATION: fonte — `metadata/regions` (hoje `501`/vazio) ou snapshot de `ibge_mesoregions.csv` no BFF].
  - Todas leem a sessão (cookie `HttpOnly`), checam a matriz papel × capacidade (FR-011), injetam `Authorization: Bearer`, validam input/output com TypeBox (`Elysia.t`) e preservam o status HTTP do erro (Princípios I, V). Sem mutações — domínio read-only.
- **Integração core-api**: endpoints `GET /api/v1/indicators/{axis}`, `GET /api/v1/export/{format}`, `GET /api/v1/metadata/datasets|formats|regions`, `/health`, `/ready` do `svc-analysis-bi` — prontidão endpoint a endpoint verificada em [api-readiness.fe.md](./api-readiness.fe.md); contrato consolidado em [spec.md](./spec.md). Atenções: sem paginação, séries esparsas, erros sem código estruturado, `429` global, HIGH-001/002/003 compensados no BFF.
- **Novos agregados / Value Objects (server/domain, Princípio III)?**: branded types + smart constructors `Result<T,E>` para `PeriodMonth` (`YYYY-MM`), `PeriodRange` (início ≤ fim), `Granularity`, `IndicatorAxis`, `ExportFormat`, `MesoregionCode` e `KAnonymityMeta` — espelhos client-side do contrato, sem lógica de negócio nova; o preenchimento de gaps é função pura do domínio client (`fillSparseSeries`).
- **Eventos no client**:  `IndicatorFiltersChanged` (sincroniza os 5 dashboards e a central de exports), `DatasetExportStarted`/`DatasetExportCompleted`/`DatasetExportFailed` (estado da central) — em EN-passado, vivem em `client/data/events/`, usados para invalidação/sincronização via `createAsync` por chave de filtros.
- **Design System**: [x] novos átomos/moléculas/organismos — gráfico de pirâmide etária, gráfico de barras/ranking (CID-10, destinos, tipos), gráfico de série temporal com marcação de gaps preenchidos, cartão de KPI, painel de filtros analíticos (período mês/ano, mesorregião, granularidade, top N), banner de supressão por privacidade (componente dedicado, variante para estado vazio), tabela acessível espelho de gráfico, cartão de formato de export com dica de uso — catalogar em [design-atoms.fe.md](./design-atoms.fe.md), [design-molecules.fe.md](./design-molecules.fe.md), [design-organisms.fe.md](./design-organisms.fe.md), [design-pages.fe.md](./design-pages.fe.md); tokens (paleta categórica acessível para gráficos) em [design-tokens.fe.md](./design-tokens.fe.md); governança em [design-governance.fe.md](./design-governance.fe.md).
- **Possíveis violações da constituição (I–VI)?**: nenhuma prevista. Pontos de vigilância para o "Complexity Tracking" do `plan.fe.md`: (a) biblioteca de gráficos que injete estilos com hex cru em `ui/` — encapsular via tokens vanilla-extract (Princípio III); (b) chamar o `analysis-bi` direto do client "porque é só leitura" — proibido, toda leitura passa pelo BFF Elysia (Princípio I); (c) esconder o aviso de supressão por decisão estética — é requisito de compliance (FR-004), não opção de design; (d) lógica de preenchimento de gaps espalhada em componentes de view — deve viver como função pura do domínio client, testada isoladamente; (e) autorização só visual sem checagem no handler Elysia (Princípios I e III).

## Assumptions

- Autenticação web (login Authentik, sessão por cookie `HttpOnly` no BFF Elysia, roles no claim `groups`) já entregue por feature anterior; esta feature apenas consome a sessão.
- O contrato do `analysis-bi` descrito em [spec.md](./spec.md) está implantado e estável; divergências são tratadas como bloqueio em [api-readiness.fe.md](./api-readiness.fe.md), não contornadas no front.
- Shell de aplicação, tokens e átomos base vêm dos conjuntos `001-social-care-web`/`002-people-context-web` (`design-*.fe.md` daquelas features); esta feature cataloga apenas componentes novos de visualização analítica.
- O star schema está materializado (eventos do `social-care` fluindo) antes da homologação; em dev, fakes/in-memory reproduzem o envelope real, incluindo casos com `suppressed_groups > 0`.
- Dados são eventuais (ingestão NATS + job mensal de carry-forward): a UI apresenta os dashboards como retrato consolidado, com `meta.timestamp` visível, sem promessa de tempo real.
- Perfis de uso: equipe pequena (< 20 usuárias simultâneas), desktop-first com responsividade básica para tablet; payloads completos (sem paginação) são suportáveis no client para o volume BV (< 1000 linhas).
- A matriz papel × capacidade (quem vê dashboards, quem exporta) será definida pela associação antes do go-live e implementada no BFF Elysia (compensação do HIGH-003).
- Vocabulário PT-BR segue a tabela canônica do serviço (faixa etária, mesorregião, diagnóstico CID-10, salário mínimo, benefício BPC/PBF, encaminhamento, violação de direitos, atendimento, completude de avaliação, supressão por privacidade, K-anonimato).

## Out of Scope

- Qualquer mutação de dados (prontuário no `001-social-care-web`; identidade no `002-people-context-web`).
- Drill-down individual, listas nominais ou qualquer visualização abaixo do agregado K≥5 (impossível por desenho do backend).
- Construtor de relatórios/consultas ad-hoc, dashboards customizáveis pelo usuário e comparação lado a lado de múltiplos conjuntos de filtros (v1 = um conjunto de filtros por vez).
- Agendamento/envio automático de exports e exportação de imagens dos gráficos [NEEDS CLARIFICATION na descoberta — fora até decisão].
- Implementação de `metadata/regions`, paginação, códigos `ANA-XXX` ou correção dos findings HIGH-001/002/003 no serviço (workstreams do `analysis-bi`, não desta feature).
- Modo offline/PWA e suporte mobile nativo.

## Referências

- [spec.md](./spec.md) — especificação do contrato core-api (`svc-analysis-bi`)
- [plan.fe.md](./plan.fe.md) — plano de implementação frontend
- [plan.md](./plan.md) — plano de consumo do contrato (visão core-api)
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão endpoint a endpoint
- [domain.fe.md](./domain.fe.md) — modelo de domínio client
- [design-tokens.fe.md](./design-tokens.fe.md) — tokens do design system (vanilla-extract)
- [design-atoms.fe.md](./design-atoms.fe.md) — átomos do design system
- [design-molecules.fe.md](./design-molecules.fe.md) — moléculas do design system
- [design-organisms.fe.md](./design-organisms.fe.md) — organismos do design system
- [design-pages.fe.md](./design-pages.fe.md) — páginas do design system
- [design-governance.fe.md](./design-governance.fe.md) — governança do design system
- [../README.md](../README.md) — doc de integração cross-serviço
- [../../adr/README.md](../../adr/README.md) — índice de ADRs web_02
- [../../adr/0001-vertical-modular-architecture.md](../../adr/0001-vertical-modular-architecture.md) — arquitetura vertical-modular
- [../../adr/0002-errors-as-values.md](../../adr/0002-errors-as-values.md) — erros como valores
- [../../adr/0003-bun-supply-chain.md](../../adr/0003-bun-supply-chain.md) — Bun supply-chain
- [../../adr/0004-client-server-split-mvvm-ddd.md](../../adr/0004-client-server-split-mvvm-ddd.md) — split client × server
- [../../adr/0005-auth-session-refresh-decisions.md](../../adr/0005-auth-session-refresh-decisions.md) — auth/sessão
- [../../adr/0007-design-system-vanilla-extract.md](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract
- [../../adr/0009-framework-agnostic-client.md](../../adr/0009-framework-agnostic-client.md) — ViewModel puro + binding Solid
- [../../adr/0010-bff-orchestration-fn-naming.md](../../adr/0010-bff-orchestration-fn-naming.md) — nomenclatura `*.query.fn.ts`
- [../../adr/0011-no-mocks-in-production.md](../../adr/0011-no-mocks-in-production.md) — sem mocks em produção
- [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) — constituição web_02
- [../../reference/framework/solidstart/](../../reference/framework/solidstart/) — docs offline SolidStart
- [../../reference/framework/elysia/](../../reference/framework/elysia/) — docs offline Elysia
- [../../reference/runtime/bun/](../../reference/runtime/bun/) — docs offline Bun
- [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/) — docs offline vanilla-extract
