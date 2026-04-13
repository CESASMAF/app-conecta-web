# Prototipo: Situacao Educacional da Familia

> Tela dedicada ao registro da situacao educacional de uma familia.
> Acessada a partir do painel de fichas na home.
> Endpoint: PUT /api/v1/patients/{patientId}/educational-status
> Contrato: contracts/services/social-care/model/schemas/UpdateEducationalStatusRequest.yaml

## Arquivo do Prototipo

- `prototypes/condicoes-educacionais.html`

---

## O que NAO pode faltar na tela final

- [x] Barra de navegacao do paciente (nome, nascimento, CPF, diagnostico, status)
- [x] Link "Voltar para Fichas" no topo
- [x] 2 secoes wizard: Perfis Educacionais + Ocorrencias de Condicionalidade
- [x] Tabela de perfis por membro com: escolaridade (dropdown lookup dominio_escolaridade), canReadWrite (toggle), attendsSchool (toggle)
- [x] Secao de programOccurrences com cards: membro (select), data (date input), efeito (select lookup dominio_efeito_condicionalidade), isSuspensionRequested (toggle)
- [x] Botao "Adicionar ocorrencia" com estilo dashed
- [x] Botao "Remover" (X) por ocorrencia
- [x] Painel lateral sticky com taxa de alfabetizacao (barra de progresso)
- [x] Badge de frequencia escolar (Todos/Parcial/Nenhum)
- [x] Vulnerabilidades dinamicas usando faixas etarias do analytics.yaml
- [x] Botao "Salvar situacao educacional" desabilitado por padrao, habilita quando form dirty
- [x] Toast de feedback para sucesso e erro ao salvar
- [x] Loading state com skeleton shimmer

---

## Alinhamento com o contrato (UpdateEducationalStatusRequest)

### memberProfiles[] — campos por membro
| Campo | Tipo | Fonte lookup | Representacao no prototipo |
|-------|------|-------------|---------------------------|
| memberId | UUID | -- | Identificado pela linha na tabela |
| canReadWrite | boolean | -- | Toggle switch inline |
| attendsSchool | boolean | -- | Toggle switch inline |
| educationLevelId | UUID | dominio_escolaridade | Dropdown select |

### programOccurrences[] — campos por ocorrencia
| Campo | Tipo | Fonte lookup | Representacao no prototipo |
|-------|------|-------------|---------------------------|
| memberId | UUID | -- | Select com membros da familia |
| date | IsoDateTime | -- | Input type="date" |
| effectId | UUID | dominio_efeito_condicionalidade | Dropdown select |
| isSuspensionRequested | boolean | -- | Toggle switch inline |

### Vulnerabilidades (analytics.yaml)
| Tipo | Faixa etaria | Criterio |
|------|-------------|----------|
| Fora da escola | 0-5 | attendsSchool == false |
| Fora da escola | 6-14 | attendsSchool == false |
| Fora da escola | 15-17 | attendsSchool == false |
| Analfabetismo | 10-17 | canReadWrite == false |
| Analfabetismo | 18-59 | canReadWrite == false |
| Analfabetismo | 60+ | canReadWrite == false |

---

## O que reprova direto se estiver errado

### Acessibilidade (reprova direto)
- [x] Contraste minimo 4.5:1 em todo texto (WCAG AA)
- [x] Touch targets minimo 44px em mobile (toggles, selects)
- [x] Navegacao por teclado funciona (Tab, Enter, Space nos toggles)
- [x] Toggles com role="switch" + aria-checked
- [x] Focus visible (outline 2px offset 2px) em todos os elementos interativos
- [x] Selects com aria-label individual por membro

### Responsividade (reprova direto)
- [x] Mobile (< 768px): sidebar hidden, grid 1 coluna, resumo acima das secoes
- [x] Desktop (>= 768px): sidebar visible, grid 2 colunas (5fr 3fr)
- [x] Coluna "Sabe ler/escrever" escondida em mobile
- [x] Grid de ocorrencias empilha em 1 coluna no mobile
- [x] Nenhum overflow horizontal em nenhuma resolucao

