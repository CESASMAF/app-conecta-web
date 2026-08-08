// ViewModel puro do shell (T035) — bun:test, sem montar Solid.
import { test, expect, describe } from 'bun:test'
import { rootViewModel } from '~/modules/shell/client/root/root.view-model'

describe('rootViewModel (puro)', () => {
  test('visibleMenu: filtra por papel — worker vê Pacientes; admin vê Pessoas; sem papel não vê nada', () => {
    expect(rootViewModel.visibleMenu(['worker']).map((i) => i.id)).toEqual(['patients'])
    expect(rootViewModel.visibleMenu(['admin']).map((i) => i.id)).toEqual(['people'])
    expect(rootViewModel.visibleMenu([]).map((i) => i.id)).toEqual([])
  })

  test('visibleMenu: superadmin vê todas as áreas; papel composto <sistema>:<papel> conta', () => {
    expect(rootViewModel.visibleMenu(['superadmin']).map((i) => i.id)).toEqual(['patients', 'people', 'indicators'])
    expect(rootViewModel.visibleMenu(['social-care:worker']).map((i) => i.id)).toEqual(['patients'])
  })

  test('landingHref: destino = 1ª área visível ao papel (worker → /patients; analyst → /indicators)', () => {
    expect(rootViewModel.landingHref(['worker'])).toBe('/patients')
    expect(rootViewModel.landingHref(['analyst'])).toBe('/indicators')
    // Sem papel nenhum NÃO há destino: todas as áreas exigem um. Inventar `/patients` aqui
    // fazia o middleware redirecionar para uma rota que ele mesmo nega, em laço infinito.
    expect(rootViewModel.landingHref([])).toBeNull()
  })

  test('pageTitle: mapeia rota conhecida; fallback p/ a marca', () => {
    expect(rootViewModel.pageTitle('/')).toBe('Início')
    expect(rootViewModel.pageTitle('/patients')).toBe('Pacientes')
    expect(rootViewModel.pageTitle('/desconhecida')).toBe('RAROS Boa Vista')
  })

  test('isActive: "/" só ativo na raiz; demais por prefixo de segmento', () => {
    expect(rootViewModel.isActive('/', '/')).toBe(true)
    expect(rootViewModel.isActive('/people', '/')).toBe(false)
    expect(rootViewModel.isActive('/people', '/people')).toBe(true)
    expect(rootViewModel.isActive('/people/123', '/people')).toBe(true)
    expect(rootViewModel.isActive('/peopleX', '/people')).toBe(false)
  })
})

// Em produção (2026-08-08) o shell recebeu, durante a revalidação disparada por uma mutação
// que falhou, um objeto SEM `groups` — `groups.includes` lançou e a TELA INTEIRA virou
// "Uncaught Client Exception". Estas funções rodam dentro do render: lançar aqui não é um
// menu errado, é o documento no chão. Na dúvida mostram MENOS, nunca mais; quem autoriza
// de verdade é o backend.
describe('rootViewModel — groups ausente não pode derrubar o render', () => {
  const ausentes = [undefined, null] as const

  test('visibleMenu não lança e esconde o que exige papel', () => {
    for (const g of ausentes) {
      const menu = rootViewModel.visibleMenu(g as unknown as readonly string[])
      expect(menu).toEqual([])
    }
  })

  test('canAccess nega o que exige papel e libera o que não exige', () => {
    for (const g of ausentes) {
      const groups = g as unknown as readonly string[]
      expect(rootViewModel.canAccess(groups, 'admin')).toBe(false)
      expect(rootViewModel.canAccess(groups, undefined)).toBe(true)
    }
  })

  test('roleLabel e landingHref caem no default em vez de lançar', () => {
    for (const g of ausentes) {
      const groups = g as unknown as readonly string[]
      expect(rootViewModel.roleLabel(groups)).toBe('Usuário')
      expect(rootViewModel.landingHref(groups)).toBeNull()
    }
  })
})
