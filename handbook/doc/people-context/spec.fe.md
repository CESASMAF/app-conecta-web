# Feature Specification: Gestão de Pessoas e Identidade — Web

**Feature Branch**: `002-people-context-web`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Interface web (front + BFF Elysia, repo `web_02/`) para o registro de identidade de pessoas do ecossistema ACDG, consumindo a API do `svc-people-context` via BFF — o browser nunca vê token; o BFF injeta `Authorization: Bearer` (OIDC/Authentik) e o header `X-Actor-Id` nas mutações."

> **Variante `-fe` (frontend / web-app).** Espelha o `spec.md` (contrato core-api) mas troca a
> semântica de backend pela do **front + BFF unificado** (SolidStart + Elysia). A spec descreve o **quê**
> (jornadas, requisitos, critérios) — o **como** (handlers Elysia, módulos, MVVM) fica no `plan.fe.md`.
> Governa `src/`; conformidade verificada no "Constitution Check" do `plan.fe.md` (princípios I–VI de
> [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md)).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e busca de pessoa (Priority: P1)

A operadora acessa a lista de pessoas, busca por nome parcial ou CPF (com paginação "carregar mais"), e cadastra uma nova pessoa em formulário com máscaras PT-BR (CPF `123.456.789-00`, data `dd/MM/yyyy`). A deduplicação por CPF é tratada como fluxo feliz: se o CPF já existe, a operadora é levada ao perfil existente com aviso informativo. O perfil da pessoa é o hub: dados cadastrais editáveis (preservando campos não alterados), badge de status (Ativa/Inativa) e estado de acesso (Sem acesso / Acesso ativo).

**Why this priority**: É o MVP — sem busca e cadastro de pessoa, vínculos e acessos não têm onde acontecer. Entrega valor sozinha: registro único navegável, fim das planilhas de "quem é quem".

**Independent Test**: Fluxo completo via `/people` → `/people/new` → `/people/:personId`: buscar, cadastrar (incluindo CPF duplicado), visualizar e editar o perfil, com BFF testado via fakes in-memory (`bun:test`, [ADR-0011](../../adr/0011-no-mocks-in-production.md)).

**Acceptance Scenarios**:

1. **Given** a lista de pessoas carregada, **When** a usuária digita um termo de busca, **Then** a lista filtra (nome parcial ou prefixo de CPF via `GET /people?search=`) com paginação "carregar mais" alimentada por `meta.nextCursor` enquanto `meta.hasMore` for verdadeiro.
2. **Given** o formulário de cadastro, **When** a usuária digita um CPF com dígito verificador inválido ou um repdigit (`111.111.111-11`), **Then** o campo exibe erro de validação em PT-BR antes de qualquer request ao BFF (espelho do MOD-11 do domínio).
3. **Given** o formulário válido (CPF mascarado, data `dd/MM/yyyy`, nome 1–200), **When** submetido, **Then** o BFF recebe valores crus (11 dígitos, ISO 8601), chama `POST /people` e a usuária é redirecionada ao perfil recém-criado.
4. **Given** um CPF já cadastrado no formulário, **When** submetido, **Then** o backend responde `201` com o id **existente** e a UI redireciona ao perfil com o aviso "Pessoa já cadastrada com este CPF" — nunca uma tela de erro.
5. **Given** o campo CPF vazio, **When** o formulário é submetido, **Then** o cadastro prossegue normalmente (CPF é opcional) e a UI sinaliza no perfil que a pessoa não tem documento registrado.
6. **Given** o perfil aberto, **When** a usuária edita apenas o e-mail e salva, **Then** o BFF envia o `PUT /people/:personId` e a UI confirma o `204` — os demais campos permanecem intactos (semântica COALESCE).
7. **Given** data de nascimento futura digitada, **When** a usuária tenta salvar, **Then** a validação de borda bloqueia o envio com mensagem PT-BR no campo (espelho de `PEO-001`).

---

### User Story 2 - Gestão de vínculos de sistema (Priority: P2)

O administrador gerencia, na tela do perfil, os vínculos `system:role` da pessoa: atribui um vínculo escolhendo sistema e papel, desativa e reativa vínculos existentes, e consulta pessoas por sistema/papel numa tela de discovery (`GET /roles?system=…`). A UI espelha o escopo do RBAC: admin de um sistema só opera no próprio sistema; a role `superadmin` e o auto-assign não são ofertados quando proibidos.

