# Descoberta: Atendimento Socioassistencial — Web (visão frontend · `web_02/`)

**Feature**: `specs/001-social-care-web/` · **Consultor**: `/acdg-skills:requirements-engineer`

> Fase 0 (frontend). Elicitação ancorada em Engenharia de Requisitos + Histórias de Usuário.
> Saída alimenta a SPEC ([`discovery.fe.md`](./discovery.fe.md) → [`spec.fe.md`](./spec.fe.md)).
> Restrições deste nível = front + BFF (não core-api): a fonte de dados é o `svc-social-care`
> via rota Elysia (BFF) consumida pelo client via Eden Treaty; o front consome o contrato e
> **nunca** acessa o backend direto — o browser jamais vê token, URL de backend ou secret
> (Princípio I da constituição — [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)).

## Problema / Oportunidade

As assistentes sociais da ACDG-BV não têm interface para operar o prontuário digital: o serviço `social-care` existe, mas só é acessível por API. Na prática, o caso do paciente raro (titular + composição familiar + avaliação socioeconômica + medidas de proteção) continua em papel, com retrabalho de digitação, risco de perda de histórico e nenhuma visibilidade dos indicadores de vulnerabilidade já calculados pelo backend (`computedAnalytics`). A interface web precisa transformar o contrato HTTP em jornadas de trabalho reais — cadastro, prontuário, avaliação, atendimento e proteção — operáveis por uma equipe pequena e não técnica, em conexões modestas de Boa Vista/RR.

## Stakeholders

| Stakeholder | Interesse / o que espera | Decisor? |
|---|---|---|
| Assistente social (`worker`) | Telas rápidas de cadastro, prontuário navegável por seções, formulários com validação clara em PT-BR | não |
| Administrador (`admin`) | UI de gestão de `dominios` (lookup tables), aprovação de solicitações, ações de ciclo de vida | sim |
| Supervisor (`owner`) | Visão somente-leitura do prontuário + timeline do audit trail | não |
| DPO / LGPD | Aviso visual de PII anonimizada, bloqueio de edição pós-anonimização, nada de PII em logs do client | sim |
| Equipe web | Contrato pronto e verificado ([`api-readiness.fe.md`](./api-readiness.fe.md)); design system tokenizado ([`design-tokens.fe.md`](./design-tokens.fe.md)) | não |

## Histórias de usuário (INVEST)

- **US-001** (P1): Como assistente social, quero cadastrar um paciente e navegar pelo prontuário completo em seções, para conduzir o caso a partir de uma única tela.
  - **Valor / prioridade**: P1 — é a porta de entrada de todo o fluxo; sem ela a aplicação não tem MVP.
  - **Critérios de aceitação**: dado o formulário de cadastro preenchido com CPF válido (máscara `123.456.789-00`, envio sem formatação), quando submeto, então vejo confirmação e sou levada ao prontuário recém-criado em status "Lista de espera"; dado um prontuário aberto, quando navego pelas seções (dados pessoais, documentos, família, diagnósticos), então vejo os dados do `GET /patients/:patientId` com datas em `dd/MM/yyyy`.
- **US-002** (P1): Como assistente social, quero gerenciar a composição familiar na própria tela do prontuário, para manter o núcleo familiar atualizado.
  - **Valor / prioridade**: P1 — indicadores (renda per capita, densidade habitacional) exibidos no prontuário dependem dos membros.
  - **Critérios de aceitação**: dado o prontuário, quando adiciono um membro escolhendo parentesco do select populado por `GET /dominios/dominio_parentesco`, então o membro aparece na lista sem reload completo; quando removo um membro, então ele some da lista ativa (soft-delete no backend).
- **US-003** (P2): Como assistente social, quero preencher a avaliação socioeconômica por seções salváveis independentemente (habitação, renda, trabalho, educação, saúde, rede de apoio), para registrar a visita sem perder trabalho.
  - **Valor / prioridade**: P2 — formulários extensos; cada `PUT` é independente e retorna `204`, permitindo salvamento parcial.
  - **Critérios de aceitação**: dado a seção "Condição habitacional" preenchida, quando salvo, então vejo feedback de sucesso e os badges de indicadores (ex.: "Risco de sobrelotação" quando densidade > 3.0) atualizam com o `computedAnalytics` recarregado; dado um benefício com flag `exigeCpfFalecido`, quando o seleciono, então o campo "CPF do falecido" aparece e se torna obrigatório.
