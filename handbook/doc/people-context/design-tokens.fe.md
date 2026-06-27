# 01 · Design Tokens: People Context Web

**Feature**: `specs/002-people-context-web/design-system/` · **Base**: [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (tokens centralizados, zero-runtime via vanilla-extract CSS-in-TS), `src/styles/tokens.css.ts` (contrato tipado) + `src/styles/sprinkles.css.ts`

> A camada base do Atomic Design. **Regra constitucional** ([Princípio V](../../../.specify/memory/constitution.md)): `ui/` (atoms/molecules/organisms e
> `modules/*/client/ui`) **não** usa hex/rgb/hsl/px crus — só tokens (`vars.*` do vanilla-extract,
> `contract` do `createThemeContract`; referenciar token inexistente é **erro de compilação** — a
> verificação é feita em `tsc --noEmit` ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md))).
> A fonte de verdade dos literais vive em `tokens.css.ts` (primitivos OKLCH + contrato semântico).
> Este doc mapeia os tokens que a feature usa e sinaliza **lacunas** (token novo necessário) — não
> inventa cor solta na tela.
>
> Esta feature **reutiliza integralmente** a camada de tokens catalogada em
> [../social-care/design-tokens.fe.md](../social-care/design-tokens.fe.md) — nenhum primitivo novo; só aliases semânticos do
> domínio de pessoas (§2).

## 1. Tokens existentes reutilizados

| Token (`vars.*`) | Valor | Uso na feature |
|---|---|---|
| `vars.color.action.primary` (+ `hover`, `active`, `fg`) | `coral-500/600/700` (`oklch(62% 0.21 25)` ACDG) | CTAs: "Nova pessoa" (FAB), submit do `PersonForm`, "Provisionar login" |
| `vars.color.bg.primary` / `bg.secondary` / `bg.elevated` | `warmgray-50/100` / branco | fundo do shell, cards do detalhe da pessoa, dialogs |
| `vars.color.text.primary` / `text.secondary` / `text.disabled` | `warmgray-900/600/400` | hierarquia textual em tabela, fichas (`M3DataField`) e labels; linha de pessoa inativa esmaecida |
| `vars.color.border.default` / `border.strong` / `border.active` | `warmgray-200/400`, `coral-500` | inputs, divisores das seções Perfil/Vínculos/Acesso, campo focado |
| `vars.color.focus.ring` + `vars.width.focusRing` + `vars.offset.focusRing` | `coral-500`, `2px`, `1px` | foco visível WCAG 2.2 AA em todo interativo |
| `vars.color.success[500]` | `oklch(58% 0.16 145)` | pessoa/vínculo/login ativos (via aliases §2); toast de sucesso |
| `vars.color.warning[500]` | `oklch(72% 0.18 75)` | `IdpRetryBanner` (207 Multi-Status); conflito `409` (`PEO-005/006/008`, `ROL-009`) |
| `vars.color.danger[500]` | `oklch(58% 0.21 25)` | ações destrutivas (desativar, **erasure LGPD**); erros `502 IDP-*` |
| `vars.color.info[500]` | `oklch(60% 0.15 245)` | confirmação `202` do reset de senha ("link enviado por e-mail") |
| `vars.color.text.error` / `vars.color.border.error` | `danger-500` | validação de campo (espelha `PEO-001`/`ROL-001` 400 do backend) |
| `vars.spacing` (base 4/8: `2…96px`) · `vars.radius` (`sm…full`) · `vars.borderWidth` | `tokens.css.ts` | grid do `PersonForm`, badges (`radius.full`), cards (`radius.lg`) |
| `vars.typography` (Atkinson Hyperlegible Next; `xs…4xl`; **mono p/ CPF/UUID**) | `tokens.css.ts` | corpo, títulos de seção; CPF e `idpUserId` em fonte mono (self-hosted `.woff2`, [ADR-0008](../../adr/0008-self-host-webfonts.md)) |
| `vars.elevation.stateLayer` (hover 0.08 / focus 0.12 / pressed 0.16) + `elevation.shadow` | `tokens.css.ts` | linhas clicáveis da `PersonTable`; dialogs |
| `vars.zIndex` (`dropdown…tooltip`) | `tokens.css.ts` | `ErasureDialog` (modal), menus kebab, toasts |

## 2. Tokens novos propostos (se houver)

> Cada novo token exige adição em `tokens.css.ts` (vanilla-extract `createThemeContract`) + justificativa.
> Evite — prefira reusar. O gate de compilação (`tsc --noEmit`) detecta token inexistente.

| Token proposto | Valor | Por que não dá pra reusar um existente |
|---|---|---|
| `vars.color.personActive` / `vars.color.personInactive` | `vars.color.success[500]` / `vars.color.warmgray[500]` | os tokens `color.status.*` existentes (`acolhido/fila/alta/desistente`) carregam a semântica da máquina de estados do **prontuário** (`PatientStatus`); o registro de pessoas tem só um boolean `active` — alias próprio evita acoplar `M3ActiveBadge` ao vocabulário do social-care. Custo zero (derivados). |
| `vars.color.idpLinked` / `vars.color.idpNone` / `vars.color.idpFailed` | `vars.color.success[500]` / `vars.color.warmgray[500]` / `vars.color.warning[500]` | o estado de provisão IdP (`idpUserId` presente · `null` · criação 207 com falha de provisão) é um eixo **independente** de `active` e aparece em lista, header e painel de acesso (`M3LoginIndicator`); usar semáforos crus espalharia a decisão de mapeamento por componente. |

