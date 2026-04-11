# Feature: Auth Landing + App Hub — Spec Completa

> Leia este README primeiro. Ele é o índice dos 4 documentos de referência desta feature.
> Cada documento é auto-contido e pode ser lido isoladamente, mas juntos formam a spec completa.

## Documentos

| Arquivo | O que contém | Quem consome |
|---------|-------------|--------------|
| `01-feature-spec.md` | Visão geral, fluxo de decisão, layout de cada tela, ViewModel, tipos, segurança | **Todos os agentes** (domain-architect, viewmodel-engineer, view-implementer, infra-implementer) |
| `02-components.md` | Catálogo de componentes específicos desta feature: props, variantes, estados, CSS classes | **view-implementer** |
| `03-states-and-flows.md` | Todos os estados de cada tela (normal, loading, error, empty, redirect), transições entre eles, edge cases | **viewmodel-engineer**, **view-implementer** |
| `04-copy-a11y-responsive.md` | UX copy (PT-BR), acessibilidade (ARIA, landmarks, keyboard), responsividade (breakpoints, adaptações), animações | **view-implementer** |

## Contexto

- **Usuário alvo:** Todos os perfis (assistentes sociais, administradores, profissionais de saúde, educadores)
- **Objetivo:** Autenticar via OIDC (Zitadel PKCE) e direcionar ao micro-app correto baseado em roles
- **Rotas:** `/` (landing), `/hub` (app selector pós-auth), `/auth/callback` (OIDC callback)
- **Contrato API:** OIDC endpoints via Zitadel + `GET /api/v1/me` (retorna user profile + apps permitidos)
- **Protótipo de referência:** `prototype-auth-hub.html` (raiz do projeto, interativo com 8 cenários)

## Stack

- **Server:** Hono BFF (SSR para landing, client hydration para hub)
- **Client:** hono/jsx/dom (NÃO Preact)
- **Estilos:** hono/css com tokens de `src/client/styles/tokens.ts`
- **Auth:** OIDC via Zitadel com PKCE (ver adapter-expert/auth-handbook.md)

## Telas (4)

1. **Landing Page** — Pré-auth, pública, background dark
2. **App Hub** — Pós-auth, seleção de módulos, background claro
3. **Auto-Redirect** — 1 app só, redirect automático com progress bar
4. **Loading** — Transição entre estados (autenticando, carregando, entrando)