**Why this priority**: Os vínculos são o que tornam a pessoa "paciente do social-care" ou "terapeuta do therapies"; dependem do P1, mas destravam os demais sistemas do ecossistema.

**Independent Test**: Com pessoa existente (fixture/fake in-memory), atribuir/desativar/reativar vínculos com tokens de roles distintas (`social-care:admin`, `superadmin`), verificando escopo visual, noop de vínculo duplicado e a tela de discovery — `bun:test` ([ADR-0011](../../adr/0011-no-mocks-in-production.md)).

**Acceptance Scenarios**:

1. **Given** o perfil aberto por admin com grupo `social-care:admin`, **When** abre o formulário "Adicionar vínculo", **Then** o seletor de sistema oferece apenas `social-care` (escopo derivado da sessão — espelho de `ROL-007`), enquanto `superadmin` vê todos os sistemas.
2. **Given** o formulário de vínculo, **When** a usuária não é superadmin, **Then** a opção `superadmin` não aparece no seletor de papel (espelho de `ROL-006`); se o backend ainda responder `403 ROL-006`, a UI traduz o código em mensagem i18n.
3. **Given** um vínculo já ativo (ex.: `social-care:patient`), **When** o admin tenta atribuí-lo de novo, **Then** a UI mostra "Vínculo já existente" como informação (o BFF recebeu `204` noop) e a lista permanece sem duplicatas.
4. **Given** um vínculo inativo na lista, **When** o admin clica "Reativar" e confirma, **Then** o vínculo volta a ativo (`201` da reativação) sem criar entrada duplicada.
5. **Given** o perfil da própria pessoa autenticada (`person.idpUserId` = usuário da sessão), **When** a tela renderiza as ações, **Then** "Adicionar vínculo" não é oferecido a não-superadmin (espelho de `ROL-008`); um `403 ROL-008` residual é traduzido em "Você não pode atribuir vínculos a si mesmo".
6. **Given** a tela de discovery, **When** o admin filtra por sistema `social-care` e papel `patient`, **Then** a lista exibe `{ pessoa, vínculo }` com CPF mascarado na exibição; sem sistema selecionado a consulta não é disparada (o parâmetro `system` é obrigatório — espelho de `ROL-004`).
7. **Given** dois admins operando o mesmo vínculo simultaneamente, **When** o backend responde `409 ROL-009`, **Then** a UI recarrega a lista de vínculos e informa "O vínculo foi alterado por outro usuário".

---

### User Story 3 - Gestão de acesso e IdP (Priority: P3)

A operadora provisiona o login da pessoa no Authentik — marcando "Criar acesso" no cadastro ou retroativamente pelo perfil, inclusive como retomada após um `207 Multi-Status`. O administrador dispara a recuperação de senha (assíncrona, sem link visível) e desativa/reativa pessoas com confirmação. O superadministrador executa o apagamento total LGPD com fricção deliberada.

**Why this priority**: Fecha o ciclo identidade → acesso e cobre as obrigações LGPD; pressupõe pessoa e vínculos operantes e tem frequência menor que cadastro/vínculo.

**Independent Test**: Com pessoas em estados distintos (sem login, com login, inativa — fakes in-memory), exercitar provisão retroativa, reset, desativar/reativar e erasure com tokens `worker`/`admin`/`superadmin`, verificando estados de UI, mensagens e bloqueios — `bun:test` + happy-dom.

**Acceptance Scenarios**:

