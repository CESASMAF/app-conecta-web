// Teste PURO do OIDC (T024): PKCE S256 + URL de autorização. Sem rede.
import { test, expect, describe } from 'bun:test'
import { generatePkce, buildAuthorizeUrl } from '~/server/oidc'

describe('oidc/pkce (research D3)', () => {
  test('generatePkce: challenge = base64url(SHA-256(verifier))', async () => {
    const p = await generatePkce()
    expect(p.verifier.length).toBeGreaterThan(20)
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p.verifier))
    expect(p.challenge).toBe(Buffer.from(digest).toString('base64url'))
    expect(p.state).not.toBe(p.nonce)
  })

  test('buildAuthorizeUrl: S256 + state + nonce + response_type=code', () => {
    const url = buildAuthorizeUrl({ challenge: 'CHAL', state: 'ST', nonce: 'NO' })
    expect(url).toContain('response_type=code')
    expect(url).toContain('code_challenge=CHAL')
    expect(url).toContain('code_challenge_method=S256')
    expect(url).toContain('state=ST')
    expect(url).toContain('nonce=NO')
  })
})
