# Prompt Inicial — Davi (Designer UI/UX)

> **Cole este texto inteiro como primeira mensagem no Claude Code Desktop.**
> Ele configura o Claude para trabalhar corretamente no projeto.

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
git merge origin/main --no-edit
git submodule update --init --recursive
```
Se a branch `design/prototipe-main` não existir localmente, crie a partir da remote:
```
git checkout -b design/prototipe-main origin/design/prototipe-main
```
**IMPORTANTE:** Depois de pull, SEMPRE merge da main para pegar tokens e configs atualizados.
Essa é a branch BASE. Toda sub-branch de protótipo nasce DELA. Todo PR tem como target ELA. NUNCA `main`.

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

**PASSO 5 — Design tokens e template:**
- Leia `prototypes/STARTER.html` — este é o template BASE para todo protótipo. Contém TODOS os tokens como CSS vars.
- Leia `prototypes/TEMPLATE.md` — todo protótipo DEVE ter um `.md` companheiro
- Leia `src/client/styles/tokens.ts` — referência dos tokens em TypeScript (mesmos valores do STARTER.html)
- Liste os protótipos que já existem em `prototypes/` (se houver)

**PASSO 6 — Me cumprimentar e pedir o nome da feature:**
Depois de completar os passos 1-5, me diga:
1. Confirme que está na branch `design/prototipe-main` e que fez merge da main
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

---

## REGRA DE OURO DOS PROTÓTIPOS — TOKENS

**SEMPRE começar copiando `prototypes/STARTER.html`.** Ele já tem:
- Todas as cores como `var(--color-primary)`, `var(--color-surface)`, etc.
- Todos os espaçamentos como `var(--space-1)` até `var(--space-10)`
- Todos os radius como `var(--radius-card)`, `var(--radius-pill)`, etc.
- Todas as fontes como `var(--font-satoshi)`, `var(--font-erode)`, etc.
- O mesmo CSS reset que a produção usa
- As mesmas fonts carregadas da mesma forma que a produção

**NUNCA:**
- Escrever `#4F8448` direto — use `var(--color-primary)`
- Escrever `16px` para spacing — use `var(--space-3)`
- Escrever `12px` para border-radius — use `var(--radius-card)`
- Escrever `'Satoshi', sans-serif` — use `var(--font-satoshi)`
- Inventar uma cor que não existe nos tokens — se precisar de uma cor nova, PERGUNTE ao Davi e anote no .md para o Gabriel adicionar ao tokens.ts

**Se precisar de um valor que não existe nos tokens:**
1. Anote no `.md` companheiro na seção "Notas para o dev"
2. Use o valor mais próximo dos tokens existentes
3. Gabriel vai decidir se cria um novo token ou ajusta

---

## CRIANDO TOKENS NOVOS NO PROTÓTIPO

Quando o Davi pedir algo que precisa de um valor visual novo (cor, espaçamento, sombra),
NÃO use hex/px direto. Em vez disso, CRIE uma variável CSS no bloco `:root` do protótipo
com o prefixo `--NEW-` para que o Gabriel saiba que é uma proposta de token novo.

```css
/* DENTRO do :root do STARTER.html, adicione no final: */

/* ══ TOKENS NOVOS (propostas para o Gabriel avaliar) ══ */
--NEW-color-sage-light: rgba(79, 132, 72, 0.08);
--NEW-color-card-glass: rgba(255, 255, 255, 0.45);
--NEW-color-card-glass-hover: rgba(255, 255, 255, 0.65);
--NEW-shadow-card-hover: 0 8px 32px rgba(79, 132, 72, 0.06);
--NEW-space-sidebar: 64px;
--NEW-space-sidebar-expanded: 220px;
--NEW-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--NEW-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--NEW-duration-fast: 150ms;
--NEW-duration-normal: 300ms;
```

Depois USE a variável no CSS do protótipo:
```css
/* CERTO — usa a variável, Gabriel consegue encontrar e migrar */
.card {
  background: var(--NEW-color-card-glass);
  box-shadow: var(--NEW-shadow-card-hover);
  transition: all var(--NEW-duration-normal) var(--NEW-ease-out);
}

/* ERRADO — hex/valor direto, Gabriel não sabe que é intencional */
.card {
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 32px rgba(79, 132, 72, 0.06);
}
```

### Por que isso funciona:
1. O Gabriel roda `grep "NEW-" prototypes/nome.html` e vê TODOS os tokens novos propostos
2. Ele decide: adicionar ao `tokens.ts` ou mapear para um token existente
3. Roda `deno task gen-starter` para atualizar o STARTER.html
4. Pronto — o valor vive em um lugar só

### Regras para tokens novos:
- Prefixo `--NEW-` é OBRIGATÓRIO (sem ele o Gabriel não encontra)
- Agrupar no final do `:root` sob o comentário `TOKENS NOVOS`
- Nomear semanticamente: `--NEW-color-card-glass` não `--NEW-rgba-white-045`
- Listar TODOS no `.md` companheiro na seção "Tokens e cores usados"
- Máximo 10 tokens novos por protótipo (se precisar de mais, o design system precisa de revisão)

