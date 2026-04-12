# Admin Hub — States & Flows

> Todos os estados de cada tab, transicoes entre eles, e edge cases.
> Este documento e a referencia do viewmodel-engineer e view-implementer para garantir que nenhum estado foi esquecido.

## State Machine Overview

```
                          ┌──────────────────┐
                          │   Auth Hub Card   │
                          │  "Administracao"  │
                          └────────┬─────────┘
                                   │ click / navigate /admin
                                   ▼
                          ┌──────────────────┐
                          │   adminGuard     │
                          │   role check     │
                          └───┬──────────┬───┘
                          NO  │          │ YES (admin/owner)
                              ▼          ▼
                        redirect /    ┌──────────────────┐
                        (Auth Hub)    │  Admin Hub Shell  │
                                      │  Tab: Dashboard   │
                                      └────────┬─────────┘
                                               │
                    ┌──────────┬───────────┬────┴────┬──────────┐
                    ▼          ▼           ▼         ▼          ▼
              ┌──────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
              │Dashboard │ │Pessoas │ │Lookups  │ │Solicita. │ │Auditoria │
              │  Tab     │ │ Tab    │ │  Tab    │ │   Tab    │ │   Tab    │
              └────┬─────┘ └───┬────┘ └────┬────┘ └────┬─────┘ └────┬─────┘
                   │           │           │           │            │
            ┌──────┼──────┐    │     ┌─────┼─────┐     │            │
            ▼      ▼      ▼   ▼     ▼     ▼     ▼     ▼            ▼
          idle  loading loaded  ... idle  loading drill  ...       load more
          error              error       entries        error     (pagination)
```

Cada tab tem 4 estados independentes: `idle → loading → loaded | error`
Dados sao carregados on-demand quando a tab e ativada pela primeira vez.

---

## Tab 1: Dashboard — Estados

### 1.1 Loading (inicial)

- **Condicao:** `tabStates.dashboard === 'loading'`
- **Trigger:** Mount do componente (useEffect on mount)
- **Renderiza:** 4 stat cards skeleton + 3 pending items skeleton + 3 audit entry skeletons
- **Animacao:** Shimmer 1.5s infinite
- **ARIA:** `role="status"` com `aria-label="Carregando dados do dashboard"`

### 1.2 Normal (com dados)

- **Condicao:** `tabStates.dashboard === 'loaded'` e `stats !== null`
- **Renderiza:**
  - StatsGrid: 4 cards (Pessoas, Roles Ativos, Solicitacoes Pendentes [highlight], Acoes no Audit)
  - PendingSection: Header "Solicitacoes pendentes" + lista de PendingItems + link "Ver todas"
  - RecentAuditSection: Header "Atividade recente" + 5 ultimas AuditEntries + link "Ver audit completo"
- **Animacao entrada:** fadeInUp 500ms ease (stats grid), 600ms (sections)
- **Interacoes:**
  - Click "Ver todas" → switchTab('solicitacoes')
  - Click "Ver audit completo" → switchTab('auditoria')
  - Click Aprovar → OPEN_MODAL(approve, ...)
  - Click Rejeitar → OPEN_MODAL(reject, ...)

### 1.3 Vazio (sem dados)

- **Condicao:** `tabStates.dashboard === 'loaded'` e `stats.people.total === 0`
- **Renderiza:** StatsGrid com zeros + EmptyState ("Nenhuma atividade ainda")
- **Descricao:** "Comece cadastrando pessoas ou configurando lookup tables para ver atividade aqui."

### 1.4 Erro

- **Condicao:** `tabStates.dashboard === 'error'`
- **Renderiza:** ErrorState com titulo e mensagem
- **Retry:** Click "Tentar novamente" → LOAD_DASHBOARD_START → refetch

---

## Tab 2: Pessoas — Estados

### 2.1 Loading

- **Condicao:** `tabStates.pessoas === 'loading'`
- **Renderiza:** SectionHeader (sem botao) + SearchInput disabled + 4 table row skeletons

### 2.2 Normal

- **Condicao:** `tabStates.pessoas === 'loaded'` e `people.length > 0`
- **Renderiza:**
  - SectionHeader com botao "+ Nova Pessoa"
  - SearchInput com filtro client-side
  - PeopleTable com PersonRows
- **Filtragem:** `peopleSearch` filtra por nome (case-insensitive) ou CPF (remove pontuacao)
- **Interacoes:**
  - Digitar no search → SET_PEOPLE_SEARCH
  - Click "+ Nova Pessoa" → abre formulario (modal ou inline, TBD)
  - Click numa row → expandir detalhes/roles (TBD)

### 2.3 Vazio

