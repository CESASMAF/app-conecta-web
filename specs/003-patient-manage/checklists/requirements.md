# Specification Quality Checklist: Cadastro, ciclo de vida, núcleo familiar e identidade social do paciente (escrita)

**Purpose**: Validar completude e qualidade da especificação antes do planejamento
**Created**: 2026-06-25
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs) — corpo tech-agnostic; endpoints/códigos de erro ficam nos critérios externos rastreados (Gherkin/`contracts/`), não no texto de requisitos.
- [x] Focused on user value and business needs (cadastrar, conduzir cuidado, compor família, manter identidade)
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed (User Scenarios, Requirements, Success Criteria)

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain — escopo, papéis, máquina de estados e dependência de people-context resolvidos pelo contrato real + matriz RBAC.
- [x] Requirements are testable and unambiguous (FR-001…FR-017)
- [x] Success criteria are measurable (SC-001…SC-008)
- [x] Success criteria are technology-agnostic (sem framework/endpoint/medida técnica)
- [x] All acceptance scenarios are defined (US1–US4, Given/When/Then)
- [x] Edge cases are identified (sem papel, duplo-submit, transição inválida, dependência fora, pessoa inexistente, duplicidade, sessão expira, erro interno, concorrência)
- [x] Scope is clearly bounded (9 comandos de paciente; avaliação/clínico/proteção/pessoas são features seguintes — em Assumptions)
- [x] Dependencies and assumptions identified (seções Dependencies/Assumptions; risco de contrato E2E registrado)

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria (rastreio US↔FR↔códigos REGP/ADM/DISC/READM/WDR/APP/RFM/APC/USIA)
- [x] User scenarios cover primary flows (cadastrar, ciclo de vida, família, identidade social)
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Validação: **todos os itens passam** na 1ª iteração. Pronta para `/speckit-plan` (clarify dispensável — sem marcadores pendentes).
- **Decisão de produto pendente (não-bloqueante)**: a entrada de `personId` no cadastro assume pessoa existente (people-context). Quando o setor **Pessoas & Identidade** existir, o cadastro ganhará busca/seleção de pessoa — anotado em Assumptions/research D3.
- **Pré-condição de aceite E2E** (não-bloqueante p/ desenvolvimento contra stub): correção dos 3 bugs de contrato no `social-care` (research D9).