- **US-004** (P2): Como administrador, quero executar ações de ciclo de vida (admitir, desligar, readmitir, retirar da fila) com confirmação e motivo, para controlar a lista de espera.
  - **Valor / prioridade**: P2 — operação crítica, mas menos frequente que cadastro/avaliação.
  - **Critérios de aceitação**: dado paciente em "Lista de espera", quando clico "Admitir" e confirmo, então o status do prontuário muda para "Ativo"; dado `reason = other` no desligamento, então o campo de observações (máx. 1000 chars) é obrigatório.
- **US-005** (P3): Como assistente social, quero registrar atendimentos e informações de ingresso, e consultar a linha do tempo do caso, para documentar o plano de cuidado.
  - **Critérios de aceitação**: dado o prontuário, quando registro um atendimento com data futura, então a UI bloqueia antes do envio (espelha regra `date ≤ now`).
- **US-006** (P3): Como assistente social, quero registrar encaminhamentos, violações de direitos e acolhimentos, para acionar medidas de proteção com rastreabilidade.
  - **Critérios de aceitação**: dado o formulário de violação sem descrição do fato, quando tento enviar, então vejo erro de campo obrigatório antes do request (espelho de `VIO-002`).
- **US-007** (P3): Como supervisor, quero ver o audit trail do prontuário como timeline com diff `before/after`, para auditar mudanças sem acesso de escrita.

## Requisitos

### Funcionais
- **RF-001**: O sistema DEVE exibir lista de pacientes com busca textual, filtro por status e paginação por cursor ("carregar mais" via `meta.nextCursor`).
- **RF-002**: O sistema DEVE renderizar o prontuário como página de seções (dados pessoais, documentos, endereço, família, diagnósticos, avaliação, atendimentos, encaminhamentos, violações), todas servidas por um único `GET` orquestrado no BFF.
- **RF-003**: O sistema DEVE formatar CPF/NIS/CEP/datas para exibição PT-BR e despachar valores crus (dígitos, ISO 8601) ao BFF.
- **RF-004**: O sistema DEVE popular todo select de domínio via `GET /dominios/:tableName` (cacheável no BFF) e reagir às metadata flags (`exigeCpfFalecido`, `exigeRegistroNascimento`, `exigeDescricao`) exibindo campos condicionais.
- **RF-005**: O sistema DEVE exibir os indicadores de `computedAnalytics` (badges/cards) sem recalcular nada no client.
- **RF-006**: O sistema DEVE mapear códigos de erro estruturados (`PAT-001`, `DISC-007`, `VIO-002`…) para mensagens i18n PT-BR acionáveis, preservando o status HTTP vindo do BFF (ver [`adr.fe.md`](./adr.fe.md)).
- **RF-007**: O sistema DEVE tratar `409` (optimistic locking / transição inválida) oferecendo recarga do prontuário com aviso "outro usuário editou este registro".
- **RF-008**: O sistema DEVE exibir aviso "Dados pessoais removidos por solicitação LGPD" e bloquear edições quando o prontuário estiver anonimizado.
- **RF-009**: O sistema DEVE condicionar ações da UI à role do usuário (worker/owner/admin) espelhando o RBAC do backend — `owner` nunca vê botões de escrita.

### Não-funcionais (viram métricas — ver [`metrics.fe.md`](./metrics.fe.md))
- **RNF-001**: Segurança — token OIDC (Authentik) vive só no BFF Elysia (cookie de sessão `HttpOnly`); nenhuma URL de backend ou Bearer no bundle/network do browser.
- **RNF-002**: Performance — prontuário completo interativo em p95 < 2 s em conexão 4G; lista de 20 pacientes < 1 s.
- **RNF-003**: Acessibilidade — formulários navegáveis por teclado, labels e mensagens de erro associadas (WCAG 2.1 AA).
- **RNF-004**: i18n — zero strings hardcoded; vocabulário do domínio em PT-BR com acentuação correta (paciente, prontuário, acolhimento, encaminhamento).
- **RNF-005**: Resiliência — falha do `social-care` degrada com mensagem clara e retry, sem tela branca (fallback gracioso).

## Restrições e premissas (frontend)

- **Stack**: SolidStart (front + BFF unificado via Elysia em `src/routes/api/[...path].ts`) + Solid
  (JSX) + TypeBox (`Elysia.t`) + vanilla-extract (design system zero-runtime) + Eden Treaty; Bun como
  runtime/PM/test — **nunca** Node, pnpm, npm ou yarn (Princípio IV da constituição,
  [ADR-0003](../../adr/0003-bun-supply-chain.md), [ADR-0007](../../adr/0007-design-system-vanilla-extract.md));
  TS estrito (Princípio V).
- BFF Elysia é a única fronteira; dados vêm do `svc-social-care` (prontidão dos endpoints em
  [`api-readiness.fe.md`](./api-readiness.fe.md)).
