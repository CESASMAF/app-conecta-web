# Patient Registration — UX Copy, Accessibility & Responsiveness

> Tudo que o view-implementer precisa para textos, ARIA, keyboard, e breakpoints.
> Design System: **Sage Garden**

---

## 1. UX Copy (PT-BR)

Todas as strings da UI. Código em inglês, UI em português brasileiro.

```typescript
// src/client/viewmodels/registration/strings.ts

export const REGISTRATION_STRINGS = {
  // ── Navigation ──────────────────────────────────────
  backToFamilies: 'Voltar para Familias',
  draftSaved: 'Rascunho salvo automaticamente',

  // ── Steps ───────────────────────────────────────────
  steps: [
    { number: 'Etapa 01', title: 'Dados Pessoais', desc: 'Informacoes basicas da pessoa de referencia.' },
    { number: 'Etapa 02', title: 'Documentos', desc: 'CPF, NIS, CNS e documentos de identificacao. Informe ao menos um.' },
    { number: 'Etapa 03', title: 'Endereco', desc: 'Situacao de moradia e localizacao.' },
    { number: 'Etapa 04', title: 'Diagnosticos', desc: 'Pelo menos um diagnostico e obrigatorio.' },
    { number: 'Etapa 05', title: 'Composicao Familiar', desc: 'Membros da familia (opcional).' },
    { number: 'Etapa 06', title: 'Especificidades (opcional)', desc: 'Identidade social, etnica ou cultural.' },
    { number: 'Etapa 07', title: 'Ingresso', desc: 'Tipo de ingresso e motivo do atendimento.' },
  ] as const,
  stepLabels: ['Pessoais', 'Docs', 'Endereco', 'Diag.', 'Familia', 'Espec.', 'Ingresso'] as const,
  stepperMobile: (current: number, total: number, label: string): string =>
    `Etapa ${current} de ${total} — ${label}`,

  // ── Buttons ─────────────────────────────────────────
  btnBack: 'Anterior',
  btnNext: 'Proximo',
  btnSave: 'Salvar Cadastro',
  btnSaving: 'Salvando...',
  btnAddDiagnosis: 'Adicionar diagnostico',
  btnAddMember: 'Adicionar membro',
  btnConfirm: 'Confirmar',
  btnCancel: 'Cancelar',

  // ── Step 0: Dados Pessoais ──────────────────────────
  labelFirstName: 'Nome',
  labelLastName: 'Sobrenome',
  labelSocialName: 'Nome Social',
  labelMotherName: 'Nome da Mae',
  labelBirthDate: 'Data de Nascimento',
  labelNationality: 'Nacionalidade',
  labelSex: 'Sexo',
  labelPhone: 'Telefone',
  phFirstName: 'Nome',
  phLastName: 'Sobrenome',
  phSocialName: 'Nome social (opcional)',
  phMotherName: 'Nome completo da mae',
  phBirthDate: 'DD/MM/AAAA',
  phPhone: '(00) 00000-0000',
  sexOptions: ['Masculino', 'Feminino', 'Outro'] as const,
  nationalityOptions: ['Brasileira', 'Naturalizada', 'Estrangeira'] as const,

  // ── Step 1: Documentos ──────────────────────────────
  labelCPF: 'CPF',
  labelNIS: 'NIS',
  labelCNS: 'CNS',
  labelRGNumber: 'Numero do RG',
  labelRGUf: 'UF',
  labelRGAgency: 'Orgao Emissor',
  labelRGDate: 'Data de Emissao',
  rgSectionTitle: 'RG (preencha todos ou nenhum)',
  phCPF: '000.000.000-00',
  phNIS: '00000000000',
  phCNS: '000 0000 0000 0000',

  // ── Step 2: Endereço ────────────────────────────────
  labelLocationType: 'Qual a situacao de moradia?',
  locationUrban: 'Urbano',
  locationUrbanDesc: 'Residencia em area urbana',
  locationRural: 'Rural',
  locationRuralDesc: 'Residencia em area rural',
  locationHomeless: 'Situacao de Rua',
  locationHomelessDesc: 'Pessoa sem moradia fixa',
  labelHousing: 'Tipo de Moradia',
  labelCEP: 'CEP',
  labelStreet: 'Rua',
  labelNumber: 'Numero',
  labelComplement: 'Complemento',
  labelNeighborhood: 'Bairro',
  labelState: 'Estado',
  labelCity: 'Cidade',
  labelShelter: 'Unidade de acolhimento / abrigo',
  housingOptions: ['Propria', 'Alugada', 'Cedida', 'Outros'] as const,
  bannerRural: 'Rua e Complemento nao se aplicam para area rural.',
  bannerHomeless: 'Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS.',

  // ── Step 3: Diagnósticos ────────────────────────────
  labelDiagCID: 'Codigo CID',
  labelDiagDate: 'Data',
  labelDiagDesc: 'Descricao',
  phDiagCID: 'Ex: G80',
  phDiagDate: 'DD/MM/AAAA',
  phDiagDesc: 'Descricao do diagnostico',
  diagStatusPending: 'Pendente',
  diagStatusComplete: 'Completo',

  // ── Step 4: Família ─────────────────────────────────
  labelFmName: 'Nome',
  labelFmBirth: 'Data de nascimento',
  labelFmSex: 'Sexo',
  labelFmRelationship: 'Parentesco',
  labelFmLives: 'Reside com o paciente',
  labelFmDisability: 'Pessoa com deficiencia',
  docSectionTitle: 'Documentos necessarios',
  docSectionDesc: 'Selecione os documentos que deseja informar para este membro.',
  referencePersonLabel: 'Pessoa de referencia',

  // ── Step 5: Especificidades ─────────────────────────
  labelIdentity: 'Identidade Social',
  labelDescription: 'Descricao',
  labelObservations: 'Observacoes',
  identityOptions: [
    'Quilombola', 'Indigena', 'Ribeirinho', 'Cigano',
    'Extrativista', 'Pescador artesanal',
    'Pertencente a comunidade de terreiro',
    'Nenhuma das anteriores',
  ] as const,

  // ── Step 6: Ingresso ────────────────────────────────
  labelIngressType: 'Tipo de Ingresso',
  labelOriginName: 'Nome da Origem',
  labelOriginContact: 'Contato da Origem',
  labelServiceReason: 'Motivo do Atendimento',
  labelPrograms: 'Programas sociais vinculados',
  labelObservation: 'Observacao',
  phOriginName: 'Nome da origem',
  phOriginContact: 'Telefone ou email',
  phServiceReason: 'Descreva o motivo do primeiro atendimento...',
  phObservation: 'Anotacoes gerais sobre o ingresso...',
  ingressTypes: ['Demanda espontanea', 'Busca ativa', 'Encaminhamento', 'Reincidencia'] as const,
  socialPrograms: [
    'BPC (Beneficio de Prestacao Continuada)',
    'Bolsa Familia',
    'Auxilio Brasil',
    'PETI',
    'Outros programas',
  ] as const,

  // ── Success ─────────────────────────────────────────
  successTitle: 'Cadastro realizado!',
  successDesc: 'A familia foi cadastrada com sucesso no sistema Conecta.',
  successNewRegistration: 'Novo cadastro',
  successViewFamilies: 'Ver familias',

  // ── Errors ──────────────────────────────────────────
  errRequired: 'Campo obrigatorio',
  errDateFormat: 'Formato invalido (DD/MM/AAAA)',
  errDateInvalid: 'Data invalida',
  errDateFuture: (code: string): string => `Data nao pode ser futura (${code})`,
  errCpfLength: 'CPF deve ter 11 digitos (CPF-003)',
  errCpfInvalid: 'CPF invalido (CPF-005)',
  errNisLength: 'NIS deve ter 11 digitos (NIS-002)',
  errRgRequired: (code: string): string => `Obrigatorio quando RG informado (${code})`,
  errAtLeastOneDoc: 'Pelo menos um documento deve ser informado — CPF, NIS ou RG (CD-001)',
  errLocationRequired: 'Selecione a situacao de moradia',
  errUfRequired: 'UF e obrigatoria (ADDR-002)',
  errCityRequired: 'Cidade e obrigatoria (ADDR-004)',
  errHousingRequired: 'Tipo de moradia e obrigatorio',
  errCepLength: 'CEP deve ter 8 digitos (CEP-003)',
  errCepRange: 'CEP nao pertence a nenhuma faixa valida (CEP-004)',
  errAtLeastOneDiag: 'Pelo menos um diagnostico e obrigatorio (PAT-001)',
  errCidRequired: 'Codigo CID obrigatorio (ICD-001)',
  errCidFormat: 'Formato CID invalido — ex: G80, F84.0',
  errDescRequired: 'Descricao obrigatoria (DIA-003)',
  errIngressRequired: 'Tipo de ingresso e obrigatorio',
  errReasonRequired: 'Motivo do atendimento e obrigatorio (ING-001)',
  errMaxLength: (max: number): string => `Maximo ${max} caracteres`,
} as const
```