### Tabela para o .md companheiro:
```markdown
## Tokens e cores usados

| Uso | Variável no protótipo | Token existente? | Proposta |
|-----|----------------------|------------------|----------|
| Fundo dos cards | var(--NEW-color-card-glass) | NÃO | rgba(255,255,255,0.45) |
| Hover dos cards | var(--NEW-color-card-glass-hover) | NÃO | rgba(255,255,255,0.65) |
| Sombra hover | var(--NEW-shadow-card-hover) | NÃO | 0 8px 32px rgba(79,132,72,0.06) |
| Cor primária | var(--color-primary) | SIM | — |
| Espaçamento cards | var(--space-2) | SIM | — |
```

**Marcar componentes no HTML:**
Todo bloco visual que será um componente separado na produção deve ter `data-component="NomeDoComponente"`:
```html
<header data-component="PageHeader">
  <h1>Título</h1>
  <p>Subtítulo</p>
</header>

<div data-component="FamilyMemberCard">
  <span>Nome do membro</span>
</div>
```
Isso ajuda o dev a saber onde cortar os componentes na conversão para JSX.

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
6. **USAR APENAS tokens do STARTER.html** — se eu pedir uma cor que não existe, me diga qual token existente é mais próximo. NUNCA invente um hex.

### REGRA OBRIGATÓRIA: Campos e dados vêm dos contratos

**ANTES de criar qualquer formulário, tabela ou card com dados, você DEVE:**
1. Consultar o schema relevante em `contracts/` (ex: `contracts/social-care/model/schemas/patient.yaml`)
2. LISTAR para o Davi quais campos existem no backend: "O paciente tem: fullName, cpf, birthDate, gender. NÃO tem: telefone, email, foto."
3. Usar SOMENTE campos que existem no schema
4. Se o Davi pedir um campo que NÃO existe, dizer: **"Esse campo não existe no contrato. Os campos disponíveis são: [lista]. Quer usar um desses ou anotar como pedido para o Gabriel?"**

**NUNCA inventar nomes de campos.** Se o schema diz `dominio_escolaridade`, usar `dominio_escolaridade` — não "escolaridade", não "education_level", não "grau_ensino".

---

## WORKFLOW

### Protótipo novo
```
1. [BOOT SEQUENCE já fez] Estamos em design/prototipe-main (com merge da main)
2. git checkout -b proto/<nome-da-feature>
3. cp prototypes/STARTER.html prototypes/<nome-da-feature>.html
4. cp prototypes/TEMPLATE.md prototypes/<nome-da-feature>.md
5. Desenvolver o protótipo DENTRO do STARTER (tokens já carregados)
6. Marcar componentes com data-component="NomeDoComponente"
7. Preencher o .md companheiro (tokens, interações, o que não pode faltar)
8. Rodar /design-critique → corrigir findings
9. Rodar /accessibility-review → corrigir findings
10. git add prototypes/<nome-da-feature>.html prototypes/<nome-da-feature>.md
11. git commit -m "proto: <descrição curta>"
12. git push origin proto/<nome-da-feature>
13. Abrir PR com target design/prototipe-main
```

### Ajuste em protótipo existente
```
1. git checkout proto/<nome> && git pull origin proto/<nome>
2. VERIFICAR se o protótipo usa STARTER.html como base:
   - Abre o .html e procura por "DESIGN TOKENS — Conecta ACDG"
   - Se NÃO tem: MIGRAR primeiro (ver abaixo)
   - Se tem: prosseguir com ajustes
3. Fazer ajustes no .html e atualizar o .md se necessário
4. Rodar /design-critique e /accessibility-review
5. git add prototypes/
6. git commit -m "proto: ajuste <o que mudou>"
7. git push
```

### Migrar protótipo antigo para STARTER.html
Protótipos criados antes do STARTER.html usam hex hardcoded e tokens diferentes.
Antes de QUALQUER ajuste, migrar:
```
1. Abrir prototypes/STARTER.html — copiar o bloco <head> inteiro (fonts, tokens, reset)
2. Substituir o <head> do protótipo antigo pelo do STARTER
3. No <style>, substituir hex hardcoded por var(--color-*):
   #4F8448 → var(--color-primary)
   #F8F3EC → var(--color-background)   (ATENÇÃO: era diferente!)
   #261D11 → var(--color-text-primary)
   etc.
4. Substituir spacing hardcoded por var(--space-*):
   12px padding → var(--space-2) ou var(--space-3)
5. Testar que visualmente ficou igual (pode ter diferenças por tokens corretos)
6. Commitar a migração SEPARADO: "proto: migrate <nome> to STARTER tokens"
7. Só DEPOIS fazer os ajustes pedidos
```

---

## SE ALGO DER ERRADO

| Situação | O que fazer |
|----------|-------------|
| Estou em main | PARE. Volte para `design/prototipe-main`. NUNCA commite em main. |
| Estou em design/prototipe-main direto | PARE. Crie uma sub-branch `proto/<nome>` primeiro. |
| Quero um endpoint que não existe | Anote e peça ao Gabriel. Prototipe com dados mockados. |
| Preciso de uma cor que não está nos tokens | Use a mais próxima e anote no .md. Gabriel decide se cria token novo. |
| Protótipo ficou grande | OK, não tem limite de linhas para protótipos. Continue. |
| Git deu conflito | Rode `git pull --rebase origin design/prototipe-main` e resolva. |
| Preciso de um dado que não está nos contracts | Anote no `.md` como "Nota para o dev" e prototipe com mock. |
| O STARTER.html parece desatualizado | Rode `git merge origin/main` na design/prototipe-main para atualizar. |

---

Agora execute o BOOT SEQUENCE acima e me cumprimente!
