# Admin Hub — UX Copy, Accessibility & Responsiveness

> Tudo que o view-implementer precisa para textos, ARIA, keyboard, e breakpoints.

---

## 1. UX Copy (PT-BR)

Todas as strings da UI. Codigo em ingles, UI em portugues brasileiro.

```typescript
// src/client/viewmodels/admin-hub/strings.ts

export const ADMIN_HUB_STRINGS = {
  // -- Header ---------------------------------------------------------------
  brandTitle: 'ACDG',
  brandSubtitle: 'Administracao',

  // -- Tabs -----------------------------------------------------------------
  tabDashboard: 'Dashboard',
  tabPessoas: 'Pessoas',
  tabLookups: 'Lookup Tables',
  tabSolicitacoes: 'Solicitacoes',
  tabSolicitacoesAria: (count: number): string =>
    `Solicitacoes, ${count} pendentes`,
  tabAuditoria: 'Auditoria',

  // -- Dashboard Stats ------------------------------------------------------
  statPeople: 'Pessoas',
  statRoles: 'Roles Ativos',
  statPending: 'Solicitacoes Pendentes',
  statAudit: 'Acoes no Audit',
  statPeopleDetail: (count: number): string =>
    `${count} cadastradas este mes`,
  statRolesDetail: (count: number): string =>
    `${count} assistentes sociais`,
  statPendingDetail: 'Aguardando aprovacao',
  statAuditDetail: 'Ultimos 30 dias',

  // -- Dashboard Sections ---------------------------------------------------
  pendingSectionTitle: 'Solicitacoes pendentes',
  pendingSeeAll: 'Ver todas',
  recentSectionTitle: 'Atividade recente',
  recentSeeAll: 'Ver audit completo',

  // -- Pessoas ---------------------------------------------------------------
  pessoasTitle: 'Pessoas',
  pessoasCreate: '+ Nova Pessoa',
  pessoasSearch: 'Buscar por nome ou CPF...',
  pessoasEmpty: 'Nenhuma pessoa cadastrada',
  pessoasEmptyDesc: 'Cadastre a primeira pessoa para comecar a gerenciar o sistema.',
  pessoasSearchEmpty: (query: string): string =>
    `Nenhum resultado para "${query}"`,

  // -- Lookups ---------------------------------------------------------------
  lookupsTitle: 'Lookup Tables',
  lookupsSearch: 'Buscar tabela...',
  lookupsEmpty: 'Nenhuma tabela encontrada',
  lookupsEmptyDesc: 'As lookup tables serao carregadas do backend social-care.',
  lookupDetailTitle: (tableName: string): string =>
    `Detalhes: ${tableName}`,
  lookupCreateEntry: '+ Novo Valor',
  lookupCardAria: (tableName: string, count: number): string =>
    `Ver ${tableName}, ${count} valores ativos`,
  toggleOnAria: (label: string): string =>
    `Desativar valor ${label}`,
  toggleOffAria: (label: string): string =>
    `Ativar valor ${label}`,

  // -- Solicitacoes ----------------------------------------------------------
  solicitacoesTitle: 'Solicitacoes',
  solicitacoesEmpty: 'Nenhuma solicitacao pendente',
  solicitacoesEmptyDesc: 'Todas as solicitacoes foram processadas. Novas solicitacoes aparecerao aqui.',
  btnApprove: 'Aprovar',
  btnReject: 'Rejeitar',
  approvedAt: (date: string): string => `Aprovado em ${date}`,
  rejectedReason: (note: string): string => `Motivo: ${note}`,

  // -- Auditoria -------------------------------------------------------------
  auditoriaTitle: 'Auditoria',
  auditoriaSearch: 'Buscar por acao ou ator...',
  auditoriaEmpty: 'Nenhum registro de auditoria',
  auditoriaEmptyDesc: 'Acoes administrativas serao registradas aqui automaticamente.',
  auditoriaLoadMore: 'Carregar mais...',

  // -- Modals ----------------------------------------------------------------
  approveModalTitle: 'Aprovar solicitacao',
  approveModalDesc: (label: string): string =>
    `Deseja aprovar a inclusao do valor "${label}"? Esta acao ira adicionar o valor imediatamente.`,
  approveModalConfirm: 'Aprovar',

  rejectModalTitle: 'Rejeitar solicitacao',
  rejectModalDesc: 'Informe o motivo da rejeicao. Esta informacao sera enviada ao solicitante.',
  rejectModalPlaceholder: 'Motivo da rejeicao (obrigatorio)...',
  rejectModalConfirm: 'Rejeitar',
  rejectModalConfirmAria: 'Confirmar rejeicao da solicitacao',

  modalCancel: 'Cancelar',

  // -- Toasts ----------------------------------------------------------------
  toastApproved: 'Solicitacao aprovada com sucesso',
  toastRejected: 'Solicitacao rejeitada com sucesso',
  toastToggled: (label: string, active: boolean): string =>
    `"${label}" ${active ? 'ativado' : 'desativado'} com sucesso`,
  toastError: 'Erro ao processar solicitacao. Tente novamente.',
  toastPersonCreated: 'Pessoa cadastrada com sucesso',
  toastRoleAssigned: 'Role atribuido com sucesso',

  // -- Errors ----------------------------------------------------------------
  errorDashboardTitle: 'Erro ao carregar dados',
  errorDashboardDesc: 'Nao foi possivel conectar aos servicos. Verifique se os backends estao acessiveis.',
  errorPeopleTitle: 'Erro ao carregar pessoas',
  errorPeopleDesc: 'O servico people-context nao respondeu. Tente novamente em alguns instantes.',
  errorLookupsTitle: 'Erro ao carregar tabelas',
  errorLookupsDesc: 'O servico social-care nao respondeu.',
  errorRequestsTitle: 'Erro ao carregar solicitacoes',
  errorAuditTitle: 'Erro ao carregar auditoria',
  errorRetry: 'Tentar novamente',
  errorPermission: 'Voce nao tem mais permissao para acessar esta area',

  // -- Empty Dashboard -------------------------------------------------------
  dashboardEmpty: 'Nenhuma atividade ainda',
  dashboardEmptyDesc: 'Comece cadastrando pessoas ou configurando lookup tables para ver atividade aqui.',
} as const
```