### Regras de Copy

- **Títulos de step (h3):** Erode bold 28px, sem ponto final
- **Descrições de step (p):** Satoshi 15px regular, com ponto final, textMuted
- **Labels de campo:** Satoshi 12px 600 UPPERCASE, letter-spacing 1px, textSoft
- **Placeholders:** Satoshi 15px italic, textSoft
- **Botões primários:** Satoshi 14px 600, ação direta ("Proximo", "Salvar")
- **Botões secundários:** Satoshi 14px 600, ação reversa ("Anterior", "Cancelar")
- **Erros:** Satoshi 12.5px, danger color, sem ponto
- **Section titles:** Satoshi 12px 600 UPPERCASE, letter-spacing 1px

---

## 2. Acessibilidade (WCAG 2.1 AA)

### 2.1 Landmarks

```html
<!-- Shell -->
<nav class="sidebar" aria-label="Menu principal">
  <!-- sidebar items -->
</nav>

<main class="main-content" aria-label="Cadastro de paciente">
  <!-- wizard topbar -->
  <nav aria-label="Navegacao do wizard">
    <!-- stepper -->
  </nav>

  <!-- step content -->
  <section aria-label="Etapa atual do cadastro" aria-live="polite">
    <form novalidate>
      <!-- step fields -->
    </form>
  </section>
</main>

<!-- Success -->
<div role="dialog" aria-modal="true" aria-labelledby="success-title">
  <!-- success content -->
</div>
```

