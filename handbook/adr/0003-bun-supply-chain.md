[← Voltar para ADRs](./README.md)

# ADR-0003: Bun como package manager + supply-chain hardening (default-secure)

- **Status:** Accepted (substitui o ADR-0003 "pnpm v11" do web/React)
- **Date:** 2026-05-29 · **Reescrito:** 2026-06-12 (stack web_02: Bun no lugar de pnpm) · **Amendado:** 2026-06-12 (globalStore + runtime sem `node_modules`)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

O web/React rodava com **pnpm v11** pinado + hardening de supply-chain em `pnpm-workspace.yaml`
(`allowBuilds`, `minimumReleaseAge`, `trustPolicy`, etc.). O web_02 troca o runtime/PM para **Bun**
(regra Bun-native, [README](./README.md)) — então a política precisa ser **reexpressa nos termos do Bun**,
não portada 1:1. Bun é, ao mesmo tempo, runtime, test runner, bundler **e** package manager; reduzir a
superfície npm é o objetivo.

Risco real (inalterado): pacotes comprometidos costumam atacar via `postinstall`; versões recém-publicadas
são a janela de exposição antes da detecção; phantom-deps escondem acoplamento não-declarado.

## Decisão

**Usar o package manager do Bun** (`bun install` / `bun.lock`) e aplicar **supply-chain hardening com os
mecanismos nativos do Bun** — que já são *default-secure*:

1. **Lifecycle scripts bloqueados por padrão (`trustedDependencies`).** Diferente do npm, o Bun **não
   executa** `postinstall`/`preinstall` arbitrários. Quem precisa rodar build script entra numa allowlist
   explícita em `package.json`:
   ```jsonc
   { "trustedDependencies": ["esbuild"] }   // só os listados; substitui a default-list embutida
   ```
   Equivale ao `allowBuilds` do pnpm. Definir o array **substitui** a lista embutida do Bun (não estende) —
   então inclui-se explicitamente cada pacote com script legítimo (ex.: `esbuild`, trazido pelo Vinxi/Vite).
   Para travar tudo: `trustedDependencies: []` ou `install.ignoreScripts = true` no `bunfig.toml`.

2. **Security Scanner API** no `bunfig.toml` — varre pacotes **antes** de instalar (CVEs, pacotes
   maliciosos, licença), com níveis `fatal` (cancela o install) e `warn`:
   ```toml
   [install.security]
   scanner = "@acme/bun-security-scanner"
   ```

3. **Isolated installs (`--linker isolated`) + global virtual store (`globalStore`)** — layout não-hoisted
   estilo pnpm (`node_modules/.bun/` + symlinks), que **previne phantom dependencies** e dá resolução
   determinística. É o **default** para workspaces novos (`configVersion = 1`). Ligamos também o **global
   virtual store** (off por default; só funciona com o isolated linker): em vez de copiar os arquivos de
   cada pacote para dentro do projeto, o `node_modules` vira uma **árvore fina de symlinks** apontando para
   um store global compartilhado (`<cache>/links/`). Fixado em `bunfig.toml`:
   ```toml
   [install]
   linker = "isolated"
   globalStore = true
   ```
   Efeito medido (fixture de ~1.400 pacotes): `node_modules` cai de **391 MB → ~5 MB de symlinks** por
   projeto (store compartilhado entre worktrees/CI) e install morno fica **~6,6× mais rápido**. **Não
   elimina** a pasta `node_modules` (o toolchain Vinxi/Vite/Nitro exige ela em dev/build) — só a deixa
   leve. A eliminação real é no **runtime** (item 7).

4. **`bun audit` no CI** — checa os pacotes instalados contra os advisories do npm; `--audit-level=high`,
   `--prod`, `--ignore <CVE>`; sai com código **1** se houver vulnerabilidade (quebra o pipeline).

5. **Lockfile `bun.lock` commitado**; CI roda **`bun install --frozen-lockfile`** (builds reprodutíveis).

6. **`Dockerfile` na imagem `oven/bun`** (pin de versão), copiando `bun.lock` + `bunfig.toml` antes do
   install para aproveitar cache e validar frozen-lockfile.