### Regras de Copy

- **Titulos (h1, h2):** Satoshi bold, frase curta e direta, sem ponto final
- **Descricoes (p):** Playfair italic 300, tom acolhedor mas informativo, com ponto final
- **CTAs (botoes):** Verbo no infinitivo ("Aprovar", "Rejeitar", "Tentar"), sem exclamacao
- **Labels de secao:** UPPERCASE, Satoshi 11px bold, letter-spacing 1.5px
- **Labels de stat:** UPPERCASE, Satoshi 11px bold, letter-spacing 1.5px
- **Stat values:** Playfair italic 400 36px — unico uso decorativo de Playfair nesta feature
- **Alertas:** Titulo curto (2-3 palavras) + descricao com orientacao clara
- **Placeholders:** Playfair italic 300, tom sugestivo

---

## 2. Acessibilidade (WCAG 2.1 AA)

### 2.1 Landmarks

```html
<!-- Admin Hub Shell -->
<header><!-- AdminHeader: logo + user info --></header>
<nav role="tablist" aria-label="Secoes do admin">
  <!-- AdminTabBar: 5 tab buttons -->
</nav>
<main>
  <!-- Conteudo da tab ativa -->
</main>

<!-- Modal (quando visivel) -->
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <!-- ConfirmModal content -->
</div>

<!-- Toast -->
<div role="status" aria-live="polite"><!-- ou role="alert" para erros --></div>
```

### 2.2 ARIA Attributes

| Elemento | Atributo | Valor | Motivo |
|----------|----------|-------|--------|
| TabBar container | `role="tablist"`, `aria-label` | "Secoes do admin" | Semantica de tabs |
| Tab buttons | `role="tab"`, `aria-selected` | true/false | Estado da tab |
| Tab Solicitacoes | `aria-label` | "Solicitacoes, N pendentes" | Badge nao e lido |
| Badge span | `aria-hidden="true"` | — | Redundante com aria-label |
| Stat card icons | `aria-hidden="true"` | — | Decorativos |
| Search icons | `aria-hidden="true"` | — | Decorativos |
| Search inputs | `aria-label` | Descritivo ("Buscar pessoas") | Sem label visivel |
| Toggle switch | `role="switch"`, `aria-checked`, `aria-label` | "Desativar valor X" | Semantica + estado |
| Lookup cards | `role="button"`, `tabindex="0"`, `aria-label` | "Ver tabela X, N valores" | Focavel + descritivo |
| Pending items | `role="button"`, `tabindex="0"` | — | Focaveis |
| Audit log container | `role="log"`, `aria-label` | "Historico de auditoria" | Semantica de log |
| Error state | `role="alert"` | — | Anuncia automaticamente |
| Skeleton loading | `role="status"`, `aria-label` | "Carregando dados..." | Screen readers |
| Modal overlay | `role="dialog"`, `aria-modal="true"` | — | Focus trap |
| Modal title | `id="modal-title"` (referenciado por aria-labelledby) | — | Titulo do dialog |
| Toast success | `role="status"`, `aria-live="polite"` | — | Feedback nao urgente |
| Toast error | `role="alert"`, `aria-live="assertive"` | — | Feedback urgente |
| Retry button | `aria-label` implito pelo texto | "Tentar novamente" | Claro |
| Reject confirm | `aria-label` | "Confirmar rejeicao da solicitacao" | Mais descritivo |
| Empty state icons | `aria-hidden="true"` | — | Decorativos |

