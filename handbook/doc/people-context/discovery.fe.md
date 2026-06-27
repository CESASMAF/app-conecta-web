# Descoberta: Gestão de Pessoas e Identidade — Web (visão frontend · `web_02/`)

**Feature**: `specs/002-people-context-web/` · **Consultor**: `/acdg-skills:requirements-engineer`

> Fase 0 (frontend). Elicitação ancorada em Engenharia de Requisitos + Histórias de Usuário.
> Saída alimenta a SPEC (`spec.fe.md`). Restrições deste nível = front + BFF (não core-api): a
> fonte de dados é o `svc-people-context` via rota Elysia (BFF); o front consome o contrato e
> **nunca** acessa o backend direto — o browser jamais vê token, URL de backend ou secret. O BFF
> Elysia injeta `Authorization: Bearer` (OIDC/Authentik, verificado com `jose`) e o header
> `X-Actor-Id` nas mutações. Veja [ADR-0001](./adr.md) e
> [Constituição web_02](../../../.specify/memory/constitution.md).

## Problema / Oportunidade

A equipe da ACDG-BV não tem interface para o registro de identidade: cadastrar uma pessoa, vinculá-la a um sistema (`social-care:patient`, `therapies:therapist`, …) ou criar seu acesso hoje exige chamadas manuais à API e cliques diretos no Authentik — operações inviáveis para uma equipe pequena e não técnica. O resultado prático é dependência de quem "sabe API", risco de duplicidade quando a busca não é feita antes do cadastro e contas de acesso desalinhadas com o registro. A interface web precisa transformar o contrato do `people-context` em jornadas reais — buscar/cadastrar pessoa com deduplicação por CPF, gerenciar vínculos, provisionar login, recuperar senha e operar desativação/LGPD — sem que ninguém toque na API ou no IdP diretamente.

## Stakeholders

| Stakeholder | Interesse / o que espera | Decisor? |
|---|---|---|
| Operadora / assistente social (`worker`) | Buscar antes de cadastrar (sem duplicar), formulário com máscara de CPF e data PT-BR, provisionar login retroativo | não |
| Supervisor (`owner`) | Consulta somente-leitura de pessoas e vínculos; nenhum botão de escrita visível | não |
| Administrador de sistema (`admin` escopado) | UI de vínculos clara sobre o que ele pode (só o próprio sistema), ações de desativar/reativar pessoa e disparar reset de senha | sim |
| Superadministrador (`superadmin`) | Fluxo de erasure LGPD com fricção deliberada (confirmação forte, irreversibilidade explícita) | sim |
| DPO / LGPD | CPF mascarado só na exibição, nenhum link de senha exibido/copiável, aviso de irreversibilidade no erasure | sim |
| Equipe web | Contrato pronto e verificado (`api-readiness.fe.md`); reuso do shell e design system do conjunto `001-social-care-web` (`design-*.fe.md`) | não |

## Histórias de usuário (INVEST)

- **US-001** (P1): Como operadora, quero buscar pessoas por nome ou CPF e cadastrar uma nova quando não existir, para garantir registro único sem duplicidade.
  - **Valor / prioridade**: P1 — porta de entrada de tudo; a busca-antes-de-cadastrar é a defesa de UX contra duplicatas, e o backend ainda garante dedup por CPF.
  - **Critérios de aceitação** (viram BDD/cenários): dado a tela de pessoas, quando digito um termo, então a lista filtra via `GET /people?search=` com paginação "carregar mais" (`meta.nextCursor`); dado o formulário de cadastro com CPF mascarado (`123.456.789-00`) e data `dd/MM/yyyy`, quando submeto, então o BFF recebe valores crus (11 dígitos, ISO 8601) e sou levada ao perfil da pessoa; dado um CPF já cadastrado, quando submeto, então sou levada ao perfil **existente** com aviso "Pessoa já cadastrada" (dedup idempotente, não é erro).
