[← Voltar para ADRs](./README.md)

# ADR-0011: Sem mocks em código de produção — `not-implemented` como placeholder

- **Status:** Accepted
- **Date:** 2026-06-06 · **Atualizado:** 2026-06-12 (enforcement em `bun:test`; sem ESLint)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

Módulos podem nascer com mocks server-side para iterar sem o backend: `get-contract-mock`,
`list-partners-mock` e fallbacks inline que devolvem dado fabricado quando não há sessão ou a API está fora.
O problema: um mock que vive em `src/` e é cabeado como fallback **mente para a UI** — a tela mostra um
contrato que não existe, esconde falhas reais de auth/rede e cria divergência silenciosa quando o backend
evolui. Isso colide com [ADR-0002](./0002-errors-as-values.md) (erros são valores, nada de estado falso) e
com [ADR-0010](./0010-bff-orchestration-fn-naming.md) (o BFF entrega a verdade, não um teatro).

## Decisão

**Nada de mock em código de produção (`src/`).** Uma operação que o backend ainda não expõe retorna o
erro-de-valor **`'not-implemented'`** (mapeado para tag i18n e tratado no `switch` exaustivo da UI), nunca
um dado fabricado.

- **Proibido em `src/`:** arquivos `*-mock.*` / `*.mock.*`, identificadores `MOCK_*`, imports de módulos
  `*mock*`, e "dev fallback" que devolve objeto fabricado.
- **Permitido:** **fixtures de teste** sob `tests/` (ex.: `tests/**/fixtures/*.fixture.ts`) — são dados de
  teste, não entram no bundle.
- **Placeholder honesto:** `Result.err('not-implemented')` na borda (rota Elysia / repository do client).

Enforcement (tool-agnóstico — vale para Claude/Kimi/Codex, roda em **`bun test`**):
- **Governance test** (`tests/architecture/no-mocks-in-src.test.ts`, em **`bun:test`**): varre `src/` e
  **falha** se houver arquivo `*-mock.*`/`*.mock.*` ou identificador `MOCK_*`.
- Por que governance test e **não** uma regra de lint: o web_02 segue a regra **Bun-native/zero-npm** — não
  há `eslint-plugin-*` no projeto. O mesmo runtime que roda os testes (`bun:test`) faz a varredura de `src/`
  inteiro, sem depender de toolchain npm de lint (mesmo padrão dos boundaries — [ADR-0001](./0001-vertical-modular-architecture.md)
  e [ADR-0009](./0009-framework-agnostic-client.md)).

## Consequências

**Positivas**
- A UI nunca exibe dado falso; falhas reais (auth, rede, rota ausente) aparecem como tais.
- O que falta no backend fica **visível e rastreável** (`not-implemented`), não escondido atrás de mock.
- Enforcement **sem dependência npm** — o próprio `bun test` garante.

**Negativas / custos**
- Sem backend rodando, telas que dependem de rota ausente mostram erro em vez de dado — é o comportamento
  correto, mas exige os serviços (ou a stack local) para um happy-path local.

**Neutras**
- Fixtures de teste seguem livres em `tests/`.

## Amendamento (2026-06-12) — estratégia de teste de UI: render real via smoke SSR, sem DOM falso

Corolário deste ADR aplicado à **camada visual** (fase client da feature 001). Não fazemos *mock* do DOM
nem "asserção contra HTML simulado": componentes estilizados são validados pelo **render real**.

- **Por que não DOM unit test em `bun:test`:** os componentes usam vanilla-extract ([ADR-0007](./0007-design-system-vanilla-extract.md)).
  Os `.css.ts` **exigem o transform de build** do v-e (que injeta o *file scope* via `setFileScope`); sob
  `bun:test` puro, `createGlobalTheme`/`style()` chamam `getFileScope()` e **lançam** (`Styles were unable to
  be assigned to a file` / `created styles outside of a '.css.ts' context`). `@vanilla-extract/css/disableRuntimeStyles`
  desliga a *injeção* de CSS, **não** o requisito de file-scope — não resolve.
- **Por que não Playwright/browser E2E:** é dependência npm — **proibida** pela Constituição **Princ. IV
  (Bun-native/zero-npm)**. Não introduzimos um runner de browser só para isso.
- **O que fazemos então (validado nesta feature):**
  1. **Lógica pura em `bun:test`** — ViewModels e predicados sem `.css.ts`: `login.view-model.test.ts`,
     `shell/root.view-model.test.ts`, `page-guard.test.ts`, `safe-redirect.test.ts`.
  2. **Smoke SSR contra o build** — onde o vite **compila** o v-e de verdade: `bun run build` + subir
     `.output/server` e `curl` afirmando o HTML real (card de login renderiza; shell renderiza com sessão
     real plantada no Redis — topbar/nav/usuário; guard devolve **302** sem sessão; CSS hash do v-e linkado;
     bundle client **sem** vestígio de servidor).

Consequência honesta (alinhada ao ADR): a view "burra" não tem teste de unidade de DOM, mas **tem render
real** no gate de build — não trocamos verdade por um DOM fabricado.

## Alternativas consideradas

- **Mock como fallback dev** — rejeitada: mente para a UI, esconde falhas, diverge do backend (este ADR).
- **Feature flag ligando mock** — rejeitada: mesma mentira, com mais superfície de configuração.
- **Regra de ESLint (`no-restricted-syntax`/`no-restricted-imports`)** — rejeitada pela regra **Bun-native**:
  não há ESLint no web_02; o governance test em `bun:test` cobre `src/` inteiro sem esse toolchain.

## Referências

- [ADR-0002](./0002-errors-as-values.md) — erros como valores; base do `'not-implemented'`.
- [ADR-0010](./0010-bff-orchestration-fn-naming.md) — BFF entrega a verdade; client não compõe.
- `tests/architecture/no-mocks-in-src.test.ts` (`bun:test`) — o enforcement.
