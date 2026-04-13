# Diretriz de Conversão — Protótipo HTML → Produção hono/jsx

> Para o Claude do Davi seguir. Para o Claude do Gabriel consultar ao converter.
> Baseado em 10 erros reais encontrados durante a conversão do home-redesign.

---

## 1. NUNCA px fixo para spacing e font-size

```
ERRADO:  padding: 40px 48px;
ERRADO:  font-size: 42px;
ERRADO:  max-width: 1000px;

CERTO:   padding: clamp(1.5rem, 1rem + 2vw, 2.5rem);
CERTO:   font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
CERTO:   max-width: min(90%, 72rem);
```

px é aceitável APENAS para: border-width, border-radius, box-shadow, icon sizes.

---

## 2. SEMPRE usar tokens do STARTER.html

```
ERRADO:  color: #4F8448;
ERRADO:  background: #F8F3EC;

CERTO:   color: var(--color-primary);
CERTO:   background: var(--color-background);
```

Se o protótipo do Davi tem hex hardcoded, o dev DEVE mapear para tokens.
Se a cor não existe nos tokens, NÃO inventar — pedir ao Gabriel para criar.

---

## 3. Formato de nome: "Sobrenome, Nome"

O protótipo mostra dados mockados como "Silva, Maria Aparecida".
Na produção, o backend retorna `firstName` e `lastName` separados.

```typescript
// Converter para o formato do protótipo:
fullName = f.lastName && f.firstName
  ? `${f.lastName}, ${f.firstName}`
  : f.fullName ?? "—";
```

---

## 4. hono/css keyframes — SEMPRE extrair

```typescript
// ERRADO — @keyframes inline dentro de css`` não funciona
const style = css`
  @keyframes fade { to { opacity: 1; } }
  animation: fade 500ms;
`;

// CERTO — importar keyframes separado
import { css, keyframes } from "hono/css";

const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const style = css`
  animation: ${fade} 500ms forwards;
`;
```

---

## 5. Background gradient + body color

Quando usar gradient `position: fixed`, o body background aparece abaixo do fold no scroll.

```typescript
// Fix: override body para a cor final do gradient
const bodyOverride = css`
  :-hono-global {
    body { background: #D4DDD0 !important; }
  }
`;
// Renderizar: <div class={bodyOverride} />
```

---

## 6. Protótipos servidos antes do CSP

Protótipos HTML com `<style>` inline são bloqueados pelo CSP (sem nonce).
No `server.ts`, serveStatic de protótipos ANTES do securityHeaders:

```typescript
app.use("/prototypes/*", serveStatic({ root: "./" })); // ANTES do CSP
app.use("*", securityHeaders());
```

---

## 7. ViewModel e Service NÃO mudam no redesign visual

Se o protótipo é um REDESIGN VISUAL de tela existente:
- NÃO reescrever reducer, types, service
- APENAS modificar views/components e styles
- Verificar se as props dos componentes existentes atendem

Se precisar de dados novos (ex: status ativo/inativo), pedir ao Gabriel.

---

## 8. Sidebar parent hover — CSS limitation

hono/css não suporta `.parent:hover .child` da mesma forma que CSS vanilla.
Workaround: usar class composition ou CSS nesting (suportado em browsers modernos).

```typescript
// Funciona em hono/css com nesting:
const sidebar = css`
  width: 64px;
  &:hover { width: 220px; }
  &:hover .label { opacity: 1; }  // NÃO funciona — .label é outra class hash
`;

// Workaround: definir transição no próprio elemento
const label = css`
  opacity: 0;
  transition: opacity 300ms;
  nav:hover & { opacity: 1; }  // Depende do contexto
`;
```

---

## 9. Animações — SEMPRE prefers-reduced-motion

```typescript
const card = css`
  animation: ${fadeIn} 500ms forwards;
  animation-delay: var(--stagger, 0ms);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`;

// Stagger delay via style prop:
<div style={`--stagger: ${index * 60}ms`} />
```

---

## 10. Checklist de conversão (usar para cada componente)

- [ ] Tokens: zero hex hardcoded, tudo via tokens.ts
- [ ] Fluid: spacing e font-size usam clamp(), não px
- [ ] Responsivo: testado em 375px, 1024px, 1440px (Chrome DevTools emulate)
- [ ] Acessibilidade: aria-label em interativos, role="button" em clicáveis, tabIndex={0}
- [ ] Animações: keyframes extraído, prefers-reduced-motion respeitado
- [ ] Nome formato: "Sobrenome, Nome" (se dados vêm como firstName/lastName)
- [ ] Estado vazio: EmptyState para listas sem dados
- [ ] Loading: SkeletonList para carregamento
- [ ] Keyboard: Escape fecha panels
- [ ] Build: `deno task build` compila sem erros
- [ ] Testes: `deno task test` — 0 regressões