1. **Given** o cadastro com "Criar acesso" marcado e o IdP indisponível, **When** o backend responde `207 Multi-Status`, **Then** a UI confirma "Pessoa cadastrada, mas o acesso não pôde ser criado" e o perfil exibe a ação "Criar acesso agora" (retomada via `POST /people/:personId/login`).
2. **Given** pessoa sem login e sem e-mail, **When** a usuária aciona "Criar acesso", **Then** a UI exige o e-mail antes do envio (espelho de `422 PEO-009`); com e-mail preenchido, o sucesso (`201`) atualiza o estado para "Acesso ativo" exibindo que o convite/credencial foi gerado.
3. **Given** pessoa que já tem login, **When** o perfil renderiza, **Then** "Criar acesso" não é exibido (espelho de `409 PEO-008`); um `409` residual recarrega o perfil e reapresenta o estado correto.
4. **Given** pessoa com login, **When** o admin clica "Enviar recuperação de senha" e confirma, **Then** a UI exibe "Solicitação aceita — a pessoa receberá um e-mail com as instruções" (`202 Accepted`) e **nenhum link** é exibido, logado ou copiável; para pessoa sem login a ação aparece desabilitada com tooltip explicativo (espelho de `422 PEO-007`).
5. **Given** pessoa ativa, **When** o admin confirma a desativação, **Then** o badge muda para "Inativa", as ações de edição/vínculo ficam bloqueadas e a timeline de feedback indica que o acesso foi revogado no IdP primeiro; se o IdP falhar (`502 IDP-002`), a UI informa "Nada foi alterado — tente novamente" (banco intacto).
6. **Given** pessoa já inativa em outra sessão, **When** o admin tenta desativá-la, **Then** o `409 PEO-005` recarrega o perfil e mostra o estado atual (reativação espelhada com `409 PEO-006`).
7. **Given** usuária sem `superadmin`, **When** o perfil renderiza, **Then** "Apagar definitivamente (LGPD)" não existe na tela; um deep-link/ação residual recebe `403 PEO-010` traduzido em tela de acesso negado.
8. **Given** superadmin aciona "Apagar definitivamente (LGPD)", **When** o diálogo abre, **Then** ele exige digitar o nome completo da pessoa para habilitar a confirmação, explicita a irreversibilidade (conta de acesso + vínculos + registro) e, após o `204`, redireciona à lista com confirmação do apagamento.

---

### Edge Cases

- Lista de pessoas vazia (0 resultados de busca): estado vazio com orientação ("Nenhuma pessoa encontrada") e atalho "Cadastrar nova pessoa" pré-preenchendo o termo buscado quando fizer sentido (nome).
- `207 Multi-Status` no cadastro: não é erro nem sucesso pleno — a UI precisa de estado visual próprio ("acesso pendente") no perfil até a provisão retroativa concluir.
- Conflitos de estado `409` (`PEO-005` já inativa, `PEO-006` já ativa, `PEO-008` já tem login): sempre recarregar o perfil e reapresentar apenas as ações válidas — nunca repetir a mutação às cegas.
- Pré-condições `422` (`PEO-007` sem login para reset, `PEO-009` sem e-mail para provisão): preferir prevenir na UI (ação desabilitada/campo exigido); quando o backend responder, traduzir apontando a pendência.
- Falhas do IdP (`502 IDP-001…IDP-005`): banner "Serviço de acesso indisponível" com retry; deixar claro que o cadastro local não foi perdido (e, no deactivate/erasure, que nada foi alterado).
- Paginação por cursor: "carregar mais" desabilita durante o fetch; `hasMore=false` esconde o botão; mudar o termo de busca descarta o cursor acumulado e reinicia a lista.
- Erro do BFF → código estruturado (`PEO-XXX`, `ROL-XXX`, `IDP-XXX`, `AUTH-XXX`) → tag i18n; código desconhecido cai em mensagem genérica segura sem vazar payload.
- Reentrância: todo submit desabilita o botão até a resposta (sem duplo `POST` — não há idempotency key no contrato; a dedup por CPF mitiga apenas o cadastro).
- Sessão expirada no meio do formulário: redirecionar ao login preservando rascunho local do formulário em edição.
- Usuária `owner`: nenhum botão de escrita renderizado; deep-link para rota de edição responde com tela de acesso negado (espelho do `403 AUTH-002`).
- CPF na exibição: sempre mascarado (`123.456.789-00`); nunca em URL de navegação nem em logs do client (LGPD).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir a lista de pessoas com busca (nome parcial / prefixo de CPF) e paginação por cursor ("carregar mais" via `meta.nextCursor`/`meta.hasMore`), consumindo `GET /people` via handler Elysia (Eden treaty).
- **FR-002**: Usuários DEVEM conseguir cadastrar pessoa em formulário com máscaras PT-BR (CPF, data) que envia valores crus ao BFF (11 dígitos, ISO 8601), com CPF e e-mail opcionais.
- **FR-003**: O sistema DEVE validar todo input na borda do handler Elysia com TypeBox (`Elysia.t`), espelhando o domínio (CPF MOD-11 sem repdigits, nome 1–200, nascimento não-futuro, e-mail válido, `createLogin` ⇒ e-mail obrigatório, senha inicial ≥ 8) antes de chamar o `people-context`.
- **FR-004**: O sistema DEVE tratar a deduplicação por CPF como fluxo feliz: redirecionar ao perfil existente com aviso informativo, sem tela de erro.
- **FR-005**: O sistema DEVE renderizar o perfil da pessoa como hub: dados cadastrais, badge Ativa/Inativa, estado de acesso (Sem acesso / Acesso pendente / Acesso ativo), vínculos por sistema e ações condicionadas à role da sessão.
- **FR-006**: O sistema DEVE permitir editar dados cadastrais preservando campos não alterados (COALESCE no backend) e refletindo que nome/e-mail sincronizam com o IdP quando a pessoa tem login.
- **FR-007**: O sistema DEVE gerenciar vínculos (atribuir, desativar, reativar, listar com filtro ativo/inativo) espelhando o escopo do RBAC na própria UI: sistemas limitados ao escopo do admin, role `superadmin` oculta para não-superadmin, auto-assign não ofertado.
- **FR-008**: O sistema DEVE oferecer a tela de discovery de vínculos (`GET /roles`) com filtro obrigatório de sistema, filtros opcionais de papel/ativo e CPF mascarado na exibição.
- **FR-009**: O sistema DEVE expor a provisão de login na criação (`createLogin`) e retroativa pós-`207` ("Criar acesso agora"), com estado visual de acesso pendente até a conclusão.
- **FR-010**: O sistema DEVE disparar a recuperação de senha como ação assíncrona com confirmação de aceite (`202`) — nenhum link de recuperação renderizado, logado ou armazenado no client.
- **FR-011**: O sistema DEVE oferecer desativar/reativar pessoa com diálogo de confirmação, comunicando a ordem IdP-first nos erros (`502` = nada alterado) e bloqueando edições de pessoa inativa.
- **FR-012**: O sistema DEVE restringir o apagamento LGPD a `superadmin` com fricção deliberada (digitar o nome completo, aviso de irreversibilidade) e redirecionar à lista após o `204`.
- **FR-013**: O sistema DEVE mapear todo erro estruturado do backend (`PEO-XXX`, `ROL-XXX`, `IDP-XXX`, `AUTH-XXX`, `ADM-001`) para mensagem i18n PT-BR, preservando o status HTTP através do BFF e apontando o campo quando aplicável.
- **FR-014**: O sistema DEVE garantir que toda mutação saia do BFF com `Authorization: Bearer` e `X-Actor-Id` injetados — o browser nunca envia nem conhece esses valores (Princípio I — [ADR-0004](../../adr/0004-client-server-split-mvvm-ddd.md), [ADR-0005](../../adr/0005-auth-session-refresh-decisions.md)).