### 2.2 ARIA Attributes

| Elemento | Atributo | Valor | Motivo |
|----------|----------|-------|--------|
| Sidebar nav | `aria-label` | "Menu principal" | Identifica a navegação |
| Sidebar item ativo | `aria-current` | "page" | Indica página atual |
| Main content | `aria-label` | "Cadastro de paciente" | Identifica o conteúdo |
| Step content section | `aria-live` | "polite" | Anuncia mudança de step |
| Stepper progress bar | `role="progressbar"` | `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="6"` | Progresso do wizard |
| Step dot | `aria-label` | "Etapa N: {label}" | Identifica cada passo |
| Card selector group | `role="radiogroup"` | `aria-label="{label}"` | Grupo de seleção |
| Card selector item | `role="radio"` | `aria-checked="{selected}"` | Opção de seleção |
| Error banner | `role="alert"` | — | Auto-announce erros |
| Validation errors | `aria-live="assertive"` | — | Anuncia erros de campo |
| Diagnosis remove | `aria-label` | "Remover diagnostico N" | Ação descritiva |
| Member remove | `aria-label` | "Remover membro {nome}" | Ação descritiva |
| Document chips | `aria-pressed` | `"{isActive}"` | Toggle button state |
| Success overlay | `role="dialog"`, `aria-modal="true"` | `aria-labelledby="success-title"` | Dialog modal |
| Success checkmark SVG | `aria-hidden` | "true" | Decorativo |
| Sidebar icons | `aria-hidden` | "true" | Decorativos (label textual existe) |
| Info banner icon ℹ | `aria-hidden` | "true" | Decorativo |
| Diagnosis status icon | `aria-hidden` | "true" | Status indicado pelo texto |
| Program checkboxes | `role="checkbox"` | `aria-checked="{selected}"` | Checkbox customizado |