### Usabilidade (reprova direto)
- [x] Usuario sabe onde esta: back-link + patient-bar + titulo "Situacao Educacional"
- [x] Usuario sabe o que fazer: labels claros, botao de adicionar ocorrencia visivel
- [x] Loading state com skeleton shimmer ao carregar dados existentes
- [x] Feedback visual ao salvar (spinner no botao + toast de resultado)
- [x] Vulnerabilidades atualizam em tempo real ao mudar toggles

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
| Texto soft | #4A5E44 | sage.textSoft |
| Verde primario | #4F8448 | sage.greenPrimary |
| Verde dark | #3D6A37 | sage.greenDark |
| Verde light | rgba(79,132,72,0.08) | sage.greenLight |
| Erro | #C4422B | sage.danger |
| Erro light | rgba(196,66,43,0.08) | sage.dangerLight |
| Warning | #D4A017 | sage.warning |
| Warning light | rgba(212,160,23,0.08) | sage.warningLight |
| Toggle ativo | #4F8448 | sage.greenPrimary |
| Toggle inativo (false) | rgba(196,66,43,0.4) | sage.danger (opacity) |
| Barra alfabetizacao verde | #4F8448 | sage.greenPrimary |
| Barra alfabetizacao amarela | #D4A017 | sage.warning |
| Barra alfabetizacao vermelha | #C4422B | sage.danger |

---

## Interacoes e comportamentos

| Elemento | Interacao | Detalhe |
|----------|-----------|---------|
| Dropdown escolaridade | Change atualiza state | Select nativo, um por membro na tabela |
| Toggle canReadWrite | Click alterna null->true->false->true | role="switch", exibe Sim/Nao/-- |
| Toggle attendsSchool | Click alterna null->true->false->true | role="switch", exibe Sim/Nao/-- |
| Botao "+ Adicionar ocorrencia" | Click adiciona card de ocorrencia | Card com campos vazios |
| Botao X (remover ocorrencia) | Click remove a ocorrencia | Remove do array programOccurrences |
| Select membro (ocorrencia) | Change atualiza memberId | Lista todos os membros da familia |
| Input data (ocorrencia) | Change atualiza date | Input nativo type="date" |
| Select efeito (ocorrencia) | Change atualiza effectId | Lookup dominio_efeito_condicionalidade |
| Toggle suspensao | Click liga/desliga | isSuspensionRequested boolean |
| Taxa alfabetizacao sidebar | Recalcula ao mudar canReadWrite | Barra: verde (>=80%), amarelo (50-79%), vermelho (<50%) |
| Badge frequencia escolar | Atualiza ao mudar attendsSchool | Verde (todos), amarelo (parcial), vermelho (nenhum) |
| Vulnerabilidades | Aparecem/desaparecem dinamicamente | Pills usando faixas do analytics.yaml |
| Botao Salvar | Desabilitado ate form dirty | Habilita ao mudar qualquer campo |
| Botao Salvar (loading) | Spinner + texto | Desabilita interacao durante save |
| Toast | Slide-in bottom-right | Auto-dismiss apos 3 segundos |
| Skeleton loading | Shimmer animation | Blocos pulsantes na tabela/sidebar |

---

## Notas para o dev

O endpoint e `PUT /patients/{patientId}/educational-status` (idempotente, 204).
Header `X-Actor-Id` obrigatorio (session.userSub).

Os dropdowns de escolaridade usam lookup `dominio_escolaridade` do backend.
Os dropdowns de efeito usam lookup `dominio_efeito_condicionalidade`.
Ambos sao carregados via GET /api/admin/lookups/{tableName}.

As vulnerabilidades no sidebar seguem exatamente as faixas do
`contracts/shared/validation-rules/analytics.yaml`:
- Fora da escola: 0-5, 6-14, 15-17
- Analfabetismo: 10-17, 18-59, 60+
Um membro pode contar em multiplas categorias (ex: 15 anos fora
da escola E analfabeto conta em ambas).

A idade e calculada a partir do birthDate de cada membro usando
a funcao `yearsAt()` do kernel, com referenceDate = data atual.

O campo `canReadWrite` se aplica a TODOS os membros (nao apenas 15+).
A restricao 15+ e apenas na deteccao de vulnerabilidade de analfabetismo
(analytics), nao na entrada de dados.

O painel de cenarios (canto superior direito) e APENAS para
navegacao do prototipo — nao faz parte da implementacao final.

---

## Checklist do designer (preencher antes de abrir PR)

- [x] Todas as telas estao no HTML (nao falta nenhum estado)
- [x] Estados de erro estao representados (toast erro)
- [x] Estado vazio esta representado (formulario vazio, sem ocorrencias)
- [x] Loading states estao representados (skeleton shimmer)
- [x] Mobile e desktop estao representados (responsive CSS)
- [x] As cores usadas estao listadas na tabela acima
- [x] As interacoes estao descritas na tabela acima
- [x] O que e inegociavel esta listado acima
- [x] Todos os campos mapeiam 1:1 para o contrato UpdateEducationalStatusRequest
