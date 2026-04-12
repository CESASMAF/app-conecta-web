# Patient Registration — States & Flows

> Todos os estados de cada step, transições entre eles, e edge cases.
> Este documento é a referência do viewmodel-engineer e view-implementer para garantir que nenhum estado foi esquecido.

## State Machine Overview

```
                         ┌──────────────────────────────────────────────────────┐
                         │                 WIZARD FLOW                          │
                         │                                                      │
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
  │  STEP 0  │───►│  STEP 1  │───►│  STEP 2  │───►│  STEP 3  │                 │
  │ Pessoais │    │  Docs    │    │ Endereco │    │ Diag.    │                 │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘                 │
       │               │               │               │                       │
       │ validate       │ validate      │ validate      │ validate              │
       │ fail→stay     │ fail→stay    │ fail→stay    │ fail→stay              │
       │               │               │               │                       │
       ▼               ▼               ▼               ▼                       │
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
  │  STEP 4  │───►│  STEP 5  │───►│  STEP 6  │───►│  SAVING  │                 │
  │ Familia  │    │ Espec.   │    │ Ingresso │    │          │                 │
  │(opcional)│    │(opcional)│    │          │    └────┬─────┘                 │
  └──────────┘    └──────────┘    └──────────┘         │                       │
                                      │                 │                       │
                                      │ validate        ├── success             │
                                      │ fail→stay      │     │                  │
                                      │                 │     ▼                  │
                                      │                 │  ┌──────────┐          │
                                      │                 │  │ SUCCESS  │          │
                                      │                 │  │ OVERLAY  │          │
                                      │                 │  └────┬─────┘          │
                                      │                 │       │                │
                                      │                 │   "Novo cadastro"      │
                                      │                 │       │                │
                                      │                 │       ▼                │
                                      │                 │   RESET → Step 0      │
                                      │                 │                       │
                                      │                 └── failure              │
                                      │                       │                  │
                                      │                       ▼                  │
                                      │                  Error Banner            │
                                      │                  (stay on step 6)        │
                                      │                                          │
  ┌─────────────────────────────────────────────────────────────────────────┐     │
  │ Navegação lateral: stepper dots permitem ir a qualquer step visitado   │     │
  │ "← Anterior" volta 1 step. "← Voltar para Familias" sai do wizard    │     │
  └─────────────────────────────────────────────────────────────────────────┘     │
                                                                                 │
  ┌─────────────────────────────────────────────────────────────────────────┐     │
  │ Draft: saveDraft() em cada dispatch. loadDraft() no mount.             │     │
  │ clearDraft() após SAVE_SUCCESS.                                        │     │
  └─────────────────────────────────────────────────────────────────────────┘     │
                         └──────────────────────────────────────────────────────┘
```

---

## Step 0: Dados Pessoais — Estados

### 0.1 Normal (default)

- **Condição:** `currentStep === 0`, sem errors
- **Renderiza:** 8 form fields (nome, sobrenome, nome social, mãe, nascimento, nacionalidade, sexo, telefone) em grid 2-col
- **Animação de entrada:** containerFadeIn 600ms ease-out no glass card
- **Campos obrigatórios:** firstName, lastName, motherName, birthDate, nationality, sex (marcados com *)
- **Campos opcionais:** socialName, phoneNumber

### 0.2 Erro de validação

- **Condição:** NEXT_STEP dispatch + validação falha
- **Trigger:** campos obrigatórios vazios, data inválida, sexo não selecionado
- **Renderiza:** Normal + field errors abaixo de cada campo + card-selector error border
- **Scroll:** auto-scroll to first `.has-error` element
- **Erros possíveis:**
  - "Campo obrigatório" — firstName, lastName, motherName
  - "Formato invalido (DD/MM/AAAA)" — birthDate formato errado
  - "Data invalida" — mês/dia fora de range
  - "Data nao pode ser futura (PD-005)" — birthDate > hoje
  - "Campo obrigatório" — nationality, sex

### 0.3 Preenchido parcialmente (draft restore)

- **Condição:** loadDraft() restaurou state com campos parciais
- **Renderiza:** Normal com campos preenchidos. Inputs com valor mostram `.filled` class (border mais opaca)

---

## Step 1: Documentos — Estados

### 1.1 Normal

- **Condição:** `currentStep === 1`, sem errors
- **Renderiza:** CPF, NIS, CNS fields + seção RG (4 campos) em grid 2-col
- **Seção RG:** precedida por FormSectionTitle "RG (preencha todos ou nenhum)"
- **Nenhum campo é individualmente obrigatório** — a regra é CD-001 (pelo menos um documento)

### 1.2 Erro CD-001 (nenhum documento)

