# Prototipo: Condicoes de Trabalho e Rendimento da Familia

> Tela dedicada ao registro de trabalho, renda e beneficios sociais da familia.
> Acessada a partir do painel de fichas na home (Ficha de Avaliacao).
> Endpoints:
>   - PUT /api/v1/patients/{patientId}/work-and-income
>   - PUT /api/v1/patients/{patientId}/socioeconomic-situation

## Arquivo do Prototipo

- `prototypes/condicoes-trabalho-rendimento.html`

---

## O que NAO pode faltar na tela final

- [ ] Barra de navegacao do paciente (nome, nascimento, CPF, diagnostico, status)
- [ ] Link "Voltar para Fichas" no topo
- [ ] Secao 1: Cards accordion por membro da familia (ocupacao, carteira de trabalho, renda mensal)
- [ ] Secao 2: Beneficios sociais com lista dinamica (adicionar/remover beneficios, max 100 itens)
- [ ] Select "Tipo de beneficio" por card (dominio_tipo_beneficio: Bolsa Familia, BPC/LOAS, Auxilio Doenca, Pensao por Morte, Seguro Defeso, Outro)
- [ ] Campos condicionais por tipo de beneficio:
  - Pensao por Morte → campo "CPF do falecido" (MV-002)
  - Auxilio Doenca → campo "Certidao de nascimento" (MV-001)
- [ ] Toggle "Recebe beneficio social?" que controla visibilidade da lista de beneficios
- [ ] Campo "Fonte principal de renda" (texto obrigatorio, maxLength 200)
- [ ] Toggle "Ha desempregados na familia?"
- [ ] Toggle "Ha aposentados na familia?"
- [ ] Painel lateral sticky com calculos de renda em tempo real:
  - Renda total do trabalho (soma dos monthlyAmount)
  - Renda per capita trabalho (total / membros)
  - Total de beneficios sociais (soma dos amounts)
  - Renda global (trabalho + beneficios)
  - Renda per capita global (global / membros)
- [ ] Barra de vulnerabilidade baseada em renda per capita vs salario minimo
- [ ] Badge de vulnerabilidade (Adequada / Atencao / Vulneravel)
- [ ] Sub-secao "Renda Consolidada" com campos readonly auto-calculados:
  - Renda familiar total (totalFamilyIncome = trabalho + beneficios)
  - Renda per capita (incomePerCapita = total / membros)
- [ ] Validacao inline: renda mensal >= 0, valor beneficio > 0, nome beneficio obrigatorio (maxLength 200)
- [ ] Validacao de consistencia: se toggle beneficio = OFF, lista deve estar vazia (SES-001)
- [ ] Validacao de consistencia: se toggle beneficio = ON, lista nao pode estar vazia (SES-002)
- [ ] Validacao: nomes de beneficios nao podem ser duplicados (SBC-002)
- [ ] Validacao: renda per capita nao pode ser maior que renda total (SES-006)
- [ ] Limite maximo de 100 beneficios (botao desabilitado ao atingir)
- [ ] Toast de feedback para sucesso e erro ao salvar
- [ ] Loading state com skeleton shimmer
- [ ] Botao "Salvar" desabilitado ate form dirty

---

## O que reprova direto se estiver errado

### Acessibilidade (reprova direto)
- [ ] Contraste minimo 4.5:1 em todo texto (WCAG AA)
- [ ] Touch targets minimo 44px em mobile (accordions, toggles, botoes)
- [ ] Navegacao por teclado funciona (Tab, Enter, Space nos accordions e toggles)
- [ ] Accordions com role="button" + aria-expanded + aria-controls
- [ ] Toggles com role="switch" + aria-checked
- [ ] Erros de validacao com role="alert"
- [ ] Focus ring visivel (outline 2px offset 2px) em todos os elementos interativos
- [ ] Inputs de moeda com aria-label descritivo ("Renda mensal de [nome]")

