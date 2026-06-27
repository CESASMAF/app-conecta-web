# Feature Specification: Área do Assistente Social (telas) — navegação por papel, busca, cadastro e prontuário

**Feature Branch**: `004-social-care-area`

**Created**: 2026-06-26

**Status**: Draft (planejamento de telas — para revisão antes de construir)

**Input**: Sessão de design conduzida com o Tech Lead (2026-06-26). Decisões travadas: **app único com navegação por papel**; começar pela **área do Assistente Social**; **mobile-first** (uso misto escritório+campo); o **paciente é um ativo criado só pelo assistente social** (o RH cuida dos operadores); equipe de perfil indefinido → telas **guiadas/à prova de erro**. Layout escolhido por mock-up: **home busca-primeiro**, **prontuário em abas**, **cadastro em wizard enxuto**, **família/identidade dentro do Resumo**.

## User Scenarios & Testing *(mandatory)*

Ator: **assistente social** — profissional autenticado com papel `worker` (a 001 fornece sessão/papéis; o `superadmin` ignora guards). Esta feature é a **camada de telas** que consome o server-side já construído (lista de pacientes, `overview` composto, cadastro, ciclo de vida, avaliações, atendimentos, proteção, auditoria). O **design não é o foco** — o foco é o fluxo: entrar → encontrar/cadastrar paciente → trabalhar no prontuário, com performance, estabilidade e segurança.

Esta área é o primeiro dos **3 mundos** do app (Assistente Social · Admin/RH · Donos), cada um alinhado a um serviço. O **shell de navegação por papel** nasce aqui e será reusado pelos outros dois.

### User Story 1 - Entrar, encontrar um paciente e abrir o prontuário (Priority: P1) 🎯 MVP

O assistente social autentica e cai na **sua** área. Vê uma busca de pacientes em primeiro plano; digita um nome (ou rola a lista), reconhece a situação de cada um, e abre o paciente. O prontuário abre no **Resumo**: quem é, situação atual, núcleo familiar e identidade social — tudo numa visão só, pronta.

**Why this priority**: É o MVP e o esqueleto do app inteiro — a **navegação por papel** (que os 3 perfis reusam), a home de busca e o prontuário-Resumo. Entrega "entrar → buscar → ver o paciente" usando **só o que já existe no server-side** (lista + `overview`), provando a fundação visual com risco baixo. Sem essa base, nenhuma outra tela existe.

**Independent Test**: Com sessão de `worker` e pacientes no ambiente, abrir o app → ver a área de Pacientes → buscar por nome → abrir um paciente → ver o Resumo com situação, família e identidade. Abrir um paciente inexistente → aviso claro, volta à lista.

**Acceptance Scenarios**:
1. **Given** um assistente social autenticado, **When** ele entra no app, **Then** vê a **área de Pacientes** com a busca em primeiro plano e a lista logo abaixo (cada item: nome + situação).
2. **Given** a lista, **When** ele busca por um nome, **Then** só pacientes correspondentes aparecem; ao chegar ao fim, mais são carregados (rolagem infinita).
3. **Given** um paciente na lista, **When** ele o abre, **Then** o prontuário abre na aba **Resumo** mostrando nome, **situação com rótulo**, **núcleo familiar** (com parentesco) e **identidade social** — sem precisar de outra tela/clique.
4. **Given** um identificador inexistente, **When** ele tenta abrir, **Then** volta à lista com aviso de "não encontrado", nunca erro técnico.
5. **Given** que ele tem só o papel de assistente social, **When** navega, **Then** vê apenas a área de Pacientes (as áreas de RH e Donos não aparecem para ele).

---

### User Story 2 - Cadastrar um novo paciente (Priority: P1)

Pela home, o assistente social inicia um cadastro. Um **wizard enxuto** o conduz: **(1) Identificação** da pessoa (nome, CPF, nascimento, nome da mãe, sexo) e **(2) Diagnóstico inicial + responsável** (CID, data, descrição, parentesco). Ao concluir, o paciente é criado **em fila de espera** e abre direto no prontuário. Documentos, endereço e o restante completam-se depois, no próprio prontuário.

