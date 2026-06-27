# Feature Specification: Cadastro, ciclo de vida, núcleo familiar e identidade social do paciente (escrita)

**Feature Branch**: `003-patient-manage`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "Segundo incremento vertical sobre o serviço social-care, agora de **escrita**: fechar o setor Pacientes. Após autenticar (001) e navegar a lista (002), o profissional **registra** um novo paciente, **conduz seu ciclo de vida** (admitir da fila, dar alta, readmitir, retirar da fila), **gere o núcleo familiar** (adicionar/remover membros, atribuir cuidador principal) e **atualiza a identidade social**. Cobre os 9 comandos de paciente do social-care. Os campos de seleção consomem os catálogos de domínio já cacheados pela 002. Design não importa; o que importa é ser performático, estável e seguro."

## User Scenarios & Testing *(mandatory)*

Atores: **profissional autenticado** com papel `worker`, `owner` ou `admin` (papéis vêm da sessão; `superadmin` ignora guards). O cadastro e a gestão de família/identidade exigem papel `worker`; as transições de ciclo de vida exigem `worker` **ou** `admin`. Um usuário autenticado **sem** papel autorizado não executa nenhuma escrita — o backend é a autoridade final.

Critérios de aceite externos (fonte de verdade): os casos Gherkin de cadastro/ciclo-de-vida/família do `social-care` (`handbook/doc/social-care/requesitos/*-casos-registry.md`) e a matriz RBAC (`04-casos-lookup-rbac.md`). Cada cenário desta spec rastreia para os códigos de erro estruturados do serviço (`REGP-xxx`, `ADM-xxx`, `DISC-xxx`, `READM-xxx`, `WDR-xxx`, `APP-xxx`, `RFM-xxx`, `APC-xxx`, `USIA-xxx`).

### User Story 1 - Registrar um novo paciente (Priority: P1)

Um profissional autenticado abre o cadastro, vincula uma pessoa já existente (identidade), informa o diagnóstico inicial e os dados do paciente (dados pessoais, documentos civis, endereço, identidade social, parentesco do responsável) e registra o paciente. O paciente nasce **em fila de espera** (`WAITLISTED`) e passa a aparecer na lista da 002.

**Why this priority**: É o MVP deste incremento e a primeira **escrita** do sistema — prova, ponta a ponta, que a sessão autoriza uma mutação, que o BFF injeta a identidade, que a validação acontece antes de tocar o backend e que o estado novo aparece na leitura. Sem cadastrar, não há o que gerir; todo o resto do setor depende de existir um paciente.

**Independent Test**: Com uma sessão válida e uma pessoa registrada, abrir o cadastro, preencher os campos obrigatórios e submeter; verificar que o paciente é criado (recebe identificador), entra em fila de espera e passa a constar na lista (002). Submeter com campos inválidos e verificar que a tela mostra o erro do campo **sem** criar nada. (REGP-001…REGP-031)

**Acceptance Scenarios**:

1. **Given** uma pessoa já registrada e um profissional `worker` autenticado, **When** ele preenche diagnóstico inicial + dados obrigatórios e submete, **Then** o paciente é criado, recebe um identificador e passa a constar na lista com situação "em fila de espera".
2. **Given** o formulário de cadastro, **When** o profissional deixa um campo obrigatório vazio ou inválido (ex.: data de nascimento futura, CPF inválido, diagnóstico sem descrição), **Then** a tela aponta o campo com problema e **nada é enviado/criado** até a correção.
3. **Given** uma pessoa cujo paciente já existe, **When** o profissional tenta cadastrá-la de novo, **Then** recebe um aviso claro de "paciente já registrado para esta pessoa" (conflito), sem duplicar.
4. **Given** que o serviço de identidades (people-context) está temporariamente indisponível, **When** o cadastro é submetido, **Then** a operação é recusada de forma graciosa ("não foi possível validar a pessoa agora, tente novamente") — fail-secure, sem criar paciente órfão.
5. **Given** todo campo de seleção do formulário (parentesco, tipo de identidade, localização da residência), **When** o formulário é exibido, **Then** suas opções vêm dos catálogos de domínio carregados (002), nunca de uma lista fixa no aplicativo.

