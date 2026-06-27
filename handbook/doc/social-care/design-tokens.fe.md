# 01 · Design Tokens: Social Care Web

**Feature**: `specs/001-social-care-web/design-system/` · **Base**: [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) (tokens centralizados, zero-runtime via **vanilla-extract** CSS-in-TS), `src/styles/tokens.css.ts` (primitivos OKLCH) + `src/styles/contract.css.ts` (semânticos em `vars.*`)

> A camada base do Atomic Design. **Regra constitucional** ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)): `ui/` (atoms/molecules/organisms e
> `modules/*/client/ui`) **não** usa hex/rgb/hsl/px crus — só tokens (`vars.*`, notação vanilla-extract
> zero-runtime). A fonte de verdade dos literais vive em `tokens.css.ts` (primitivos OKLCH) e em
> `contract.css.ts` (semânticos via `createThemeContract`). O **governance test** (`tests/architecture/only-tokens.test.ts`,
> [ADR-0007](../../adr/0007-design-system-vanilla-extract.md)) roda em `bun test` e falha o CI em violação.
> Este doc mapeia os tokens que a feature usa e sinaliza **lacunas** (token novo necessário) — não inventa
> cor solta na tela.

## 1. Tokens existentes reutilizados

| Token (`vars.*`) | Valor | Uso na feature |
|---|---|---|
| `vars.color.actionPrimary` (+ `Hover`, `Active`, `Fg`) | `coral-500/600/700` (`oklch(62% 0.21 25)` = #E65C3B ACDG) | CTAs: "Novo paciente" (FAB), submit de forms, "Admitir" |
| `vars.color.bgPrimary` / `vars.color.bgSecondary` / `vars.color.bgElevated` | `warmgray-50/100` / branco | fundo do shell, cards do prontuário, dialogs |
| `vars.color.textPrimary` / `vars.color.textSecondary` / `vars.color.textDisabled` | `warmgray-900/600/400` | hierarquia textual em tabelas, fichas e labels |
| `vars.color.borderDefault` / `vars.color.borderStrong` / `vars.color.borderActive` | `warmgray-200/400`, `coral-500` | inputs, divisores de seção, campo focado |
| `vars.color.focusRing` + `vars.width.focusRing` + `vars.offset.focusRing` | `coral-500`, `2px`, `1px` | foco visível WCAG 2.2 AA em todo interativo |
| `vars.color.statusFila` / `vars.color.statusAcolhido` / `vars.color.statusAlta` / `vars.color.statusDesistente` | `warning-500` / `success-500` / `info-500` / `warmgray-500` | `M3StatusChip` ← enum `PatientStatus` (ver §3) |
| `vars.color.riskViolation` / `vars.color.riskOvercrowding` / `vars.color.riskDelay` / `vars.color.riskPrenatal` / `vars.color.riskDefault` | `danger-500` / `warning-500` / `warning-500` / `info-500` / `warmgray-500` | `M3RiskChip` ← `computedAnalytics` e agregados de Protection |
| `vars.color.textError` / `vars.color.borderError` | `danger-500` | mensagens de validação (espelham `AppError` 400 do backend) |
| `vars.color.success500` / `vars.color.warning500` / `vars.color.danger500` / `vars.color.info500` | OKLCH em `tokens.css.ts` | semáforos de indicadores, toasts, banners |
| `vars.spacing` (base 4/8: `2…96px`) · `vars.radius` (`sm…full`) · `vars.borderWidth` | `tokens.css.ts` | grid de forms, chips (`vars.radius.full`), cards (`vars.radius.lg`) |
| `vars.typography` (Atkinson Hyperlegible Next; `xs…4xl`; mono p/ CPF/NIS/UUID) | `tokens.css.ts` (fonte self-hosted via [ADR-0008](../../adr/0008-self-host-webfonts.md)) | corpo, títulos de seção, identificadores em fonte mono |
| `vars.elevation.stateLayer` (hover 0.08 / focus 0.12 / pressed 0.16) + `vars.elevation.shadow*` | `tokens.css.ts` | state layers M3 de botões/linhas clicáveis; dialogs |
| `vars.zIndex` (`dropdown…tooltip`) | `tokens.css.ts` | dialogs de transição de status, toasts de erro, tooltips |

## 2. Tokens novos propostos (se houver)

> Cada novo token exige adição em `tokens.css.ts` + `contract.css.ts` + justificativa. Evite — prefira reusar.

| Token proposto | Valor | Por que não dá pra reusar um existente |
|---|---|---|
| `vars.color.flowPendente` / `vars.color.flowConcluido` / `vars.color.flowCancelado` | `var(--warning-500)` / `var(--success-500)` / `var(--warmgray-500)` | `Referral.Status` (`PENDING/COMPLETED/CANCELLED`) e `LookupRequestStatus` (`pendente/aprovado/rejeitado`) são status de **fluxo**, não de paciente; usar `vars.color.status*` acoplaria chips genéricos à semântica do prontuário. Aliases derivados, custo zero (rejeitado mapeia em `vars.color.danger500`). |
| `vars.color.bannerLgpdBg` / `vars.color.bannerLgpdFg` | `var(--info-500)` com alpha / `var(--warmgray-900)` | banner permanente de prontuário anonimizado (`PatientPIIAnonymizedEvent`) precisa de superfície informativa própria, distinta de erro e de warning, e estável em dark mode. |

Nenhum primitivo novo: tudo deriva de paletas já existentes.

## 3. Mapa semântico (observado na evidência → token)

| Papel visual (evidência) | Cor/medida crua observada | Token canônico |
|---|---|---|
| `PatientStatus.waitlisted` → chip "Fila de espera" (ícone relógio) | âmbar | `vars.color.statusFila` |
| `PatientStatus.active` → chip "Acolhido" (ícone check) | verde | `vars.color.statusAcolhido` |
| `PatientStatus.discharged` → chip "Alta" (ícone seta ↑) | azul | `vars.color.statusAlta` |
| `PatientStatus.withdrawn` → chip "Desistente" (ícone ✕) | cinza | `vars.color.statusDesistente` |
| `violationReports.length > 0` → chip "Violação de direitos" | vermelho | `vars.color.riskViolation` |
| `computedAnalytics.housing.isOvercrowded` (densidade > 3.0) → chip "Sobrelotação" | âmbar | `vars.color.riskOvercrowding` |
| `computedAnalytics.educationalVulnerabilities.dropoutRisk > 0` → chip "Evasão escolar" | âmbar | `vars.color.riskDelay` |
| `healthStatus.gestatingMembers` sem `startedPrenatalCare` → chip "Pré-natal pendente" | azul | `vars.color.riskPrenatal` |
| `computedAnalytics.financial.vulnerabilityIndex` `high`/`medium`/`low` | vermelho/âmbar/verde | `vars.color.danger500` / `vars.color.warning500` / `vars.color.success500` |
| `Referral.Status` e `LookupRequestStatus` | âmbar/verde/cinza | `vars.color.flow*` (proposto, §2) |
| Erro de validação de campo (`AppError` 400: `HOUSING-001`, `SOCIO-001`…) | vermelho | `vars.color.textError` + `vars.color.borderError` |
| Conflito de versão (409, optimistic locking) → banner | âmbar | `vars.color.warning500` |
| Prontuário anonimizado (LGPD) → banner fixo | azul suave | `vars.color.bannerLgpd*` (proposto, §2) |
| CTA primário (cadastrar, salvar, admitir) | coral ACDG | `vars.color.actionPrimary*` |
| CPF/NIS/CNS/UUID exibidos | fonte mono | `vars.typography.fontFamilyMono` |
| Foco de teclado em qualquer interativo | anel coral 2px | `vars.color.focusRing` + `vars.width.focusRing` |

## 4. Lacunas / riscos

- **Sync entre `tokens.css.ts` e `contract.css.ts`**: primitivos vivem em `tokens.css.ts`; o contrato semântico (`createThemeContract`) em `contract.css.ts`. Mudou primitivo, atualizar o contrato — gate de revisão em [design-governance.fe.md](./design-governance.fe.md) §3. (No stack web_02, vanilla-extract garante erro de compilação se `vars.*` referenciado não existir — diferente da sync manual dupla do Tailwind.)
- **Dark mode parcial**: `.dark` (via `assignVars` do vanilla-extract) cobre só neutros (surface/text/border); `action/risk/status/flow` ainda sem override — chips em dark mode dependem de contraste do primitivo. Aceito para v1 ([ADR-0007](../../adr/0007-design-system-vanilla-extract.md)), reavaliar antes de habilitar toggle por padrão.
- **Daltonismo**: status e risco nunca podem depender só de cor — `M3StatusChip`/`M3RiskChip` já pareiam cor + ícone + label (manter como regra em [design-atoms.fe.md](./design-atoms.fe.md)).
- **`vars.color.riskDelay`** tem nome genérico para o papel "evasão escolar"; mantido por compatibilidade com o Figma 156:2, com label semântico via i18n (inconsistência #6 do [design-interface-inventory.fe.md](./design-interface-inventory.fe.md)).
- **Sem tokens de datepicker** ainda (componente `M3DateField` é novo) — deve compor exclusivamente tokens existentes; qualquer necessidade nova volta a este doc antes de codificar.
- Cores cruas observadas sem token: nenhuma — auditoria dos componentes `M3*` existentes não encontrou hex/px fora de `tokens.css.ts`/`contract.css.ts`.
- **Webfonts self-hosted** ([ADR-0008](../../adr/0008-self-host-webfonts.md)): Atkinson Hyperlegible Next servida de `public/fonts/*.woff2` — zero npm (`@fontsource` removido), zero IP a terceiros (LGPD), referenciada via `@font-face` em `src/styles/globals.css.ts`.

## Referências

- [Constituição web_02](../../../.specify/memory/constitution.md) — Princípio IV (Bun-Native/Zero-NPM-Utility; `vars.*` obrigatório), V (TypeScript estrito; referência a token inexistente é erro de compilação)
- [ADR-0007](../../adr/0007-design-system-vanilla-extract.md) — vanilla-extract como engine; `createThemeContract`; governance test `only-tokens`
- [ADR-0008](../../adr/0008-self-host-webfonts.md) — self-host `.woff2`; sem @fontsource
- [design-interface-inventory.fe.md](./design-interface-inventory.fe.md) — mapa EN→PT (§3) e inconsistências de tokens (§3.6)
- [design-atoms.fe.md](./design-atoms.fe.md) — uso de `vars.*` por átomo; regra cor+ícone+label
- [design-governance.fe.md](./design-governance.fe.md) — gate `only-tokens` em `bun test`; aprovação de maker para token novo
- Docs offline: `../../reference/ui/vanilla-extract/` · `../../reference/framework/solidstart/`
