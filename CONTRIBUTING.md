# Contributing — app-conecta-web (ACDG)

## Perfis de Contribuidor

Este projeto tem dois perfis com escopos distintos:

| Perfil | Responsabilidades | Branch prefix |
|--------|-------------------|---------------|
| **Dev** | Server-side, seguranca, estados, reatividade, domain, application, middleware, testes | `feat/`, `fix/`, `refactor/`, `test/` |
| **Designer** | UI/UX, visual, componentes, estilos, copy, acessibilidade | `ui/` |

---

## Gitflow

```
main (protegida — so via PR)
  |
  ├── feat/nome-da-feature       Dev: features novas (qualquer camada)
  ├── fix/nome-do-bug            Dev: bug fixes (qualquer camada)
  ├── refactor/nome              Dev: refatoracoes
  ├── test/nome                  Dev: testes
  |
  ├── ui/nome-da-melhoria        Designer: visual, componentes, estilos
  |
  ├── chore/nome                 Ambos: config, docs, CI
  └── docs/nome                  Ambos: documentacao
```

### Regras

1. **NUNCA commitar direto na `main`** — sempre via Pull Request
2. **NUNCA force push** (`git push --force` e bloqueado por hooks)
3. **Testes devem passar** antes de merge (pre-push hook roda automaticamente)
4. **Kodus AI** revisa automaticamente todos os PRs (qualidade, seguranca, performance)

---

## Escopo por Perfil

### Dev (`feat/`, `fix/`, `refactor/`, `test/`)

Pode modificar **qualquer arquivo** do projeto:

```
src/domain/          — Value Objects, entities, aggregates
src/application/     — Use cases, ports, validation
src/adapters/        — Auth, remote client, config
src/middleware/       — Security headers, session, CSRF, fetch metadata, auth guard
src/routes/          — Health, auth, API proxy, SSR pages
src/server.ts        — Entrypoint
src/types.ts         — AppState types
src/client/          — ViewModels, services, views, styles, apps
tests/               — Todos os testes
```

**Workflow:**
1. `git checkout -b feat/minha-feature`
2. Implementar seguindo o `/pipeline-maestro`
3. `deno task test` — testes passando
4. `deno task build` — bundles compilando
5. `git push origin feat/minha-feature`
6. Abrir PR para `main` — Kodus AI revisa automaticamente
7. Merge apos CI verde

### Designer (`ui/`)

Pode modificar **APENAS** estes arquivos:

```
src/client/views/     — Pages e Components (hono/jsx/dom)
src/client/styles/    — Tokens e estilos (hono/css)
src/views/            — SSR layouts e pages (hono/jsx)
static/               — CSS, imagens, assets
```

**NAO pode modificar:**
```
src/domain/           ❌
src/application/      ❌
src/adapters/         ❌
src/middleware/        ❌
src/routes/           ❌
src/server.ts         ❌
src/types.ts          ❌
src/client/viewmodels/ ❌ (pedir ao dev)
src/client/services/   ❌ (pedir ao dev)
src/client/apps/       ❌ (pedir ao dev)
tests/                 ❌ (exceto testes de view)
```

**Workflow:**
1. `git checkout -b ui/minha-melhoria`
2. Modificar APENAS views/styles/static
3. Usar tokens de `src/client/styles/tokens.ts` (nunca hardcode hex)
4. Importar de `hono/jsx/dom` (client) ou `hono/jsx` (SSR)
5. `deno task test` — testes passando
6. `deno task build` — bundles compilando
7. `git push origin ui/minha-melhoria`
8. Abrir PR para `main` — **Gabriel DEVE revisar antes de merge**
9. Kodus AI revisa automaticamente em paralelo

**Se precisar de um novo endpoint, campo de dados, ou viewmodel:** pedir ao dev.

---

## Setup para Novos Contribuidores

```bash
# 1. Clone
git clone git@github.com:acdgbrasil/app-conecta-web.git
cd app-conecta-web

# 2. Configurar hooks
git config core.hooksPath .githooks

# 3. Criar sua branch
git checkout -b ui/minha-feature    # designer
git checkout -b feat/minha-feature  # dev

# 4. Build e rodar
deno task build
docker compose up --build

# 5. Acessar
# http://localhost:8081

# 6. Antes de push
deno task test       # testes
deno task build      # bundles
```

---

## Convencoes

### Commits (Conventional Commits)

```
feat:      nova feature
fix:       bug fix
chore:     config, deps, CI
docs:      documentacao
refactor:  refatoracao sem mudanca de comportamento
test:      adicionar/corrigir testes
```

### Branch naming

```
feat/descricao-curta
fix/descricao-curta
ui/descricao-curta
chore/descricao-curta
docs/descricao-curta
refactor/descricao-curta
test/descricao-curta
```

### CSS / Estilos

- Usar **APENAS** `hono/css` com tokens de `src/client/styles/tokens.ts`
- **NUNCA** usar Tailwind, styled-components, ou inline styles com valores hardcoded
- Usar `alpha()` helper para cores com transparencia
- CSP nonce via `<Style nonce={nonce} />`

### Acessibilidade

- Contraste minimo 4.5:1 para texto (WCAG AA)
- Touch targets minimo 48px (WCAG 2.5.5)
- `aria-label` em elementos interativos
- `aria-hidden="true"` em elementos decorativos
- `prefers-reduced-motion` respeitado em animacoes

---

## Review com Kodus AI

Todos os PRs sao automaticamente revisados pela [Kodus AI](https://kodus.io). Ela analisa:

- Qualidade de codigo
- Seguranca (vulnerabilidades, leaks)
- Performance (patterns problematicos)
- Aderencia aos padroes do projeto (detecta regras do CLAUDE.md)

Findings aparecem como comentarios inline no PR. Corrigir antes de merge.

---

## CODEOWNERS

O arquivo `.github/CODEOWNERS` define quem e responsavel por cada area.
PRs que tocam areas de outro owner notificam automaticamente o responsavel.