---

### User Story 2 - Conduzir o ciclo de vida do paciente (Priority: P2)

A partir do registro de um paciente, o profissional executa a transição cabível à situação atual: **admitir** (da fila para em atendimento), **dar alta** (de em atendimento para desligado, com motivo), **readmitir** (de desligado para em atendimento) e **retirar da fila** (sair da fila de espera, com motivo). Apenas a transição válida para a situação corrente é oferecida.

**Why this priority**: É o que torna o cadastro útil no dia a dia — move o paciente pela jornada de cuidado. Depende de existir um paciente (US1), por isso P2. As transições têm pré-condições de estado e exigem papel `worker` ou `admin`.

**Independent Test**: Sobre um paciente em fila, admitir e verificar que passa a "em atendimento"; sobre um ativo, dar alta com motivo e verificar "desligado"; sobre um desligado, readmitir; sobre um em fila, retirar com motivo. Tentar uma transição inválida para a situação atual e verificar a recusa clara. (ADM-001…ADM-004, DISC-001…DISC-007, READM-001…READM-005, WDR-001…WDR-007)

**Acceptance Scenarios**:

1. **Given** um paciente em fila de espera, **When** o profissional o admite, **Then** a situação passa a "em atendimento" e a ação de admitir deixa de ser oferecida.
2. **Given** um paciente em atendimento, **When** o profissional dá alta informando um motivo válido (e observações quando o motivo for "outro"), **Then** a situação passa a "desligado".
3. **Given** um paciente desligado, **When** o profissional o readmite, **Then** a situação volta a "em atendimento".
4. **Given** um paciente em fila de espera, **When** o profissional o retira da fila informando o motivo, **Then** ele deixa a fila e a situação reflete a saída.
5. **Given** um paciente em atendimento, **When** o profissional tenta admiti-lo de novo (transição inválida), **Then** recebe um aviso claro ("paciente já em atendimento") e **nenhuma** mudança de estado ocorre.
6. **Given** que o motivo de alta é "outro", **When** as observações não são informadas, **Then** a tela exige as observações antes de permitir submeter.

---

### User Story 3 - Gerir o núcleo familiar (Priority: P3)

No registro do paciente, o profissional compõe e mantém o núcleo familiar: **adiciona** um membro (pessoa, parentesco, se reside junto, se é cuidador, se tem deficiência, documentos pendentes), **remove** um membro e **define o cuidador principal** entre os membros existentes.

**Why this priority**: Enriquece o registro com o contexto familiar exigido pelo acompanhamento social, mas não bloqueia o fluxo de cuidado. Depende de existir um paciente **ativo/registrado** (US1), por isso P3.

**Independent Test**: Adicionar um membro a um paciente e verificar que ele consta no núcleo; tentar adicionar o mesmo membro duas vezes e verificar a recusa; remover um membro; atribuir um dos membros como cuidador principal. (APP-006…APP-011, RFM-001…RFM-005, APC-001…APC-005)

**Acceptance Scenarios**:

1. **Given** um paciente registrado, **When** o profissional adiciona um membro com parentesco e atributos válidos, **Then** o membro passa a constar no núcleo familiar.
2. **Given** um membro já presente no núcleo, **When** o profissional tenta adicioná-lo de novo, **Then** recebe um aviso de "membro já existe" e nada é duplicado.
3. **Given** um membro do núcleo, **When** o profissional o remove, **Then** ele deixa de constar.
4. **Given** um paciente com membros, **When** o profissional define um deles como cuidador principal, **Then** esse membro passa a ser o cuidador principal.
5. **Given** um paciente **não ativo**, **When** o profissional tenta alterar o núcleo familiar, **Then** a operação é recusada com aviso de situação incompatível.

---

### User Story 4 - Atualizar a identidade social (Priority: P3)

O profissional atualiza a identidade social do paciente (tipo de identidade do catálogo e, quando o tipo exigir — ex.: indígena —, a descrição correspondente).

**Why this priority**: Mantém um dado sensível e específico atualizado, exigido por relatórios e direitos, mas é uma edição pontual sobre um paciente já existente. P3.

