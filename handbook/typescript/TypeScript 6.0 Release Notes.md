# TypeScript 6.0 - Release Notes (Otimizado para IAs)

**Data:** Abril 2026  
**Versão:** TypeScript 6.0  
**Tipo:** Transition Release para TypeScript 7.0

---

## 📋 Índice Estruturado

1. [Novas Features](#novas-features)
2. [Mudanças de Comportamento](#mudanças-de-comportamento)
3. [Breaking Changes](#breaking-changes)
4. [Configurações Default Alteradas](#configurações-default-alteradas)
5. [Deprecações](#deprecações)

---

## Novas Features

### 1. Less Context-Sensitivity on `this`-less Functions

**Contexto:** Melhoria em inferência de tipos em funções genéricas

**Problema antes:**
- Funções com method syntax (sem `this` explícito) eram tratadas como "contextually sensitive"
- Isso bloqueava a inferência de tipos em argumentos iniciais
- Order de propriedades afetava o tipo inferido

**Solução:**
- TypeScript 6.0 agora detecta se `this` é realmente usado na função
- Se `this` não é usado, a função não é considerada "contextually sensitive"
- Melhora significativa em inferência de tipos para funções genéricas

**Exemplo:**
```typescript
declare function callIt<T>(obj: {
  produce: (x: number) => T,
  consume: (y: T) => void,
}): void;

// ANTES: Erro se consume vinha primeiro com method syntax
// DEPOIS: Funciona perfeitamente em qualquer ordem
callIt({
  consume(y) { return y.toFixed(); },
  produce(x: number) { return x * 2; },
});
```

**Impacto:** ✅ Backward compatible - Apenas melhora comportamento existente

---

### 2. Subpath Imports com `#/`

**Contexto:** Suporte a importações internas de pacotes

**Mudança:**
- Node.js adicionou suporte a subpath imports começando com `#/`
- Antes: Desenvolvedores precisavam usar `#root/*`, `#lib/*`, etc
- Agora: Podem usar simples `#/` como prefix

**Configuração em `package.json`:**
```json
{
  "imports": {
    "#/*": "./dist/*"
  }
}
```

**Uso:**
```typescript
import * as utils from "#/utils.js";
```

**Compatibilidade:** Node.js 20+ e TypeScript com `--moduleResolution nodenext` ou `bundler`

**Impacto:** ✅ Backward compatible - Novo suporte apenas

---

### 3. `--moduleResolution bundler` com `--module commonjs`

**Contexto:** Opções de module resolution mais flexíveis

**Mudança:**
- Antes: `bundler` só funcionava com `esnext` ou `preserve`
- Agora: Pode ser usado com `commonjs`

**Implicação:** Mais opções de migração de projetos legados

**Impacto:** ✅ Backward compatible - Novo suporte apenas

---

### 4. Flag `--stableTypeOrdering`

**Contexto:** Preparação para TypeScript 7.0 (parallelization)

**Propósito:** Fazer ordenação de tipos ser determinística

**Problema TypeScript 5.x:**
- Tipos recebem IDs baseado na ordem de encontro
- Diferentes orders de declaração → diferentes IDs → diferentes union type orders
- Exemplo: `100 | 500` vs `500 | 100` em `.d.ts` dependendo de declarações anteriores

**Solução TypeScript 7.0:**
- Tipos ordenados por algoritmo determinístico baseado em conteúdo
- Sempre `100 | 500` independente da ordem de declaração

**TypeScript 6.0:**
```typescript
// Usar flag para pré-visualizar comportamento 7.0
// tsconfig.json
{
  "compilerOptions": {
    "stableTypeOrdering": true
  }
}
```

**⚠️ Aviso:** Pode desacelerar type-checking em até 25% - Use apenas para diagnóstico

**Impacto:** ℹ️ Opt-in - Backward compatible

---

### 5. `es2025` Target e Lib

**Contexto:** Novas APIs de ES2025

**Adições:**
- `RegExp.escape` - Escape automático de caracteres especiais
- `Promise.try` - Criar promises de forma segura
- Iterator methods no `Set`
- Temporal API - Nova API de datas/horários

**Uso:**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2025",
    "lib": ["es2025"]
  }
}
```

**Impacto:** ✅ Backward compatible - Novo suporte apenas

---

### 6. Temporal API - Types Nativos

**O que é:** Stage 4 proposal para manipulação de datas/horários

**Status:** Agora oficialmente parte de ECMAScript

**Uso em TypeScript 6.0:**
```typescript
let yesterday = Temporal.Now.instant().subtract({
  hours: 24,
});

let tomorrow = Temporal.Now.instant().add({
  hours: 24,
});
```

**Require:** `--target esnext` ou `"lib": ["esnext"]`

**Runtimes suportados:** Bun, Deno, Node.js (com flag)

**Impacto:** ✅ Novo - Opt-in uso

---

### 7. Map Methods: `getOrInsert` e `getOrInsertComputed`

**Contexto:** ECMAScript "upsert" proposal (Stage 4)

**Problema antes:**
```typescript
let value;
if (map.has(key)) {
  value = map.get(key);
} else {
  value = defaultValue;
  map.set(key, value);
}
```

**Solução:**
```typescript
// Simples
let value = map.getOrInsert(key, defaultValue);

// Com computação (callback só chamado se não existe)
let value = map.getOrInsertComputed(key, (key) => {
  return expensiveComputation(key);
});
```

**Disponível em:** `esnext` lib

**Impacto:** ✅ Novo - Opt-in uso

---

### 8. `RegExp.escape`

**Contexto:** Stage 4 proposal para sanitizar strings em regex

**Problema:** Caracteres especiais precisam ser escapados manualmente

**Solução:**
```typescript
function matchWholeWord(word: string, text: string) {
  const escapedWord = RegExp.escape(word);
  const regex = new RegExp(`\\b${escapedWord}\\b`, "g");
  return text.match(regex);
}

// Antes: "a.b.c" → precisa escapar pontos
// Depois: RegExp.escape("a.b.c") → "a\\.b\\.c"
```

**Disponível em:** `es2025` lib

**Impacto:** ✅ Novo - Opt-in uso

---

### 9. DOM Lib: Consolidação de `dom.iterable` e `dom.asynciterable`

**Mudança:**
- Antes: Precisava fazer `"lib": ["dom", "dom.iterable"]`
- Agora: `"lib": ["dom"]` inclui tudo automaticamente

**Benefício:** Simplifica configuração comum

```typescript
// ANTES - Precisa de config adicional
// tsconfig.json: "lib": ["dom", "dom.iterable"]

// DEPOIS - Apenas dom é suficiente
for (const element of document.querySelectorAll("div")) {
  console.log(element.textContent);
}
```

**Impacto:** ✅ Backward compatible - Melhoria apenas

---

## Mudanças de Comportamento

### 1. `rootDir` Agora Default para `.`

**Antes:**
```typescript
// rootDir era inferido do comum ancestor de files
src/
  app.ts
  utils/
    helper.ts
// rootDir = "src" (inferido)
```

**Depois:**
```typescript
// rootDir = diretório com tsconfig.json
{
  "compilerOptions": {
    "rootDir": "./src"  // PRECISA ser explícito agora
  }
}
```

**Benefício:** Mais rápido, mais previsível

**Se quebrar seu build:**
```json
{
  "compilerOptions": {
    "rootDir": "./src"
  },
  "include": ["./src"]
}
```

---

### 2. `types` Agora Default para `[]`

**Problema antes:**
- `types: undefined` = incluir TODOS os pacotes em `node_modules/@types`
- Pode ser centenas de pacotes em workspaces
- Aumenta compile time 20-50%

**Depois:**
```typescript
// Default: types: []
// PRECISA ser explícito para usar tipos globais
```

**Solução:**
```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

**Ou restore comportamento antigo:**
```json
{
  "compilerOptions": {
    "types": ["*"]  // Inclui tudo novamente
  }
}
```

**Sintomas de quebra:**
```
Cannot find module 'fs'
Cannot find name 'process'
Cannot find name 'describe'
```

---

### 3. Compiler Option Defaults Alteradas

| Opção | Antes | Depois | Impacto |
|-------|-------|--------|---------|
| `strict` | `false` | `true` | ⚠️ Mais erros de tipo |
| `module` | `commonjs` | `esnext` | ⚠️ Saída ESM por padrão |
| `target` | `es5` | `es2025` | ⚠️ Sem downlevel para ES5 |
| `noUncheckedSideEffectImports` | `false` | `true` | ✅ Melhor detecção |
| `libReplacement` | `true` | `false` | ✅ Melhor performance |

**Se quebrar:**
```json
{
  "compilerOptions": {
    "strict": false,
    "module": "commonjs",
    "target": "es2020"
  }
}
```

---

## Breaking Changes

### 1. ❌ `target: es5` - Deprecado

**Status:** Hard deprecation - Não funciona mais

**Razão:** ES5 é obsoleto, todos os navegadores modernos suportam ES2015+

**Alternativa:**
- Migrar para `es2015` mínimo
- Ou usar transpiler externo (Babel, esbuild)

---

### 2. ❌ `--downlevelIteration` - Deprecado

**Status:** Hard deprecation - Não funciona mais

**Razão:** Só funcionava com `target: es5`

---

### 3. ❌ `--moduleResolution node` - Deprecado

**Status:** Hard deprecation em 6.0 → Removido em 7.0

**Razão:** Reflete Node.js 10, está desatualizado

**Migrar para:**
```json
{
  "compilerOptions": {
    "moduleResolution": "nodenext"  // Para Node.js
    // OU
    // "moduleResolution": "bundler"  // Para bundlers
  }
}
```

---

### 4. ❌ `--module amd|umd|systemjs|none` - Deprecados

**Status:** Hard deprecation - Não funciona mais

**Razão:** Sistemas de módulos legados, ESM é padrão

**Alternativa:** Migrar para ESM ou usar bundler externo

---

### 5. ❌ `--baseUrl` - Deprecado

**Problema:**
```json
{
  "baseUrl": "./src",  // Afeta RESOLVE também, não apenas paths
  "paths": {
    "@app/*": ["app/*"]
  }
}
```

**Solução:**
```json
{
  "paths": {
    "@app/*": ["./src/app/*"],
    "@lib/*": ["./src/lib/*"]
  }
  // Sem baseUrl
}
```

---

### 6. ❌ `--moduleResolution classic` - Removido

**Status:** Completamente removido

**Alternativa:** Use `nodenext` ou `bundler`

---

### 7. ❌ `--esModuleInterop false` e `--allowSyntheticDefaultImports false`

**Status:** Não podem mais ser `false`

**Antes:**
```typescript
import * as express from "express";
```

**Depois:**
```typescript
import express from "express";
```

---

### 8. ❌ `--alwaysStrict false` - Não funciona mais

**Todos os códigos agora em strict mode**

**Se usar reserved words como identifiers:**
```typescript
const await = 5;  // ❌ Erro
const myVar = 5;  // ✅ OK
```

---

### 9. ❌ `--outFile` - Removido

**Status:** Completamente removido

**Razão:** Bundlers externos (webpack, esbuild, etc) fazem isso melhor

**Alternativa:** Use um bundler

---

### 10. ❌ Legacy `module` Syntax para Namespaces

```typescript
// ❌ Erro
module Foo {
  export const bar = 10;
}

// ✅ Correto
namespace Foo {
  export const bar = 10;
}

// ✅ Ainda funciona - Ambient modules
declare module "some-module" {
  export function doSomething(): void;
}
```

---

### 11. ❌ `asserts` Keyword - Deprecated para `with`

```typescript
// ❌ Antes
import blob from "./data.json" asserts { type: "json" }

// ✅ Depois
import blob from "./data.json" with { type: "json" }
```

---

### 12. ❌ `no-default-lib` Directive - Removido

```typescript
// ❌ Não funciona mais
/// <reference no-default-lib="true"/>

// ✅ Alternativas
// tsconfig.json:
{
  "compilerOptions": {
    "noLib": true
    // OU
    // "libReplacement": true
  }
}
```

---

### 13. ⚠️ Command-line Files com `tsconfig.json` é Erro

**Antes:**
```bash
tsc foo.ts  # Ignora tsconfig.json silenciosamente
```

**Depois:**
```bash
tsc foo.ts
# error TS5112: tsconfig.json is present but will not be loaded if files are specified

# Solução:
tsc --ignoreConfig foo.ts
```

---

## Configurações Default Alteradas

### Tabela Resumida

```json
{
  "compilerOptions": {
    "strict": true,                           // false → true
    "module": "esnext",                       // commonjs → esnext
    "target": "es2025",                       // es5 → es2025 (floating)
    "rootDir": ".",                           // inferred → "."
    "types": [],                              // ["*"] → []
    "noUncheckedSideEffectImports": true,    // false → true
    "libReplacement": false,                  // true → false
    "esModuleInterop": true,                  // não pode ser false
    "allowSyntheticDefaultImports": true,    // não pode ser false
    "alwaysStrict": true                      // não pode ser false
  }
}
```

---

## Deprecações

### Flag: `--ignoreDeprecations: "6.0"`

Para ignorar deprecações em 6.0 (não funcionará em 7.0):

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

### Todas as Deprecações:
1. ~~`target: es5`~~ (hard deprecation)
2. ~~`--downlevelIteration`~~ (hard deprecation)
3. ~~`--moduleResolution node`~~ (soft deprecation → hard em 7.0)
4. ~~`--module amd|umd|systemjs|none`~~ (soft deprecation → hard em 7.0)
5. ~~`--baseUrl`~~ (soft deprecation → hard em 7.0)
6. ~~`--moduleResolution classic`~~ (soft deprecation)
7. ~~`--esModuleInterop false`~~ (soft deprecation)
8. ~~`--allowSyntheticDefaultImports false`~~ (soft deprecation)
9. ~~`--alwaysStrict false`~~ (soft deprecation)
10. ~~`--outFile`~~ (soft deprecation → hard em 7.0)
11. ~~legacy `module` syntax~~ (soft deprecation → hard em 7.0)
12. ~~`asserts` keyword~~ (soft deprecation → hard em 7.0)
13. ~~`no-default-lib` directive~~ (soft deprecation)
14. Command-line files com tsconfig.json → Error

---

## 🎯 Estratégia de Migração

### Fase 1: Diagnóstico Imediato
```bash
# Verificar se há deprecações
npx tsc --version  # Certifique-se que é 6.0+
npm list typescript
```

### Fase 2: Ajustes Obrigatórios
```json
{
  "compilerOptions": {
    "types": ["node", "jest"],  // Ou o que seu projeto usa
    "rootDir": "./src"          // Se estava inferido
  }
}
```

### Fase 3: Lidar com Default Changes
```json
{
  "compilerOptions": {
    "strict": true,           // Adicione type guards se quebrar
    "module": "esnext",       // Configure bundler se precisa CommonJS
    "target": "es2025"        // Ou seu target desejado
  }
}
```

### Fase 4: Remover Deprecated Options
```json
// ❌ Remove:
// "baseUrl"
// "moduleResolution": "node"
// "module": "amd|umd|systemjs"
// "target": "es5"
// "outFile"

// ✅ Substitua por:
// "moduleResolution": "nodenext" ou "bundler"
// "module": "esnext"
// Use path mapping sem baseUrl
```

### Fase 5: Prepare para 7.0
- Teste com `--stableTypeOrdering` flag se preocupado com diffs de `.d.ts`
- Explicitize tipos onde inferência falha (type annotations)
- Use `ignoreDeprecations: "6.0"` se ainda usar deprecated options

---

## 📊 Comparação 5.9 vs 6.0

| Aspecto | 5.9 | 6.0 | 7.0 |
|---------|-----|-----|-----|
| `strict` default | `false` | `true` | `true` |
| `types` default | `["*"]` (all) | `[]` (none) | `[]` |
| `rootDir` inference | Automático | Não (default `.`) | Não |
| `target: es5` | ✅ Suportado | ⚠️ Deprecated | ❌ Removido |
| `--baseUrl` | ✅ Suportado | ⚠️ Deprecated | ❌ Removido |
| Parallelization | ❌ Não | ❌ Não | ✅ Sim |
| Native Port | ❌ Não | ❌ Não | ✅ Sim |

---

## 🚀 Checklist de Migração

- [ ] Upgrade para TypeScript 6.0
- [ ] Definir `types` array (ex: `["node"]`)
- [ ] Definir `rootDir` se necessário
- [ ] Revisar `strict` mode errors
- [ ] Ajustar `module` se necessário
- [ ] Remover/atualizar deprecated options
- [ ] Testar build e tipos globais
- [ ] Rodar testes
- [ ] Documentar mudanças
- [ ] Preparar para TS 7.0

---

## 🔗 Recursos Adicionais

- **Official Announcement:** https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
- **GitHub Issues:** Cada mudança tem PR/issue associada
- **Migration Tool:** `ts5to6` tool disponível para ajudar com migração

---

## ⚡ Performance Tips

1. Use `types: ["node"]` em vez de `types: ["*"]` → 20-50% mais rápido
2. Defina explicitamente `rootDir` → Evita inferência desnecessária
3. Evite `--stableTypeOrdering` em builds normais → Usa apenas para diagnóstico
4. Com multi-project workspaces → Defina `types` em cada `tsconfig.json`

---

**Última atualização:** Abril 2026  
**Status:** TypeScript 6.0 oficial  
**Próximo:** TypeScript 7.0 (native port com parallelization)
