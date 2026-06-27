// ViewModel puro da lista (T009) — bun:test, sem Solid.
import { test, expect, describe } from 'bun:test'
import {
  initialState,
  mergeNextPage,
  isExhausted,
  isEmpty,
  queryToParams,
} from '~/modules/patients/client/list/patient-list.view-model'
import { fakePatients, pageOf } from '../../support/social-care-fake'

describe('patient-list.view-model (puro)', () => {
  test('mergeNextPage: append + atualiza cursor/hasMore', () => {
    let s = initialState()
    s = mergeNextPage(s, pageOf(fakePatients(2), 5, 'c1'))
    expect(s.items.length).toBe(2)
    expect(s.hasMore).toBe(true)
    expect(s.nextCursor).toBe('c1')
    s = mergeNextPage(s, pageOf(fakePatients(3, 2), 5, null))
    expect(s.items.length).toBe(5)
    expect(isExhausted(s)).toBe(true)
  })

  test('isEmpty: só após um load sem itens e sem mais', () => {
    let s = initialState()
    expect(isEmpty(s)).toBe(false) // ainda não carregou
    s = mergeNextPage(s, pageOf([], 0, null))
    expect(isEmpty(s)).toBe(true)
  })

  test('queryToParams: omite vazios; trim na busca', () => {
    expect(queryToParams({})).toEqual({})
    expect(queryToParams({ search: '  Maria  ', status: 'ACTIVE' })).toEqual({ search: 'Maria', status: 'ACTIVE' })
    expect(queryToParams({ search: '   ' })).toEqual({})
  })
})
