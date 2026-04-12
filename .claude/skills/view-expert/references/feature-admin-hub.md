# Feature: Admin Hub

> **NOTA:** Este arquivo e um resumo. A spec completa e detalhada esta em:
> `features/admin-hub/README.md` (indice com 4 documentos separados)
>
> - `01-feature-spec.md` — Fluxo, layout, ViewModel, tipos, seguranca, rotas
> - `02-components.md` — Catalogo de componentes com props, variantes, CSS
> - `03-states-and-flows.md` — State machine, todos os estados, edge cases
> - `04-copy-a11y-responsive.md` — UX copy, ARIA, keyboard, contraste, breakpoints, animacoes
>
> Leia os documentos na pasta `features/admin-hub/` para a spec de implementacao.

## Resumo

- **Rota:** `/admin` (SPA com 5 tabs)
- **Acesso:** role `admin` ou `owner` (adminGuard)
- **Layout:** Top Tabs (header dark + tab bar + conteudo)
- **Tabs:** Dashboard | Pessoas | Lookup Tables | Solicitacoes | Auditoria
- **Client App:** `src/client/apps/admin-hub/entry.tsx`
- **Backend:** Proxy para people-context + social-care, audit store local
- **Design:** Tool-like, desktop-first, Playfair somente em stat values
- **Prototipo:** `prototype-admin-hub.html` (Layout A aprovado)