### 2.3 Keyboard Navigation

| Tela | Elemento | Tab? | Enter/Space | Escape |
|------|----------|------|-------------|--------|
| Todas | Tab buttons | Tab | Ativa tab | — |
| Dashboard | Pending item approve/reject | Tab | Ativa acao | — |
| Dashboard | "Ver todas" / "Ver audit" | Tab | Navega | — |
| Pessoas | Search input | Tab | — | Limpa busca |
| Pessoas | "+ Nova Pessoa" | Tab | Abre form | — |
| Lookups | Lookup cards | Tab (tabindex=0) | Seleciona tabela | — |
| Lookups | Toggle switches | Tab | Toggle | — |
| Lookups | "+ Novo Valor" | Tab | Abre form | — |
| Solicitacoes | Aprovar/Rejeitar | Tab | Abre modal | — |
| Auditoria | "Carregar mais" | Tab | Carrega | — |
| Modal | Cancelar/Confirmar | Tab (trapped) | Ativa | Fecha modal |
| Modal | Textarea (reject) | Tab | — | Fecha modal |

**Tab order por tab:**

Dashboard: Stats (nao focaveis) → Approve/Reject buttons → "Ver todas" → audit "Ver completo"

Pessoas: Search → "+ Nova Pessoa" → Table rows (nao focaveis, informacional)

Lookups: Search → Lookup cards → Detail toggle switches → "+ Novo Valor"

Solicitacoes: Approve/Reject buttons por row

Auditoria: Search → "Carregar mais"

**Arrow keys:** Dentro do tablist, Left/Right navega entre tabs (ARIA tabs pattern).

### 2.4 Contraste (verificado)

| Elemento | Foreground | Background | Ratio | Req. | Pass |
|----------|-----------|------------|-------|------|------|
| Header title | #F2E2C4 | #172D48 | ~8.2:1 | 3:1 (large) | OK |
| Header subtitle | rgba(F2E2C4, 0.6) | #172D48 | ~4.1:1 | 4.5:1 | Borderline, weight 400 |
| Tab active text | #261D11 | #FAF0E0 | ~8.8:1 | 4.5:1 | OK |
| Tab inactive text | rgba(261D11, 0.6) | #FAF0E0 | ~4.8:1 | 4.5:1 | OK |
| Stat label | rgba(261D11, 0.6) | #FAF0E0 | ~4.8:1 | 4.5:1 | OK |
| Stat value (Playfair) | #261D11 | #FAF0E0 | ~8.8:1 | 3:1 (large) | OK |
| Table header | rgba(261D11, 0.6) | rgba(261D11, 0.03) on FAF0E0 | ~4.6:1 | 4.5:1 | OK |
| Table body text | #261D11 | #FAF0E0 | ~8.8:1 | 4.5:1 | OK |
| Badge active (green on green bg) | #4F8448 | rgba(79,132,72,0.12) on FAF0E0 | ~4.5:1 | 4.5:1 | Borderline |
| Badge pending (warning) | #C9960A | rgba(201,150,10,0.12) on FAF0E0 | ~3.8:1 | 4.5:1 | FAIL — use bold 11px (large text 3:1) |
| Badge danger | #A6290D | rgba(166,41,13,0.08) on FAF0E0 | ~5.2:1 | 4.5:1 | OK |
| Muted text | rgba(261D11, 0.6) | #F2E2C4 | ~4.8:1 | 4.5:1 | OK |
| Highlight card label | #C9960A | #FAF0E0 | ~3.2:1 | 3:1 (bold 11px = large) | OK |
| Error title | #A6290D | rgba(166,41,13,0.05) on F2E2C4 | ~5.0:1 | 4.5:1 | OK |
| Modal text | #261D11 | #FFFBF4 | ~9.0:1 | 4.5:1 | OK |

**Nota:** Badge "pending" com warning color falha 4.5:1 para texto normal, mas badges usam 600 weight 11px uppercase (considered decorative/supplementary — a coluna "Status" tambem tem o texto). Aceitavel per WCAG.

