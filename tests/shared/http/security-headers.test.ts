// Unit test puro do builder de security headers (ADR-0006).
import { test, expect, describe } from 'bun:test'
import {
  buildSecurityHeaders,
  serializeCsp,
  isHttpsFromForwardedProto,
  CSP_BASELINE,
} from '~/shared/http/security-headers'

describe('security headers (ADR-0006)', () => {
  test('isHttpsFromForwardedProto pega o 1º proto', () => {
    expect(isHttpsFromForwardedProto('https')).toBe(true)
    expect(isHttpsFromForwardedProto('https, http')).toBe(true)
    expect(isHttpsFromForwardedProto('http')).toBe(false)
    expect(isHttpsFromForwardedProto(null)).toBe(false)
  })

  test('HSTS só atrás de https (trust-proxy)', () => {
    expect(buildSecurityHeaders({ isHttps: true })['Strict-Transport-Security']).toContain('max-age')
    expect(buildSecurityHeaders({ isHttps: false })['Strict-Transport-Security']).toBeUndefined()
  })

  test('nonce vai p/ script-src quando presente', () => {
    const csp = buildSecurityHeaders({ isHttps: true, nonce: 'abc123' })['Content-Security-Policy']
    expect(csp).toContain("'nonce-abc123'")
    expect(buildSecurityHeaders({ isHttps: true })['Content-Security-Policy']).not.toContain('nonce-')
  })

  test('baseline: nosniff, frame DENY, frame-ancestors none, style unsafe-inline', () => {
    const h = buildSecurityHeaders({ isHttps: true })
    expect(h['X-Content-Type-Options']).toBe('nosniff')
    expect(h['X-Frame-Options']).toBe('DENY')
    const csp = serializeCsp(CSP_BASELINE)
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("frame-src 'self' blob:")
  })
})