- **Condicao:** `tabStates.pessoas === 'loaded'` e `people.length === 0`
- **Renderiza:** SectionHeader + EmptyState ("Nenhuma pessoa cadastrada")

### 2.4 Vazio por filtro

- **Condicao:** `tabStates.pessoas === 'loaded'` e `filteredPeople.length === 0` e `peopleSearch !== ''`
- **Renderiza:** SectionHeader + SearchInput + EmptyState ("Nenhum resultado para '{query}'")

### 2.5 Erro

- **Condicao:** `tabStates.pessoas === 'error'`
- **Renderiza:** ErrorState ("Erro ao carregar pessoas", "O servico people-context nao respondeu.")

---

## Tab 3: Lookup Tables — Estados

### 3.1 Loading

- **Condicao:** `tabStates.lookups === 'loading'`
- **Renderiza:** SectionHeader + 6 lookup card skeletons

### 3.2 Normal (grid)

- **Condicao:** `tabStates.lookups === 'loaded'` e `selectedTable === null`
- **Renderiza:**
  - SectionHeader "Lookup Tables"
  - SearchInput para filtrar tabelas por nome
  - LookupGrid com 13 LookupCards
- **Interacoes:** Click num card → SELECT_LOOKUP_TABLE + fetch entries

### 3.3 Drill-down (tabela selecionada)

- **Condicao:** `tabStates.lookups === 'loaded'` e `selectedTable !== null`
- **Renderiza:**
  - LookupGrid (todas as cards, card selecionada com borda primary)
  - LookupDetailPanel (abaixo, com animacao fadeInUp):
    - SectionHeader "Detalhes: {tableName}" + botao "+ Novo Valor"
    - LookupEntryTable com ToggleSwitches
- **Interacoes:**
  - Click toggle → PATCH toggle → TOGGLE_ENTRY_SUCCESS
  - Click outra card → SELECT_LOOKUP_TABLE (troca)
  - Click "+ Novo Valor" → abre formulario (TBD)

### 3.4 Vazio

- **Condicao:** `tabStates.lookups === 'loaded'` e `lookupTables.length === 0`
- **Renderiza:** EmptyState ("Nenhuma tabela encontrada")

### 3.5 Erro

- **Condicao:** `tabStates.lookups === 'error'`
- **Renderiza:** ErrorState ("Erro ao carregar tabelas", "O servico social-care nao respondeu.")

---

## Tab 4: Solicitacoes — Estados

### 4.1 Loading

- **Condicao:** `tabStates.solicitacoes === 'loading'`
- **Renderiza:** SectionHeader + 3 table row skeletons

### 4.2 Normal

- **Condicao:** `tabStates.solicitacoes === 'loaded'` e `requests.length > 0`
- **Renderiza:**
  - SectionHeader "Solicitacoes"
  - RequestsTable com todas as requests (pendentes primeiro, depois aprovados/rejeitados)
- **Interacoes:**
  - Click Aprovar → OPEN_MODAL(approve, requestId, label)
  - Click Rejeitar → OPEN_MODAL(reject, requestId, label)
  - Modal confirma → PUT approve/reject → APPROVE_SUCCESS/REJECT_SUCCESS → SHOW_TOAST

### 4.3 Vazio

- **Condicao:** `tabStates.solicitacoes === 'loaded'` e `requests.length === 0`
- **Renderiza:** EmptyState ("Nenhuma solicitacao pendente", "Todas as solicitacoes foram processadas.")

### 4.4 Erro

- **Condicao:** `tabStates.solicitacoes === 'error'`
- **Renderiza:** ErrorState

---

## Tab 5: Auditoria — Estados

### 5.1 Loading

- **Condicao:** `tabStates.auditoria === 'loading'`
- **Renderiza:** SectionHeader + SearchInput disabled + 5 audit entry skeletons

### 5.2 Normal

- **Condicao:** `tabStates.auditoria === 'loaded'` e `auditEntries.length > 0`
- **Renderiza:**
  - SectionHeader "Auditoria"
  - SearchInput para filtrar por acao ou ator (client-side)
  - AuditLog com role="log" e aria-label="Historico de auditoria"
  - LoadMoreButton (se auditOffset < auditTotal)
- **Interacoes:**
  - Click "Carregar mais" → LOAD_MORE_AUDIT_SUCCESS (append, nao replace)
  - Digitar no search → filtro client-side

### 5.3 Vazio

- **Condicao:** `tabStates.auditoria === 'loaded'` e `auditEntries.length === 0`
- **Renderiza:** EmptyState ("Nenhum registro de auditoria")

### 5.4 Erro

- **Condicao:** `tabStates.auditoria === 'error'`
- **Renderiza:** ErrorState

---

## Modal States