- **Condição:** NEXT com CPF, NIS, e RG todos vazios
- **Renderiza:** GlobalErrorBanner no topo: "Pelo menos um documento deve ser informado — CPF, NIS ou RG (CD-001)"
- **Banner:** fundo danger-light, ícone "!" vermelho, animação bannerSlide

### 1.3 Erro de formato (campo individual)

- **Condição:** CPF com < 11 dígitos, NIS com < 11 dígitos, CPF checksum falha, RG parcial
- **Renderiza:** erro inline no campo específico
- **Erros possíveis:**
  - "CPF deve ter 11 digitos (CPF-003)"
  - "CPF invalido (CPF-005)" — checksum fail
  - "NIS deve ter 11 digitos (NIS-002)"
  - "Obrigatorio quando RG informado (RG-001..RG-006)" — RG all-or-nothing

---

## Step 2: Endereço — Estados

### 2.1 Gate (initial)

- **Condição:** `currentStep === 2`, locationType === null
- **Renderiza:** APENAS o LocationTypeGate (3 cards: Urbano, Rural, Rua)
- **Campos de endereço:** ocultos (max-height 0, opacity 0)

### 2.2 Urbano selecionado

- **Condição:** locationType === 'URBANO'
- **Renderiza:** Gate (Urbano selected) + todos os campos de endereço (reveal animation)
- **Campos habilitados:** todos (moradia, CEP, rua, número, complemento, bairro, estado, cidade, abrigo)

### 2.3 Rural selecionado

- **Condição:** locationType === 'RURAL'
- **Renderiza:** Gate (Rural selected) + campos de endereço + AddressInfoBanner (Rural)
- **Campos desabilitados:** Rua, Complemento (opacity 0.4, pointer-events none)
- **Banner:** "Rua e Complemento nao se aplicam para area rural."

### 2.4 Situação de Rua selecionada

- **Condição:** locationType === 'RUA'
- **Renderiza:** Gate (Rua selected) + campos + AddressInfoBanner (Rua)
- **Campos desabilitados:** moradia, CEP, rua, número, complemento, bairro, abrigo
- **Campos habilitados:** APENAS Estado e Cidade
- **Banner:** "Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS."

### 2.5 Erro — Gate não selecionado

- **Condição:** NEXT sem selecionar location type
- **Renderiza:** erro no card-selector-group + "Selecione a situacao de moradia"
- **Validação para aqui** — não valida os outros campos

### 2.6 Erro — Campos faltando

- **Condição:** NEXT com gate selecionado mas campos obrigatórios vazios
- **Erros possíveis:**
  - "UF e obrigatoria (ADDR-002)" — estado vazio
  - "Cidade e obrigatoria (ADDR-004)" — cidade vazia
  - "Tipo de moradia e obrigatorio" — housing vazio (Urbano/Rural)
  - "CEP deve ter 8 digitos (CEP-003)" — CEP parcial
  - "CEP nao pertence a nenhuma faixa valida (CEP-004)" — CEP fora de range

---

## Step 3: Diagnósticos — Estados

### 3.1 Normal (1 card vazio)

- **Condição:** `currentStep === 3`, 1 diagnosis card com campos vazios
- **Renderiza:** DiagnosisCard com DiagnosisStatus "PENDENTE" + 8 QuickCIDChips
- **Status badge:** posição absolute top-right, textSoft

### 3.2 Diagnóstico completo

- **Condição:** CID code + date (10 chars) + description todos preenchidos
- **Renderiza:** DiagnosisCard com `.diag-complete` class
- **Mudanças visuais:**
  - Border: rgba(79,132,72,0.3)
  - Background: rgba(79,132,72,0.04)
  - Status badge: "COMPLETO" em greenPrimary
  - Status icon: circle preenchido verde com checkmark branco
- **Transição:** all 300ms ease-out (em tempo real, a cada keystroke)

### 3.3 Quick CID selecionado

- **Condição:** usuário clicou um chip
- **Efeito:** CID code e description preenchidos automaticamente. Chip fica `.chip-active` (verde sólido, branco)
- **Chips disponíveis:** G80, Q90, F84.0, E70, G71.0, R69, Z03, Z03.9

### 3.4 Múltiplos diagnósticos

- **Condição:** usuário clicou "+ Adicionar diagnóstico" 1+ vezes
- **Renderiza:** N DiagnosisCards empilhados verticalmente, cada um com seus próprios campos e chips
- **Botão remove:** "×" circle button no top-right de cada card (exceto se for o único)

### 3.5 Erro PAT-001 (nenhum diagnóstico)

- **Condição:** NEXT sem nenhum diagnosis card
- **Renderiza:** GlobalErrorBanner "Pelo menos um diagnostico e obrigatorio (PAT-001)"