Nenhum primitivo novo: tudo deriva de paletas já existentes. Os aliases `color.flow.*` e `color.bannerLgpd.*` propostos pelo social-care ([../social-care/design-tokens.fe.md](../social-care/design-tokens.fe.md) §2) **não** são necessários aqui — o aviso LGPD desta feature é de **ação destrutiva** (erasure), não de estado anonimizado, e usa `vars.color.danger[500]`.

## 3. Mapa semântico (observado na evidência → token)

| Papel visual (evidência) | Cor/medida crua observada | Token canônico |
|---|---|---|
| `Person.active === true` → badge "Ativa" | verde | `vars.color.personActive` (proposto, §2) |
| `Person.active === false` → badge "Inativa" + linha esmaecida | cinza | `vars.color.personInactive` + `vars.color.text.disabled` |
| `SystemRole.active === true` → chip `social-care:patient` | verde/neutro com borda | `vars.color.personActive` (borda) + `vars.color.border.default` |
| `SystemRole.active === false` → chip esmaecido | cinza | `vars.color.personInactive` + `vars.color.text.disabled` |
| `idpUserId != null` → indicador "Tem login" | verde | `vars.color.idpLinked` (proposto, §2) |
| `idpUserId === null` → indicador "Sem login" | cinza | `vars.color.idpNone` |
| `201` esperado mas veio `207 Multi-Status` → banner "login não provisionado" + retry | âmbar | `vars.color.idpFailed` + `vars.color.warning[500]` (banner) |
| Erasure LGPD (DELETE superadmin, irreversível) → botão + dialog | vermelho | `vars.color.danger[500]` (variant `destructive` do `M3Button`) |
| Erro `502 IDP-001..005` (IdP fora, mutação abortada) | vermelho | `vars.color.danger[500]` |
| Conflito `409` (`PEO-005/006/008`, `ROL-009`) → banner/toast | âmbar | `vars.color.warning[500]` |
| `202` reset de senha aceito → aviso informativo | azul | `vars.color.info[500]` |
| Erro de validação de campo (`PEO-001`, `PEO-004`, `ROL-001` 400) | vermelho | `vars.color.text.error` + `vars.color.border.error` |
| CTA primário (cadastrar, salvar, provisionar) | coral ACDG | `vars.color.action.primary*` |
| CPF / `PersonId` / `idpUserId` exibidos | fonte mono | `vars.typography.fontFamily.mono` |
| Foco de teclado em qualquer interativo | anel coral 2px | `vars.color.focus.ring` + `vars.width.focusRing` |

## 4. Lacunas / riscos

- **Gate de compilação** (vanilla-extract): referenciar `vars.*` inexistente é erro de `tsc --noEmit`. Os aliases novos (§2) devem entrar em `tokens.css.ts` + `createThemeContract` antes do primeiro uso — gate em [./design-governance.fe.md](./design-governance.fe.md) §3.
- **Dark mode parcial**: `.dark` cobre só neutros; os aliases `color.person*`/`color.idp*` herdam a limitação dos semáforos (sem override dark). Aceito para v1 (mesma decisão do social-care).
- **Daltonismo**: `M3ActiveBadge` e `M3LoginIndicator` nunca dependem só de cor — cor + ícone + label sempre (regra reforçada em [./design-atoms.fe.md](./design-atoms.fe.md)).
- **Sem token para "papel/sistema"**: `M3RoleBadge` é deliberadamente **neutro** (borda + mono) — colorir por sistema (`social-care` verde, `therapies` azul…) criaria uma escala não-semântica; se a necessidade surgir, volta a este doc antes de codificar.
- Cores cruas observadas sem token: nenhuma — a feature nasce sobre componentes `M3*` já auditados (nenhum hex/px fora de `tokens.css.ts`).

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio V (TypeScript estrito; token inexistente = erro de compilação)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine; `createThemeContract`; só-tokens
- [ADR-0008](../../adr/0008-self-host-webfonts.md) — Self-host `.woff2`; zero CDN; Atkinson Hyperlegible Next
- [./design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — Inventário de elementos visuais que usam estes tokens
- [./design-atoms.fe.md](./design-atoms.fe.md) — Átomos que consomem `vars.color.personActive/Inactive` e `vars.color.idp*`
- [./design-governance.fe.md](./design-governance.fe.md) — Gate de revisão: sync de contrato tipado (§3)
- [../social-care/design-tokens.fe.md](../social-care/design-tokens.fe.md) — Tokens base reutilizados (paleta completa)
- Docs offline: [../../reference/ui/vanilla-extract/](../../reference/ui/vanilla-extract/)
