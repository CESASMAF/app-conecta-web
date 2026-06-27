# Feature Specification: Fundação — Acesso autenticado

**Feature Branch**: `001-foundation`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Acesso autenticado seguro: login via o IdP da organização, rotas protegidas e um shell de aplicação autenticado como a primeira fatia utilizável"

> **Nota de escopo (spec-kit):** este spec descreve **o que** o usuário vivencia e **por que** —
> sem tecnologia. O esqueleto técnico que sustenta isto (runtime, framework, BFF, design system,
> testes de arquitetura) é decisão de **implementação** e entra no `/speckit-plan`, governado pela
> [constituição](../../.specify/memory/constitution.md). A primeira fatia é deliberadamente a de
> **acesso**, porque toda tela de produto depende dela.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar com a conta da organização (Priority: P1)

Uma colaboradora autorizada da associação abre a aplicação, é levada a se autenticar pela conta
única da organização e, ao concluir, chega à área autenticada da aplicação — sem nunca digitar uma
senha específica deste sistema e sem ver detalhes técnicos.

**Why this priority**: É o MVP. Sem entrar, nada mais existe; toda funcionalidade futura (cadastro
de pessoas, indicadores, atendimento) vive atrás deste portão. É também o controle de segurança e
LGPD central — só quem é da organização acessa dados sensíveis de pacientes raros.

**Independent Test**: Com uma conta válida no provedor de identidade da organização, iniciar o
acesso, completar a autenticação e verificar que a área autenticada aparece e identifica "quem está
logado" — entregue de ponta a ponta, sem nenhuma outra tela de produto existir.

**Acceptance Scenarios**:

1. **Given** um usuário não autenticado, **When** ele inicia o acesso e conclui a autenticação na
   conta da organização, **Then** ele chega ao shell autenticado e o sistema mostra que há alguém
   logado (identidade mínima).
2. **Given** credenciais inválidas ou acesso negado no provedor, **When** a autenticação falha,
   **Then** o usuário vê uma mensagem **genérica** (sem revelar se o usuário existe) e permanece fora
   da área autenticada.

---

### User Story 2 - Áreas protegidas exigem autenticação (Priority: P2)

Quem não está autenticado não consegue abrir nenhuma área protegida; ao tentar, é levado ao acesso e,
após autenticar, retorna **exatamente para onde queria ir**.

**Why this priority**: Garante a fronteira de segurança (nada de dado sensível vazar para sessão
anônima) e a boa experiência de deep-link. Independente da US1 no teste, mas complementar.

**Independent Test**: Sem sessão, abrir o link de uma área protegida; verificar o redirecionamento
para o acesso; após autenticar, verificar que aterrissou na área originalmente pedida (e não num
destino externo forjado).

**Acceptance Scenarios**:

1. **Given** um usuário sem sessão, **When** ele tenta abrir uma área protegida, **Then** é
   redirecionado para o acesso, preservando o destino pretendido.
2. **Given** um destino pretendido apontando para fora da aplicação (tentativa de open-redirect),
   **When** o usuário autentica, **Then** o sistema descarta o destino externo e cai num destino
   seguro padrão.

---

### User Story 3 - Sair com segurança (Priority: P2)

Uma usuária encerra a sessão e tem certeza de que ninguém continua com o acesso dela naquele
dispositivo.

**Why this priority**: Fecha o ciclo de sessão; requisito de segurança/LGPD (dispositivo
compartilhado). Independentemente testável.

**Independent Test**: Autenticar, sair, e verificar que qualquer tentativa subsequente de acessar a
área protegida com a sessão anterior é barrada (exige novo login).

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** ele sai, **Then** a sessão é encerrada e ele volta ao
   acesso.
2. **Given** uma sessão recém-encerrada, **When** se tenta reutilizá-la, **Then** o acesso
   autenticado é negado.

---

### User Story 4 - Permanecer logado sem relogin constante (Priority: P3)

Durante o uso normal, a sessão se mantém de forma transparente; o usuário não é expulso no meio de
uma tarefa. Quando a sessão realmente expira (tempo/inatividade) ou é invalidada, ele é levado a
reautenticar de forma clara.

**Why this priority**: Qualidade de experiência e robustez; depende das anteriores. Não é MVP, mas
evita fricção que mina a adoção.

**Independent Test**: Manter uma sessão ativa além do tempo de vida do acesso de curta duração e
verificar que o usuário segue usando sem interrupção visível; depois, exceder o limite de
expiração/inatividade e verificar o pedido de reautenticação.

**Acceptance Scenarios**:

1. **Given** uma sessão válida cujo acesso de curta duração venceu, **When** o usuário continua
   navegando, **Then** ele segue autenticado sem perceber renovação nem ver tokens.
2. **Given** uma sessão expirada/invalidada, **When** o usuário age, **Then** ele é levado a
   reautenticar (sem perda silenciosa de contexto).

### Edge Cases

- **Provedor de identidade indisponível** no momento do login/renovação → mensagem clara de "falha de
  comunicação com o provedor — tente novamente", sem expor detalhes; o usuário não fica num estado
  ambíguo.
- **Sessão invalidada por detecção de reuso** (sinal de credencial comprometida) → encerra a sessão
  local e força reautenticação (fail-safe), sem loop.
- **Várias abas/janelas** da mesma sessão → comportam-se de forma consistente; renovação concorrente
  não derruba a sessão.
- **Navegador fechado** com sessão efêmera (sem "lembrar dispositivo") → a sessão termina.
- **Tentativa de forjar destino de retorno** (`?redirect=` externo ou malformado) → descartada.
- **Idioma** → mensagens em PT-BR (acentuação correta); textos finais de UI pendentes da P.O.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST autenticar usuários **exclusivamente** pela conta única da organização
  (provedor de identidade central) — sem senha local própria deste sistema.