**Why this priority**: Sem cadastrar, a operação não começa. É P1 junto da US1 (as duas atividades mais frequentes). O wizard guiado é à prova de erro (combina com equipe de perfil indefinido) e mobile-first.

**Independent Test**: Iniciar "Novo paciente" → preencher os 2 passos → concluir → ver o paciente criado em fila de espera, aberto no prontuário, e constando na lista. Tentar avançar com campo obrigatório vazio → o passo aponta o erro sem deixar avançar.

**Acceptance Scenarios**:
1. **Given** a home, **When** ele toca "Novo paciente", **Then** entra no wizard no passo 1 (Identificação).
2. **Given** um passo com campo obrigatório vazio/inválido (ex.: nascimento futuro, CPF inválido), **When** ele tenta avançar, **Then** o passo aponta o campo e **não avança**.
3. **Given** os 2 passos preenchidos, **When** ele conclui, **Then** o paciente é criado **em fila de espera** e o prontuário abre nele.
4. **Given** que a pessoa por trás do paciente ainda não existe no sistema, **When** o cadastro conclui, **Then** o sistema **cria a identidade nos bastidores** (sem o assistente social passar pelo RH) e vincula ao paciente.
5. **Given** uma falha na criação (ex.: documento já registrado, dependência fora), **When** ele conclui, **Then** vê um aviso claro do problema e o que preencheu é preservado.

---

### User Story 3 - Conduzir o paciente pelo Resumo (Priority: P2)

No Resumo, o assistente social executa a **ação cabível à situação** (admitir da fila, dar alta, readmitir, retirar da fila) e mantém o **núcleo familiar** (adicionar/remover membro, definir cuidador principal) e a **identidade social**.

**Why this priority**: É o que torna o prontuário vivo — mover o paciente pela jornada de cuidado e manter o contexto familiar. Depende da US1 (Resumo) e usa o ciclo de vida/família/identidade já prontos no server-side.

**Independent Test**: Sobre um paciente em fila, admitir → situação vira "em atendimento" e a ação some; adicionar um membro → consta na família; definir cuidador principal; atualizar identidade social.

**Acceptance Scenarios**:
1. **Given** um paciente em fila, **When** ele toca "Admitir", **Then** a situação passa a "em atendimento" e só a próxima ação cabível é oferecida.
2. **Given** uma alta com motivo "outro", **When** ele não informa as observações, **Then** a tela as exige antes de confirmar.
3. **Given** o Resumo, **When** ele adiciona/remove um membro ou define o cuidador principal, **Then** o núcleo familiar reflete a mudança imediatamente (sem recarregar a tela inteira).
4. **Given** uma tentativa de ação inválida para a situação, **When** o backend recusa, **Then** o aviso é tratado graciosamente.

---

### User Story 4 - Avaliação social (Priority: P2)

Na aba **Avaliação**, o assistente social preenche/atualiza as **7 seções** (moradia, socioeconômico, trabalho/renda, educação, saúde, rede de apoio, resumo social-sanitário). Cada seção indica se está preenchida e abre para edição.

**Why this priority**: É o corpo do acompanhamento social, mas vem depois do esqueleto e do cadastro. Usa os 7 PUTs já prontos no server-side; os campos de seleção vêm dos catálogos de domínio.

**Independent Test**: Abrir a aba Avaliação → ver as 7 seções com status → editar "moradia" → salvar → a seção marca como preenchida. Submeter com campo inválido → barra no cliente sem ir ao backend.

**Acceptance Scenarios**:
1. **Given** a aba Avaliação, **When** ela carrega, **Then** mostra as 7 seções e quais já têm dados.
2. **Given** uma seção, **When** ele a edita e salva com dados válidos, **Then** é persistida e a seção marca "preenchida".
3. **Given** opções de seleção (ex.: material da parede, escolaridade), **When** o formulário aparece, **Then** as opções vêm dos catálogos — nada fixo no app.
4. **Given** o paciente não está ativo, **When** ele tenta salvar uma avaliação, **Then** o aviso de situação incompatível é tratado.

