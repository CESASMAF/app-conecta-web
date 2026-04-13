# Prompt Inicial — Davi (Designer UI/UX)

> Cole este texto INTEIRO como sua primeira mensagem ao Claude Code.
> Ele configura o ambiente, lê o contexto do projeto e te guia pelo workflow correto.
> VOCÊ NÃO PRECISA FAZER MAIS NADA — só colar e esperar o Claude te perguntar o nome da feature.

---

Oi Claude! Meu nome é Davi (@DaviFranklin), sou o Designer UI/UX do projeto Social Care.

Meu papel é criar PROTÓTIPOS em HTML e CSS puro. Eu NÃO sou desenvolvedor. Eu NÃO mexo em hono, jsx, TypeScript de produção, viewmodels, services, rotas, servidor — NADA disso. Meu mundo é a pasta `prototypes/` e só.

Mas para fazer protótipos BEM FEITOS eu preciso que você ENTENDA como o backend (BFF) funciona de verdade, quais endpoints existem, quais dados trafegam — para que eu NUNCA prototipe uma tela que depende de algo que não existe no backend.

## BOOT SEQUENCE — Execute na ordem, sem pular nenhum passo

Antes de me perguntar qualquer coisa, execute estes passos SILENCIOSAMENTE (sem me mostrar o conteúdo dos arquivos, só confirme que leu cada um):

**PASSO 1 — Sincronizar com o remoto:**
```
git fetch origin
git checkout design/prototipe-main
git pull origin design/prototipe-main
git submodule update --init --recursive
```
Se a branch `design/prototipe-main` não existir localmente, crie a partir da remote:
```
git checkout -b design/prototipe-main origin/design/prototipe-main
```
IMPORTANTE: Essa é a branch BASE. Toda sub-branch de protótipo nasce DELA. Todo PR tem como target ELA. NUNCA `main`.

**PASSO 2 — Contexto do projeto:**
- Leia `CLAUDE.md` (raiz do projeto)
- Leia `WORKFLOW.md` (raiz do projeto)
- Leia a seção "Guia do Designer (Davi)" no `WORKFLOW.md`
- Leia a tabela "Erros Comuns do Davi" no `WORKFLOW.md` — memorize para me corrigir se eu tentar cometer algum

**PASSO 3 — Entender o BFF (Backend For Frontend):**
Você PRECISA entender o que o backend oferece para eu não inventar tela que não existe.
- Leia `src/routes/api.ts` — endpoints proxy do social-care e people-context
- Leia `src/routes/api_admin.ts` — endpoints admin com audit trail
- Leia `src/routes/pages.tsx` — quais páginas SSR existem hoje
- Leia `src/routes/auth.ts` — fluxo de autenticação OIDC
- Leia `src/types.ts` — tipos de sessão, roles, variáveis do Hono

**PASSO 4 — Entender os contratos de API (submodule `contracts/`):**
Os contratos definem O QUE EXISTE de verdade nos backends. Se não está no contrato, NÃO EXISTE.
- Leia `contracts/social-care/openapi/openapi.yaml` — API do social care
- Leia `contracts/people/openapi/openapi.yaml` — API do people context
- Leia `contracts/queue-manager/openapi/openapi.yaml` — API do queue manager
- Leia os schemas em `contracts/social-care/model/schemas/` — modelos de domínio
- Leia os schemas em `contracts/people/model/schemas/` — modelos de pessoa
- Leia `contracts/shared/schemas/` — schemas compartilhados (Error, Pagination)
- Leia `contracts/shared/validation-rules/` — regras de validação por contexto

**PASSO 5 — Template de protótipo:**
- Leia `prototypes/TEMPLATE.md` — todo protótipo que eu criar DEVE ter um `.md` companheiro baseado neste template
- Liste os protótipos que já existem em `prototypes/` (se houver)

**PASSO 6 — Me cumprimentar e pedir o nome da feature:**
Depois de completar os passos 1-5, me diga:
1. Confirme que está na branch `design/prototipe-main`
2. Liste resumidamente os endpoints/recursos que existem no BFF (em 5-10 bullet points, máximo)
3. Use o recurso de pergunta interativa para me perguntar:
   - "Qual o nome da feature que vamos prototipar?" (campo de texto livre)
   - "É um protótipo novo ou ajuste em um existente?" (opções: Novo / Ajuste)

Depois que eu responder, crie a sub-branch `proto/<nome-que-eu-dei>` a partir de `design/prototipe-main`.

---

## REGRAS PERMANENTES (não precisa me lembrar toda hora, só siga)

### Meu escopo — SÓ POSSO MEXER EM:
```
prototypes/    ← HTML e CSS puros. Meu mundo inteiro.
static/        ← imagens e assets para os protótipos
```

### NÃO POSSO MEXER EM NADA MAIS. ABSOLUTAMENTE NADA:
```
src/           ← TODO o diretório src/ é proibido pra mim
deno.json      Dockerfile      CLAUDE.md      WORKFLOW.md
tests/         contracts/      .claude/        .pipeline/
```

Se em QUALQUER momento eu pedir algo que envolva esses arquivos, me diga:
**"Isso está fora do seu escopo — anota e pede pro Gabriel."**

### Branch e PR:
- Branch base: SEMPRE `design/prototipe-main` (NUNCA `main`)
- Sub-branch: `proto/<nome-da-feature>` criada a partir de `design/prototipe-main`
- PR target: SEMPRE `design/prototipe-main`
- NUNCA fazer PR para `main` — isso é trabalho do Gabriel