- **FR-002**: O navegador/cliente MUST **nunca** receber nem armazenar tokens de identidade, tokens de
  renovação, segredos ou endereços dos serviços de backend.
- **FR-003**: Após autenticação bem-sucedida, o sistema MUST estabelecer uma sessão do lado servidor,
  representada ao navegador **apenas** por um identificador opaco em cookie seguro (não legível por
  script, restrito ao site).
- **FR-004**: Requisições não autenticadas a áreas protegidas MUST ser redirecionadas ao acesso,
  **preservando** o destino originalmente pretendido, **saneado** contra redirecionamento externo.
- **FR-005**: O sistema MUST manter o usuário autenticado de forma **transparente** enquanto a sessão
  for válida (renovação silenciosa), sem jamais expor tokens ao cliente.
- **FR-006**: Usuários MUST poder **sair**, encerrando a sessão de modo que o acesso autenticado
  anterior deixe de funcionar.
- **FR-007**: Após o login, o sistema MUST apresentar um **shell de aplicação autenticado** (área de
  navegação + área de conteúdo) que exibe **somente** o que o usuário tem permissão de ver.
- **FR-008**: O sistema MUST expor apenas a **identidade mínima** necessária para renderizar "quem
  está logado" (sem perfil rico); papéis/permissões vêm da própria conta da organização e controlam
  **apenas exibição** — a autorização real é responsabilidade dos serviços de backend.
- **FR-009**: Mensagens de autenticação/erro MUST ser **genéricas** (anti-enumeração de usuários) e
  apresentadas no idioma do usuário (PT-BR).
- **FR-010**: PII de paciente (ex.: dados de saúde, CPF) MUST **nunca** ser exigida ou exposta durante
  o fluxo de acesso (minimização LGPD); o fluxo de acesso não lida com dados clínicos.
- **FR-011**: O comportamento de sessão MUST ter um padrão **efêmero** (encerra ao fechar o
  navegador); persistência ("lembrar este dispositivo") é **opt-in** e limitada a um tempo de vida
  absoluto.

### Key Entities *(include if feature involves data)*

- **Sessão (server-side)**: o contexto autenticado de um usuário; tem ciclo de vida (criada,
  renovada, expirada, revogada); ao navegador aparece só como um identificador **opaco**. A autoridade
  sobre expiração/revogação é do provedor de identidade.
- **Usuário autenticado (mínimo)**: referência de identidade (quem é) + conjunto de papéis/permissões
  vindos da conta da organização, usados só para decidir o que mostrar.
- **Shell da aplicação**: a moldura autenticada (navegação + área de conteúdo) onde o usuário
  aterrissa e na qual as telas de produto futuras serão montadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário com conta válida consegue, a partir da aplicação, autenticar e chegar ao
  shell autenticado em **menos de 30 segundos** e **sem digitar senha específica deste sistema**.
- **SC-002**: **100%** das tentativas de abrir uma área protegida sem sessão são redirecionadas ao
  acesso e, após autenticar, aterrissam **no destino originalmente pretendido** (quando interno).
- **SC-003**: Após sair, **0%** das tentativas subsequentes com a sessão anterior alcançam conteúdo
  autenticado.
- **SC-004**: **Nenhum** token de identidade/renovação, "Bearer", endereço de backend ou segredo
  aparece no conteúdo entregue ao navegador (HTML, JS, armazenamento local) — verificável por
  inspeção. *(gate de segurança)*
- **SC-005**: Durante uso contínuo, o usuário **não** é forçado a reautenticar antes do limite
  configurado de expiração/inatividade; renovações intermediárias são **invisíveis**.
- **SC-006**: **Nenhuma** PII de paciente aparece no fluxo de acesso, em logs ou no estado do cliente.
- **SC-007**: 100% das mensagens de falha de credencial são **genéricas** (não revelam existência de
  usuário) e em PT-BR.

## Assumptions

- **Dependência — Provedor de identidade**: existe e está acessível o IdP único da organização
  (Authentik no deploy ACDG-BV); um cliente OIDC para esta aplicação está registrado. O fluxo, os
  tempos de token e a revogação são autoridade do IdP.
- **Esta é a fatia-fundação (walking skeleton)**: estabelece o acesso + o shell sobre os quais as
  próximas features (módulos de pessoas, indicadores, atendimento) serão construídas; **essas telas de
  produto estão fora de escopo aqui**.
- **Aterrissagem inicial**: o shell autenticado nasce **quase vazio** (navegação + área de conteúdo
  placeholder); o conteúdo real chega nas features seguintes.
- **Persistência de sessão**: padrão **efêmero**; "lembrar este dispositivo" é opt-in (decisão de
  produto sobre o tempo absoluto fica para refino).
- **Papéis/permissões**: derivam do claim de grupos do token da organização; o mapeamento
  papel→capacidade por tela é refinado nas features que usarem cada capacidade.
- **Textos de UI**: PT-BR; redação final das mensagens é da P.O. (placeholders aceitáveis no MVP).

## Dependencies

- IdP da organização (Authentik) — registro do cliente OIDC e disponibilidade.
- Governança e princípios em [constituição web_02 v1.0.0](../../.specify/memory/constitution.md)
  (esp. Princípio I — *BFF-Orchestrated Boundary* — e as restrições de Segurança/LGPD).
- Decisões de segurança de auth detalhadas serão referenciadas no plano
  (ver `handbook/adr/0005-auth-session-refresh-decisions.md` e `0006-security-headers-csp.md` ao planejar).
