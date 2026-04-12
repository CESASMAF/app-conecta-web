# Prototipo: Composicao Familiar

> Tela dedicada a gestao da composicao familiar de um paciente.
> Acessada a partir do painel de detalhes na home (lista de familias).

## Arquivo do Prototipo

- `prototypes/composicao-familiar.html`

---

## O que NAO pode faltar na tela final

- [x] Barra de navegacao do paciente (nome, nascimento, CPF, diagnostico, status)
- [x] Lista de membros em formato tabular com nome, parentesco, idade, sexo, tags
- [x] Tags visuais: PR (Pessoa de Referencia), Cuidador, PcD, Reside
- [x] Perfil etario com grafico de barras por 8 faixas (0-5, 6-11, 12-17, 18-24, 25-34, 35-44, 45-59, 60+)
- [x] Secao de especificidade social com cards selecionaveis (Quilombola, Indigena, Ribeirinho, etc.)
- [x] Botao "Salvar especificidade" habilitado somente quando ha alteracao pendente
- [x] Modal de adicionar/editar membro com: nome, data nascimento, parentesco, sexo, documentos, checkboxes
- [x] Documentos exigidos como chips toggleaveis: CN, CPF, CTPS, RG, TE
- [x] Dialog de confirmacao antes de remover membro
- [x] Pessoa de Referencia (PR) NAO pode ser removida — botao "Remover" ausente para PR
- [x] Menu de acoes por membro (3 dots): Tornar cuidador, Editar, Remover
- [x] Toast de feedback para acoes (sucesso e erro)
- [x] Link "Voltar para Familias" no topo

---

## O que reprova direto se estiver errado

### Acessibilidade (reprova direto)
- [x] Contraste minimo 4.5:1 em todo texto (WCAG AA)
- [x] Touch targets minimo 44px em mobile (botoes, cards selecionaveis)
- [x] Navegacao por teclado funciona (Tab, Enter, Escape nos modais e cards)
- [x] Cards de especificidade e sexo com role="radio" + aria-checked
- [x] Chips de documento com role="checkbox" + aria-checked
- [x] Erros de formulario com role="alert"
- [x] Focus visible (outline 2px offset 2px) em todos os elementos interativos
- [x] Escape fecha modais, click no overlay fecha modais

### Responsividade (reprova direto)
- [x] Mobile (< 768px): sidebar hidden, grid 1 coluna, tabela vira cards empilhados
- [x] Desktop (>= 768px): sidebar visible, grid 2 colunas, tabela completa
- [x] Nenhum overflow horizontal em nenhuma resolucao
- [x] Textos nao ficam cortados ou sobrepostos

### Usabilidade (reprova direto)
- [x] Usuario sabe onde esta: back-link + patient-bar + titulo "Composicao Familiar"
- [x] Usuario sabe o que fazer: botao "Adicionar membro" visivel, CTAs claros
- [x] Erros de formulario aparecem JUNTO ao campo (field-error individual)
- [x] Loading state com skeleton shimmer
- [x] Empty state com ilustracao + CTA para adicionar primeiro membro
- [x] Error state com banner + mensagem descritiva
- [x] Confirmacao antes de remover membro (dialog)

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
| Texto soft | #8B9E85 | sage.textSoft |
| Verde primario | #4F8448 | sage.greenPrimary |
| Verde dark | #3D6A37 | sage.greenDark |
| Verde light | rgba(79,132,72,0.08) | sage.greenLight |
| Erro | #C4422B | sage.danger |
| Erro light | rgba(196,66,43,0.08) | sage.dangerLight |
| Borda input | rgba(79,132,72,0.15) | sage.inputBorder |
| Borda input filled | rgba(79,132,72,0.3) | sage.inputBorderFilled |

---

## Interacoes e comportamentos

| Elemento | Interacao | Detalhe |
|----------|-----------|---------|
| Menu de acoes (3 dots) | Click abre dropdown posicional | Fecha ao clicar fora ou em outra acao |
| Dropdown "Tornar cuidador" | Click define membro como cuidador principal | Remove flag do cuidador anterior (apenas 1 por vez) |
| Dropdown "Remover" | Click abre dialog de confirmacao | Ausente para PR — PR nunca pode ser removida |
| Cards de especificidade | Click seleciona/deseleciona | role="radio", apenas 1 selecionado, habilita botao "Salvar" |
| Chips de documento (CN, CPF...) | Click toggle on/off | role="checkbox", multi-selecao permitida |
| Card selectors (sexo) | Click seleciona | role="radio", apenas 1 selecionado |
| Modais | Escape ou click overlay fecha | Focus trap dentro do modal ao abrir |
| Perfil etario | Barras animadas (spring easing) | Recalcula automaticamente ao adicionar/remover membro |
| Toast | Aparece no canto inferior direito | Desaparece apos 3s automaticamente |
| Botao "Salvar especificidade" | Desabilitado por default | Habilita somente quando usuario muda selecao |
| Loading skeleton | Shimmer animation | Exibido enquanto dados carregam |
| Form validation | Inline, por campo | Exibe mensagem abaixo do campo com role="alert" |

---

## Notas para o dev

A Pessoa de Referencia (PR) e sempre o primeiro membro da lista e NAO pode ser
removida. O menu de acoes da PR nao tem opcao "Remover". Isso reflete a invariante
PAT-002 do dominio (deve existir exatamente 1 PR por paciente).

O cuidador principal (isPrimaryCaregiver) e exclusivo — ao definir um novo cuidador,
o anterior perde a flag. Isso reflete a operacao assignPrimaryCaregiver do aggregate.

Os documentos exigidos (requiredDocuments) sao deduplicated e sorted alphabetically
no dominio: CN, CPF, CTPS, RG, TE. O prototipo ja exibe nessa ordem.

O perfil etario usa as mesmas 8 faixas do calculateAgeProfile do viewmodel:
0-5, 6-11, 12-17, 18-24, 25-34, 35-44, 45-59, 60+.

A especificidade social (specificity) usa lookups do backend. O botao "Salvar" so
habilita quando ha mudanca pendente (comparando selectedSpecificityId vs originalSpecificityId
no viewmodel). Quando salvo, chama o backend para persistir.

O painel de cenarios (canto superior direito) e apenas para navegacao do prototipo —
nao faz parte da implementacao final.

---

## Checklist do designer (preencher antes de abrir PR)

- [x] Todas as telas estao no HTML (nao falta nenhum estado)
- [x] Estados de erro estao representados (error banner + field errors)
- [x] Estado vazio esta representado (empty state com CTA)
- [x] Loading states estao representados (skeleton shimmer)
- [x] Mobile e desktop estao representados (responsive CSS)
- [x] As cores usadas estao listadas na tabela acima
- [x] As interacoes estao descritas na tabela acima
- [x] O que e inegociavel esta listado acima