### 2.3 Keyboard Navigation

| Tela | Elemento | Tab? | Enter/Space | Escape | Arrow Keys |
|------|----------|------|-------------|--------|------------|
| All | Back link | ✅ | ✅ navega | — | — |
| All | Step dots | ✅ (tabindex=0) | ✅ go to step | — | ← → entre steps |
| All | Back button | ✅ (button) | ✅ prevStep | — | — |
| All | Next button | ✅ (button) | ✅ nextStep | — | — |
| Step 0 | Form inputs | ✅ | — | — | — |
| Step 0 | Sex cards | ✅ (tabindex=0) | ✅ select | — | ← → entre opções |
| Step 1 | Form inputs | ✅ | — | — | — |
| Step 2 | Location cards | ✅ (tabindex=0) | ✅ select | — | ← → entre opções |
| Step 2 | Checkbox (abrigo) | ✅ | ✅ toggle | — | — |
| Step 3 | CID chips | ✅ (button) | ✅ fill | — | — |
| Step 3 | Remove diagnosis | ✅ (button) | ✅ remove | — | — |
| Step 3 | Add diagnosis | ✅ (button) | ✅ add | — | — |
| Step 4 | Add member | ✅ (button) | ✅ show form | — | — |
| Step 4 | Doc chips | ✅ (button) | ✅ toggle | — | — |
| Step 4 | Confirm/Cancel | ✅ (button) | ✅ action | — | — |
| Step 4 | Remove member | ✅ (button) | ✅ remove | — | — |
| Step 6 | Programs | ✅ (tabindex=0) | ✅ toggle | — | — |
| Success | "Novo cadastro" | ✅ (button) | ✅ reset | Esc dismiss | — |
| Success | "Ver familias" | ✅ (a href) | ✅ navigate | — | — |

**Tab order sugerido por step:**

Step 0: firstName → lastName → socialName → motherName → birthDate → nationality → sex(M) → sex(F) → sex(O) → phone → Back → Next

Step 2: location(Urbano) → location(Rural) → location(Rua) → housing → cep → street → number → complement → neighborhood → state → city → shelter → Back → Next

Step 3: diagCid → diagDate → diagDesc → chip1..chip8 → removeBtn → addBtn → Back → Next

Step 6: ingressType → originName → originContact → serviceReason → program1..program5 → observation → Back → Submit

### 2.4 Contraste (verificado — Sage Garden)

| Elemento | Foreground | Background | Ratio | Req. | Pass |
|----------|-----------|------------|-------|------|------|
| Step title (h3) | #1E2B1A | rgba card ~#FAFAFA | ~15:1 | 3:1 (large) | ✅ |
| Step description | #6B7F65 | rgba card ~#FAFAFA | ~3.8:1 | 4.5:1 | ⚠️ Borderline |
| Field label | #8B9E85 | rgba card ~#FAFAFA | ~3.0:1 | 4.5:1 | ❌ FALHA |
| Field input text | #1E2B1A | transparent/gradient | ~12:1 | 4.5:1 | ✅ |
| Placeholder text | #8B9E85 | transparent/gradient | ~2.8:1 | N/A (placeholder) | ⚠️ |
| Error text | #C4422B | rgba card ~#FAFAFA | ~5.2:1 | 4.5:1 | ✅ |
| Green primary text | #4F8448 | rgba card ~#FAFAFA | ~4.1:1 | 4.5:1 | ⚠️ Borderline |
| Green primary text | #4F8448 | greenLight bg | ~3.8:1 | 4.5:1 | ⚠️ Borderline |
| Button primary text | #FFFFFF | #4F8448 gradient | ~4.5:1 | 4.5:1 | ✅ Exato |
| Button secondary text | #6B7F65 | transparent | ~3.2:1 on gradient | 4.5:1 | ⚠️ |
| Sidebar label | #6B7F65 | rgba(255,255,255,0.3) | ~3.5:1 | 4.5:1 | ⚠️ |
| Banner info text | #3D5235 | rgba(79,132,72,0.06) | ~8:1 | 4.5:1 | ✅ |
| Banner error text | #C4422B | rgba(196,66,43,0.06) | ~5.0:1 | 4.5:1 | ✅ |
| Disabled field | opacity 0.4 text | any bg | <2:1 | 4.5:1 | ❌ FALHA |