---

### User Story 5 - Cuidado clínico, proteção e histórico (Priority: P3)

Abas **Atendimentos** (registrar atendimento, informações de ingresso), **Proteção** (histórico de acolhimento, violações, encaminhamentos) e **Histórico** (trilha de auditoria do paciente).

**Why this priority**: Completa o prontuário. Cada aba consome endpoints já prontos. P3 por ser o complemento do acompanhamento.

**Independent Test**: Registrar um atendimento (com narrativa) → consta na lista; reportar uma violação → consta; abrir o Histórico → ver a trilha de eventos.

**Acceptance Scenarios**:
1. **Given** a aba Atendimentos, **When** ele registra um atendimento com resumo/plano, **Then** ele passa a constar; sem narrativa, a tela exige antes de enviar.
2. **Given** a aba Proteção, **When** ele cria um encaminhamento ou reporta uma violação, **Then** passa a constar.
3. **Given** a aba Histórico, **When** ela carrega, **Then** mostra a trilha de auditoria do paciente (eventos com data e tipo).

---

### Edge Cases

- **Papel sem acesso**: usuário autenticado sem `worker` não vê a área de Pacientes (recebe negação clara, não tela quebrada). O backend é a autoridade.
- **Sessão expira durante o uso**: a ação é repetida uma vez após renovar a sessão; não sendo possível, volta ao login preservando o que for viável (incl. rascunho do wizard).
- **Offline/conexão instável (campo)**: a tela informa indisponibilidade e oferece "tentar de novo", sem perder o que foi digitado.
- **Cadastro com pessoa já existente**: se a identidade já existe (mesmo CPF), o sistema reaproveita em vez de duplicar (conflito tratado).
- **Dependência fora** (people-context ao cadastrar): recusa graciosa, sem paciente órfão; o rascunho é preservado.
- **Submissão dupla / clique repetido**: ações de escrita ficam desabilitadas durante o envio.

## Requirements *(mandatory)*

- **FR-001**: O sistema MUST apresentar, ao entrar, a área correspondente ao **papel** do usuário; o assistente social (`worker`) vê a **área de Pacientes**. Áreas de outros papéis não aparecem para quem não as tem.
- **FR-002**: A home da área de Pacientes MUST priorizar a **busca**, com a lista paginada logo abaixo (nome + situação), reusando a navegação de pacientes existente.
- **FR-003**: O sistema MUST abrir o paciente num **prontuário com abas** (Resumo · Avaliação · Atendimentos · Proteção · Histórico); a aba inicial é o **Resumo**.
- **FR-004**: O **Resumo** MUST mostrar, numa visão só, situação (com rótulo), **ações de ciclo de vida cabíveis**, **núcleo familiar** (com parentesco) e **identidade social** — a partir da visão composta já entregue pelo servidor.
- **FR-005**: O sistema MUST permitir **cadastrar um paciente** por um **wizard enxuto** de 2 passos (Identificação; Diagnóstico + responsável), criando-o **em fila de espera** e abrindo o prontuário; o restante dos dados completa-se no prontuário.
- **FR-006**: No cadastro, o sistema MUST **criar a identidade da pessoa nos bastidores** (sem o assistente social passar pelo RH) e vinculá-la ao paciente, de forma orquestrada e segura (fail-secure; sem paciente órfão).
- **FR-007**: O sistema MUST validar cada passo do wizard **antes** de avançar/enviar (campos obrigatórios, formatos), apontando o campo com problema.
- **FR-008**: O Resumo MUST oferecer **apenas a transição de ciclo de vida cabível** à situação e MUST exigir motivo/observações quando aplicável, antes de confirmar.
- **FR-009**: O sistema MUST permitir gerir o **núcleo familiar** (adicionar/remover, cuidador principal) e a **identidade social** a partir do Resumo, refletindo o novo estado sem recarregar a tela inteira.
- **FR-010**: A aba **Avaliação** MUST listar as 7 seções com indicação de preenchimento e permitir editar/salvar cada uma, com as opções de seleção vindas dos **catálogos de domínio** (nada fixo).
- **FR-011**: As abas **Atendimentos**, **Proteção** e **Histórico** MUST permitir, respectivamente, registrar atendimento/ingresso, registrar acolhimento/violação/encaminhamento, e consultar a trilha de auditoria.
- **FR-012**: Toda escrita MUST ocorrer em nome da sessão, sem que o navegador veja token, URL de backend ou segredo; ações de escrita MUST impedir submissão duplicada.
- **FR-013**: O sistema MUST tratar graciosamente sessão expirada, dependência fora e negação de permissão, preservando o trabalho do usuário (incl. rascunho do wizard) quando viável.
- **FR-014**: As telas MUST ser **mobile-first** (uso em campo) e funcionar bem também no desktop (uso no escritório).
- **FR-015**: Nenhuma informação pessoal de paciente/membro MUST aparecer em logs (LGPD).