### 3.6 Erro de campo (ICD-001, DIA-001, DIA-003)

- **Condição:** NEXT com cards incompletos
- **Erros por card:**
  - "Codigo CID obrigatorio (ICD-001)" — CID vazio
  - "Formato CID invalido — ex: G80, F84.0" — CID não match ICD-10 regex
  - "Descricao obrigatoria (DIA-003)" — description vazio
  - "Data obrigatoria" — date vazio
  - "Formato invalido (DD/MM/AAAA)" — date formato errado
  - "Data nao pode ser futura (DIA-001)" — date > hoje

---

## Step 4: Composição Familiar — Estados

### 4.1 Normal (apenas referência)

- **Condição:** `currentStep === 4`, 0 membros adicionados
- **Renderiza:** MemberRow da pessoa de referência (index 01, sem botão remover) + botão "+ Adicionar membro"
- **Step é opcional** — NEXT passa direto

### 4.2 Adicionando membro (form aberto)

- **Condição:** click em "+ Adicionar membro"
- **Renderiza:** botão add some + FamilyForm aparece (animação fadeInUp)
- **FamilyForm contém:**
  - 6 campos básicos (nome, nascimento, sexo, parentesco, reside, PcD)
  - Seção "Documentos necessários" com 6 toggle chips
  - Botões Cancelar / Confirmar

### 4.3 Documentos selecionados

- **Condição:** chips de documento ativados (1+ active)
- **Renderiza:** DocumentSections correspondentes aparecem abaixo dos chips
- **Cada seção:** animação fadeInUp 400ms ease-out
- **Seções dinâmicas:** add/remove via Set.add/delete + re-render

### 4.4 Com membros adicionados

- **Condição:** 1+ membros confirmados
- **Renderiza:** MemberRows com nome, meta (parentesco | sexo | reside | docs), botão remover
- **Meta string:** "CONJUGE — Conjuge/Companheiro(a) | Feminino | 01/01/1990 | Reside | CPF, RG"
- **Animação:** cada row com fadeInUp

### 4.5 Erro de validação no form

- **Condição:** Confirmar com nome vazio ou parentesco não selecionado ou documento inválido
- **Renderiza:** erros inline nos campos + scroll to first error
- **Validação de documentos:** mesmas regras do Step 1 (CPF checksum, RG all-or-nothing, CN 32 digs, CNS 15 digs, TE 12 digs + zona + secao + UF, CTPS 7 digs + 4 serie + UF)

---

## Step 5: Especificidades (opcional) — Estados

### 5.1 Normal

- **Condição:** `currentStep === 5`
- **Renderiza:** select (identidade social), input (descrição), textarea (observações) em grid
- **Título:** "Especificidades (opcional)" — texto no título do step
- **Step é opcional** — NEXT passa direto
- **Options:** Quilombola, Indígena, Ribeirinho, Cigano, Extrativista, Pescador artesanal, Pertencente a comunidade de terreiro, Nenhuma das anteriores

---

## Step 6: Ingresso — Estados

### 6.1 Normal

- **Condição:** `currentStep === 6`
- **Renderiza:** select (tipo), inputs (origem, contato), textarea (motivo), seção programas, textarea (observação)
- **Programas:** 5 items em grid 2-col, NENHUM pré-selecionado
- **Campos obrigatórios:** ingressType, serviceReason

### 6.2 Erro de validação

- **Condição:** Submit com campos obrigatórios vazios
- **Erros possíveis:**
  - "Tipo de ingresso e obrigatorio" — select vazio
  - "Motivo do atendimento e obrigatorio (ING-001)" — textarea vazia
  - "Maximo 200 caracteres" — originName ou originContact
  - "Maximo 2000 caracteres" — serviceReason

### 6.3 Saving

- **Condição:** validação passou, POST iniciado
- **Renderiza:** botão "Salvando..." + disabled
- **Duração:** ~1-2s (tempo do POST)

---

## Success Overlay — Estados

### S.1 Visible

- **Condição:** saveResult.ok === true
- **Renderiza:** overlay com glass card, checkmark animado, título, subtítulo, 2 botões
- **Animações sequenciais:**
  1. Overlay fade-in 500ms
  2. Glass card scale 0.95→1 spring 800ms
  3. Circle scale 0→1.1→1 spring 600ms
  4. Checkmark SVG draw 500ms (delay 400ms)
  5. Title fadeInUp 500ms (delay 600ms)
  6. Subtitle fadeInUp 500ms (delay 750ms)
  7. Buttons fadeInUp 500ms (delay 900ms)
- **localStorage:** salva registration data + clearDraft()

