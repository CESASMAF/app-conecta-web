// ViewModel PURO da lista (ADR-0009/0012) — sem Solid. Acumula páginas por cursor; deriva vazio/fim.
import type { PatientSummary, PatientPage } from '~/shared/domain/patient'
import type { PatientStatus } from '~/shared/domain/patient'

export type ListQuery = Readonly<{ search?: string; status?: PatientStatus }>

export type PatientListState = Readonly<{
  items: readonly PatientSummary[]
  nextCursor: string | null
  hasMore: boolean
}>

// hasMore=true inicial: ainda não carregou → o 1º load é disparado; o vazio só vale após um load.
export const initialState = (): PatientListState => ({ items: [], nextCursor: null, hasMore: true })

export const mergeNextPage = (state: PatientListState, page: PatientPage): PatientListState => ({
  items: [...state.items, ...page.items],
  nextCursor: page.meta.nextCursor,
  hasMore: page.meta.hasMore,
})

export const isExhausted = (state: PatientListState): boolean => !state.hasMore

export const isEmpty = (state: PatientListState): boolean => state.items.length === 0 && !state.hasMore

// Serializa o recorte para a query string da rota BFF (omite vazios).
export const queryToParams = (q: ListQuery): Record<string, string> => {
  const p: Record<string, string> = {}
  if (q.search && q.search.trim() !== '') p.search = q.search.trim()
  if (q.status) p.status = q.status
  return p
}
