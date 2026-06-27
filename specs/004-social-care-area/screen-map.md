# Mapa de Telas — Área do Assistente Social

> Resultado da sessão de design (2026-06-26). Rascunhos (wireframes) em texto — **estrutura e fluxo**, não estética.
> A pele visual real segue a **identidade da marca Raros Boa Vista** (`handbook/brand-identity.md`): paleta roxo/magenta/azul,
> tipografia, raio 14px, sombras. Tudo **mobile-first**; o desktop ganha densidade (mais colunas).

## Decisões travadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Convivência dos 3 perfis | **App único, cada um vê sua área** (navegação por papel) | Um lugar só, sem confundir quem usa uma parte |
| Tela inicial do assistente social | **Busca em primeiro lugar** | Ele procura quem quer atender; direto ao ponto |
| Prontuário | **Abas no topo** | Tela sempre limpa; funciona no celular e no desktop |
| Cadastro | **Wizard enxuto (2 passos)** | Guiado/à prova de erro; cria rápido, resto no prontuário |
| Família + Identidade | **Dentro do Resumo** | É o que o servidor já entrega pronto num `overview` só |
| Ações de ciclo de vida | **Botão contextual no Resumo** | Só a transição cabível aparece (servidor calcula) |

## Mapa de navegação

```
┌─────────┐    login     ┌──────────────────────── APP (shell, nav por papel) ───────────────────────┐
│  Login  │ ───────────► │  topo: logo · usuário · sair                                               │
└─────────┘              │  menu lateral (conforme PAPEL):                                            │
                         │     worker → [ Pacientes ]    (RH e Donos: features futuras)               │
                         │  ┌──────────────────────────────────────────────────────────────────────┐ │
                         │  │  ÁREA DE PACIENTES                                                     │ │
                         │  │   ┌─ Home (busca) ─┐   + Novo ──► ┌─ Wizard (2 passos) ─┐  cria ──┐    │ │
                         │  │   │ 🔍 + lista     │              └─────────────────────┘         │    │ │
                         │  │   └───────┬────────┘                                               │    │ │
                         │  │           │ abrir paciente                                         │    │ │
                         │  │           ▼                                                        ▼    │ │
                         │  │   ┌─ Prontuário (abas) ◄──────────────────────────────────────────┘    │ │
                         │  │   │ Resumo · Avaliação · Atendimentos · Proteção · Histórico       │    │ │
                         │  │   └────────────────────────────────────────────────────────────────┘   │ │
                         │  └──────────────────────────────────────────────────────────────────────┘ │
                         └────────────────────────────────────────────────────────────────────────────┘
```

## Tela 1 — Pacientes (home) · US1

```
┌─────────────────────────────────┐
│ ☰  Conecta Raros        👤 ▾     │  ← shell (top-bar)
├─────────────────────────────────┤
│  Pacientes                       │
│  ┌─────────────────────────────┐ │
│  │ 🔍 Buscar por nome...        │ │
│  └─────────────────────────────┘ │
│  ┌─────────────────────────────┐ │
│  │ Maria Silva                  │ │
│  │ CID-Q90 · 3 na família  🟢   │ │  🟢 em atendimento
│  ├─────────────────────────────┤ │
│  │ João Souza                   │ │
│  │ CID-E84 · 1 na família  🟡   │ │  🟡 em fila de espera
│  ├─────────────────────────────┤ │
│  │ ... (rolagem infinita)       │ │
│  └─────────────────────────────┘ │
│                                  │
│            [ + Novo paciente ]   │  ← flutua no canto (mobile)
└─────────────────────────────────┘
```
*Reusa a lista da 002 (busca + filtro + scroll por cursor). A home passa a ser esta tela.*

## Tela 2 — Novo paciente (wizard enxuto) · US2