### S.2 Actions

- **"Novo cadastro":** dispatch RESET → volta para step 0 com state limpo
- **"Ver familias →":** navigate to /prototype-home-redesign.html (prod: /social-care)

---

## Edge Cases & Regras de Negócio

### EC-1: Browser back durante wizard

- **Cenário:** Usuário clica back do browser em qualquer step
- **Comportamento:** Sai do wizard inteiro (volta para página anterior)
- **Draft:** preservado em localStorage. Ao reabrir, loadDraft() restaura
- **Responsabilidade:** Page (beforeunload listener opcional)

### EC-2: Refresh/F5 durante wizard

- **Cenário:** Usuário recarrega a página no meio do wizard
- **Comportamento:** SSR re-renderiza shell, client hydrates, loadDraft() restaura state completo
- **Dados preservados:** step atual, todos os campos, membros, diagnósticos
- **Dados perdidos:** nenhum (tudo está em localStorage)

### EC-3: Múltiplas abas

- **Cenário:** Usuário abre /patient-registration em 2 abas
- **Comportamento:** Cada aba tem seu próprio reducer state. localStorage é compartilhado
- **Conflito:** A última aba a fazer saveDraft() "ganha". Não tratamos sync entre abas
- **Aceitável:** cadastro é operação individual, não colaborativa

### EC-4: CEP de outro estado

- **Cenário:** Usuário digita CEP 01310-100 (SP) mas seleciona UF="RJ"
- **Comportamento:** Validamos que o CEP pertence a ALGUMA faixa válida (CEP-004), não que é consistente com o UF selecionado
- **Melhoria futura:** cross-validation CEP vs UF (não implementado agora)

### EC-5: RG parcial (all-or-nothing)

- **Cenário:** Usuário preenche só o número do RG
- **Comportamento:** Erro em UF, órgão emissor, e data: "Obrigatorio quando RG informado"
- **Regra:** Se QUALQUER campo do RG tem valor, TODOS devem ser preenchidos

### EC-6: Diagnosis card com quick CID + edição manual

- **Cenário:** Usuário seleciona chip "G80", depois edita o CID code para "G81"
- **Comportamento:** chip-active é removido (o valor não bate mais). Status é recalculado
- **Implementação:** checkDiagComplete() roda a cada keystroke

### EC-7: Offline durante submit

- **Cenário:** Rede cai no momento do POST /api/v1/patients
- **Comportamento:** SAVE_FAILURE com mensagem de erro de rede. Botão volta para "Salvar Cadastro"
- **Draft:** preservado. Usuário pode tentar novamente
- **Responsabilidade:** service layer (Result<T, E> → dispatch SAVE_FAILURE)

### EC-8: Sessão expirada durante wizard

- **Cenário:** Token expira enquanto usuário preenche (15+ min sem interação com server)
- **Comportamento:** No submit, o BFF rejeita (401). Client recebe SAVE_FAILURE
- **Melhoria:** Mostrar banner "Sessão expirada, faça login novamente" com link

### EC-9: Family member com documento inválido

- **Cenário:** Usuário seleciona chip CPF, preenche "111.111.111-11" (repetidos)
- **Comportamento:** validateFmDocs() detecta CPF inválido (isValidCPF retorna false)
- **Erro:** "CPF invalido (CPF-005)" inline no campo

### EC-10: Morador de rua com endereço

- **Cenário:** Seleciona "Situação de Rua", preenche estado/cidade, volta e troca para "Urbano"
- **Comportamento:** Campos que estavam disabled são re-enabled. Valores não são perdidos para estado/cidade
- **Implementação:** selectLocationType() só limpa valores de campos que serão disabled

---

## Transition Timing

| De → Para | Duração | O que acontece |
|-----------|---------|---------------|
| Step N → Step N+1 | Imediato | containerFadeIn 600ms no novo step |
| Step N → Step N (validation fail) | Imediato | Erros aparecem, scroll to first error |
| Step N+1 → Step N (back) | Imediato | containerFadeIn 600ms |
| Location gate → Fields reveal | 500ms | max-height + opacity transition |
| Chip toggle → Section appear | 400ms | fadeInUp |
| Chip toggle → Section remove | Imediato | DOM removal (no exit animation) |
| Step 6 → Saving | Imediato | Button text "Salvando..." |
| Saving → Success | ~1.5s | POST completes, overlay fade-in |
| Success → Reset (novo cadastro) | Imediato | Overlay hides, step 0 renders |
| Quick CID click → Fields fill | Imediato | Chip highlight + field values |
| Input change → Diag status | Imediato | checkDiagComplete() real-time |
| Sidebar collapsed → expanded | 300ms | width transition + labels fade |
