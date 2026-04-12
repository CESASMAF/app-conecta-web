# Feature: Patient Registration — Spec Completa

> Leia este README primeiro. Ele é o índice dos 4 documentos de referência desta feature.
> Cada documento é auto-contido e pode ser lido isoladamente, mas juntos formam a spec completa.

## Documentos

| Arquivo | O que contém | Quem consome |
|---------|-------------|--------------|
| `01-feature-spec.md` | Visão geral, fluxo de decisão, ViewModel, tipos, API, segurança | **Todos os agentes** (domain-architect, viewmodel-engineer, view-implementer, infra-implementer) |
| `02-components.md` | Catálogo de componentes: props, variantes, estados, CSS | **view-implementer** |
| `03-states-and-flows.md` | State machine, todos os estados de cada step, edge cases, transições | **viewmodel-engineer**, **view-implementer** |
| `04-copy-a11y-responsive.md` | UX copy PT-BR, ARIA, keyboard, contraste, breakpoints, animações | **view-implementer** |

## Contexto

- **Usuário alvo:** Assistentes sociais cadastrando famílias de pacientes com doenças genéticas raras
- **Objetivo:** Cadastrar uma Pessoa de Referência com dados pessoais, documentos, endereço, diagnósticos, composição familiar, especificidades e ingresso
- **Rotas:** `/patient-registration` (página com client hydration)
- **Contrato API:** `POST /api/v1/patients` (criação completa)
- **Contratos de validação:** `contracts/shared/validation-rules/` (kernel, registry, care)
- **Protótipo de referência:** `prototype-registration-redesign.html` (raiz do projeto, interativo com 8 cenários)
- **Design spec:** `docs/superpowers/specs/2026-04-11-redesign-sage-garden-design.md`

## Stack

- **Server:** Hono BFF (SSR shell + client hydration)
- **Client:** hono/jsx/dom (NÃO Preact)
- **Estilos:** hono/css com tokens de `src/client/styles/tokens.ts`
- **Auth:** OIDC via Zitadel com PKCE (requer sessão para acessar a rota)
- **Design System:** Sage Garden — glass morphism, Erode/Satoshi fonts, green palette

## Telas (9 states)

1. **Step 0 — Dados Pessoais** — Nome, sobrenome, data de nascimento, sexo, nacionalidade
2. **Step 1 — Documentos** — CPF, NIS, CNS, RG (all-or-nothing). Pelo menos um obrigatório (CD-001)
3. **Step 2 — Endereço** — Gate de tipo de moradia (Urbano/Rural/Rua) → campos condicionais
4. **Step 3 — Diagnósticos** — Pelo menos um (PAT-001). Quick-select CID + status de completude
5. **Step 4 — Composição Familiar** — Membros opcionais com documentos toggle (CPF, RG, CN, CNS, TE, CTPS)
6. **Step 5 — Especificidades (opcional)** — Identidade social, étnica ou cultural
7. **Step 6 — Ingresso** — Tipo de ingresso, motivo (ING-001), programas sociais vinculados
8. **Success Overlay** — Confirmação com animação spring + checkmark SVG
9. **Loading/Saving** — Estado de submit com botão "Salvando..."

## Bounded Contexts Envolvidos

- **Kernel** — CPF, CNS, NIS, CEP, RG, Address, PersonId, TimeStamp
- **Registry** — Patient, FamilyMember, PersonalData, RequiredDocument
- **Care** — Diagnosis, ICDCode, IngressInfo, AppointmentType

## Validation Rules (per contracts/)

| Código | Regra | Step |
|--------|-------|------|
| CD-001 | Pelo menos um documento (CPF, NIS, ou RG) | 1 |
| CPF-003 | CPF deve ter 11 dígitos | 1, 4 |
| CPF-004 | CPF não pode ter dígitos repetidos | 1, 4 |
| CPF-005 | Checksum do CPF inválido | 1, 4 |
| NIS-002 | NIS deve ter 11 dígitos | 1 |
| RG-001..006 | RG: todos os campos ou nenhum | 1, 4 |
| PD-005 | Data de nascimento não pode ser futura | 0 |
| ADDR-002 | UF obrigatória | 2 |
| ADDR-004 | Cidade obrigatória | 2 |
| CEP-003 | CEP deve ter 8 dígitos | 2 |
| CEP-004 | CEP deve pertencer a faixa válida de estado | 2 |
| PAT-001 | Pelo menos um diagnóstico obrigatório | 3 |
| ICD-001 | Código CID não pode ser vazio | 3 |
| DIA-001 | Data do diagnóstico não pode ser futura | 3 |
| DIA-003 | Descrição do diagnóstico não pode ser vazia | 3 |
| ING-001 | Motivo do atendimento não pode ser vazio | 6 |
