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
    expect(rootViewModel.landingHref([])).toBe('/patients') // fallback
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
