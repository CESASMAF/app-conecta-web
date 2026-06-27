// ViewModel PURO da lista de pessoas (ADR-0009/0012) — sem Solid. Acumula páginas por cursor.
import type { PersonSummary, PersonPage } from '~/shared/domain/person'

export type PeopleListState = Readonly<{ items: readonly PersonSummary[]; nextCursor: string | null; hasMore: boolean }>
export const initialState = (): PeopleListState => ({ items: [], nextCursor: null, hasMore: true })

export const mergeNextPage = (state: PeopleListState, page: PersonPage): PeopleListState => ({
  items: [...state.items, ...page.items],
  nextCursor: page.meta.nextCursor,
  hasMore: page.meta.hasMore,
})

export const isExhausted = (s: PeopleListState): boolean => !s.hasMore
export const isEmpty = (s: PeopleListState): boolean => s.items.length === 0 && !s.hasMore