### Antes de QUALQUER commit:
1. Verificar que estamos na sub-branch certa (NUNCA em `design/prototipe-main` direto, NUNCA em `main`)
2. Verificar que só arquivos em `prototypes/` e `static/` estão no stage
3. Rodar `/design-critique` → corrigir findings antes de commitar
4. Rodar `/accessibility-review` → corrigir findings antes de commitar

### Acessibilidade (reprova PR se falhar):
- Contraste mínimo 4.5:1 para texto (WCAG AA)
- Touch targets mínimo 44px (WCAG 2.5.5)
- `aria-label` em elementos interativos
- `prefers-reduced-motion` respeitado em animações
- Focus ring visível em todos os interativos
- Navegação por teclado funciona (Tab, Enter, Escape)

### Styling nos protótipos:
- CSS puro (inline ou `<style>` no HTML) — isso é protótipo, não produção
- Consultar `src/client/styles/tokens.ts` como REFERÊNCIA de cores/espaçamentos, mas NÃO importar dele
- Copiar os valores hex/px dos tokens para o CSS do protótipo
- ZERO Tailwind — CSS vanilla ou nada
- Documentar no `.md` companheiro quais tokens foram usados (tabela "Tokens e cores usados")

---

## ANIMAÇÕES

Posso e QUERO usar animações nos protótipos! Você pode (e deve) me sugerir animações quando fizer sentido para a experiência.

Bibliotecas permitidas para protótipos:

**GSAP** — Preferida para animações complexas (timelines, scroll triggers, morphing).
Carregue via CDN: `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>`
Plugins úteis: ScrollTrigger, Flip, MorphSVG (se disponível via CDN).

**Motion (ex-Framer Motion)** — Para transições e micro-interações mais simples.
Carregue via CDN: `<script src="https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js"></script>`

Regras para animações:
- SEMPRE respeitar `prefers-reduced-motion` — desabilitar ou reduzir animações
- Animações devem ter propósito (guiar atenção, feedback, transição) — não decorativas
- Documentar TODAS as animações na seção "Interações e comportamentos" do `.md` companheiro
- Sugerir timings e easings, mas eu tenho a palavra final

---

## SEU PAPEL PROATIVO

Eu sou designer e às vezes indeciso. Você deve:

1. **Sugerir features e telas baseado no que EXISTE no BFF** — se o backend tem um endpoint de busca de pacientes, me sugira prototipar a tela de busca
2. **Sugerir animações e micro-interações** — transições entre estados, feedback visual, loading states
3. **Me alertar quando eu estiver prototipando algo que o backend NÃO suporta** — "Davi, esse filtro por data de nascimento não existe na API. Quer prototipar mesmo assim (e pedir pro Gabriel implementar) ou quer usar os filtros que já existem?"
4. **Me mostrar opções** — quando eu disser "faz uma tela de cadastro", me mostre 2-3 abordagens diferentes (wizard vs formulário único vs accordion) com prós e contras de cada
5. **Lembrar dos estados** — sempre prototipar: estado vazio, loading, erro, sucesso, e lista com muitos itens
6. **Consultar os contratos** — quando eu disser "quero uma tela de X", consulte os schemas em `contracts/` para saber quais campos/dados existem

---

## WORKFLOW

### Protótipo novo
```
1. [BOOT SEQUENCE já fez] Estamos em design/prototipe-main
2. git checkout -b proto/<nome-da-feature>
3. cp prototypes/TEMPLATE.md prototypes/<nome-da-feature>.md
4. Criar prototypes/<nome-da-feature>.html (HTML + CSS + JS para animações)
5. Preencher o .md companheiro (tokens, interações, o que não pode faltar)
6. Rodar /design-critique → corrigir findings
7. Rodar /accessibility-review → corrigir findings
8. git add prototypes/<nome-da-feature>.html prototypes/<nome-da-feature>.md
9. git commit -m "proto: <descrição curta>"
10. git push origin proto/<nome-da-feature>
11. Abrir PR com target design/prototipe-main
```

### Ajuste em protótipo existente
```
1. git checkout proto/<nome> && git pull origin proto/<nome>
2. Fazer ajustes no .html e atualizar o .md se necessário
3. Rodar /design-critique e /accessibility-review
4. git add prototypes/
5. git commit -m "proto: ajuste <o que mudou>"
6. git push
```

---

## SE ALGO DER ERRADO

| Situação | O que fazer |
|----------|-------------|
| Estou em main | PARE. Volte para `design/prototipe-main`. NUNCA commite em main. |
| Estou em design/prototipe-main direto | PARE. Crie uma sub-branch `proto/<nome>` primeiro. |
| Quero um endpoint que não existe | Anote e peça ao Gabriel. Prototipe com dados mockados. |
| Não sei que cor/espaçamento usar | Consulte `src/client/styles/tokens.ts` (leitura) e me sugira. |
| Protótipo ficou grande | OK, não tem limite de linhas para protótipos. Continue. |
| Git deu conflito | Rode `git pull --rebase origin design/prototipe-main` e resolva. |
| Preciso de um dado que não está nos contracts | Anote no `.md` como "Nota para o dev" e prototipe com mock. |

---

Agora execute o BOOT SEQUENCE acima e me cumprimente!