### Key Entities *(inclua se a feature envolve dados)*

- **Pessoa (perfil)**: visão do `Person` — nome completo, CPF (mascarado na exibição), nascimento, e-mail, status Ativa/Inativa, estado de acesso derivado de `idpUserId` (null = sem acesso) e do desfecho `207` (pendente).
- **Vínculo de sistema**: papel da pessoa num sistema (`system:role`) com status ativo/inativo e data de atribuição; lista no perfil + formulário de atribuição escopado.
- **Resultado de discovery**: par `{ pessoa resumida, vínculo }` da tela de consulta por sistema/papel.
- **Sessão / ator**: roles da usuária (claim `groups`: `worker`, `owner`, `system:admin`, `superadmin`) que condicionam toda a renderização de ações; `X-Actor-Id` é detalhe do BFF, invisível à UI.
- **Página de listagem**: itens + `totalCount` + cursor acumulado no client para "carregar mais".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operadora completa busca + cadastro de uma pessoa nova em menos de 2 minutos na primeira utilização.
- **SC-002**: Lista de 20 pessoas renderiza em < 1 s e o perfil completo (pessoa + vínculos) fica interativo em p95 < 1,5 s em conexão 4G.
- **SC-003**: Zero ocorrências de token OIDC, URL de backend, `X-Actor-Id` ou link de recuperação de senha observáveis no browser (bundle, network, storage, logs) — verificado em E2E.
- **SC-004**: 100% dos códigos de erro do `people-context` usados nas jornadas possuem mensagem i18n PT-BR (nenhum código cru exibido à usuária).
- **SC-005**: Zero cadastros duplicados percebidos como erro: 100% dos submits com CPF existente terminam no perfil da pessoa existente com aviso informativo.
- **SC-006**: 100% dos desfechos `207` exibem o estado "acesso pendente" com ação de retomada visível no perfil (nenhuma provisão perdida silenciosamente).
- **SC-007**: Nenhum duplo-submit registrado em produção (mutações duplicadas em < 2 s para o mesmo formulário = 0).