- Design system só-tokens (vanilla-extract — [ADR-0007](../../adr/0007-design-system-vanilla-extract.md));
  strings via i18n; componentes catalogados em [`design-atoms.fe.md`](./design-atoms.fe.md) …
  [`design-pages.fe.md`](./design-pages.fe.md).
- Envelope `{ data, meta }` e erros `{ error: { code, message } }` são o contrato — o BFF valida
  com TypeBox (`Elysia.t`) na borda; tipo flui ao client via Eden (sem redeclarar Model).
- Premissa: autenticação da web já resolvida com Authentik (OIDC) em feature anterior; esta feature
  só consome a sessão.
- Premissa: volume BV é pequeno (centenas de prontuários) — paginação por cursor com `limit=20` é
  suficiente.

## Fora de escopo

- Dashboards e indicadores agregados (virão do `analysis-bi` em feature própria).
- Busca/cadastro de pessoas (`people-context`) além do vínculo por `personId` já existente.
- Upload de documentos digitalizados; impressão/exportação de prontuário em PDF.
- Modo offline/PWA.

## Fonte de evidência (engenharia reversa, se clone do legado)

- Não há legado web a clonar — a evidência primária é o **mapa completo do serviço** `social-care`
  (relatório de exploração de 2026-06-12: bounded contexts, rotas, DTOs, eventos, erros) e o código
  em `social-care/Sources/social-care-s/` (Controllers/DTOs em `IO/HTTP/`).
- Guias de formulário do domínio em `social-care/handbook/front_end_forms/*.md` (estrutura das fichas
  socioassistenciais).
- O que é "fiel ao contrato": campos, validações e códigos de erro espelham o backend. O que é decisão
  de UI (não evidência): agrupamento das seções, ordem dos passos do cadastro, microcopy.

## Perguntas em aberto

- [ ] [NEEDS CLARIFICATION: o cadastro de paciente será wizard multi-etapas (dados pessoais → documentos → endereço → família) ou formulário único? Impacta [`design-pages.fe.md`](./design-pages.fe.md) e o plano (`plan.fe.md`).] → resolver em `/speckit-clarify`.
- [ ] [NEEDS CLARIFICATION: a tela de lista de espera precisa de ordenação própria (ex.: por data de ingresso)? O contrato atual só oferece `search`/`status`/cursor.]

## Referências

- Constituição web_02: [`../../../.specify/memory/constitution.md`](../../../.specify/memory/constitution.md)
- ADR-0001 Arquitetura vertical-modular: [`../../adr/0001-vertical-modular-architecture.md`](../../adr/0001-vertical-modular-architecture.md)
- ADR-0003 Bun supply-chain: [`../../adr/0003-bun-supply-chain.md`](../../adr/0003-bun-supply-chain.md)
- ADR-0004 Split client × server (MVVM × DDD): [`../../adr/0004-client-server-split-mvvm-ddd.md`](../../adr/0004-client-server-split-mvvm-ddd.md)
- ADR-0007 vanilla-extract: [`../../adr/0007-design-system-vanilla-extract.md`](../../adr/0007-design-system-vanilla-extract.md)
- ADR-0009 Framework-agnostic client: [`../../adr/0009-framework-agnostic-client.md`](../../adr/0009-framework-agnostic-client.md)
- ADR-0010 BFF orquestrador / nomenclatura fn: [`../../adr/0010-bff-orchestration-fn-naming.md`](../../adr/0010-bff-orchestration-fn-naming.md)
- Índice de ADRs: [`../../adr/README.md`](../../adr/README.md)
- Descoberta core-api: [`./discovery.md`](./discovery.md)
- Domínio frontend: [`./domain.fe.md`](./domain.fe.md)
- Domínio core-api: [`./domain.md`](./domain.md)
- Prontidão da API: [`./api-readiness.fe.md`](./api-readiness.fe.md)
- Mapeamento de erros (ADR de feature): [`./adr.fe.md`](./adr.fe.md)
- Métricas frontend: [`./metrics.fe.md`](./metrics.fe.md)
- Design tokens: [`./design-tokens.fe.md`](./design-tokens.fe.md)
- Design pages: [`./design-pages.fe.md`](./design-pages.fe.md)
- SolidStart: [`../../reference/framework/solidstart/`](../../reference/framework/solidstart/)
- Elysia (BFF): [`../../reference/framework/elysia/`](../../reference/framework/elysia/)
- vanilla-extract: [`../../reference/ui/vanilla-extract/`](../../reference/ui/vanilla-extract/)
