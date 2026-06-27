# Descoberta: Indicadores e BI — Web (visão frontend · `web_02/`)

**Feature**: `specs/003-analysis-bi-web/` · **Consultor**: `/acdg-skills:requirements-engineer`

> Fase 0 (frontend). Elicitação ancorada em Engenharia de Requisitos + Histórias de Usuário.
> Saída alimenta a SPEC (`spec.fe.md`). Restrições deste nível = front + BFF (não core-api): a
> fonte de dados é o `svc-analysis-bi` via handler Elysia (rota consumida via Eden Treaty); o
> front consome o contrato e **nunca** acessa o backend direto — o browser jamais vê token, URL
> de backend ou secret. O BFF Elysia injeta `Authorization: Bearer` (OIDC/Authentik). Este
> domínio é **somente leitura**: dashboards e exports, nenhuma mutação.

## Problema / Oportunidade

A gestão da ACDG-BV decide hoje no escuro: para saber quantos pacientes existem por faixa etária, quais diagnósticos CID-10 predominam ou quantas famílias vivem com menos de meio salário mínimo, alguém precisa consultar a API do `analysis-bi` à mão ou pedir extrações — inviável para uma equipe pequena e não técnica. Para advocacy (pleitos junto a SES/SMS, prestação de contas a financiadores), os números acabam montados em planilhas manuais, com risco de erro e de exposição de dados de uma população pequena e reidentificável. A interface web precisa transformar os indicadores agregados e anonimizados do `analysis-bi` em dashboards navegáveis — pirâmide etária, ranking CID-10, vulnerabilidade socioeconômica, proteção e cuidado, com filtros de período, mesorregião e granularidade — e numa central de exports em 8 formatos, sempre exibindo o aviso de supressão por privacidade quando grupos pequenos forem omitidos.

## Stakeholders

| Stakeholder | Interesse / o que espera | Decisor? |
|---|---|---|
| Gestor da associação | Dashboards dos 5 eixos legíveis sem treinamento; filtros de período/mesorregião/granularidade; gráficos prontos para reunião e advocacy | sim |
| Pesquisador / parceiro acadêmico | Central de exports com os 8 formatos nomeados de forma amigável (CSV, Parquet, DBF/TABWIN, DBC/DataSUS, FHIR/RNDS…) e download direto | não |
| DPO / compliance LGPD | Aviso de supressão K=5 SEMPRE visível quando `suppressed_groups > 0`; nenhum número individual exibível; nenhum drill-down a pessoa | sim |
| Equipe da associação (`worker`/`owner`) | Consulta dos dashboards para orientar o atendimento (visão somente leitura, como todo o domínio) | não |
| Equipe web_02 | Contrato pronto e verificado ([api-readiness.fe.md](./api-readiness.fe.md)); reuso do shell e design system dos conjuntos `001-social-care-web`/`002-people-context-web`; biblioteca de gráficos a definir no `plan.fe.md` | não |
| Equipe de segurança | RBAC imposto no BFF (HIGH-003 do serviço); token nunca no browser | sim |

## Histórias de usuário (INVEST)

- **US-001** (P1): Como gestora, quero explorar a pirâmide etária (faixa etária × sexo, filtrável por mesorregião) num período escolhido, para conhecer o perfil demográfico da população atendida.
  - **Valor / prioridade**: P1 — o retrato demográfico é a primeira pergunta de qualquer gestão e o gráfico-assinatura do dashboard.
  - **Critérios de aceitação** (viram BDD/cenários): dado o dashboard demográfico com período padrão, quando a tela carrega, então vejo a pirâmide etária construída de `GET /api/v1/indicators/demographics` (via BFF Elysia + Eden Treaty); dado `meta.suppressed_groups > 0`, então um aviso "N grupos suprimidos por privacidade (K=5)" é exibido junto ao gráfico; quando altero o período (YYYY-MM início/fim) ou a mesorregião, então o gráfico atualiza com estado de carregamento (via `createAsync` do `@solidjs/router`).
