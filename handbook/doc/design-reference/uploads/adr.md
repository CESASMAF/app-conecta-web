# ADR-0001: Dashboards exclusivamente sobre agregados K-anônimos — sem drill-down individual

**Status**: Accepted

**Data**: 2026-06-12

**Feature**: `specs/003-analysis-bi-web/`

**Decisores**: Gabriel Aderaldo + equipe web ACDG-BV (com revisão arquitetural Claude)

## Contexto

O backend `analysis-bi` (Go 1.25 · chi · pgx · NATS JetStream) é o pipeline analítico do
ecossistema ACDG: consome os ~18 eventos do Transactional Outbox do `social-care`, aplica
**supressão → generalização → K-anonymity** na ingestão (`patientId` → HMAC-SHA256 salgado;
nascimento → 17 faixas etárias de 5 anos; CEP → mesorregião IBGE; renda → 6 faixas de SM;
IDs de pessoas descartados) e **nunca armazena PII**. Na leitura, toda query de indicador
aplica `HAVING COUNT(*) >= 5` (`KThreshold = 5`, ADR-001 §2.5 do `analysis-bi`): grupos com
menos de 5 indivíduos são omitidos e contabilizados em `meta.suppressed_groups`. O mesmo
filtro vale para os 8 formatos de export (ver [domain.md](./domain.md)).

Ao desenhar a interface de dashboards, surge a tentação clássica de BI clínico: clicar numa
célula da pirâmide etária e "ver quem são". Forças em jogo:

- **LGPD (Art. 12)**: dado anonimizado deixa de ser pessoal **enquanto** o processo de
  anonimização não for revertido — qualquer caminho de re-identificação na UI (drill-down,
  cruzamento com o módulo `social-care`, recombinação de filtros que isole grupos pequenos)
  reverteria juridicamente a anonimização de dados de saúde de pacientes de doenças raras,
  população na qual a re-identificação é especialmente fácil (doenças com poucos casos por
  região).
- **Constituição web_02** (ver [`constitution.md`](../../../.specify/memory/constitution.md)):
  [Princípio I — BFF-Orchestrated Boundary](../../../.specify/memory/constitution.md) — o BFF
  nunca duplica nem **contorna** regra canônica do backend — e a seção Iron Frontier (aviso
  de supressão obrigatório quando `suppressed_groups > 0`).
- **Contrato real do serviço**: não existe endpoint de dado individual — a API expõe apenas
  `GET /api/v1/indicators/{axis}`, `GET /api/v1/export/{format}` e metadata. Porém o BFF
  **poderia** simular drill-down compondo `analysis-bi` + `social-care` (que tem dado
  identificado) ou estreitando filtros até isolar indivíduos — é esse atalho que este ADR
  proíbe.
- **Findings do FINAL-REPORT do `analysis-bi`** (74/100): **HIGH-001** (issuer/audience não
  validados), **HIGH-003** (RBAC placeholder) — enquanto abertos, a contenção de acesso é
  responsabilidade do BFF (rede interna + checagem de papel na sessão), o que torna ainda
  mais crítico não criar superfícies de consulta além das agregadas.
- **ADR-009 do deploy ACDG-BV**: `analysis-bi` vive em rede Docker interna;
  apenas `web`/Caddy têm exposição pública.
- Precedentes dos conjuntos irmãos: ADR-0001 de `001-social-care-web` e de
  `002-people-context-web` (ver [../README.md](../README.md)) — consumo
  exclusivamente via BFF; este ADR herda o padrão e o estende com a restrição analítica.

## Decisão

**A interface de dashboards consome exclusivamente os agregados K-anônimos do
`analysis-bi`, via BFF. Não existe — nem no client, nem no BFF — qualquer caminho de
drill-down individual, e a supressão K=5 é respeitada e comunicada, jamais contornada.**

Concretamente:

- O módulo `analysis-bi` do frontend é **read-only**: apenas `getIndicators`,
  `getExportCatalog` e `requestExport` (ver [domain.fe.md](./domain.fe.md)); nenhum handler
  BFF do módulo chama `social-care` ou `people-context` — composição cross-serviço com dado
  identificado é estruturalmente impossível dentro deste módulo (fronteira de import
  enforçada por governance tests em `bun:test` —
  [ADR-0001 web_02](../../adr/0001-vertical-modular-architecture.md),
  [Princípio III](../../../.specify/memory/constitution.md)).
- Nenhum elemento de UI (célula de gráfico, linha de tabela, tooltip) oferece navegação
  para registro individual; não há rota de "detalhe" abaixo do grão agregado.
- O BFF **propaga** `meta.suppressed_groups` em todo ViewModel; quando `> 0`, a UI exibe
  banner obrigatório "X grupos suprimidos por privacidade (K=5)" (tag i18n
  `'k-anonymity-suppression'`). Ocultar o banner é violação de constituição, não escolha de
  design.
- O BFF **não reagrega nem soma células** para reconstruir grupos suprimidos, e não oferece
  combinações de filtro além das que o serviço expõe (`period_start`, `period_end`,
  `mesoregion`, `granularity`, `top`) — recombinação de filtros para inferir células < 5 é
  tratada como tentativa de re-identificação e fica fora do contrato do módulo.