### Responsividade (reprova direto)
- [ ] Mobile (< 768px): sidebar hidden, grid 1 coluna, resumo acima das secoes
- [ ] Desktop (>= 768px): sidebar visible, grid 2 colunas (5fr 3fr)
- [ ] Accordions empilham corretamente em mobile
- [ ] Nenhum overflow horizontal em nenhuma resolucao
- [ ] Textos nao ficam cortados ou sobrepostos

### Usabilidade (reprova direto)
- [ ] Usuario sabe onde esta: back-link + patient-bar + titulo "Trabalho e Rendimento"
- [ ] Usuario sabe o que fazer: labels claros em cada campo
- [ ] Erros de formulario aparecem JUNTO ao campo (field-error individual)
- [ ] Loading state com skeleton shimmer ao carregar dados existentes
- [ ] Feedback visual ao salvar (spinner no botao + toast de resultado)
- [ ] Calculos de renda atualizam em tempo real ao mudar valores
- [ ] Confirmacao visual ao adicionar/remover beneficio (animacao de entrada/saida)

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
| Barra renda verde | #4F8448 | sage.greenPrimary |
| Barra renda amarela | #D4A017 | sage.warning |
| Barra renda vermelha | #C4422B | sage.danger |
| Toggle ativo | #4F8448 | sage.greenPrimary |
| Toggle inativo | #D4DDD0 | sage.bgSageDeep |
| Borda input | rgba(79,132,72,0.15) | sage.inputBorder |
| Accordion header hover | rgba(255,255,255,0.5) | sage.bgCardHover |

---

## Interacoes e comportamentos

| Elemento | Interacao | Detalhe |
|----------|-----------|---------|
| Accordion membro | Click expande/colapsa | role="button", aria-expanded, conteudo slide-down 300ms ease-out |
| Accordion chevron | Rotaciona ao expandir | transform: rotate(180deg), transition 300ms |
| Input renda mensal | Digitacao com mascara R$ | Aceita apenas numeros >= 0, formata com 2 decimais |
| Toggle carteira trabalho | Click liga/desliga | role="switch", transicao 300ms |
| Toggle beneficio social | Quando ON, revela lista | Se OFF com lista nao-vazia, mostra warning SES-001 |
| Select tipo beneficio | Seleciona tipo do beneficio | Opcoes: Bolsa Familia, BPC/LOAS, Auxilio Doenca, Pensao por Morte, Seguro Defeso, Outro |
| Campo CPF do falecido | Aparece ao selecionar "Pensao por Morte" | Slide-down 300ms ease-out, validacao MV-002 |
| Campo Certidao nascimento | Aparece ao selecionar "Auxilio Doenca" | Slide-down 300ms ease-out, validacao MV-001 |
| Botao "+ Adicionar" | Adiciona card de beneficio | Animacao de entrada (fade + slide), foco no campo nome. Desabilitado ao atingir 100 itens |
| Botao remover beneficio | Remove card com confirmacao | Animacao de saida (fade + slide-up) |
| Input nome beneficio | Validacao de duplicata | Verifica ao blur se nome ja existe na lista (SBC-002). maxLength 200 |
| Campos renda consolidada | Auto-calculados em tempo real | Readonly, atualizam ao mudar qualquer campo de renda/beneficio |
| Sidebar resumo | Recalcula em tempo real | Atualiza ao mudar qualquer campo de renda/beneficio |
| Barra vulnerabilidade | Cor muda conforme per capita | Verde (>= salario min), amarelo (0.5-1 SM), vermelho (< 0.5 SM) |
| Botao Salvar | Desabilitado ate form dirty | Habilita ao mudar qualquer campo |
| Botao Salvar (loading) | Spinner + texto "Salvando..." | Desabilita interacao durante save |
| Toast sucesso | Slide-in bottom-right | Auto-dismiss apos 3 segundos |
| Toast erro | Slide-in bottom-right, borda vermelha | Auto-dismiss apos 3 segundos |
| Skeleton loading | Shimmer animation | Blocos pulsantes no lugar dos accordions/inputs |

---

## Dados mockados no prototipo

