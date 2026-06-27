# Feature Specification: Navegação de pacientes (leitura) + catálogos de domínio

**Feature Branch**: `002-patient-browse`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "Primeiro incremento vertical sobre o serviço social-care (guia `handbook/doc/social-care/requesitos/05-fluxo-frontend.md`, seção 7, item 1): após autenticar (feature 001), o profissional navega os pacientes da associação — lista com busca, filtro por situação e rolagem infinita por cursor — e a aplicação carrega/cacheia os catálogos de domínio que alimentarão os formulários futuros. Somente leitura."

## User Scenarios & Testing *(mandatory)*

Atores: **profissional autenticado** com papel `worker`, `owner` ou `admin` (papéis vêm da sessão; `superadmin` ignora guards). Um usuário autenticado **sem** papel autorizado não acessa dados de paciente.

Critérios de aceite externos (fonte de verdade, já escritos como Gherkin): `handbook/doc/social-care/requesitos/01-casos-registry.md` (REG-010…REG-014) e `04-casos-lookup-rbac.md` (LKP-T001, LKP-T002, matriz RBAC). Cada cenário desta spec rastreia para esses IDs.

### User Story 1 - Percorrer a lista de pacientes (Priority: P1)

Um profissional autenticado abre a área de pacientes e vê a lista dos pacientes da associação. Cada item mostra o nome completo, o diagnóstico principal, quantos membros há na família e a situação atual. Ao chegar ao fim da lista, mais pacientes são carregados automaticamente, até não haver mais.

**Why this priority**: É o MVP deste incremento. É a primeira tela que mostra dado real do domínio e prova, ponta a ponta, que a sessão autentica o acesso, que o profissional enxerga quem está cadastrado e que a paginação funciona. Sem a lista, nada do fluxo de atendimento começa.

**Independent Test**: Com uma sessão válida e pacientes cadastrados no ambiente de DEV, abrir a área de pacientes e verificar que a lista aparece com os campos esperados por item e que a rolagem carrega as páginas seguintes e encerra corretamente. (REG-010, REG-011)

**Acceptance Scenarios**:

1. **Given** existem 25 pacientes e o profissional está autenticado, **When** ele abre a lista de pacientes, **Then** vê no máximo 20 pacientes na primeira página, com indicação de que há mais.
2. **Given** ele está vendo a primeira página, **When** rola até o fim, **Then** os 5 pacientes restantes são carregados e a lista para de pedir mais (não há próxima página).
3. **Given** um paciente na lista, **When** o item é exibido, **Then** mostra nome completo, diagnóstico principal, número de membros da família e situação.
4. **Given** a associação não tem nenhum paciente (ou nenhum corresponde ao recorte atual), **When** a lista carrega, **Then** um estado vazio dedicado é exibido — não uma lista em branco ambígua nem erro.

---

### User Story 2 - Buscar e filtrar pacientes (Priority: P2)

O profissional refina a lista buscando por nome e/ou filtrando por situação (em atendimento, desligado, retirado, em fila, admitido). Os dois recortes combinam, e a lista recomeça do início a cada mudança de recorte.

**Why this priority**: Com volume real de pacientes, percorrer tudo é inviável; busca e filtro tornam a lista utilizável no dia a dia. Depende da US1 (refina a mesma lista), por isso P2.

**Independent Test**: Buscar por um nome e verificar que só pacientes com aquele nome aparecem; aplicar um filtro de situação e verificar que só pacientes naquela situação aparecem; combinar os dois. (REG-013)

**Acceptance Scenarios**:

1. **Given** pacientes com nomes variados, **When** o profissional busca por "Maria", **Then** só aparecem pacientes cujo nome contém "Maria".
2. **Given** pacientes em situações variadas, **When** ele filtra por "em atendimento", **Then** só aparecem pacientes nessa situação.
3. **Given** uma busca e um filtro aplicados, **When** ele altera um deles, **Then** a lista reinicia da primeira página com o novo recorte (sem misturar resultados antigos).
4. **Given** um recorte sem correspondências, **When** a busca executa, **Then** o estado vazio é exibido com o recorte preservado para ajuste.

---

### User Story 3 - Abrir um paciente (Priority: P2)

A partir da lista, o profissional abre um paciente para ver seu registro. Nesta feature o destino é um espaço reservado (o prontuário completo é a próxima feature); o que se valida aqui é a navegação e o tratamento de um paciente que não existe.

**Why this priority**: Conecta a lista ao próximo passo da jornada e fecha o tratamento de "recurso inexistente" de forma graciosa. Depende da US1.

**Independent Test**: Abrir um paciente da lista e verificar a navegação ao destino reservado; tentar abrir um paciente inexistente e verificar o retorno à lista com aviso. (REG-014)

**Acceptance Scenarios**:

1. **Given** um paciente na lista, **When** o profissional o abre, **Then** navega ao registro do paciente (espaço reservado nesta feature).
2. **Given** um identificador de paciente que não existe, **When** o profissional tenta abri-lo, **Then** é levado de volta à lista com um aviso claro de "paciente não encontrado" (não um erro técnico).

---

### User Story 4 - Catálogos de domínio prontos para os formulários (Priority: P3)

Após o login, a aplicação carrega e mantém em cache (pelo tempo da sessão) os catálogos de domínio que, nas próximas features, alimentarão todos os campos de seleção (parentesco, escolaridade, tipos de benefício, violação etc.). Só itens ativos entram, ordenados por código; nada de opção fixa no app.

**Why this priority**: Infraestrutura de dados de referência. Não tem tela própria nesta feature, mas estabelece e valida cedo o padrão de carregamento/cache/envelope que as features de escrita vão exigir. P3 por não ser diretamente visível ao usuário agora.

**Independent Test**: Após autenticar, verificar que um catálogo permitido pode ser obtido com apenas itens ativos ordenados por código, que um segundo pedido na mesma sessão não recarrega da origem (cache), e que pedir um catálogo fora da lista permitida resulta em erro tratado. (LKP-T001, LKP-T002)

**Acceptance Scenarios**:

1. **Given** um profissional autenticado, **When** um catálogo permitido (ex.: parentesco) é obtido, **Then** vêm apenas itens ativos, cada um com identificador, código e descrição, ordenados por código.
2. **Given** um catálogo já obtido nesta sessão, **When** ele é pedido de novo, **Then** é servido do cache, sem novo carregamento da origem.
3. **Given** um nome de catálogo fora da lista de catálogos permitidos, **When** ele é pedido, **Then** o resultado é um erro tratado, sem expor detalhe técnico ao usuário.

---

### Edge Cases

- **Sem papel autorizado**: usuário autenticado mas sem `worker`/`owner`/`admin` recebe uma negação clara ("sem permissão") em vez de dados ou tela quebrada — o backend é a autoridade. (matriz RBAC, arquivo 04)
- **Sessão expira durante a navegação**: a ação é tentada novamente uma vez após renovar a sessão; não sendo possível, o profissional volta ao login preservando o destino pretendido.
- **Tamanho de página inválido**: pedir página fora da faixa permitida (1–100) é rejeitado como entrada inválida, sem quebrar a tela. (REG-012)
- **Cursor inválido/expirado**: a paginação degrada graciosamente (recomeça a lista) em vez de travar.
- **Dependência de dados temporariamente fora**: o estado da tela (busca, filtro, posição) é preservado e há um "tentar novamente". (seção 6 do arquivo 05)
- **Erro interno inesperado**: mensagem genérica com referência de correlação para suporte; nenhum detalhe interno vaza ao usuário.
- **Lista muda em outra sessão durante a rolagem**: a navegação não duplica nem perde itens de forma visível ao usuário (a paginação por cursor é estável o suficiente para a jornada).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir, a um profissional autenticado com papel autorizado, a lista de pacientes da associação, mostrando por item: nome completo, diagnóstico principal, número de membros da família e situação.
- **FR-002**: A lista MUST paginar por cursor com rolagem infinita — página inicial de 20 itens por padrão, carregando a próxima ao alcançar o fim enquanto houver mais — e MUST encerrar quando não houver mais resultados, sem duplicar itens.
- **FR-003**: O sistema MUST aceitar tamanho de página entre 1 e 100 e MUST rejeitar valores fora dessa faixa como entrada inválida, sem quebrar a tela.
- **FR-004**: O sistema MUST permitir buscar pacientes por nome e filtrar por situação (`ACTIVE`, `DISCHARGED`, `WITHDRAWN`, `WAITLISTED`, `ADMITTED`), combináveis, reiniciando a paginação a cada alteração de recorte.
- **FR-005**: O sistema MUST exibir um estado vazio dedicado quando a lista — com ou sem recorte — não retornar pacientes, preservando o recorte aplicado.
- **FR-006**: Ao abrir um paciente, o sistema MUST navegar ao seu registro (espaço reservado nesta feature); se o paciente não existir, MUST retornar à lista com aviso de "não encontrado", nunca um erro cru.
- **FR-007**: Após o login, o sistema MUST disponibilizar os catálogos de domínio permitidos para os formulários, expondo somente itens ativos, ordenados por código (identificador, código, descrição), e MUST evitar recarregá-los mais de uma vez por sessão (cache com validade de sessão).
- **FR-008**: O sistema MUST obter toda opção de seleção dos catálogos carregados; é PROIBIDO embutir (hardcode) opções de domínio no aplicativo.
- **FR-009**: Pedir um catálogo fora da lista de catálogos permitidos MUST resultar em erro tratado, sem expor detalhe técnico ao usuário.
- **FR-010**: Todo acesso a dados MUST ocorrer em nome da identidade autenticada da sessão, sem que o navegador veja token, URL de serviço de backend ou qualquer segredo.
- **FR-011**: Um usuário autenticado SEM papel autorizado MUST receber uma negação clara ("sem permissão") em vez de dados ou de uma falha técnica; a autoridade final de autorização é o backend.
- **FR-012**: A interface MUST esconder ou desabilitar ações que o papel do usuário não permite e, ainda assim, MUST tratar graciosamente uma negação de autorização vinda do backend.
- **FR-013**: Diante de sessão expirada durante a navegação, o sistema MUST tentar renovar a sessão e repetir a ação uma vez; não obtendo sucesso, MUST levar o usuário ao login preservando o destino pretendido.
- **FR-014**: Diante de indisponibilidade temporária de uma dependência de dados, o sistema MUST preservar o estado da tela (busca, filtro, posição) e oferecer "tentar novamente".
- **FR-015**: O sistema MUST garantir que nenhuma informação pessoal de paciente apareça em logs (LGPD).
- **FR-016**: O sistema MUST refletir a situação e os dados de cada paciente exatamente como vêm da fonte de verdade, sem inventar, derivar ou completar dados no cliente (sem dado fabricado).