- **US-002** (P1): Como operadora, quero ver e editar o perfil da pessoa (nome, CPF, nascimento, e-mail) com indicação de status (ativa/inativa) e de login (tem/não tem acesso), para manter o registro correto.
  - **Valor / prioridade**: P1 — o perfil é o hub das demais jornadas (vínculos, acesso, ciclo de vida).
  - **Critérios de aceitação**: dado o perfil aberto, quando edito apenas o e-mail e salvo, então só esse campo muda (semântica COALESCE — campos omitidos preservados) e vejo confirmação do `204`.
- **US-003** (P2): Como administrador escopado, quero gerenciar os vínculos `system:role` da pessoa (atribuir, desativar, reativar) na própria tela do perfil, para controlar papéis por sistema.
  - **Valor / prioridade**: P2 — dá significado ao registro nos sistemas consumidores; depende do P1.
  - **Critérios de aceitação**: dado admin de `social-care`, quando abro o formulário de vínculo, então só consigo selecionar sistemas do meu escopo (espelho de `ROL-007`); dado vínculo já ativo, quando tento atribuir de novo, então a UI informa "vínculo já existente" sem tratar como falha (`204` noop); dado meu próprio registro, então a ação de atribuir vínculo a mim mesma não é oferecida (espelho de `ROL-008`); dado que não sou superadmin, então a role `superadmin` não aparece como opção (espelho de `ROL-006`).
- **US-004** (P2): Como operadora ou administrador, quero provisionar o login da pessoa no momento do cadastro (`createLogin`) ou depois (retroativo), para dar acesso aos sistemas — inclusive quando a provisão falhou na criação (`207`).
  - **Valor / prioridade**: P2 — fecha o ciclo de identidade; o caso `207 Multi-Status` precisa de UX explícita de retomada.
  - **Critérios de aceitação**: dado o cadastro com "Criar acesso" marcado e o IdP fora, quando recebo `207`, então vejo "Pessoa cadastrada, mas o acesso não pôde ser criado" com ação "Tentar criar acesso" no perfil; dado pessoa sem e-mail, quando tento provisionar, então a UI exige o e-mail antes do envio (espelho de `422 PEO-009`); dado pessoa que já tem login, então o botão de provisionar não é exibido (espelho de `409 PEO-008`).
- **US-005** (P3): Como administrador, quero disparar a recuperação de senha de uma pessoa, para destravá-la sem acessar o Authentik.
  - **Valor / prioridade**: P3 — operacional e assíncrono; a UI nunca exibe link (segurança ADR-030).
  - **Critérios de aceitação**: dado pessoa com login, quando clico "Enviar recuperação de senha" e confirmo, então vejo "Solicitação aceita — a pessoa receberá um e-mail" (`202 Accepted`, sem link); dado pessoa sem login, então a ação aparece desabilitada com explicação (espelho de `422 PEO-007`).
- **US-006** (P3): Como administrador, quero desativar e reativar pessoas com confirmação, para bloquear acesso preservando o histórico.
  - **Valor / prioridade**: P3 — ciclo de vida reversível, menos frequente que cadastro/vínculo.
  - **Critérios de aceitação**: dado pessoa ativa, quando confirmo a desativação, então o badge muda para "Inativa" e as ações de edição ficam bloqueadas; dado o IdP indisponível (`502 IDP-002`), então vejo que **nada foi alterado** e posso tentar de novo.
- **US-007** (P3): Como superadministrador, quero executar o apagamento total LGPD com fricção deliberada, para atender solicitações legais sem risco de clique acidental.
  - **Valor / prioridade**: P3 — obrigação legal de baixa frequência e alto risco (irreversível).
  - **Critérios de aceitação**: dado meu token sem `superadmin`, então a ação de apagar não é renderizada; dado superadmin, quando aciono "Apagar definitivamente", então um diálogo exige digitar o nome completo da pessoa para habilitar a confirmação e explicita a irreversibilidade.

## Requisitos