### M.1 Fechado

- **Condicao:** `modal.type === null`
- **Renderiza:** Nada (modal nao existe no DOM)

### M.2 Aprovar

- **Condicao:** `modal.type === 'approve'`
- **Renderiza:** ConfirmModal com texto de aprovacao
- **Animacao entrada:** overlay opacity 0→1 (300ms), box fadeInUp 400ms
- **Interacoes:**
  - Confirmar → PUT approve → APPROVE_SUCCESS → CLOSE_MODAL → SHOW_TOAST(success)
  - Cancelar → CLOSE_MODAL
  - Escape → CLOSE_MODAL
  - Click fora → CLOSE_MODAL

### M.3 Rejeitar

- **Condicao:** `modal.type === 'reject'`
- **Renderiza:** ConfirmModal com textarea para motivo
- **Validacao:** reviewNote obrigatorio (botao Rejeitar disabled se vazio)
- **Interacoes:** Mesmo que M.2, mas com reviewNote no body

---

## Toast States

### T.1 Sucesso

- **Condicao:** `toast?.type === 'success'`
- **Mensagem:** "Solicitacao aprovada com sucesso" / "Solicitacao rejeitada"
- **Animacao:** slideUp 400ms elastic
- **Auto-dismiss:** 4000ms → HIDE_TOAST

### T.2 Erro

- **Condicao:** `toast?.type === 'error'`
- **Mensagem:** "Erro ao processar solicitacao. Tente novamente."
- **role="alert"**, aria-live="assertive"
- **Auto-dismiss:** 4000ms → HIDE_TOAST

---

## Edge Cases

### EC-1: Admin perde role durante sessao

- Cenario: Outro admin remove o role "admin" enquanto o usuario esta na tela
- Comportamento: Proxima request ao BFF retorna 403
- O client recebe erro → ErrorState com "Voce nao tem mais permissao para acessar esta area"
- Nao tratamos reconexao automatica — o usuario deve refazer login

### EC-2: Multiple tabs

- Cenario: Admin abre o Admin Hub em duas abas
- Comportamento: Cada aba tem seu estado local (reducer)
- Audit store e compartilhado (server-side), entao ambas as abas veem as mesmas entradas
- Se aba A aprova uma request, aba B so ve a atualizacao ao recarregar (nao ha websocket/polling)
- Aceitavel para o volume esperado (dezenas de requests, nao milhares)

### EC-3: Token refresh durante uso

- O Admin Hub nao faz polling
- Se o token expirar, a proxima request ao BFF tenta refresh proativo
- Se refresh falha → redirect para / com ?reason=session_expired

### EC-4: Lookup table name injection

- Server-side: whitelist de 13 nomes validos, rejeita qualquer outro com 400
- Server-side: UUIDs validados contra regex antes de proxy
- Client nao precisa validar — o server e a fronteira de seguranca

### EC-5: Concurrent approve/reject

- Se dois admins aprovam a mesma request simultaneamente:
- O segundo recebe erro do backend (request ja processada)
- ErrorState ou Toast de erro: "Solicitacao ja foi processada"
- Nao precisamos de locking — volume baixo, feedback claro

### EC-6: Audit store FIFO eviction

- AuditStore tem max 10.000 entries com evicao FIFO
- Para o Admin Hub MVP isso e mais que suficiente
- Se necessario, migramos para persistencia em banco no futuro

### EC-7: Deep link direto para /admin sem sessao

- authGuard rejeita → redirect para / (landing)
- Apos login, usuario volta para Auth Hub e pode clicar no card Admin

### EC-8: User digita na busca e troca de tab

- O searchQuery e por tab (peopleSearch vs lookup filter vs audit filter)
- Ao trocar de tab, o filtro da tab anterior e preservado no state
- Ao voltar, o usuario ve o filtro que deixou

---

## Transition Timing

| De → Para | Duracao | O que acontece |
|-----------|---------|---------------|
| Auth Hub card → Admin Hub | ~500ms | Navigate + SSR + hydrate |
| Tab switch | Imediato | Troca visual, fetch se idle |
| Tab idle → loading | Imediato | Skeleton aparece |
| Tab loading → loaded | ~200-500ms | Fetch completa, dados renderizam |
| Tab loading → error | ~5000ms | Timeout ou erro de rede |
| Click Aprovar → Modal | Imediato | Modal com fadeInUp 400ms |
| Confirmar → Toast | ~200ms | PUT + response + toast slideUp 400ms |
| Toast → dismiss | 4000ms | Auto-dismiss |
| Lookup card → Detail | ~200ms | Fetch + fadeInUp 400ms |
| Load more audit | ~200ms | Append entries, scroll preservado |