**Independent Test**: Atualizar a identidade social de um paciente com um tipo do catálogo; quando o tipo exige descrição, verificar que ela é cobrada; verificar que a mudança é refletida. (USIA-001…USIA-008)

**Acceptance Scenarios**:

1. **Given** um paciente registrado, **When** o profissional seleciona um tipo de identidade do catálogo e submete, **Then** a identidade social é atualizada.
2. **Given** um tipo de identidade que exige descrição (ex.: indígena em/fora de aldeia), **When** a descrição não é informada, **Then** a tela a exige antes de submeter.
3. **Given** um paciente não ativo, **When** o profissional tenta atualizar a identidade, **Then** a operação é recusada com aviso claro.

---

### Edge Cases

- **Sem papel autorizado**: usuário autenticado mas sem `worker` (cadastro/família/identidade) ou sem `worker`/`admin` (ciclo de vida) recebe negação clara ("sem permissão") em vez de executar a escrita; o backend é a autoridade. A interface esconde/desabilita a ação que o papel não permite, mas ainda assim trata graciosamente a negação vinda do backend.
- **Submissão dupla / clique repetido**: a tela impede submeter duas vezes a mesma mutação (ação desabilitada durante o envio), evitando criação/transição duplicada.
- **Transição inválida para a situação atual**: oferecer apenas a transição cabível; uma transição fora de ordem (ex.: dar alta a um paciente em fila) é recusada com aviso, sem mudar estado. (DISC-007, WDR-003, ADM-003, READM-005)
- **Dependência de identidades fora (people-context) no cadastro**: recusa fail-secure, sem criar paciente órfão; o profissional pode tentar de novo. (REGP-031)
- **Pessoa inexistente no registro de identidades**: cadastro recusado com aviso de que a pessoa precisa existir antes. (REGP-029)
- **Documento/identificador duplicado** (CPF já registrado, pessoa já com paciente): conflito tratado, sem duplicar. (REGP-001, REGP-030)
- **Sessão expira durante o preenchimento**: ao submeter, tenta-se renovar a sessão e repetir uma vez; não sendo possível, o profissional volta ao login preservando o que foi digitado quando viável.
- **Erro interno inesperado do backend**: mensagem genérica com referência de correlação; nenhum detalhe interno (stack, URL de backend) vaza ao usuário.
- **Concorrência**: dois profissionais agindo sobre o mesmo paciente — a segunda escrita conflitante recebe o erro de estado do backend (ex.: "já em atendimento") de forma graciosa, sem corromper a tela.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um profissional com papel `worker` registre um novo paciente, capturando: pessoa vinculada (identidade), diagnóstico(s) inicial(is), dados pessoais, documentos civis, endereço, identidade social e o parentesco do responsável — conforme o contrato do social-care.
- **FR-002**: O sistema MUST validar a entrada **antes** de enviar ao backend (campos obrigatórios, formatos como CPF/datas não-futuras, regras condicionais como descrição obrigatória para certos tipos de identidade) e MUST apontar o campo com problema sem submeter, prevenindo ida desnecessária ao backend.
- **FR-003**: O sistema MUST tratar os conflitos de cadastro (pessoa já com paciente, CPF/identificador já registrado) como avisos claros de conflito, sem duplicar e sem erro cru.
- **FR-004**: Em caso de indisponibilidade do serviço de identidades durante o cadastro, o sistema MUST recusar a operação de forma graciosa (fail-secure), sem criar paciente em estado inconsistente.
- **FR-005**: Todo campo de seleção dos formulários (parentesco, tipo de identidade, localização da residência etc.) MUST originar-se dos catálogos de domínio carregados (feature 002); é PROIBIDO embutir opções de domínio no aplicativo.
- **FR-006**: O sistema MUST oferecer, para cada paciente, **apenas** a transição de ciclo de vida válida para a situação atual — admitir (de em fila → em atendimento), dar alta (de em atendimento → desligado), readmitir (de desligado → em atendimento) e retirar da fila (de em fila → saída) — e MUST recusar transições inválidas com aviso claro, sem alterar estado.
- **FR-007**: O sistema MUST exigir motivo nas transições que o requerem (alta e retirada da fila) e MUST exigir observações quando o motivo for "outro", validando antes de submeter.
- **FR-008**: O sistema MUST permitir adicionar e remover membros do núcleo familiar e definir o cuidador principal entre os membros existentes, tratando "membro já existe", "membro não encontrado" e "paciente não ativo" como avisos claros.
- **FR-009**: O sistema MUST permitir atualizar a identidade social do paciente, exigindo a descrição quando o tipo selecionado a requer.
- **FR-010**: O sistema MUST impedir a submissão duplicada de uma mesma mutação (desabilitar a ação durante o envio), evitando criação/transição em duplicidade.
- **FR-011**: Toda mutação MUST ocorrer em nome da identidade autenticada da sessão, sem que o navegador veja token, URL de serviço de backend, identificador de ator em header customizado ou qualquer segredo; o ator é derivado da identidade da sessão pelo backend.
- **FR-012**: Um usuário autenticado SEM papel autorizado para a operação MUST receber negação clara ("sem permissão"), sem executar a escrita; a autoridade final de autorização é o backend, e a interface MUST esconder/desabilitar ações não permitidas e ainda assim tratar graciosamente a negação do backend.
- **FR-013**: Diante de sessão expirada ao submeter, o sistema MUST tentar renovar a sessão e repetir a mutação uma vez; não obtendo sucesso, MUST levar ao login preservando o trabalho do usuário quando viável.
- **FR-014**: Diante de indisponibilidade temporária de uma dependência durante uma mutação, o sistema MUST preservar o que o usuário preencheu e oferecer "tentar novamente", sem perder dados de formulário.
- **FR-015**: O sistema MUST garantir que nenhuma informação pessoal de paciente ou de membro familiar (nome, CPF, diagnóstico, endereço) apareça em logs (LGPD).
- **FR-016**: Após uma mutação bem-sucedida, o sistema MUST refletir o novo estado a partir da fonte de verdade (relendo o necessário), sem inventar, derivar ou completar dados no cliente (sem dado fabricado).
- **FR-017**: O sistema MUST mapear cada código de erro estruturado do backend (`REGP/ADM/DISC/READM/WDR/APP/RFM/APC/USIA-xxx`) para uma mensagem de usuário em PT-BR adequada (validação, conflito, sem-permissão, dependência-fora, não-encontrado), sem expor o código técnico cru ao usuário final.