### Funcionais
- **RF-001**: O sistema DEVE exibir lista de pessoas com busca (nome parcial / prefixo de CPF) e paginação por cursor ("carregar mais" via `meta.nextCursor`), consumindo `GET /people` via rota Elysia (`listPeople.query.fn.ts`) consumida pelo client com Eden Treaty.
- **RF-002**: O sistema DEVE oferecer cadastro com máscaras PT-BR (CPF `123.456.789-00`, data `dd/MM/yyyy`) enviando valores crus ao BFF (11 dígitos, ISO 8601), com validação de borda espelhando o domínio (CPF MOD-11, nome 1–200, nascimento não-futuro, e-mail; `createLogin` ⇒ e-mail obrigatório).
- **RF-003**: O sistema DEVE tratar a deduplicação por CPF como fluxo feliz: `201` com id de pessoa existente leva ao perfil com aviso informativo, nunca a uma tela de erro.
- **RF-004**: O sistema DEVE renderizar o perfil da pessoa como hub: dados cadastrais, badge ativa/inativa, estado de acesso (sem login / com login), vínculos por sistema e ações condicionadas à role.
- **RF-005**: O sistema DEVE gerenciar vínculos com escopo visual: admin só vê/seleciona os sistemas do seu escopo; `superadmin` vê tudo; auto-assign e role `superadmin` não são ofertados quando proibidos (espelhos de `ROL-006`/`ROL-007`/`ROL-008`).
- **RF-006**: O sistema DEVE expor o fluxo de provisão de login (na criação e retroativa pós-`207`), incluindo senha inicial opcional (mínimo 8 caracteres) e exigência de e-mail.
- **RF-007**: O sistema DEVE disparar a recuperação de senha como ação assíncrona (`202`) com mensagem de aceite — nenhum link exibido, logado ou copiável no client.
- **RF-008**: O sistema DEVE mapear códigos de erro estruturados (`PEO-XXX`, `ROL-XXX`, `IDP-XXX`, `AUTH-XXX`) para mensagens i18n PT-BR acionáveis, preservando o status HTTP vindo do BFF.
- **RF-009**: O sistema DEVE espelhar o RBAC na UI: `worker` cadastra/edita/provisiona; `owner` é somente-leitura; `admin` (escopado) gerencia vínculos, ciclo de vida e reset; `superadmin` adicionalmente apaga (LGPD).
- **RF-010**: O sistema DEVE tratar conflitos de estado (`409 PEO-005`/`PEO-006`/`PEO-008`) recarregando o perfil e reapresentando apenas as ações válidas.

### Não-funcionais (viram métricas)
- **RNF-001**: Segurança — token OIDC (Authentik) vive só no BFF (cookie de sessão HttpOnly); o BFF injeta `Authorization: Bearer` e `X-Actor-Id`; nenhum Bearer, URL de backend ou link de reset no bundle/network/storage do browser.
- **RNF-002**: Performance — busca de pessoas responde com resultados interativos em p95 < 1 s em conexão 4G; perfil completo (pessoa + vínculos) < 1,5 s.
- **RNF-003**: Acessibilidade — formulários navegáveis por teclado, labels e mensagens de erro associadas, diálogos de confirmação focáveis (WCAG 2.1 AA).
- **RNF-004**: i18n — zero strings hardcoded; vocabulário canônico PT-BR do serviço (pessoa, vínculo de sistema, provisão de login, recuperação de senha, apagamento total).
- **RNF-005**: LGPD — CPF exibido mascarado, ausente de logs do client e de URLs de navegação; erasure com confirmação forte e trilha apenas via eventos do backend.

## Restrições e premissas (frontend)

- Stack: **SolidStart** (Solid · Vinxi · Nitro preset `bun`) + **Elysia** (BFF em
  `src/routes/api/[...path].ts`) + **Bun** (runtime/PM/test) + **Eden Treaty** +
  **vanilla-extract** (CSS-in-TS zero-runtime) + **TypeBox** (`Elysia.t`) + **jose** (OIDC)
  — ver [Constituição web_02](../../../.specify/memory/constitution.md) e [ADR-0003](../../adr/0003-bun-supply-chain.md).
  **Nunca** npm/yarn/npx — supply-chain gerenciada integralmente pelo Bun (Princípio IV).
