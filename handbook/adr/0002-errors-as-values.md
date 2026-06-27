[← Voltar para ADRs](./README.md)

# ADR-0002: Erros como valores (Result) + ponte única para o ErrorBoundary do Solid

- **Status:** Accepted
- **Date:** 2026-05-29 · **Atualizado:** 2026-06-12 (stack web_02: Eden/Solid no lugar de TanStack Query)
- **Deciders:** Gabriel Aderaldo (Tech Lead) + assistente

---

## Contexto

Como modelar falhas no front + BFF? Exceções (`throw`/`try-catch`) tornam o fluxo de erro invisível
ao compilador e à revisão. No web_02 a borda de dados é o **Eden Treaty** — e o Eden **já devolve erro
como valor**: toda chamada retorna `{ data, error }` (com `error.status` e `error.value` tipados pelo
schema do Elysia). Isso **reduz** o atrito clássico: não há mais uma `queryFn` que rejeita (o web/React
dependia do TanStack Query, que sinaliza erro **lançando**).

Resta uma única travessia "valor → exceção": o **`createAsync`/`createResource` do Solid** integra com
`<Suspense>`/`<ErrorBoundary>` **lançando** o erro para o boundary mais próximo. Então o ponto onde o
valor-de-erro do Eden vira exceção é **explícito e único**: a derivação do resource.

Restrições:
- Paridade com o core-api, que já usa `Result<T,E>` (erros como valores).
- A UI **não deve** inspecionar status HTTP — só semântica ("sessão expirou", "não encontrado").
- O envelope de erro real do core-api é `{ error: { code, message, requestId } }` (sem `issues[]`).

## Decisão

**Erros são valores** em todo o código: `Result<T, E>` (union discriminada por `.ok`, vendorizada do
core-api). `throw` é proibido fora da borda de framework; quando uma API nativa lança, o `catch` converte
para `Result` imediatamente.

- **No BFF (Elysia):** handlers nunca lançam para o transporte — usam `Result` e o envelope padrão
  `{ data, meta }` / erro estruturado. O Elysia valida entrada/saída com **TypeBox (`Elysia.t`)**, então
  o contrato de erro também é tipado e chega ao Eden como `error.value`.
- **No client (Solid):** o Eden devolve `{ data, error }`. A camada `data` mapeia `error` → `AppError`
  (`mapToAppError`) e, **só na derivação do `createAsync`**, lança o `AppError` para o `<ErrorBoundary>`.
  Essa é a **única** ponte valor→exceção (substitui a `QueryError` + `QueryClient.onError` do web/React).

A **cadeia de erro** é fixa e tipada ponta-a-ponta:

```
core-api 4xx/5xx
  → resultFetch → Result.err(HttpError)              [external, sem throw]
  → Elysia BFF: mapToServerResponse → envelope { error } (status preservado, schema TypeBox)
  → Eden treaty → { data, error }                    [valor — NÃO lança]
  → data layer: mapToAppError(error)                  [Result/valor]
  → createAsync(): lança AppError p/ <ErrorBoundary>  [ÚNICA ponte valor→exceção]
  → onError do boundary (auth:expired → signOut)      [um único lugar]
  → switch exaustivo em AppError.kind → label i18n    [ui]
```

`mapToAppError` discrimina por **status HTTP** (`error.status` do Eden — mais estável que o slug do
backend); `parseErrorEnvelope` extrai `code/message/requestId` só para observabilidade.

## Consequências

**Positivas**
- Fluxo de falha visível ao compilador (switch exaustivo com guarda `never`); testável em **`bun:test`**.
- Eden entrega erro **como valor** nativamente → menos cerimônia que o web/React (não há `QueryError`
  como subclasse de `Error`; a única ponte para exceção é a do `<ErrorBoundary>` do Solid).
- UI desacoplada de HTTP; 401 vira signOut automático num único lugar (`onError` do boundary).
- Stack trace nunca chega ao usuário.
- **Zero dependência npm** para isso: `Result` é vendorizado; Eden/TypeBox vêm com o stack-base.

**Negativas / custos**
- Boilerplate de mapeamento (`HttpError → envelope → AppError`) — mitigado por ser centralizado e testado.
- A travessia valor→exceção do Solid (no `createAsync`) é implícita ao framework; concentrada na `data`
  para ficar auditável.

## Alternativas consideradas

- **Exceções em todo o fluxo** — rejeitada: invisível ao tipo, fácil de engolir, vaza HTTP na UI.
- **Manter TanStack Query + `QueryError`** (como no web/React) — rejeitada pela regra **Bun-native**: o
  Solid já entrega server-state via `createAsync`/`query` (`@solidjs/router`) e o Eden já dá erro-valor;
  TanStack Query seria dep npm redundante.
- **Biblioteca de efeitos (Effect/fp-ts) como base** — rejeitada: peso/curva; `Result` minimalista basta
  (constituição §VIII — minimal libs) e não adiciona npm.

## Referências

- `.specify/memory/constitution.md` §II e §V
- `src/shared/http/{http-error.types,app-error.types,map-to-app-error,error-envelope}.ts`
- `src/.../*.data.ts` — mapeamento Eden `{error}` → `AppError` e a ponte do `createAsync`
- [ADR-0010](./0010-bff-orchestration-fn-naming.md) — o BFF Elysia entrega a verdade composta (envelope).
- `specs/001-v2-foundation/contracts/error-envelope.md` (contrato real do core-api)
