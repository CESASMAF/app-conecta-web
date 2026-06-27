# ADR-0007 — vanilla-extract como engine do design system

**Status:** Accepted · **Data:** 2026-05-30 · **Atualizado:** 2026-06-12 (integração Vinxi/SolidStart; supply-chain Bun)
**Decisores:** Gabriel (Tech Lead)
**Contexto da spec:** `specs/004-design-tokens/`

---

## Contexto

O web_02 precisa de uma camada de estilização para o design system compartilhado (`src/shared/ui/`), com
fidelidade visual e organização **Atomic Design** (tokens → atoms → molecules → organisms). A escolha
respeita a constituição: TS estrito (§VII), dependências mínimas (§VIII), **Bun + supply-chain hardening**
(§IX, [ADR-0003](./0003-bun-supply-chain.md)) e **SSR (SolidStart + Vinxi/Nitro)**.

Foram avaliadas (spikes reais): CSS Modules, Tailwind v4, styled-components, **vanilla-extract** e
**Panda CSS**. Os dois finalistas (VE e Panda) buildaram com SSR + CSS estático zero-runtime.

## Decisão

Adotar **vanilla-extract** (`@vanilla-extract/css` runtime de autoria + `@vanilla-extract/vite-plugin`
build) como engine de estilização do design system.

- **Zero-runtime:** estilos em `*.css.ts` são compilados em **CSS estático** no build (sem custo de runtime,
  SSR-safe).
- **Type-safe:** tokens via `createThemeContract` + `createGlobalTheme`; referenciar token inexistente é
  **erro de compilação**.
- **Atomic Design** em `src/shared/ui/`: `tokens/` → `atoms/` → `molecules/` → `organisms/`. Qualquer
  `client-ui` de feature importa de `shared-ui`. Fronteira garantida por **governance test (`bun:test`)**,
  não por `eslint-plugin-boundaries` (regra Bun-native).
- **Integração:** `vanillaExtractPlugin()` entra na lista de **vite plugins do `app.config.ts`** (Vinxi),
  **antes** do plugin do SolidStart — espelha o "1º plugin do Vite" do web/React, agora no config do Vinxi.
- **Supply-chain:** instala limpo sob o hardening do [ADR-0003](./0003-bun-supply-chain.md). O `esbuild`
  (trazido pelo Vite/Vinxi) precisa rodar build script → entra em **`trustedDependencies: ["esbuild"]`**
  no `package.json` (allowlist do Bun; equivale ao antigo `allowBuilds`).

## Consequências

**Positivas:**
- CSS estático **em produção** → sem FOUC, sem runtime de estilização, SSR previsível (ver trade-off de dev abaixo).
- Tokens tipados → guard-rail contra regressão visual (uso inválido não compila).
- Footprint pequeno e sem postinstall próprio → aderente ao §VIII e ao §IX.
- Contrato ≠ valores → tema dark futuro sem reescrever consumidores.

**Negativas / trade-offs:**
- Não traz baterias prontas (recipes/patterns como o Panda) — átomos e variantes são escritos à mão
  (`style`/`styleVariants`/`recipe` — ver `handbook/reference/ui/vanilla-extract/`).
- Anti-regressão de "só tokens" exige enforcement próprio: como não há ESLint (Bun-native), a regra
  "componente só consome `tokens.*`, nunca hex cru" vira **governance test em `bun:test`** que varre
  `*.css.ts` por literais de cor fora do contrato.
- **FOUC em desenvolvimento é esperado (não é bug).** Em `bun run dev` (Vinxi) o Vite **não** extrai `.css`
  estático: cada `*.css.ts` vira um módulo JS que injeta `<style>` no `<head>` em runtime (boot/HMR). Logo
  o HTML do SSR chega sem estilo e o CSS só "pinta" quando o bundle do client roda → um flash breve na
  primeira carga. Some no build de produção, onde o VE extrai `.css` real e o SSR do SolidStart o referencia
  via `<link rel="stylesheet">` ("styled before hydration"). **Teste discriminante:** o FOUC some em
  `bun run build && bun run start`; confirme via *View Source* / `curl -s <url> | grep -i '<link\|<style'`
  (não pelo DevTools, que mostra o DOM já hidratado). É o trade-off aceito do zero-runtime. O
  `'unsafe-inline'` em `style-src` da CSP existe exatamente para permitir esses `<style>` injetados em dev
  (ver [ADR-0006](./0006-security-headers-csp.md)).

## Alternativas consideradas

- **Panda CSS:** venceu em DX (recipes/patterns + ESLint oficial anti-regressão). **Rejeitado** por dois
  motivos: (a) depende fortemente de **ESLint** para a anti-regressão de tokens — fora da regra Bun-native
  (sem plugin npm de lint); (b) traz mais superfície de deps/codegen. *(Nota: o motivo original — o pin
  `chokidar@4.0.3` disparar `ERR_PNPM_TRUST_DOWNGRADE` no `trustPolicy: no-downgrade` do pnpm — **não se
  aplica mais** no web_02, pois o Bun não tem `trustPolicy`/`minimumReleaseAge`; a rejeição agora se apoia
  em DX-via-ESLint + footprint.)*
- **Tailwind v4:** engine Oxide (binário nativo com build script) adiciona atrito de supply-chain (entraria
  em `trustedDependencies`) e governança de classes utilitárias soltas. Rejeitado.
- **styled-components / CSS-in-JS runtime:** SSR frágil, custo de runtime, projeto em maintenance mode. Rejeitado.
- **CSS Modules:** zero deps e válido, mas sem type-safety de tokens nativa. Mantido como "plano B"; VE
  preferido pela tipagem do contrato de tokens.

---

## Referências

- Constituição §VII (TS estrito), §VIII (Minimal Dependencies), §IX (Bun + supply-chain).
- [ADR-0003](./0003-bun-supply-chain.md) (`trustedDependencies` p/ `esbuild`).
- [ADR-0008](./0008-self-host-webfonts.md) (self-host de webfonts) — decisão irmã; `font.family.*` são tokens.
- `specs/004-design-tokens/` — spec + research.md (spikes comparativos).
- `handbook/reference/ui/vanilla-extract/` — doc curada + APIs (`style`, `styleVariants`, `recipe`, tokens).
- `app.config.ts` (vite plugins / Vinxi) · `package.json` (`trustedDependencies`).