- Exports (8 formatos) seguem o mesmo princípio: o BFF streama o arquivo já filtrado pelo
  serviço (K=5 aplicado no export também), sem pós-processar nem "completar" dados.
- Quem precisa de dado individual usa o módulo `social-care` (feature
  `001-social-care-web`), com RBAC, audit trail no backend Swift e finalidade assistencial —
  nunca a tela analítica.

## Citação canônica *(obrigatória)*

> A BOUNDED CONTEXT delimits the applicability of a particular model so that team members
> have a clear and shared understanding of what has to be consistent and how it relates to
> other contexts. Within that CONTEXT, work to keep the model logically unified, but do not
> worry about applicability outside those bounds. In other contexts, other models apply,
> with differences in terminology, in concepts and rules, and in dialects of the
> UBIQUITOUS LANGUAGE.
> — *(Linha 5212, p. 336, ERIC EVANS, *Domain-Driven Design: Tackling Complexity in the Heart of Software*)*

O contexto analítico tem, por construção, um modelo **diferente** do clínico: nele "paciente"
não existe — existem faixas, mesorregiões e contagens. Forçar o modelo clínico (indivíduos)
para dentro da tela analítica dissolveria exatamente a fronteira que garante a anonimização.

## Alternativas consideradas

- **Drill-down via BFF compondo `analysis-bi` + `social-care`** — rejeitada: reverte a
  anonimização (LGPD Art. 12) cruzando agregado com dado identificado; contorna o propósito
  do K=5; mistura finalidades (assistencial × analítica) violando purpose limitation; e
  expõe dado de saúde a um perfil de usuário (gestor/analista) que não precisa dele.
- **Exibir grupos suprimidos como "< 5" em vez de omiti-los** — rejeitada: o contrato do
  serviço já os omite na query (`HAVING COUNT(*) >= 5`) e revelar a **existência** de um
  grupo pequeno numa mesorregião com doença rara específica já é vetor de re-identificação;
  a contagem agregada `suppressed_groups` comunica o efeito sem apontar as células.
- **Permitir filtros livres (ex.: microrregião, CEP) para "refinar" análises** — rejeitada:
  estreitar o recorte geográfico/temporal abaixo do que o serviço expõe é recombinação de
  filtros para isolar indivíduos; o serviço generaliza em mesorregião de propósito.
- **SPA chamando `analysis-bi` diretamente (token no browser)** — rejeitada: viola o
  [Princípio I — BFF-Orchestrated Boundary](../../../.specify/memory/constitution.md); com
  HIGH-001/HIGH-002/HIGH-003 abertos no serviço, exposição direta seria irresponsável — o
  BFF é hoje a única camada de autorização efetiva.

## Consequências

- **Positivas**: conformidade LGPD por construção (anonimização nunca revertida na UI);
  superfície pública mínima; a supressão vira informação de primeira classe da tela (banner
  obrigatório) em vez de surpresa estatística; o módulo analítico fica simples — read-only,
  sem mutations, sem optimistic locking, sem estados de conflito; os findings HIGH-001/003
  do serviço ficam contidos atrás do BFF até a correção.
- **Negativas / trade-offs**: gestores perdem o atalho "ver quem compõe este grupo" — o
  fluxo correto (módulo `social-care`, com RBAC e audit) tem mais fricção, e isso é
  intencional; análises muito recortadas em municípios pequenos podem vir majoritariamente
  suprimidas (K=5 com população rara) — a UI comunica o porquê, mas não "resolve"; qualquer
  indicador novo exige mudança no serviço Go, nunca composição criativa no BFF.
- **Impacto em BCs / outbox / migrations**: nenhum no backend — o contrato
  `/api/v1/indicators` + `/export` permanece intacto, o NATS JetStream continua sendo o
  único canal de entrada de dados do `analysis-bi` e nenhuma migration é necessária; no
  frontend, o módulo vertical ([domain.fe.md](./domain.fe.md)) nasce read-only e sem
  dependência client-side dos módulos de dado identificado.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio I (Iron Frontier), Princípio III
- [ADR-0001 (vertical-modular)](../../adr/0001-vertical-modular-architecture.md) — boundaries de módulo enforçados por governance tests
- [ADR-0004 (Client/Server MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md) — fronteira BFF
- [ADR-0010 (BFF orchestration)](../../adr/0010-bff-orchestration-fn-naming.md) — handler BFF orquestrador
- [adr.fe.md](./adr.fe.md) — decisão de tratamento de séries esparsas e supressão K=5
- [domain.fe.md](./domain.fe.md) — modelo de domínio frontend (módulo read-only)
- [domain.md](./domain.md) — domínio CORE Go (invariantes K=5 canônicas)
- [api-readiness.fe.md](./api-readiness.fe.md) — prontidão dos endpoints e findings de segurança
- [ADR index](../../adr/README.md) — todos os ADRs web_02
- [Doc integração](../README.md) — mapa de contexto cross-service