- BFF Elysia é a única fronteira; dados vêm do `svc-people-context` (prontidão dos
  endpoints em [`api-readiness.fe.md`](./api-readiness.fe.md)).
- Reuso do shell de aplicação, tokens vanilla-extract e componentes do conjunto
  `001-social-care-web` (`design-tokens.fe.md`, `design-atoms.fe.md` … `design-pages.fe.md`);
  esta feature cataloga apenas os componentes novos.
- Envelope `{ data, meta }` e erros `{ success: false, error: { code, message } }` são o
  contrato — o BFF valida com TypeBox (`Elysia.t`) na borda e preserva o status HTTP.
- Premissa: autenticação web (sessão Authentik via cookie HttpOnly, `jose` verify) já
  entregue por feature anterior ([ADR-0005](../../adr/0005-auth-session-refresh-decisions.md));
  esta feature consome a sessão e suas roles (claim `groups`).
- Premissa: volume BV é pequeno (centenas de pessoas) — cursor pagination com `limit=20`
  é suficiente.

## Fora de escopo

- Prontuário socioassistencial e demais jornadas do `social-care` (conjunto `001-social-care-web`).
- Administração do Authentik (grupos, flows, blueprints) e composição do e-mail de recuperação (queue-manager).
- Dashboards/relatórios sobre pessoas e vínculos (`analysis-bi`).
- Autogestão de perfil pela própria pessoa (self-service); esta feature é operada pela equipe da associação.
- Modo offline/PWA.

## Fonte de evidência (engenharia reversa, se clone do legado)

- Não há legado web a clonar — a evidência primária é o **mapa completo do serviço**
  `people-context` (relatório de exploração de 2026-06-12: módulos, entidades, rotas com
  roles, eventos `people.*`, códigos de erro, auth e vocabulário) e o código em
  `people-context/src/` (`routes/people.ts`, `routes/roles.ts`, `domain/person.ts`,
  `domain/system-role.ts`, `middleware/auth.ts`).
- O que é "fiel ao contrato": campos, validações, códigos de erro, semântica de
  dedup/idempotência e a matriz endpoint × roles. O que é decisão de UI (não evidência):
  busca-antes-de-cadastrar como fluxo guiado, agrupamento do perfil em seções Solid,
  microcopy e fricção do erasure.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md)
- [ADR-0001 (people-context): BFF como única fronteira de identidade](./adr.md)
- [ADR-0003 (web_02): Bun supply-chain](../../adr/0003-bun-supply-chain.md)
- [ADR-0005 (web_02): Auth — OIDC+PKCE, jose verify](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0009 (web_02): Framework-Agnostic Client](../../adr/0009-framework-agnostic-client.md)
- [discovery.md — visão backend/core-api](./discovery.md)
- [api-readiness.fe.md — prontidão dos endpoints](./api-readiness.fe.md)
- [domain.fe.md — modelo do frontend](./domain.fe.md)
- [Índice de ADRs web_02](../../adr/README.md)

## Perguntas em aberto

- [ ] [NEEDS CLARIFICATION: o cadastro deve embutir a provisão de login num único formulário (checkbox "Criar acesso" + senha inicial) ou em passo separado pós-criação? Impacta `design-pages.fe.md` e `plan.fe.md`.] → resolver em `/speckit-clarify`.
- [ ] [NEEDS CLARIFICATION: a UI de vínculos deve oferecer listas fechadas de sistemas/roles (os `KnownSystem`/`KnownRole` + roles administrativas) ou campo com sugestões, já que o domínio não é exaustivo?]
- [ ] [NEEDS CLARIFICATION: o picker de pessoa do cadastro de paciente (`001-social-care-web`) deve ser entregue por esta feature como componente reutilizável do módulo `people`?]
