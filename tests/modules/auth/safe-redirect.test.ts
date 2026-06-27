// Teste puro do safe-redirect (T038, FR-004): anti open-redirect.
import { test, expect } from 'bun:test'
import { sanitizeRedirectPath } from '~/shared/http/safe-redirect'

test('aceita caminho de mesma origem', () => {
  expect(sanitizeRedirectPath('/dashboard')).toBe('/dashboard')
  expect(sanitizeRedirectPath('/people/123')).toBe('/people/123')
})

test('descarta destino externo / malformado → fallback', () => {
  expect(sanitizeRedirectPath('//evil.com')).toBe('/')
  expect(sanitizeRedirectPath('https://evil.com')).toBe('/')
  expect(sanitizeRedirectPath('/\\evil.com')).toBe('/')
  expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/')
  expect(sanitizeRedirectPath(null)).toBe('/')
  expect(sanitizeRedirectPath(undefined)).toBe('/')
})
