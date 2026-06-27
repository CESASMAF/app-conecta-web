---
name: "bff-compose-view"
description: "Como construir uma composição view-ready no BFF do web_02 — fan-out cross-service, merge, resolução de código→rótulo no servidor, ações/transições disponíveis e degradação parcial. Use para qualquer tela que mostre dados de mais de uma origem/agregado, para que o client fique só com a tela."
user-invocable: true
---

# Compor uma view-ready no BFF (screen-shaped)

Uma composição vive em `src/server/composition/<tela>.compose.ts` e é chamada pela rota `*.query.fn.ts` da tela (e reusada pelas mutações para recompor o view-state). Objetivo: o client recebe **um** objeto pronto.

## Anatomia
1. **Fan-out**: chame os clients necessários em paralelo (`Promise.all` de `Result`s). Ex.: paciente = social-care (cabeçalho + família + avaliações + proteção); pessoa = people-context (dados + papéis); futuro: cruzar serviços.
2. **Merge**: una os fragmentos num único objeto de tela. O client nunca vê as partes separadas.
3. **Domínio→rótulo NO SERVIDOR**: resolva todo código de catálogo para texto exibível usando os domínios (`GET /dominios/:table`). O client recebe `relationshipLabel`, `statusLabel`, `typeLabel` — não o código.
4. **Ações/transições disponíveis**: calcule no servidor o que a tela pode fazer (ex.: `availableTransitions` a partir da situação do paciente; `canEdit`/`canDelete` a partir do papel). O client só renderiza botões; não deriva regra.
5. **Degradação parcial**: se uma origem **secundária** falhar, devolva o que tem com `meta.partial: true` e omita só a seção indisponível — a tela não quebra. Uma origem **primária** ausente vira erro (ex.: paciente inexistente → 404).

## Tipos
- Defina o tipo da view-ready com `Elysia.t` (flui ao client via Eden — sem redeclarar Model). Ex.: `PatientOverview`, `PersonOverview`.
- Os tipos puros de retorno ficam em `src/modules/<f>/client/data/*.model.ts` (consumo no client).

## Reuso por mutações
Após uma escrita, a rota `*.service.fn.ts` chama a mesma composição (ou um recorte dela) para **devolver o fragmento recomposto** — o client troca o estado sem refetch (ADR-0010 §3).

## Regras
- Zero dep npm nova (`fetch`/`Promise.all`/`Map`). Errors-as-values. Sem PII em log.
- A composição é **server-only** (`src/server/`), nunca importada pelo client.
- Sem dado fabricado: tudo vem da fonte; o que falta fica honesto (`meta.partial` / `'not-implemented'`), não inventado.

## Checklist
- [ ] O client renderiza a tela inteira com **um** GET.
- [ ] Todos os códigos viraram rótulos no servidor.
- [ ] Ações/transições calculadas no servidor.
- [ ] Falha de origem secundária degrada (`meta.partial`), não quebra.