## Impacto Arquitetural (web-app / BFF) *(obrigatório se a feature toca `src/`)*

- **Módulo(s) vertical(is) afetado(s)**: [x] novo `src/modules/people/` (busca/cadastro, perfil, vínculos, acesso/IdP, discovery) · [ ] estende `auth` (apenas consome sessão e roles existentes) · [x] `shared/ui` (design system — componentes novos catalogados; shell e tokens reutilizados do conjunto `001-social-care-web`)
  - Cross-módulo só via `public-api` (Princípio III — [ADR-0001](../../adr/0001-vertical-modular-architecture.md)). A feature vive num único módulo vertical; o picker de pessoa consumido pelo módulo `social-care` será exposto pela `public-api` de `people` [NEEDS CLARIFICATION: o picker entra nesta feature ou na 001?].
- **Handlers Elysia novos/alterados (a fronteira, Princípio I — [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md))?**:
  - `people.query.fn.ts` — `listPeople` input `{ search?, cursor?, limit? }` → página de pessoas + cursor; `getPerson`/`getPersonByCpf`.
  - `person-commands.service.fn.ts` — `createPerson` payload de cadastro (com `createLogin?`/`initialPassword?`) → `{ id, provisioned | pending }` (distinguindo `201` de `207`); `updatePerson` com semântica COALESCE.
  - `roles.service.fn.ts` — `assignRole` (distinguindo `201` de `204` noop), `deactivateRole`, `reactivateRole`, `listPersonRoles`, `queryRoles` (discovery, `system` obrigatório).
  - `access.service.fn.ts` — `provisionLogin` retroativa pós-`207`; `requestPasswordReset` (retorna apenas o aceite `202`, nunca conteúdo sensível); `deactivatePerson`, `reactivatePerson`, `erasePerson` (superadmin).
  - Todos leem a sessão (cookie HttpOnly via Elysia middleware), injetam `Authorization: Bearer` + `X-Actor-Id`, validam input/output com TypeBox (`Elysia.t`) e preservam o status HTTP do erro (Princípios I e V).
- **Integração core-api**: endpoints de `/api/v1` do `svc-people-context` (`people`, `roles`, `health`) — prontidão endpoint a endpoint verificada em [api-readiness.fe.md](./api-readiness.fe.md); contrato consolidado em [spec.md](./spec.md).
- **Novos agregados / Value Objects (server/domain, Princípio V)?**: branded types + smart constructors `Result<T,E>` para `Cpf` (MOD-11 + repdigits), `PersonId`, `RoleId`, `IsoDate`, `Email` e `SystemRolePair` (`system:role`) — espelhos client-side dos branded types do serviço, sem lógica de negócio nova.
- **Reatividade no client (Solid — Princípio III)?**: `createAsync` / `query` / `action` / `useSubmission` do `@solidjs/router` para server-state (lista de pessoas, ficha, vínculos); `createSignal`/`createStore` para estado local de formulários e diálogos de confirmação — sem TanStack Query ([ADR-0002](../../adr/0002-errors-as-values.md), [ADR-0009](../../adr/0009-framework-agnostic-client.md)).
- **Design System ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md))**: [x] novos átomos/moléculas/organismos — input mascarado de CPF (reuso do `001-social-care-web`), badge de estado de acesso (Sem acesso / Pendente / Ativo), lista de vínculos com chips `system:role`, formulário de vínculo escopado, diálogo de confirmação destrutiva com digitação do nome (erasure), banner de resultado parcial (`207`) — catalogar em [design-atoms.fe.md](./design-atoms.fe.md), [design-molecules.fe.md](./design-molecules.fe.md), [design-organisms.fe.md](./design-organisms.fe.md), [design-pages.fe.md](./design-pages.fe.md); tokens em [design-tokens.fe.md](./design-tokens.fe.md); governança em [design-governance.fe.md](./design-governance.fe.md).
- **Possíveis violações da constituição (I–VI)?**: nenhuma prevista. Pontos de vigilância para o "Complexity Tracking" do [plan.fe.md](./plan.fe.md): (a) qualquer caminho que exponha o link de reset ou o `X-Actor-Id` ao client (violação do Princípio I); (b) derivar escopo de admin no client a partir de dado não-confiável — o escopo visual é conveniência, a autoridade é o backend (Princípio V); (c) tentação de compor "pessoa + vínculos" num endpoint novo do serviço — composição é papel do BFF (Princípio I + [ADR-0010](../../adr/0010-bff-orchestration-fn-naming.md)).

