// Binding Solid da lista de pessoas (ADR-0009): 1ª página via query+createAsync (SSR), próximas por cursor.
// Busca deep-linkable no searchParam `q` (debounce nativo). Erro por tag + retry.
import { createSignal, createMemo, createEffect } from 'solid-js'
import { createAsync, query, revalidate, useSearchParams } from '@solidjs/router'
import { peopleListFn } from '../../server/people.fn'
import { initialState, mergeNextPage, isExhausted, isEmpty as vmIsEmpty, type PeopleListState } from './people-list.view-model'
import { isOk } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { PersonPage } from '~/shared/domain/person'
import { peopleErrorTag, type PeopleTag } from '~/shared/i18n/people'

const firstPage = query((search: string) => peopleListFn(search ? { search } : {}), 'people:first')

export function usePeopleListBinding() {
  const [params, setParams] = useSearchParams()
  const search = createMemo(() => (typeof params.q === 'string' && params.q.trim() !== '' ? params.q : ''))
  const first = createAsync(() => firstPage(search()))

  const [morePages, setMorePages] = createSignal<PersonPage[]>([])
  const [loadingMore, setLoadingMore] = createSignal(false)
  const [tailError, setTailError] = createSignal<AppError | null>(null)

  createEffect(() => {
    search()
    setMorePages([])
    setTailError(null)
  })

  const state = createMemo<PeopleListState>(() => {
    const f = first()
    if (!f || !isOk(f)) return initialState()
    let s = mergeNextPage(initialState(), f.value)
    for (const p of morePages()) s = mergeNextPage(s, p)
    return s
  })

  const pending = createMemo(() => first() === undefined)
  const total = createMemo(() => {
    const f = first()
    return f && isOk(f) ? f.value.meta.totalCount : 0
  })
  const errorTag = createMemo<PeopleTag | null>(() => {
    const f = first()
    if (f && !isOk(f)) return peopleErrorTag(f.error.kind)
    const te = tailError()
    return te ? peopleErrorTag(te.kind) : null
  })
  const empty = createMemo(() => {
    const f = first()
    return Boolean(f) && isOk(f!) && vmIsEmpty(state())
  })
  const hasFilter = createMemo(() => search() !== '')

  async function loadMore(): Promise<void> {
    const s = state()
    if (loadingMore() || isExhausted(s) || s.nextCursor === null) return
    setLoadingMore(true)
    const r = await peopleListFn({ ...(search() ? { search: search() } : {}), cursor: s.nextCursor })
    if (isOk(r)) setMorePages((prev) => [...prev, r.value])
    else setTailError(r.error)
    setLoadingMore(false)
  }
  function retry(): void {
    setTailError(null)
    void revalidate(firstPage.key)
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  function setSearch(v: string): void {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => setParams({ q: v.trim() === '' ? undefined : v }), 300)
  }

  return { state, total, pending, errorTag, empty, hasFilter, loadingMore, loadMore, retry, setSearch, searchValue: search }
}
