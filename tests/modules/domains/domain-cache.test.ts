// Cache de catálogos (T029): dedup por sessão.
import { test, expect, describe } from 'bun:test'
import { createDomainCache } from '~/modules/domains/client/cache/domain-cache'
import { ok } from '~/shared/http/result'

describe('domain-cache (dedup por sessão)', () => {
  test('2º pedido da mesma tabela NÃO rechama o loader', async () => {
    let calls = 0
    const cache = createDomainCache(async () => {
      calls++
      return ok([])
    })
    await cache('dominio_parentesco')
    await cache('dominio_parentesco')
    expect(calls).toBe(1)
  })

  test('tabelas diferentes chamam o loader uma vez cada', async () => {
    let calls = 0
    const cache = createDomainCache(async () => {
      calls++
      return ok([])
    })
    await cache('dominio_parentesco')
    await cache('dominio_escolaridade')
    expect(calls).toBe(2)
  })
})