## Assumptions

- Autenticação web (login Authentik, sessão por cookie HttpOnly no BFF Elysia, roles no claim `groups`) já entregue por feature anterior; esta feature apenas consome a sessão.
- O contrato do `people-context` descrito em [spec.md](./spec.md) está implantado e estável; divergências são tratadas como bloqueio em [api-readiness.fe.md](./api-readiness.fe.md), não contornadas no front.
- Shell de aplicação, tokens e átomos base vêm do conjunto `001-social-care-web` ([design-tokens.fe.md](./design-tokens.fe.md) daquela feature); esta feature cataloga apenas componentes novos.
- Perfis de uso: equipe pequena (< 20 usuárias simultâneas), desktop-first com responsividade básica para tablet.
- Vocabulário PT-BR segue a tabela canônica do serviço (pessoa, identidade, documento, vínculo de sistema, papel, provisão de login, recuperação de senha, desativação temporária, apagamento total).
- A entrega da credencial inicial (quando `initialPassword` é definida pela operadora) é processo offline da associação; a UI não exibe nem reenvia senhas.

## Out of Scope

- Jornadas do prontuário socioassistencial (`social-care`) — conjunto `001-social-care-web`.
- Administração do Authentik (grupos, flows, blueprints) e composição/envio do e-mail de recuperação (queue-manager).
- Dashboards/relatórios sobre pessoas e vínculos (`analysis-bi`).
- Self-service da própria pessoa (editar o próprio perfil, trocar a própria senha pela UI da plataforma).
- Auditoria visual das mudanças de pessoa (o serviço não expõe audit trail HTTP; a trilha vive nos eventos NATS).
- Modo offline/PWA e suporte mobile nativo.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — lei máxima do projeto
- [ADR-0001 — Arquitetura Vertical-Modular](../../adr/0001-vertical-modular-architecture.md)
- [ADR-0002 — Errors as Values](../../adr/0002-errors-as-values.md)
- [ADR-0003 — Bun Supply-Chain](../../adr/0003-bun-supply-chain.md)
- [ADR-0004 — Client × Server Split (MVVM × DDD)](../../adr/0004-client-server-split-mvvm-ddd.md)
- [ADR-0005 — Auth/Session/Refresh](../../adr/0005-auth-session-refresh-decisions.md)
- [ADR-0007 — Design System vanilla-extract](../../adr/0007-design-system-vanilla-extract.md)
- [ADR-0009 — Framework-Agnostic Client (MVVM)](../../adr/0009-framework-agnostic-client.md)
- [ADR-0010 — BFF Elysia Orquestrador / fn naming](../../adr/0010-bff-orchestration-fn-naming.md)
- [ADR-0011 — No Mocks in Production](../../adr/0011-no-mocks-in-production.md)
- [Índice de ADRs](../../adr/README.md)
- [plan.fe.md — plano de implementação frontend](./plan.fe.md)
- [spec.md — especificação core-api](./spec.md)
- [api-readiness.fe.md — prontidão endpoint a endpoint](./api-readiness.fe.md)
- [domain.fe.md — agregados Person/SystemRole vistos pelo front](./domain.fe.md)
- [design-tokens.fe.md — tokens do design system](./design-tokens.fe.md)
- [design-atoms.fe.md](./design-atoms.fe.md) · [design-molecules.fe.md](./design-molecules.fe.md) · [design-organisms.fe.md](./design-organisms.fe.md) · [design-pages.fe.md](./design-pages.fe.md) · [design-governance.fe.md](./design-governance.fe.md)
- [Docs offline: framework/solidstart](../../reference/framework/solidstart/)
- [Docs offline: framework/elysia](../../reference/framework/elysia/)
- [Docs offline: ui/vanilla-extract](../../reference/ui/vanilla-extract/)
