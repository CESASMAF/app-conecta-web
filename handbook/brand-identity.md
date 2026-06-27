# 🎨 Identidade Visual & Tom — Raros Boa Vista

> Referência canônica da marca para as telas do `web_02` (extraída do site oficial: CSS, screenshots, HTML).
> **Fonte de verdade visual.** Ao construir telas, derivar os design tokens (vanilla-extract, ADR-0007) destes valores.
> Tagline oficial: **"Cuidado, Amor e Inclusão"** · Local: **Boa Vista — Roraima, Brasil**.

## 🖌️ Paleta de cores

### Primárias (CSS variables do `:root`)
| Variável | Hex | Uso |
|---|---|---|
| `--purple` / `--blue` | `#703cc0` | Cor principal da marca, links, ícones |
| `--magenta` | `#9618ba` | Gradiente, destaques |
| `--turquoise` | `#00c2d1` | Saúde/categoria, ícones |
| `--blue-accent` | `#267ce8` | Botão primário (CTA), hover |
| `--blue-dark` | `#5b2ea0` | Hover do roxo |

### Gradiente da marca
```css
--brand-gradient: linear-gradient(135deg, #703cc0, #9618ba 45%, #267ce8);
```
Roxo → magenta → azul. Usado em banners internos e no botão `.btn-join` do menu.

### Interface
| Variável | Hex | Uso |
|---|---|---|
| `--ink` | `#111827` | Títulos (H1–H4) |
| `--body` | `#374151` | Texto de corpo |
| `--muted` | `#6b7280` | Texto secundário (descrições de card) |
| `--faint` | `#9aa3af` | Datas, metadados |
| `--line` | `#e8eaee` | Bordas, divisores |
| `--line-soft` | `#eef0f3` | Bordas mais suaves |
| `--bg` | `#f3f4f6` | Fundo geral da página |
| `--card` | `#ffffff` | Fundo dos cards |

### Por categoria (badges)
| Categoria | Texto | Fundo (soft) |
|---|---|---|
| Ações Sociais / News | `#267ce8` azul | `#dbeafe` |
| Saúde | `#00c2d1` turquesa | `#cdf6f9` |
| Tecnologia | `#703cc0` roxo | `#ede4fb` |
| Tutoriais | `#9618ba` magenta | `#f3def8` |
| Eventos | `#ea580c` laranja | `#ffedd5` |

## 🔤 Tipografia

**Fonte única: Poppins** (Google Fonts) — sem-serif geométrico moderno.

| Elemento | Tamanho | Peso |
|---|---|---|
| H1 (hero) | 54px | 800 (ExtraBold) |
| H2 (seções) | 36px | 800 |
| H2 (lista posts) | 26px | 800 |
| H3 (cards) | 17px | 700 |
| H4 (footer) | 14px | 700 |
| Body / parágrafos | 16px | 400 |
| Subtexto descritivo | 14px | 400 |
| Datas / meta | 13px | 400 |
| Badges / labels | 11px | 700 (uppercase, letter-spacing 0.06–0.1em) |

- Line-height body: **1.55** · títulos: **1.1–1.18**
- Letter-spacing títulos: **-0.01em a -0.025em** (negativado, dá peso visual)

> ✅ **Decidido (2026-06-26):** as telas do app usam **Atkinson Hyperlegible** (ADR-0008 — legibilidade máxima para uso intenso/campo, self-hosted). **Poppins** é a fonte do **site público**, **não** usada no app interno. A escala de tamanhos/pesos acima vira a **hierarquia tipográfica** (na família Atkinson). A identidade da marca, no app, entra pelas **cores** (roxo/gradiente), forma (raio 14px), sombras e tom — não pela fonte.

## 🧱 Layout e estrutura

- **Container** máx **1180px**, padding horizontal **28px**
- **Border-radius** padrão: `--radius: 14px` (cards, inputs, botões)
- **Grid de cards**: 3 col. desktop (`cards-3`), até 4 (`cards-4`), **1 col. em mobile** (`max-width 980px`)

