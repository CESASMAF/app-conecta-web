# ADR-0008 — Self-host de webfonts via `.woff2` manual (sem npm)

**Status:** Accepted (substitui o ADR-0008 "@fontsource" do web/React — **decisão invertida** pela regra Bun-native)
**Data:** 2026-05-30 · **Reescrito:** 2026-06-12 (zero-npm: woff2 manual no lugar de `@fontsource`) · **Emendado:** 2026-06-25 (famílias reais: **Atkinson Hyperlegible Next/Mono** — a identidade usa Atkinson por hiperlegibilidade/WCAG, ver `theme.css.ts`; corrige a menção legada a Inter/Nunito/JetBrains)
**Decisores:** Gabriel (Tech Lead)
**Contexto da spec:** `specs/004-design-tokens/`

---

## Contexto

A identidade tipográfica usa **Atkinson Hyperlegible Next** (texto/UI) e **Atkinson Hyperlegible Mono**
(código/dados) — fontes desenhadas para **hiperlegibilidade**, que é valor de produto num app de saúde
(acessibilidade WCAG 2.2 AA). As famílias são os tokens `vars.font.{sans,mono}` em `tokens/theme.css.ts`.
Carregar de **CDN Google Fonts** envia o IP do usuário a terceiros (LGPD), depende de domínio externo, abre
risco de FOUC/offline e complica a CSP do hardening ([ADR-0006](./0006-security-headers-csp.md)). Logo:
**self-host** é obrigatório (constituição §I BFF-boundary, §VIII deps mínimas).

A questão é **como** self-hospedar. O web/React resolvia via **`@fontsource`** (pacote npm com os `.woff2`).
No web_02 vale a regra **Bun-native / zero-npm-utility** ([README](./README.md)): `@fontsource` é uma
dependência npm cujo único conteúdo são **assets** — não há código a reusar do ecossistema. Trazer um pacote
npm só para empacotar arquivos `.woff2` é exatamente o tipo de dependência que a regra elimina.

## Decisão

**Self-host dos `.woff2` de forma manual, versionados no próprio repo** (sem pacote npm):

- Os arquivos ficam em **`public/fonts/`** (`atkinson-hyperlegible-next-latin-wght-normal.woff2`,
  `atkinson-hyperlegible-mono-latin-wght-normal.woff2` — `.woff2` **variable**, subset `latin` cobre
  PT-BR) — servidos same-origin pelo SolidStart/Caddy.
- Os `@font-face` são declarados **uma vez** num `*.css.ts` global do design system (vanilla-extract,
  [ADR-0007](./0007-design-system-vanilla-extract.md)); os tokens `font.family.*` referenciam as famílias
  com fallback de sistema. `font-display: swap`. Nenhuma chamada a domínio externo.
- **Aquisição reprodutível via script Bun** (não vira dependência de runtime): um `scripts/fetch-fonts.ts`
  roda com `bun run` e baixa os `.woff2` oficiais (Google Fonts/upstream) para `public/fonts/`, fixando a
  versão/origem num cabeçalho de comentário. Reexecutável, auditável, **zero `node_modules` de fonte**.

## Consequências

**Positivas:**
- Privacidade/LGPD: zero IP do usuário a terceiros; nada de `fonts.gstatic.com`.
- Sem FOUC, funciona offline e no Docker; alinhado ao BFF-boundary (§I) e à CSP (sem origem externa de fonte).
- **Zero dependência npm** (cumpre a regra Bun-native ao pé da letra) — os `.woff2` são assets do repo, não
  pacotes. Sem entrada de fonte no `package.json`/`bun.lock`.

**Negativas / trade-offs:**
- Os `.woff2` entram no repo/output (peso de assets — esperado para self-host).
- **Sem versionamento/provenance via lockfile** (que o `@fontsource` dava): a integridade passa a depender
  do `scripts/fetch-fonts.ts` (origem + hash fixados no script) e do versionamento git dos próprios arquivos.
  Trade-off **aceito** — é o custo de não trazer dep npm. (Era exatamente a objeção que o ADR original fazia
  ao manual; sob a regra Bun-native, ela é o preço a pagar e o script mitiga a parte de reprodutibilidade.)
- Atualizar fonte = rodar o script + commitar o novo `.woff2` (processo manual explícito).

## Alternativas consideradas

- **`@fontsource` (como o web/React):** entregava self-host + provenance via lockfile e risco de execução
  nulo (só `.woff2`+`.css`, zero scripts/deps transitivas). **Rejeitado** no web_02 **pela regra
  Bun-native/zero-npm** — é uma dependência npm que só empacota assets; preferimos os arquivos no repo.
  *(Era a decisão **escolhida** no ADR original; aqui ela inverte por causa da regra.)*
- **CDN Google Fonts:** rejeitado — vaza IP do usuário (LGPD), domínio externo, FOUC/offline, complica CSP.
- **Fontes de sistema (sem webfont):** rejeitado — zero custo, mas quebra a fidelidade visual.

---

## Referências

- Constituição §I (BFF-Orchestrated Boundary), §VIII (Minimal Dependencies), §IX (Bun + supply-chain).
- [README dos ADRs](./README.md) — regra Bun-native/zero-npm (motivo da inversão).
- [ADR-0007](./0007-design-system-vanilla-extract.md) — `@font-face` no `*.css.ts`; `font.family.*` são tokens.
- `public/fonts/` (os `.woff2`) · `scripts/fetch-fonts.ts` (aquisição reprodutível via `bun run`).
- `specs/004-design-tokens/` — spec, research.md (R1), data-model.md.