### Correções de contraste necessárias:

1. **Field labels (`--text-soft`):** Mudar de #8B9E85 para #6B7F65 (textMuted) para labels = ratio ~3.8:1. Ou usar #5A7154 = ~4.6:1 ✅
2. **Step description:** Mudar de textMuted para textSecondary (#3D5235) = ~8:1 ✅
3. **Green primary em chips/selectors:** Usar #3D6A37 (greenDark) para texto sobre fundo claro = ~5.8:1 ✅
4. **Disabled fields:** Usar opacity 0.5 + texto strikethrough/pattern em vez de opacity pura
5. **Placeholders:** WCAG não exige contraste em placeholders, mas para usabilidade recomenda-se ≥ 3:1

### 2.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }

  /* Blobs: parar completamente */
  .bg-blob-1, .bg-blob-2 {
    animation: none;
  }

  /* Step content: aparecer imediatamente */
  .step-content {
    animation: none;
    opacity: 1;
    transform: none;
  }

  /* Address fields: revelar sem animação */
  .addr-fields-visible {
    transition: none;
  }

  /* Success overlay: sem spring */
  .success-overlay.visible .success-glass {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### 2.6 Screen Reader Announcements

| Evento | O que anuncia | Como |
|--------|---------------|------|
| Mudança de step | "Etapa N: {título}" | `aria-live="polite"` na section do step |
| Erro de validação | Mensagem do primeiro erro | `role="alert"` no GlobalErrorBanner |
| Erro inline | Mensagem do campo | `aria-live="assertive"` no `.field-error` |
| Diagnosis status change | "Completo" / "Pendente" | `aria-live="polite"` no status text |
| Success | "Cadastro realizado!" | `role="dialog"` auto-focus no título |
| Location type selected | "Urbano selecionado" etc. | `aria-checked="true"` + screen reader reads label |
| Document section appear | Seção nova | `aria-live="polite"` no container de docs |
| Member added | "{nome} adicionado" | `aria-live="polite"` na lista de membros |

---

## 3. Responsividade

### 3.1 Breakpoints

```typescript
// Consistente com design-tokens.md
const breakpoint = {
  mobile: 600,    // < 600px (corrigido de 768px no protótipo)
  tablet: 1200,   // 600-1200px
  desktop: 1200,  // >= 1200px
}
```

### 3.2 Adaptações por Tela

#### Wizard (todas as steps)

| Elemento | Mobile (< 600px) | Desktop (>= 600px) |
|----------|-------------------|---------------------|
| Sidebar | **Escondida** | 64px collapsed, 220px hover |
| Main padding | 24px 16px | 40px 32px |
| Step content padding | 28px 24px | 40px 44px |
| Form grid | 1 coluna | 2 colunas |
| Stepper dots + labels | **Escondidos** | Visíveis |
| Stepper mobile text | Visível | Escondido |
| Card selectors | Coluna vertical | Row horizontal |
| Programs grid | 1 coluna | 2 colunas |
| Diagnosis grid | 1 coluna | 2 colunas |
| Member row | 3 colunas (auto 1fr auto) | 4 colunas (auto 1fr 1fr auto) |
| Member meta | Grid col 2, 12px | Inline, 14px |

#### Step 2 (Endereço)

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Location type cards | Coluna vertical | Row horizontal (3 cards) |
| Info banner | Full width | Full width (same) |
| Address fields | 1 coluna | 2 colunas |

#### Step 4 (Família - Form)

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Family form | Compact padding | Full padding (s5) |
| Document chips | Wrap, smaller gaps | Row wrap, s2 gaps |
| Document sections | 1 coluna | 2 colunas |

### 3.3 CSS Implementation

```css
/* Mobile-first base (< 600px) */
.sidebar { display: none; }
.main-content { margin-left: 0; padding: 24px 16px; }
.step-content { padding: 28px 24px; }
.form-grid { grid-template-columns: 1fr; }
.programs-grid { grid-template-columns: 1fr; }
.diagnosis-grid { grid-template-columns: 1fr; }
.progress-steps { display: none; }
.stepper-mobile { display: block; }
.card-selector-group { flex-direction: column; }
.member-row {
  grid-template-columns: auto 1fr auto;
  gap: var(--s2);
}
.member-meta { grid-column: 2; font-size: 12px; }

/* Desktop (>= 600px) */
@media (min-width: 600px) {
  .sidebar { display: flex; }
  .main-content { margin-left: var(--sidebar-width); padding: 40px 32px; }
  .step-content { padding: 40px 44px; }
  .form-grid { grid-template-columns: 1fr 1fr; }
  .programs-grid { grid-template-columns: 1fr 1fr; }
  .diagnosis-grid { grid-template-columns: 1fr 1fr; }
  .progress-steps { display: flex; }
  .stepper-mobile { display: none; }
  .card-selector-group { flex-direction: row; }
  .member-row {
    grid-template-columns: auto 1fr 1fr auto;
    gap: var(--s4);
  }
  .member-meta { grid-column: auto; font-size: 14px; }
}
```

---

## 4. Animações (referência rápida)

Durações e curvas consistentes com o design spec Sage Garden e `animations.md`:

| Elemento | Animação | Duração | Easing | Delay |
|----------|----------|---------|--------|-------|
| Step glass card | containerFadeIn (opacity + translateY 16px) | 600ms | ease-out | 0 |
| Error banner | bannerSlide (opacity + translateX -8px) | 500ms | ease-out | 0 |
| Diagnosis card | fadeInUp (opacity + translateY 12px) | 500ms | ease-out | 0 |
| Member row | fadeInUp | 500ms | ease-out | 0 |
| Document section | fadeInUp | 400ms | ease-out | 0 |
| Address fields reveal | max-height + opacity | 500ms + 400ms | ease-out | 0 |
| Progress bar fill | width | 600ms | ease-out | 0 |
| Sidebar expand | width | 300ms | ease-out | 0 |
| Sidebar labels | opacity + translateX -8px | 300ms | ease-out | 0 |
| Card selector hover | bg + border-color | 300ms | ease-out | — |
| Input focus | border-color | 300ms | ease-out | — |
| Button hover | translateY(-1px) + shadow | 300ms | ease-out | — |
| Success overlay | opacity | 500ms | ease-out | 0 |
| Success glass card | successIn (scale 0.95→1) | 800ms | spring | 0 |
| Success circle | successScale (0→1.1→1) | 600ms | spring | 0 |
| Checkmark SVG | checkDraw (stroke-dashoffset) | 500ms | ease-out | 400ms |
| Success title | fadeInUp | 500ms | ease-out | 600ms |
| Success subtitle | fadeInUp | 500ms | ease-out | 750ms |
| Success actions | fadeInUp | 500ms | ease-out | 900ms |
| Diagnosis status | all (color, bg, border) | 300ms | ease-out | — |
| CID chip active | all (bg, border, color) | 150ms | ease-out | — |

### Easing Curves

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);    /* Standard Sage Garden */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Celebratory (success) */
```

### Duration Scale

```css
--duration-fast: 150ms;   /* Micro-interactions (chips, toggles) */
--duration-normal: 300ms; /* Standard transitions (hover, focus, sidebar) */
--duration-slow: 500ms;   /* Entrance animations (cards, rows, banners) */
```

### Keyframes (shared)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes containerFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bannerSlide {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes successScale {
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes checkDraw {
  to { stroke-dashoffset: 0; }
}

@keyframes successIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```