**Seções da Home (do site institucional):** Header/Nav sticky (branco, borda inferior `1px #e8eaee`, altura 74px) · Hero full-width (foto escura + overlay `linear-gradient(135deg, rgba(8,13,24,.92), rgba(8,13,24,.72))`, padding `90px 0 130px`) · Stats Band (card branco flutuando sobre o hero, 4 col. ícone+número+label) · Banner de data comemorativa · Apresentação (split texto+imagem) · Logos de parceiros (REALIZAÇÃO/PARCEIROS uppercase) · Últimos Posts (grid 3 cards) · Ações Sociais (feed + sidebar) · Footer (branco, 3 col.).

## 🔘 Botões e componentes

**Primário (CTA — "Ver ações")**
```css
background:#2563eb; color:#fff; padding:13px 26px; border-radius:10px; font-weight:600; font-size:15px;
```
**Menu (Join/CTA do nav)**
```css
background:linear-gradient(135deg,#703cc0,#9618ba 45%,#267ce8); color:#fff; border-radius:9px; padding:10px 18px; font-weight:600; font-size:14px;
```
**Outline**
```css
background:#fff; color:#374151; border:1px solid #e8eaee; border-radius:10px; padding:13px 24px; font-weight:600;
/* hover: border-color e color roxo */
```
**Ghost (sobre fundo escuro)**
```css
background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); color:#fff; border-radius:10px; padding:13px 26px;
```
**Card de post**
```css
background:#fff; border:1px solid #e8eaee; border-radius:14px;
box-shadow:0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.05);
/* hover: translateY(-4px) + shadow-md */  /* thumb height: 180px */
```
**Badge de categoria**
```css
font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:5px 11px; border-radius:7px;
```
**Tag de seção** — pílula com ícone de coração + texto uppercase, roxa (`#703cc0`), fundo levemente colorido.
**Tag verde (hero)**
```css
background:rgb(34,197,94); color:#fff; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
```
**Sombras**
```css
--shadow-sm: 0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.05);
--shadow-md: 0 8px 24px rgba(16,24,40,.08);
--shadow-lg: 0 18px 50px rgba(15,23,42,.14);
```

## 🧭 Navegação
Menu horizontal centralizado, **underline roxo na página ativa**. Links peso médio, cor `--ink`, sem maiúsculas. Botão de ação à direita (gradiente da marca). Ícone de busca (lupa) à direita.

## 💬 Tom de voz
Humano, acolhedor **e** institucional — ONG/projeto social para pessoas com doenças raras e suas famílias. Equilibra:
- **Afetividade/cuidado:** "acolhimento", "fortalecimento de vínculos", "Cuidado, Amor e Inclusão", "conectando famílias".
- **Propósito/impacto:** números reais (150+ jovens, 85+ famílias), resultados concretos.
- **Clareza/acessibilidade:** linguagem direta, sem tecnicismos — alcança famílias, não só profissionais.
- **Institucional/sério:** ao descrever o projeto (parcerias, atendimento multiprofissional).
- **Local/territorial:** sempre reforça "Boa Vista", "Roraima, Brasil".
- Recorrentes: *inclusão social · garantia de direitos · rede de apoio · cuidado humanizado · fortalecimento de vínculos · capacitação.*

## 🖼️ Logo
Ícone: duas figuras humanas abraçadas formando um coração, em roxo e turquesa. Texto **"RAROS"** em roxo/magenta bold, **"BOA VISTA"** abaixo menor. Tagline **"Cuidado, Amor e Inclusão"** em cinza.

## 🔧 Como isto vira tokens no web_02 (na construção)
Os valores acima viram o **theme contract** do design system (vanilla-extract, ADR-0007), ex.: `color.brand.purple = #703cc0`, `color.brand.gradient`, `color.ink/body/muted`, `color.category.{news,health,tech,...}`, `radius.base = 14px`, `shadow.{sm,md,lg}`, `font.family = Poppins`, escala de `font.size/weight`. O app interno **não é o site público**, mas herda paleta, tipografia, raio, sombras e tom — para o profissional sentir a mesma marca. Telas internas: priorizar legibilidade/densidade (mobile-first) sobre o "vitrine" do site, mantendo as cores e o roxo da marca nos elementos de ação/estado.
