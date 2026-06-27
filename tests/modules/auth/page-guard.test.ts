// Predicado puro do guard de página (T036).
import { test, expect, describe } from 'bun:test'
import { isProtectedPagePath } from '~/modules/auth/server/page-guard'

describe('isProtectedPagePath', () => {
  test('páginas de app são protegidas', () => {
    expect(isProtectedPagePath('/')).toBe(true)
    expect(isProtectedPagePath('/people')).toBe(true)
    expect(isProtectedPagePath('/people/123')).toBe(true)
  })

  test('login, BFF, rotas internas e assets são públicos', () => {
    expect(isProtectedPagePath('/login')).toBe(false)
    expect(isProtectedPagePath('/api/auth/login')).toBe(false)
    expect(isProtectedPagePath('/api/me')).toBe(false)
    expect(isProtectedPagePath('/_build/assets/app.js')).toBe(false)
    expect(isProtectedPagePath('/favicon.ico')).toBe(false)
    expect(isProtectedPagePath('/brand/raros.webp')).toBe(false)
  })
})