| Membro | Relacao | Idade | Ocupacao | Carteira | Renda |
|--------|---------|-------|----------|----------|-------|
| Maria Aparecida Silva | Titular | 41 | Diarista | Nao | R$ 1.200 |
| Joao Carlos Silva | Esposo | 44 | Pedreiro | Sim | R$ 2.800 |
| Ana Lucia Silva | Filha | 22 | Estudante | Nao | R$ 0 |
| Pedro Henrique Silva | Filho | 16 | Menor - nao trabalha | Nao | R$ 0 |
| Conceicao da Silva | Mae | 68 | Aposentada | Nao | R$ 1.412 |

| Beneficio | Valor | Beneficiario |
|-----------|-------|-------------|
| Bolsa Familia | R$ 600 | Maria Aparecida |
| BPC/LOAS | R$ 1.412 | Conceicao |

---

## Notas para o dev

Os calculos de renda sao feitos pelo dominio em analytics:
- `totalWorkIncome = sum(individualIncomes[].monthlyAmount)`
- `perCapitaWorkIncome = totalWorkIncome / max(memberCount, 1)`
- `totalGlobalIncome = totalWorkIncome + sum(socialBenefits[].amount)`
- `perCapitaGlobalIncome = totalGlobalIncome / max(memberCount, 1)`
- Divisor minimo = 1 para evitar divisao por zero.

A lista de ocupacoes vem da tabela de dominio `dominio_condicao_ocupacao`
(GET /api/v1/dominios/dominio_condicao_ocupacao). No prototipo, usamos
valores mockados.

O tipo de beneficio vem da tabela de dominio `dominio_tipo_beneficio`
(GET /api/v1/dominios/dominio_tipo_beneficio). Cada tipo pode ter
flags de metadados que ativam campos condicionais:
- `exige_cpf_falecido: true` → campo CPF do falecido obrigatorio (MV-002)
- `exige_registro_nascimento: true` → campo Certidao de nascimento obrigatorio (MV-001)
No prototipo, as opcoes sao mockadas: Bolsa Familia, BPC/LOAS,
Auxilio Doenca (MV-001), Pensao por Morte (MV-002), Seguro Defeso, Outro.

A lista de beneficiarios (select no card de beneficio) deve ser
populada com os membros da familia do Patient.

Os campos `totalFamilyIncome` e `incomePerCapita` sao submetidos
no payload do PUT /socioeconomic-situation como campos REQUIRED.
Na tela, sao calculados automaticamente e exibidos como readonly.
O backend pode recalcular para validacao, mas o frontend envia.

A consistencia entre o toggle `receivesSocialBenefit` e a lista de
beneficios deve ser validada:
- SES-001: flag false + lista nao-vazia = erro
- SES-002: flag true + lista vazia = erro
- SES-006: incomePerCapita > totalFamilyIncome = erro
- SBC-002: nomes duplicados = erro

Nomes de beneficios sao normalizados (trim + collapse whitespace)
antes de comparar por duplicata. maxLength: 200 caracteres.

Campo `mainSourceOfIncome` tem maxLength: 200 caracteres.

A lista de beneficios tem limite maximo de 100 itens (maxItems: 100).
O botao "+ Adicionar beneficio" deve ser desabilitado ao atingir.

O endpoint e idempotente (PUT) — pode ser chamado varias vezes
sem efeitos colaterais. Resposta: HTTP 204.

O painel de cenarios (canto superior direito) e APENAS para
navegacao do prototipo — nao faz parte da implementacao final.

---

## Checklist do designer (preencher antes de abrir PR)

- [ ] Todas as telas estao no HTML (nao falta nenhum estado)
- [ ] Estados de erro estao representados (validacao inline + toast erro + SES-001/SES-002)
- [ ] Estado vazio esta representado (formulario vazio, nenhum membro expandido)
- [ ] Loading states estao representados (skeleton shimmer)
- [ ] Mobile e desktop estao representados (responsive CSS)
- [ ] As cores usadas estao listadas na tabela acima
- [ ] As interacoes estao descritas na tabela acima
- [ ] O que e inegociavel esta listado acima
