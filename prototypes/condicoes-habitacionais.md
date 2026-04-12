# Prototipo: Condicoes Habitacionais da Familia

> Tela dedicada ao registro das condicoes habitacionais de uma familia.
> Acessada a partir do painel de fichas na home (Ficha #10).
> Endpoint: PUT /api/v1/patients/{patientId}/housing-condition

## Arquivo do Prototipo

- `prototypes/condicoes-habitacionais.html`

---

## O que NAO pode faltar na tela final

- [x] Barra de navegacao do paciente (nome, nascimento, CPF, diagnostico, status)
- [x] Link "Voltar para Fichas" no topo
- [x] 3 secoes com glass cards: Estrutura, Infraestrutura, Acessibilidade/Riscos
- [x] Cards selecionaveis para todos os enums (single-select por grupo)
- [x] 3 inputs numericos (comodos, dormitorios, banheiros) em grid 3 colunas
- [x] Toggle switches para todos os campos booleanos
- [x] Textarea de observacoes que aparece ao ativar toggle "Observacoes diagnosticas"
- [x] Painel lateral sticky com calculo de densidade (pessoas/dormitorio)
- [x] Barra de progresso de densidade com cores (verde < 2, amarelo 2-3, vermelho > 3)
- [x] Badge de status de superlotacao (Normal vs Superlotado)
- [x] Indicadores de risco dinamicos — pills que aparecem conforme flags ativadas
- [x] Botao "Salvar condicoes" desabilitado por padrao, habilita quando form esta dirty
- [x] Validacao inline: dormitorios <= comodos (erro aparece junto ao campo)
- [x] Toast de feedback para sucesso e erro ao salvar
- [x] Loading state com skeleton shimmer

---

## O que reprova direto se estiver errado

### Acessibilidade (reprova direto)
- [x] Contraste minimo 4.5:1 em todo texto (WCAG AA)
- [x] Touch targets minimo 44px em mobile (cards selecionaveis, toggles)
- [x] Navegacao por teclado funciona (Tab, Enter, Space nos cards e toggles)
- [x] Cards com role="radiogroup" + role="radio" + aria-checked
- [x] Toggles com role="switch" + aria-checked
- [x] Erros de validacao com role="alert"
- [x] Focus visible (outline 2px offset 2px) em todos os elementos interativos
- [x] Textarea de observacoes com aria-label descritivo

### Responsividade (reprova direto)
- [x] Mobile (< 768px): sidebar hidden, grid 1 coluna, resumo acima das secoes
- [x] Desktop (>= 768px): sidebar visible, grid 2 colunas (5fr 3fr)
- [x] Grid de inputs numericos: sempre 3 colunas mesmo em mobile
- [x] Nenhum overflow horizontal em nenhuma resolucao
- [x] Textos nao ficam cortados ou sobrepostos

### Usabilidade (reprova direto)
- [x] Usuario sabe onde esta: back-link + patient-bar + titulo "Condicoes Habitacionais"
- [x] Usuario sabe o que fazer: labels claros em cada campo e secao
- [x] Erros de formulario aparecem JUNTO ao campo (field-error individual)
- [x] Loading state com skeleton shimmer ao carregar dados existentes
- [x] Feedback visual ao salvar (spinner no botao + toast de resultado)
- [x] Calculo de densidade atualiza em tempo real ao mudar dormitorios

---

## Tokens e cores usados

| Uso | Valor no prototipo | Token esperado |
|-----|-------------------|----------------|
| Fundo pagina | #F8F3EC | sage.bgBase |
| Fundo warm | #F0E8DC | sage.bgWarm |
| Fundo sage | #E2E8DF | sage.bgSage |
| Card glass | rgba(255,255,255,0.45) | sage.bgCard |
| Card hover | rgba(255,255,255,0.65) | sage.bgCardHover |
| Texto principal | #1E2B1A | sage.textPrimary |
| Texto secundario | #3D5235 | sage.textSecondary |
| Texto muted | #6B7F65 | sage.textMuted |
| Texto soft | #637A5D | sage.textSoft |
| Verde primario | #4F8448 | sage.greenPrimary |
| Verde dark | #3D6A37 | sage.greenDark |
| Verde light | rgba(79,132,72,0.08) | sage.greenLight |
| Erro | #C4422B | sage.danger |
| Erro light | rgba(196,66,43,0.08) | sage.dangerLight |
| Warning | #D4A017 | sage.warning |
| Warning light | rgba(212,160,23,0.08) | sage.warningLight |
| Barra densidade verde | #4F8448 | sage.greenPrimary |
| Barra densidade amarela | #D4A017 | sage.warning |
| Barra densidade vermelha | #C4422B | sage.danger |
| Toggle ativo | #4F8448 | sage.greenPrimary |
| Toggle inativo | #D4DDD0 | sage.bgSageDeep |
| Borda input | rgba(79,132,72,0.15) | sage.inputBorder |
| Borda input filled | rgba(79,132,72,0.3) | sage.inputBorderFilled |

---

## Interacoes e comportamentos

| Elemento | Interacao | Detalhe |
|----------|-----------|---------|
| Cards de tipo moradia | Click seleciona (single-select) | role="radio", deseleciona anterior, marca aria-checked |
| Cards de material | Click seleciona (single-select) | Mesmo padrao de tipo moradia |
| Cards de agua/energia/esgoto/lixo | Click seleciona (single-select por grupo) | Cada grupo e um radiogroup independente |
| Cards de acessibilidade | Click seleciona (single-select) | 3 opcoes mutuamente exclusivas |
| Toggle switches | Click liga/desliga | role="switch", transicao 300ms |
| Toggle "Observacoes" | Quando ON, revela textarea | Slide-down com animation 300ms ease-out |
| Inputs numericos | Digitacao com validacao | Aceita apenas numeros >= 0 |
| Validacao dormitorios | Inline, em tempo real | Mostra erro se dormitorios > comodos |
| Densidade sidebar | Recalcula ao mudar dormitorios | Formula: 5 membros / dormitorios (mock) |
| Barra de densidade | Cor muda conforme valor | Verde (<2), amarelo (2-3), vermelho (>3) |
| Indicadores de risco | Aparecem/desaparecem dinamicamente | Pills coloridas no painel lateral |
| Botao Salvar | Desabilitado ate form dirty | Habilita ao mudar qualquer campo |
| Botao Salvar (loading) | Spinner + texto "Salvando..." | Desabilita interacao durante save |
| Toast sucesso | Slide-in bottom-right | Auto-dismiss apos 3 segundos |
| Toast erro | Slide-in bottom-right, borda vermelha | Auto-dismiss apos 3 segundos |
| Skeleton loading | Shimmer animation | Blocos pulsantes no lugar dos cards/inputs |

---

## Notas para o dev

O calculo de densidade por dormitorio e feito pelo dominio em
`src/domain/assessment/services/housing_analytics.ts`:
- Formula: `density = totalFamilyMembers / numberOfBedrooms`
- Fallback: se bedrooms = 0, usa 1 como divisor
- Superlotacao: `density > 3.0` (estritamente maior)

No prototipo, usamos 5 membros como mock. Na implementacao real,
o numero de membros vem do PatientDetail (familyMembers.length).

Os toggles de risco (area de risco geografico, acesso dificultado,
conflito social) afetam os indicadores do painel lateral. Na
implementacao, esses indicadores devem ser derivados do state
no ViewModel, nao computados no componente.

O textarea de observacoes so aparece quando o toggle esta ativo.
Na implementacao, usar `display: none` ou conditional rendering
(nao apenas opacity, para nao ocupar espaco).

O endpoint e idempotente (PUT) — pode ser chamado varias vezes
sem efeitos colaterais. Resposta: HTTP 204.

O painel de cenarios (canto superior direito) e APENAS para
navegacao do prototipo — nao faz parte da implementacao final.

---

## Checklist do designer (preencher antes de abrir PR)

- [x] Todas as telas estao no HTML (nao falta nenhum estado)
- [x] Estados de erro estao representados (validacao inline + toast erro)
- [x] Estado vazio esta representado (formulario vazio, default)
- [x] Loading states estao representados (skeleton shimmer)
- [x] Mobile e desktop estao representados (responsive CSS)
- [x] As cores usadas estao listadas na tabela acima
- [x] As interacoes estao descritas na tabela acima
- [x] O que e inegociavel esta listado acima