### Key Entities *(include if feature involves data)*

- **Área (por papel)**: o "mundo" que o usuário vê conforme seu papel — aqui, a **área de Pacientes** do assistente social.
- **Paciente (resumo de lista)**: nome, diagnóstico principal, nº de membros, situação.
- **Prontuário**: a visão completa do paciente, organizada em abas; a aba Resumo é a visão composta (situação + ações + família + identidade).
- **Wizard de cadastro**: sequência enxuta de passos que cria a pessoa (identidade) + o paciente.
- **Seção de avaliação**: uma das 7 áreas da avaliação social, com estado "preenchida/pendente".

## Success Criteria *(mandatory)*

- **SC-001**: A partir do login, o assistente social encontra e abre um paciente em no máximo 3 ações.
- **SC-002**: Cadastrar um paciente novo (caminho mínimo) leva no máximo os 2 passos do wizard; entrada inválida é barrada na própria tela antes de ir ao backend.
- **SC-003**: O prontuário abre mostrando situação, família e identidade **sem o usuário precisar de cliques extras** (vem pronto do servidor).
- **SC-004**: Para qualquer paciente, só a transição de ciclo de vida válida à situação é oferecida.
- **SC-005**: 100% das opções de seleção dos formulários vêm dos catálogos — nenhuma fixa no código.
- **SC-006**: Nenhum token, URL de backend, segredo ou PII de paciente aparece no que vai ao navegador ou em logs.
- **SC-007**: Um usuário sem o papel de assistente social não acessa a área de Pacientes.
- **SC-008**: As telas são usáveis em tela de celular (campo) e de desktop (escritório).

## Assumptions

- A **feature 001** fornece sessão/papéis e o **shell** (a navegação por papel evolui a partir dele). A **002** fornece a lista/busca de pacientes e o cache de catálogos. A **003** especifica a escrita de pacientes; o **server-side dos 3 serviços já está construído** (lista, `overview`, cadastro, ciclo de vida, avaliações, atendimentos, proteção, auditoria, domínios).
- O **paciente é criado só pelo assistente social**; o RH gere os **operadores** (feature futura). A identidade da pessoa-beneficiária é criada nos bastidores no cadastro.
- As áreas de **Admin/RH** e **Donos** são features futuras; esta entrega o shell que elas reusarão.
- Esta feature é **front (telas) + 1 ajuste de orquestração no server-side** (rota de cadastro que cria pessoa + paciente — ver `plan.md`/Dependencies). Nenhum outro endpoint novo de backend.

## Dependencies

- **Feature 001** — sessão, papéis, shell.
- **Feature 002** — lista/busca de pacientes, cache de catálogos.
- **Server-side completo (003 + sessão)** — os endpoints do BFF que as telas consomem.
- **Ajuste no server-side (incluído nesta feature)** — uma rota de **cadastro orquestrado** (cria a pessoa sem login no people-context → cria o paciente no social-care), pois o `POST /api/patients` atual espera um `personId` já existente.