### Key Entities *(include if feature involves data)*

- **Registro de cadastro de paciente**: o conjunto de dados para criar um paciente — pessoa vinculada (identificador de identidade), diagnóstico(s) inicial(is) `{ código CID, data, descrição }`, dados pessoais `{ nome, nome social?, nome da mãe, nacionalidade, sexo, nascimento, telefone? }`, documentos civis `{ CPF?, NIS?, RG?, CNS? }`, endereço `{ CEP?, abrigo?, situação de rua?, localização da residência, logradouro/bairro/número/complemento?, UF, município }`, identidade social `{ tipo, descrição? }` e parentesco do responsável.
- **Situação do paciente (máquina de estados)**: `WAITLISTED` (em fila) → `ACTIVE` (em atendimento) → `DISCHARGED` (desligado); de `WAITLISTED` há a saída por "retirada da fila"; de `DISCHARGED` há a volta por "readmissão". Transições: admitir (`WAITLISTED→ACTIVE`), dar alta (`ACTIVE→DISCHARGED`), readmitir (`DISCHARGED→ACTIVE`), retirar da fila (`WAITLISTED→saída`).
- **Motivo de transição**: alta `{ improved | deceased | transferred | abandoned | other }`; retirada da fila `{ refused_service | moved_location | other }`; observações obrigatórias quando o motivo for `other` (limite de 1000 caracteres).
- **Membro do núcleo familiar**: pessoa vinculada (identificador de identidade), parentesco (catálogo), reside junto?, é cuidador?, tem deficiência?, documentos pendentes, nascimento; um membro pode ser marcado como **cuidador principal**.
- **Identidade social**: tipo (catálogo de tipo de identidade) e descrição condicional (exigida para tipos como indígena em/fora de aldeia).
- **Identidade do profissional**: derivada da sessão (papéis `worker`/`owner`/`admin`/`superadmin`); determina quais ações de escrita são oferecidas e o acesso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir de uma sessão válida e de uma pessoa registrada, um profissional consegue cadastrar um paciente e vê-lo aparecer na lista (002) com situação "em fila de espera".
- **SC-002**: Uma submissão com campo obrigatório ausente/ inválido é barrada na própria tela (apontando o campo) **sem** chamar o backend — verificável: o backend não recebe a requisição inválida.
- **SC-003**: Para qualquer paciente, a interface oferece **somente** a transição de ciclo de vida válida para a sua situação atual; uma transição inválida nunca altera o estado.
- **SC-004**: 100% das opções de seleção dos formulários originam-se dos catálogos carregados — nenhuma opção fixa embutida no código (auditável por inspeção).
- **SC-005**: Um usuário sem o papel exigido nunca executa a escrita; recebe "sem permissão", sem erro técnico nem tela quebrada.
- **SC-006**: Nenhum token, URL de backend, identificador de ator em header de cliente, segredo ou informação pessoal de paciente/membro aparece no conteúdo entregue ao navegador ou nos logs (verificável por inspeção).
- **SC-007**: Nenhuma mutação é executada em duplicidade por clique repetido ou reenvio (a ação é bloqueada durante o envio) — verificável: uma única chamada por submissão confirmada.
- **SC-008**: Diante de expiração de sessão ao submeter, o profissional não perde o que preencheu: a mutação é repetida automaticamente após renovar a sessão, ou ele retorna ao formulário preservado após reautenticar.