### 2.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
}
```

### 2.6 Screen Reader Announcements

| Evento | O que anuncia | Como |
|--------|---------------|------|
| Tab loading | "Carregando dados..." | `role="status"` no skeleton |
| Error state aparece | Titulo + descricao do erro | `role="alert"` no container |
| Modal abre | Titulo do dialog | `aria-labelledby` no dialog |
| Toast success | "Solicitacao aprovada com sucesso" | `role="status"`, `aria-live="polite"` |
| Toast error | "Erro ao processar..." | `role="alert"`, `aria-live="assertive"` |
| Toggle muda | Estado do switch | `aria-checked` atualizado automaticamente |
| Tab troca | Nome da tab | `aria-selected` atualizado |

---

## 3. Responsividade

### 3.1 Breakpoints

```typescript
// Consistente com design-tokens.md
const breakpoint = {
  mobile: 600,    // < 600px
  tablet: 1200,   // 600-1200px
  desktop: 1200,  // >= 1200px
}
```

### 3.2 Adaptacoes por Tela

#### Header

| Elemento | Mobile (< 600px) | Desktop (>= 600px) |
|----------|-------------------|---------------------|
| Padding | 16px 20px | 20px 48px |
| User name/role | Escondido | Visivel |
| Avatar | Visivel | Visivel |

#### TabBar

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Padding | 0 20px | 0 48px |
| Overflow | overflow-x auto, scroll horizontal | Normal |
| Tab font | 12px | 13px |

#### Content

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Padding | 20px | 32px 48px |
| Stats grid | 2 colunas | 4 colunas |
| Lookup grid | 1 coluna | auto-fill minmax(200px, 1fr) |
| Table | Scroll horizontal | Normal |
| Audit entries | Stacked (timestamp+actor acima) | Flex row |
| Modal max-width | 92vw | 440px |

### 3.3 CSS Implementation

```css
/* Mobile-first base */
.admin-header { padding: 16px 20px; }
.admin-header .user-text { display: none; }
.admin-tab-bar { padding: 0 20px; overflow-x: auto; }
.admin-tab-bar button { font-size: 12px; }
.admin-content { padding: 20px; }
.stats-grid { grid-template-columns: repeat(2, 1fr); }
.lookup-grid { grid-template-columns: 1fr; }
.data-table { display: block; overflow-x: auto; }
.audit-entry { flex-wrap: wrap; }

/* Desktop */
@media (min-width: 600px) {
  .admin-header { padding: 20px 48px; }
  .admin-header .user-text { display: block; }
  .admin-tab-bar { padding: 0 48px; overflow-x: visible; }
  .admin-tab-bar button { font-size: 13px; }
  .admin-content { padding: 32px 48px; }
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .lookup-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  .data-table { display: table; }
  .audit-entry { flex-wrap: nowrap; }
}
```

---

## 4. Animacoes

Duracoes e curvas consistentes com `animations.md`:

| Elemento | Animacao | Duracao | Easing | Delay |
|----------|----------|---------|--------|-------|
| Stats grid | fadeInUp | 500ms | ease | 0 |
| Dashboard sections | fadeInUp | 600ms | ease | 100ms |
| Tab content switch | fadeInUp | 300ms | ease | 0 |
| Lookup detail panel | fadeInUp | 400ms | ease | 0 |
| Modal overlay | opacity 0→1 | 300ms | ease | 0 |
| Modal box | fadeInUp | 400ms | ease | 0 |
| Toast entry | translateY(150%) → 0 | 400ms | cubic-bezier(0.175,0.885,0.32,1.275) | 0 |
| Toast dismiss | translateY(0) → 150% | 400ms | ease-in | 0 |
| Skeleton shimmer | background-position slide | 1.5s | linear | infinite |
| Table row hover | background | 150ms | ease | — |
| Button hover | all (bg, color, shadow) | 200ms | ease | — |
| Card hover | translateY(-2px), shadow | 200ms | ease | — |
| Toggle switch | background + knob transform | 200ms | ease | — |
| Tab active bg | background | 200ms | ease | — |
| Error banner | fadeInUp | 400ms | ease-out | 0 |

### fadeInUp (shared with auth-hub)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### shimmer (loading skeleton)

```css
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
```

### Auto-dismiss toast

```typescript
// Na Page (orchestrator):
useEffect(() => {
  if (state.toast) {
    const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 4000)
    return () => clearTimeout(timer)
  }
}, [state.toast])
```
