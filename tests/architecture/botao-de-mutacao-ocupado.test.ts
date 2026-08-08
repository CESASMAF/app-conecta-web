// Governance: botão que dispara MUTAÇÃO precisa dizer que está ocupado.
//
// `disabled` sozinho não é feedback — o botão apaga e nada explica que a gravação começou.
// Quem clicou não sabe se pegou, e a reação natural é clicar de novo; em mutação isso vira
// registro duplicado. Os três sinais andam juntos: bloqueio (impede o 2º clique), texto
// (diz o que está acontecendo) e spinner (mostra que não travou).
//
// O gate é textual de propósito: não existe um componente único por onde todo submit passe,
// e criar um mudaria 18 arquivos de uma vez. Isto trava o que já foi corrigido.
import { test, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = join(import.meta.dir, '../../src')
const read = (f: string): string => readFileSync(join(SRC, f), 'utf8')

// Arquivos com submit de mutação já cobertos. Novo formulário de gravação entra aqui.
//
// As telas de login e recuperação saíram desta lista porque saíram do app: quem as
// renderiza agora é a UI do Ory (`kratos-ui`), em login.${DOMAIN}. O feedback de
// ocupado delas é responsabilidade do Ory, não nossa.
const COBERTOS = [
  'modules/patients/client/detail/components/care-forms.component.tsx',
  'modules/patients/client/detail/components/assessment-forms.component.tsx',
  'modules/patients/client/create/wizard.page.tsx',
]

test('todo formulário de mutação bloqueia, avisa e mostra progresso', () => {
  const faltando: string[] = []
  for (const f of COBERTOS) {
    const src = read(f)
    const bloqueia = /disabled=\{/.test(src)
    const avisa = /(Salvando|Entrando|Enviando|Confirmando|Criando|Verificando)…/.test(src)
    // Procura o USO (`class={btnSpinner}`), não a string solta: `includes('btnSpinner')`
    // casaria com a linha de import e continuaria verde com o spinner removido do JSX —
    // um gate que não pega a regressão que existe para pegar.
    const mostra = /class=\{btnSpinner\}/.test(src)
    if (!bloqueia || !avisa || !mostra) {
      faltando.push(
        `${f} → bloqueia=${bloqueia} avisa=${avisa} spinner=${mostra}`,
      )
    }
  }
  expect(faltando).toEqual([])
})

// O rótulo ocupado no gerúndio descreve o que está em curso; no particípio ("Salvo")
// afirmaria um resultado que ainda não existe — e que pode nem acontecer.
test('o rótulo ocupado está no gerúndio, não anuncia sucesso', () => {
  const proibidos = /(Salvo|Criado|Enviado|Concluído)!?['"]/
  for (const f of COBERTOS) {
    expect(read(f)).not.toMatch(proibidos)
  }
})

// O componente existe e é o lugar certo para formulário novo — mas os três acima ainda
// montam o botão à mão. Este teste impede que o `BusyButton` suma de novo num rollback:
// ele já foi perdido uma vez (o `main` foi reescrito em 2026-08-08 e levou o commit junto).
test('o BusyButton continua disponível para quem for escrever formulário novo', () => {
  const src = read('shared/ui/busy-button.component.tsx')
  expect(src).toContain('export function BusyButton')
  expect(src).toContain('aria-busy')
  expect(src).toMatch(/class=\{btnSpinner\}|s\.btnSpinner/)
})