7. **Runtime de produção SEM `node_modules`** — `node_modules` é tratado como **artefato de build**, ausente
   da imagem de runtime. Dois mecanismos, ambos nativos do Bun:
   - **Bundle do SolidStart** — `bun run build` usa o **Nitro preset `bun`** e gera `.output/server/index.mjs`
     com as dependências **empacotadas**. A imagem final roda `bun .output/server/index.mjs` **sem nenhum
     `node_modules`** (validado no spike de 2026-06-12: SSR + `/api/health` rodando a partir do `.output/`).
   - **Binário standalone (opcional)** — entrypoints isolados (ex.: um worker/CLI do BFF) podem ir além com
     **`bun build --compile --outfile <bin>`**, gerando um **executável único** (sem `node_modules` e sem
     exigir o Bun instalado; cross-target via `--target=bun-linux-arm64` etc.).
   - **Docker multi-stage:** estágio `build` faz `bun install` (gera `node_modules`) + `bun run build`; o
     estágio `runtime` copia **só** o `.output/` (e o necessário), descartando `node_modules`.

## Consequências

**Positivas**
- Builds reprodutíveis (mesma versão de Bun em dev/CI/Docker).
- **`postinstall` bloqueado por padrão** sem precisar de flag por install — superfície de ataque menor que
  npm/yarn já no default.
- Isolated linker mata phantom-deps (reforça as fronteiras do [ADR-0001](./0001-vertical-modular-architecture.md)).
- **Uma ferramenta** (Bun) cobre PM + runtime + test + bundle → menos toolchain npm para auditar.
- **`node_modules` enxuto em dev** (~5 MB de symlinks com `globalStore`) e **runtime de produção
  node_modules-free** (bundle `.output` do Nitro) — superfície de disco/imagem e de auditoria menor.

**Negativas / custos**
- **Não há equivalente nativo ao `minimumReleaseAge`** do pnpm (quarentena de N dias para versões novas).
  Mitigação: confiar no **Security Scanner API** (que detecta pacote malicioso na hora) + `bun audit` no CI;
  se a quarentena por idade for requisito duro, ela vira responsabilidade de um scanner customizado, não do PM.
- `trustedDependencies` substitui (não estende) a default-list → manter a allowlist quando um dep legítimo
  (ex.: `esbuild`/`sharp`) precisar de script.
- Isolated installs podem quebrar pacotes que assumem `node_modules` flat (raro no nosso stack) — fallback
  `--linker hoisted` documentado por exceção.

**Neutras**
- Migração pnpm→Bun reescreve o `node_modules` (layout `.bun/`) — aceito uma vez.
- Em dev a pasta `node_modules` **continua existindo** (Vinxi/Vite/Nitro a varrem) — o `globalStore` só a
  encolhe. A ausência total só vale no runtime de produção (item 7).

## Alternativas consideradas

- **Manter pnpm v11** (como no web/React) — rejeitada pela regra **Bun-native/zero-npm**: manteria um PM
  npm e o corepack fora do Bun; o web_02 unifica tudo no Bun.
- **`bun install` sem hardening** (defaults só) — rejeitada: os defaults já bloqueiam scripts, mas sem
  scanner/isolated/audit a governança fica incompleta para um ERP.
- **`dangerously` rodar todos os scripts / `--linker hoisted` global** — rejeitada (anula proteções).
- **Eliminar `node_modules` em dev via auto-install do Bun** (`rm -rf node_modules` → resolução Bun-style do
  cache global, sem pasta) — **rejeitada**: serve a scripts/arquivos avulsos, mas o toolchain do SolidStart
  (Vinxi/Vite/Nitro) faz resolução estilo Node e **percorre `node_modules`**, e perde-se IntelliSense (os
  `.d.ts` vivem em `node_modules`). A pasta enxuta (`globalStore`) + runtime node_modules-free entrega o
  objetivo sem esse custo.

## Referências

- `package.json` (`trustedDependencies`) · `bunfig.toml` (`[install.security]`, `linker`, `globalStore`) · `bun.lock` · `Dockerfile` (multi-stage) · `app.config.ts` (Nitro preset `bun`)
- `handbook/reference/runtime/bun/pm/{lifecycle,security-scanner-api,isolated-installs,lockfile,global-store}.mdx`
- `handbook/reference/runtime/bun/pm/cli/audit.mdx` · `handbook/reference/runtime/bun/bundler/executables.mdx` (`--compile`) · `.../runtime/auto-install.mdx`
- `.specify/memory/constitution.md` §IX (reescrito de "pnpm + supply-chain" para "Bun + supply-chain")
- [ADR-0001](./0001-vertical-modular-architecture.md) (isolated installs reforçam as boundaries)