```
PASSO 1/2                          PASSO 2/2
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ Novo paciente · Identificação│    │ Novo paciente · Diagnóstico  │
│ ●───────────○                │    │ ○───────────●                │
│                              │    │                              │
│ Nome completo  [__________]  │    │ CID         [______]         │
│ CPF            [__________]  │    │ Data        [__/__/____]     │
│ Nascimento     [__/__/____]  │    │ Descrição   [____________]   │
│ Nome da mãe    [__________]  │    │                              │
│ Sexo           ( ) M ( ) F   │    │ Parentesco do responsável    │
│                              │    │             [ selecionar ▾ ] │  ← do catálogo
│                              │    │                              │
│              [ Próximo → ]   │    │ [ ← Voltar ]   [ Criar ]     │
└─────────────────────────────┘    └─────────────────────────────┘
                                              │ cria pessoa+paciente (bastidores)
                                              ▼  → abre o Prontuário (em fila de espera)
```
*Só o essencial para criar. Documentos, endereço, identidade social → completam no prontuário.*
*Validação por passo: não avança com campo obrigatório inválido. Rascunho preservado se a sessão cair.*

## Tela 3 — Prontuário · abas

### Aba RESUMO (abertura) · US1 + US3
```
┌─────────────────────────────────┐
│ ← Pacientes                      │
│ Maria Silva                      │
│ 🟡 Em fila de espera   [ Admitir ]│  ← ação cabível à situação (servidor calcula)
├─[Resumo]─Avaliação─Atend.─Proteç─Hist┤
│                                  │
│ IDENTIDADE SOCIAL                │
│   Indígena (em aldeia)           │  ← rótulo resolvido no servidor   [editar]
│                                  │
│ NÚCLEO FAMILIAR (3)              │
│   • Ana — Mãe · cuidadora ★      │  ★ = cuidador principal
│   • Pedro — Irmão                │
│   • Lia — Avó                    │
│              [ + membro ]        │
└─────────────────────────────────┘
```
*Tudo vem do `overview` view-ready já pronto. Ações de família/identidade trocam o estado sem recarregar.*

### Aba AVALIAÇÃO · US4
```
├─Resumo─[Avaliação]─Atend.─Proteç─Hist┤
│ Avaliação social                 │
│  ✅ Moradia                  [>] │  ✅ preenchida
│  ✅ Socioeconômico           [>] │
│  ⬜ Trabalho e renda         [>] │  ⬜ pendente
│  ⬜ Educação                 [>] │
│  ⬜ Saúde                    [>] │
│  ⬜ Rede de apoio            [>] │
│  ⬜ Resumo social-sanitário  [>] │
└──────────────────────────────────┘
   toca [>] → formulário da seção (campos + selects do catálogo) → [ Salvar ]
```

### Aba ATENDIMENTOS · US5
```
├──Avaliação─[Atend.]─Proteç─Hist──┤
│ Atendimentos        [+ registrar]│
│  • 12/06 · Clínico · Dra. Ana    │
│  • 03/05 · Psicossocial · ...    │
│ ─────────────────────────────    │
│ Ingresso (intake)        [editar]│
└──────────────────────────────────┘
```

### Aba PROTEÇÃO · US5
```
├────Atend.─[Proteção]─Hist────────┤
│ Acolhimento (placement)  [editar]│
│ Violações de direitos  [+ relatar]│
│ Encaminhamentos     [+ encaminhar]│
└──────────────────────────────────┘
```

### Aba HISTÓRICO (auditoria) · US5
```
├──────Proteção─[Histórico]────────┤
│ Trilha de auditoria              │
│  • 12/06 10:32 · Atendimento reg.│
│  • 02/06 09:10 · Admitido        │
│  • 28/05 14:00 · Paciente criado │
│         (filtros: tipo · período)│
└──────────────────────────────────┘
```

## Incrementos (ordem de construção)

1. **Esqueleto** (US1): shell nav-por-papel + home busca + prontuário/Resumo. *só usa server-side pronto*
2. **Cadastro** (US2): wizard + rota de cadastro orquestrado *(ajuste server-side)*
3. **Ações no Resumo** (US3): ciclo de vida + família + identidade
4. **Avaliação** (US4): 7 seções
5. **Atendimentos · Proteção · Histórico** (US5)
