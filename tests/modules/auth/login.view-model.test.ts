// ViewModel puro do login (T025/T033) — bun:test, sem montar Solid.
import { test, expect, describe } from 'bun:test'
import { loginViewModel } from '~/modules/auth/client/login/login.view-model'

describe('loginViewModel (puro)', () => {
  test('sem destino → /api/auth/login', () => {
    expect(loginViewModel.loginHref()).toBe('/api/auth/login')
    expect(loginViewModel.loginHref('/')).toBe('/api/auth/login')
  })
  test('destino interno → preserva saneado e encoded', () => {
    expect(loginViewModel.loginHref('/people/123')).toBe('/api/auth/login?redirect=%2Fpeople%2F123')
  })
  test('destino externo/malformado → descarta (anti open-redirect)', () => {
    expect(loginViewModel.loginHref('https://evil.com')).toBe('/api/auth/login')
    expect(loginViewModel.loginHref('//evil')).toBe('/api/auth/login')
  })
  test('toErrorTag: mapeia conhecidos; desconhecido → genérico (anti-enumeração)', () => {
    expect(loginViewModel.toErrorTag(null)).toBeNull()
    expect(loginViewModel.toErrorTag('idp')).toBe('auth.error.idp')
    expect(loginViewModel.toErrorTag('state')).toBe('auth.error.state')
    expect(loginViewModel.toErrorTag('session')).toBe('auth.error.unauthorized')
    expect(loginViewModel.toErrorTag('qualquer-coisa')).toBe('auth.error.generic')
  })
})
