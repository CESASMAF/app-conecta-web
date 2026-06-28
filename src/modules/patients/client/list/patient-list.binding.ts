// Binding Solid da lista (ADR-0009): único ponto reativo. 1ª página via `query`+`createAsync` (SSR),
// páginas seguintes por cursor no client; erro por tag + retry (G2); recorte deep-linkable nos searchParams.
import { createSignal, createMemo, createEffect } from 'solid-js'
import { createAsync, query, revalidate, useSearchParams } from '@solidjs/router'
import { listPatientsFn } from '../../server/patient-list.fn'
import {
  initialState,
  mergeNextPage,
  isExhausted,
  isEmpty as vmIsEmpty,
  queryToParams,
  type ListQuery,
  type PatientListState,
} from './patient-list.view-model'
import { isOk } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import { isPatientStatus, type PatientPage } from '~/shared/domain/patient'
import { patientsErrorTag } from '~/shared/i18n/patients'

// 1ª página cacheada por recorte (SSR-serializada → sem refetch na hidratação).
const firstPage = query((q: ListQuery) => listPatientsFn(queryToParams(q)), 'patients:first')

export function usePatientListBinding() {
  const [params, setParams] = useSearchParams()

  const queryModel = createMemo<ListQuery>(() => {
    const rawStatus = typeof params.status === 'string' ? params.status : undefined
    const status = rawStatus && isPatientStatus(rawStatus) ? rawStatus : undefined
    const search = typeof params.q === 'string' && params.q.trim() !== '' ? params.q : undefined
    return { ...(search ? { search } : {}), ...(status ? { status } : {}) }
  })

  const first = createAsync(() => firstPage(queryModel()))

  const [morePages, setMorePages] = createSignal<PatientPage[]>([])
  const [loadingMore, setLoadingMore] = createSignal(false)
  const [tailError, setTailError] = createSignal<AppError | null>(null)

  // Mudou o recorte → zera as páginas extras e o erro de cauda (reinicia a paginação — D7).
  createEffect(() => {
    queryModel()
    setMorePages([])
    setTailError(null)
  })

  const state = createMemo<PatientListState>(() => {
    const f = first()
    if (!f || !isOk(f)) return initialState()
    let s = mergeNextPage(initialState(), f.value)
    for (const p of morePages()) s = mergeNextPage(s, p)
    return s
  })

  const errorTag = createMemo(() => {
    const f = first()
    if (f && !isOk(f)) return patientsErrorTag(f.error?.kind ?? 'unknown')
    const te = tailError()
    return te ? patientsErrorTag(te.kind) : null
  })

  const total = createMemo(() => {
    const f = first()
    return f && isOk(f) ? f.value.meta.totalCount : 0
  })

  const pending = createMemo(() => first() === undefined)
  const empty = createMemo(() => {
    const f = first()
    return Boolean(f) && isOk(f!) && vmIsEmpty(state())
  })
  const hasFilter = createMemo(() => {
    const q = queryModel()
    return q.search !== undefined || q.status !== undefined
  })

  async function loadMore() {
    const s = state()
    if (loadingMore() || isExhausted(s) || s.nextCursor === null) return
    setLoadingMore(true)
    const r = await listPatientsFn({ ...queryToParams(queryModel()), cursor: s.nextCursor })
    if (isOk(r)) setMorePages((prev) => [...prev, r.value])
    else setTailError(r.error)
    setLoadingMore(false)
  }

  function retry(): void {
    setTailError(null)
    void revalidate(firstPage.key)
  }

  // Debounce nativo (setTimeout — Princ. IV) p/ não refazer a busca a cada tecla (D7).
  let searchTimer: ReturnType<typeof setTimeout> | undefined
  function setSearch(v: string): void {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => setParams({ q: v.trim() === '' ? undefined : v }), 300)
  }

  function setStatus(v: string | undefined): void {
    setParams({ status: v && v !== '' ? v : undefined })
  }

  // valores correntes do recorte p/ os controles (input/select controlados)
  const searchValue = createMemo(() => queryModel().search ?? '')
  const statusValue = createMemo(() => queryModel().status ?? '')

  return {
    state,
    total,
    errorTag,
    pending,
    empty,
    hasFilter,
    loadingMore,
    loadMore,
    retry,
    setSearch,
    setStatus,
    searchValue,
    statusValue,
    queryModel,
  }
}
