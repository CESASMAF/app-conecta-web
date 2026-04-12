# Feature: Admin Hub — Spec Completa

> Leia este README primeiro. Ele e o indice dos 4 documentos de referencia desta feature.
> Cada documento e auto-contido e pode ser lido isoladamente, mas juntos formam a spec completa.

## Documentos

| Arquivo | O que contem | Quem consome |
|---------|-------------|--------------|
| `01-feature-spec.md` | Visao geral, fluxo, ViewModel, tipos, API, seguranca, rotas | **Todos os agentes** |
| `02-components.md` | Catalogo de componentes: props, variantes, estados, CSS | **view-implementer** |
| `03-states-and-flows.md` | State machine, estados de cada tab, edge cases, transicoes | **viewmodel-engineer**, **view-implementer** |
| `04-copy-a11y-responsive.md` | UX copy PT-BR, ARIA, keyboard, contraste, breakpoints, animacoes | **view-implementer** |

## Contexto

- **Usuario alvo:** Administradores do sistema (role `admin` ou `owner`)
- **Objetivo:** Gerenciar pessoas, roles, lookup tables e revisar solicitacoes de novos valores
- **Rotas:** `/admin` (SPA com tabs), `/api/admin/*` (proxy API com audit)
- **Contrato API:** Proxy para people-context + social-care, audit store local
- **Prototipo de referencia:** `prototype-admin-hub.html` (raiz do projeto, Layout A — Top Tabs)

## Stack

- **Server:** Hono BFF (SSR shell + client hydration)
- **Client:** hono/jsx/dom (NAO Preact)
- **Estilos:** hono/css com tokens de `src/client/styles/tokens.ts`
- **Auth:** OIDC via Zitadel com PKCE, adminGuard middleware (role check)
- **Backends:** people-context (Bun+Elysia), social-care (Swift/Vapor)

## Telas (5 tabs em SPA unica)

1. **Dashboard** — Stats agregados + solicitacoes pendentes + atividade recente
2. **Pessoas** — Tabela de pessoas com busca, roles, e botao criar
3. **Lookup Tables** — Grid de 13 tabelas + drill-down com toggles
4. **Solicitacoes** — Tabela de requests pendentes com aprovar/rejeitar
5. **Auditoria** — Log cronologico de todas as acoes administrativas