## Assumptions

- As **features 001 e 002** estão concluídas: 001 fornece sessão autenticada, papéis e shell; 002 fornece a lista de pacientes, o detalhe (espaço reservado, a ser enriquecido por esta feature) e o **cache de catálogos de domínio por sessão** que alimenta os selects desta feature.
- A **pessoa (identidade)** referenciada no cadastro **já existe** no registro de identidades (people-context). A criação/seleção de pessoas é o setor **Pessoas & Identidade** (feature futura); aqui assume-se o identificador de uma pessoa existente como entrada (no aceite contra o serviço real, validado por REGP-029/031). Quando a feature de Pessoas existir, o cadastro de paciente passará a oferecer busca/seleção de pessoa.
- O serviço **social-care** expõe os 9 comandos de paciente (cadastro, 4 transições de ciclo de vida, adicionar/remover membro, cuidador principal, identidade social) com os contratos e códigos de erro mapeados em `contracts/`. A validação de aceite roda contra esse serviço em DEV; enquanto as imagens não sobem, roda contra o **stub** em `tests/`.
- O **prontuário completo** (visão consolidada do paciente — dados, família, avaliações) é montado incrementalmente: esta feature entrega cadastro + ciclo de vida + família + identidade; **Avaliação Social, Cuidado Clínico e Proteção de Direitos são features seguintes**.
- O **audit trail** é responsabilidade do social-care (centralizado, via Outbox); a feature não mantém auditoria própria — apenas dispara as mutações que o serviço audita.
- O deploy é **single-tenant** (associação de Boa Vista isolada).

## Dependencies

- **Feature 001** — sessão autenticada, papéis e shell.
- **Feature 002** — lista de pacientes (para ver o resultado das mutações), detalhe (a enriquecer) e **cache de catálogos de domínio** (selects dos formulários).
- **Serviço social-care** — os 9 comandos de paciente disponíveis em DEV para o aceite (os Gherkin de cadastro/ciclo-de-vida/família passando contra o serviço encerram o incremento). **Risco conhecido**: há bugs de contrato de integração no serviço (ver `research.md` — header de ator no GET, serialização do relay de outbox, decode de evento) que afetam o **caminho real**; não bloqueiam o desenvolvimento contra stub, mas são pré-condição do aceite end-to-end.
- **people-context** (direto no cadastro) — origem das identidades; sua indisponibilidade aparece como recusa fail-secure no cadastro (REGP-031). A criação de pessoas é setor futuro.