- **US-002** (P1): Como gestora, quero ver os top diagnósticos CID-10 (código + descrição, casos novos vs acumulados), para entender o perfil epidemiológico e fundamentar pleitos.
  - **Valor / prioridade**: P1 — com a pirâmide, forma o dashboard mínimo de advocacy.
  - **Critérios de aceitação**: dado o dashboard epidemiológico, quando seleciono "Top 10", então a UI consulta `GET /api/v1/indicators/epidemiological?top=10` e exibe o ranking com `icd_code` + `icd_label`; dado granularidade trimestral, então as séries exibem rótulos `2025-T1` (PT-BR de `2025-Q1`).
- **US-003** (P2): Como gestora, quero o eixo socioeconômico (distribuição de renda em 6 faixas de salário mínimo, cobertura de benefícios BPC/PBF, insegurança alimentar), para evidenciar a vulnerabilidade das famílias.
  - **Valor / prioridade**: P2 — amplia o dashboard para a dimensão social; mesmo contrato do P1.
  - **Critérios de aceitação**: dado o dashboard socioeconômico, quando a tela carrega, então vejo a distribuição por `income_band` (rotulada em SM: "0–0,5 SM", "0,5–1 SM", …) e indicadores de benefícios; o aviso de supressão segue obrigatório.
- **US-004** (P2): Como gestora, quero os eixos de proteção (encaminhamentos por destino — UPA, CRAS, CREAS — e violações de direitos por tipo) e de cuidado (atendimentos por tipo, completude de avaliações), para monitorar a operação socioassistencial.
  - **Valor / prioridade**: P2 — fecha os 5 eixos; dados sensíveis (violações) reforçam a obrigatoriedade do aviso de supressão.
  - **Critérios de aceitação**: dado o dashboard de proteção, quando filtro por mesorregião, então vejo encaminhamentos por destino e violações por tipo daquele território; dado um período sem dados, então vejo estado vazio explicativo ("Sem dados no período — registros podem ter sido suprimidos por privacidade"), não um gráfico quebrado.
- **US-005** (P3): Como pesquisador, quero exportar qualquer um dos 5 datasets em 8 formatos com os mesmos filtros do dashboard, para análise externa e integração com TABWIN/DataSUS/RNDS.
  - **Valor / prioridade**: P3 — valor alto mas jornada distinta (download, não visualização); depende dos filtros do P1.
  - **Critérios de aceitação**: dado a central de exports, quando escolho dataset `epidemiological`, formato "CSV" e período, então o download inicia via BFF (`GET /api/v1/export/csv?dataset=epidemiological&…`) com o nome `acdg-epidemiological-{period}.csv`; cada formato exibe nome amigável e dica de uso (DBF → TABWIN, DBC → DataSUS, FHIR → RNDS, ODS → LibreOffice); o aviso de supressão acompanha o resumo do export.

## Requisitos

### Funcionais
- **RF-001**: O sistema DEVE exibir dashboards dos 5 eixos (`demographics`, `epidemiological`, `socioeconomic`, `protection`, `care`) consumindo `GET /api/v1/indicators/{axis}` via handler Elysia (rota consumida com Eden Treaty), com visualizações adequadas a cada eixo (pirâmide etária, ranking CID-10, distribuição de renda, barras por destino/tipo, séries de atendimento).
- **RF-002**: O sistema DEVE oferecer filtros compartilhados de período (`period_start`/`period_end` em formato YYYY-MM, com UI PT-BR mês/ano), mesorregião IBGE e granularidade (mensal/trimestral/anual), refletidos na URL da rota (estado compartilhável — rotas file-based em `src/routes/` do SolidStart).
- **RF-003**: O sistema DEVE exibir aviso de supressão por privacidade SEMPRE que `meta.suppressed_groups > 0` ("N grupos suprimidos por privacidade (K=5)") — requisito de compliance, não decorativo.
- **RF-004**: O sistema DEVE preencher gaps de séries temporais esparsas no client (períodos ausentes da resposta viram pontos zero/nulos explícitos no eixo do tempo), pois o backend omite períodos sem dados.
- **RF-005**: O sistema DEVE oferecer central de exports com os 5 datasets × 8 formatos (nomes amigáveis: CSV, JSON, XML, Parquet, DBF/TABWIN, DBC/DataSUS, ODS/LibreOffice, FHIR/RNDS), reusando os filtros ativos e fazendo o download via BFF (streaming do `Content-Disposition`).
- **RF-006**: O sistema DEVE traduzir erros HTTP do serviço (sem códigos estruturados) em mensagens i18n PT-BR: `400` aponta o filtro inválido, `429` informa limite de requisições com retry (via `action` do `@solidjs/router`), `5xx`/timeout exibem estado de indisponibilidade com "tentar novamente".
- **RF-007**: O sistema DEVE espelhar na UI a natureza somente leitura do domínio: nenhuma ação de escrita, nenhum formulário de mutação, nenhum drill-down individual (só agregados).
- **RF-008**: O sistema DEVE impor a autorização por papel no BFF Elysia (compensação do HIGH-003): apenas papéis autorizados acessam dashboards/exports; demais recebem tela de acesso negado.