### Key Entities *(include if feature involves data)*

- **Resumo de paciente**: o que aparece em cada linha da lista — identificador, nome completo, diagnóstico principal, contagem de membros da família e situação.
- **Situação do paciente**: um de `ACTIVE`, `DISCHARGED`, `WITHDRAWN`, `WAITLISTED`, `ADMITTED`.
- **Página de resultados**: a fatia atual de resumos mais os metadados de paginação — tamanho da página, total de itens, indicador de "há mais" e referência da próxima página (cursor).
- **Recorte de busca**: termo de nome e/ou situação selecionada que define o subconjunto exibido.
- **Catálogo de domínio**: um dos catálogos permitidos; contém itens ativos `{ identificador, código, descrição }` ordenados por código.
- **Identidade do profissional**: derivada da sessão (papéis `worker`/`owner`/`admin`/`superadmin`); determina visibilidade de ações e acesso aos dados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir de uma sessão recém-iniciada, um profissional consegue ver a lista de pacientes e abrir o registro de um paciente específico em no máximo 3 ações.
- **SC-002**: A rolagem infinita carrega as páginas seguintes sem recarga perceptível da tela e encerra corretamente ao fim — sem itens duplicados e sem ficar pedindo mais indefinidamente.
- **SC-003**: Buscar por um nome retorna somente pacientes cujo nome contém o termo; filtrar por situação retorna somente pacientes naquela situação; e os dois recortes combinam corretamente.
- **SC-004**: 100% das opções de seleção disponíveis no aplicativo originam-se dos catálogos carregados — nenhuma opção fixa embutida no código (auditável).
- **SC-005**: Um usuário sem papel autorizado nunca vê dados de paciente; em vez disso recebe uma mensagem de "sem permissão", sem erro técnico nem tela quebrada.
- **SC-006**: Nenhum token, URL de backend, segredo ou informação pessoal de paciente aparece no conteúdo entregue ao navegador ou nos logs (verificável por inspeção).
- **SC-007**: Diante de expiração de sessão durante a navegação, o profissional não perde o recorte de busca/filtro: ou a ação é repetida automaticamente, ou ele retorna ao mesmo ponto após reautenticar.

## Assumptions

- A **feature 001** (login OIDC + shell autenticado + ciclo de sessão) está concluída e fornece a identidade autenticada, os papéis e a moldura de navegação.
- O serviço **social-care** expõe a lista de pacientes (resumos + paginação por cursor) e os catálogos de domínio conforme os critérios Gherkin dos arquivos `01` e `04`; a validação de aceite roda contra esse serviço em ambiente de DEV.
- O **prontuário completo** (conteúdo ao abrir um paciente) é a **feature 003**; nesta feature o destino é um espaço reservado.
- Esta feature é **somente leitura**: nenhum cadastro, edição, transição de ciclo de vida, atendimento, avaliação, proteção ou administração de catálogos.
- O deploy é **single-tenant** (associação de Boa Vista isolada); todos os pacientes pertencem à mesma associação, e a lista não precisa segmentar por organização.
- O momento de carregar os catálogos (logo após o login ou na primeira necessidade) é decisão de implementação; o requisito é apenas que estejam disponíveis e cacheados por sessão (FR-007).

## Dependencies

- **Feature 001** — sessão autenticada, papéis e shell.
- **Serviço social-care** — lista de pacientes e catálogos de domínio disponíveis em DEV para o aceite (os cenários Gherkin `01`/`04` passando contra o serviço encerram o incremento).
- **people-context** (indireto) — origem das identidades; sua indisponibilidade aparece como erro tratável nas features de escrita; nesta feature, apenas leitura, sem dependência direta no caminho feliz.