### Não-funcionais (viram métricas)
- **RNF-001**: Segurança — token OIDC (Authentik) vive só no BFF (cookie de sessão HttpOnly); o BFF injeta `Authorization: Bearer`; nenhum Bearer ou URL do `analysis-bi` no bundle/network/storage do browser ([ADR-0005](../../adr/0005-auth-session-refresh-decisions.md), [ADR-0006](../../adr/0006-security-headers-csp.md)).
- **RNF-002**: Performance — dashboard de um eixo interativo em p95 < 2 s em conexão 4G (payloads completos, sem paginação — tipicamente < 1000 linhas); troca de filtro re-renderiza em < 1 s.
- **RNF-003**: Acessibilidade — gráficos com alternativa textual/tabular (tabela de dados acessível por gráfico), navegação por teclado nos filtros, contraste WCAG 2.1 AA; aviso de supressão perceptível também por leitores de tela. Tokens de cor em OKLCH (vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)).
- **RNF-004**: i18n — zero strings hardcoded; vocabulário canônico PT-BR do serviço (faixa etária, mesorregião, diagnóstico CID-10, salário mínimo, benefício, encaminhamento, violação de direitos, atendimento, completude de avaliação, supressão por privacidade, K-anonimato).
- **RNF-005**: LGPD — a UI nunca apresenta contagem individual nem permite inferência de grupo < 5 (o backend já suprime; a UI não tenta "reconstruir" células suprimidas, p.ex. por subtração de totais exibidos lado a lado).

## Restrições e premissas (frontend)

- Stack: **SolidStart** (Solid · Vinxi · Nitro preset `bun`) + **Elysia** (BFF em `src/routes/api/[...path].ts`) + **Bun** (runtime, PM, testes) + **Eden Treaty** (client type-safe) + **vanilla-extract** (CSS-in-TS zero-runtime) + **TypeBox** (`Elysia.t`) — conforme [constituição web_02](../../../.specify/memory/constitution.md).
- BFF Elysia é a única fronteira; dados vêm do `svc-analysis-bi` (prontidão dos endpoints em [api-readiness.fe.md](./api-readiness.fe.md)).
- Reuso do shell de aplicação, tokens e componentes dos conjuntos `001-social-care-web`/`002-people-context-web` (`design-*.fe.md`); esta feature cataloga apenas componentes novos (gráficos, filtros analíticos, central de exports).
- Envelope `{ data, meta }` com `k_threshold`/`suppressed_groups`/`total_records` é o contrato; erros vêm como HTTP status + mensagem (sem `ANA-XXX`) — o BFF valida com TypeBox e preserva o status.
- Sem paginação no contrato: o client trata payloads completos; séries esparsas exigem preenchimento de gaps no client.
- Premissa: autenticação web (sessão Authentik via cookie HttpOnly, roles no claim `groups`) já entregue por feature anterior; esta feature consome a sessão.
- Premissa: dados são eventuais (ingestão NATS + job mensal de carry-forward) — a UI comunica o caráter "retrato consolidado", não tempo real.
- **Package manager = Bun** (`bun install`, `bun.lock`, `bun test`); jamais npm/yarn/npx/pnpm no `web_02` ([ADR-0003](../../adr/0003-bun-supply-chain.md), [Princípio IV](../../../.specify/memory/constitution.md)).

## Fora de escopo

- Qualquer mutação de dados (prontuário é do `social-care`; identidade é do `people-context`).
- Drill-down a indivíduos ou listas nominais (impossível por desenho do backend — só agregados K≥5).
- Construtor de relatórios customizados / consultas ad-hoc (os 5 eixos com filtros são o escopo da v1).
- Agendamento/envio automático de exports (download interativo apenas).
- Correção dos findings do serviço (HIGH-001/002/003) — apenas compensação no BFF.
- Modo offline/PWA e suporte mobile nativo (desktop-first com responsividade básica).

## Fonte de evidência (engenharia reversa, se clone do legado)

- Não há legado web a clonar — a evidência primária é o **mapa completo do serviço** `analysis-bi` (relatório de exploração de 2026-06-12: rotas com query params, envelope com `meta.suppressed_groups`, 18 eventos, star schema, limitações e findings de segurança) e o código em `analysis-bi/internal/` (`api/router.go`, `api/handlers/{indicators,export,metadata,health}.go`, `domain/{anonymizer,k_anonymity}.go`, `export/*.go`).
- O que é "fiel ao contrato": rotas, query params, envelope, semântica de supressão K=5, formatos de export e limitações (sem paginação, séries esparsas, erros sem código). O que é decisão de UI (não evidência): escolha de tipos de gráfico, layout dos dashboards, rotulagem PT-BR das faixas (ex.: "0–0,5 SM"), microcopy do aviso de supressão e organização da central de exports.

## Perguntas em aberto

- [ ] [NEEDS CLARIFICATION: de onde vem a lista de mesorregiões para o seletor — implementar `metadata/regions` no serviço (hoje `501`/vazio) ou servir snapshot de `ibge_mesoregions.csv` pelo BFF Elysia? Impacta `plan.fe.md` e [api-readiness.fe.md](./api-readiness.fe.md).] → resolver em `/speckit-clarify`.
- [ ] [NEEDS CLARIFICATION: quais papéis do Authentik (`groups`) podem ver dashboards e quais podem exportar? O serviço não distingue (HIGH-003); a matriz papel × capacidade precisa ser definida pela associação para o RBAC do BFF.]
- [ ] [NEEDS CLARIFICATION: a gestão quer comparação entre dois períodos/mesorregiões lado a lado na v1, ou um único conjunto de filtros por vez é suficiente? Impacta `design-pages.fe.md`.]
- [ ] [NEEDS CLARIFICATION: a biblioteca de gráficos deve priorizar export de imagem (PNG/SVG para slides de advocacy)? Não há requisito explícito; decidir antes do `design-organisms.fe.md`. Avaliar integração com GSAP para animações ([constituição web_02 — stack](../../../.specify/memory/constitution.md)).]

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — stack, Princípios I–VI
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — módulo analysis-bi isolado
- [ADR-0003 (Bun supply-chain)](../../adr/0003-bun-supply-chain.md) — Bun como PM/runtime
- [ADR-0004 (Client/Server MVVM×DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — BFF Elysia + Eden Treaty
- [ADR-0005 (auth/session)](../../adr/0005-auth-session-refresh-decisions.md) — sessão OIDC opaca
- [ADR-0006 (security headers CSP)](../../adr/0006-security-headers-csp.md) — headers via Elysia middleware
- [ADR-0007 (vanilla-extract)](../../adr/0007-design-system-vanilla-extract.md) — CSS-in-TS, tokens OKLCH
- [ADR-0010 (BFF orchestration)](../../adr/0010-bff-orchestration-fn-naming.md) — `*.query.fn.ts`
- [adr.md](./adr.md) — proibição de drill-down individual
- [adr.fe.md](./adr.fe.md) — séries esparsas, supressão K=5 e erros
- [domain.fe.md](./domain.fe.md) — modelo de domínio BFF + client
- [domain.md](./domain.md) — domínio CORE Go
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints
- [discovery.md](./discovery.md) — visão core-api
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- Docs offline: `../../reference/framework/solidstart/` · `../../reference/framework/elysia/` · `../../reference/runtime/bun/`
