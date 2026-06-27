// Tela da lista de pacientes (composition — ADR-0012). SSR da 1ª página + scroll infinito por
// IntersectionObserver (nativo, Princ. IV) + estados vazio/erro/skeleton.
import { For, Show, onMount, onCleanup } from 'solid-js'
import { A } from '@solidjs/router'
import { usePatientListBinding } from './patient-list.binding'
import { PatientRow } from './components/patient-row.component'
import { EmptyState } from './components/empty-state.component'
import { ListSkeleton } from './components/list-skeleton.component'
import { ErrorRetry } from './components/error-retry.component'
import { SearchBar } from './components/search-bar.component'
import { StatusFilter } from './components/status-filter.component'
import { tp } from '~/shared/i18n/patients'
import * as s from './patient-list.css'

export function PatientListPage() {
  const b = usePatientListBinding()
  let sentinel: HTMLDivElement | undefined

  onMount(() => {
    if (!sentinel) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void b.loadMore()
      },
      { rootMargin: '200px' },
    )
    io.observe(sentinel)
    onCleanup(() => io.disconnect())
  })

  return (
    <section class={s.wrap}>
      <header class={s.header}>
        <h1 class={s.title}>Pacientes</h1>
        <div class={s.headerActions}>
          <Show when={!b.pending() && !b.errorTag()}>
            <span class={s.count}>
              {b.state().items.length} de {b.total()}
            </span>
          </Show>
          <A href="/patients/new" class={s.newBtn}>
            + Novo paciente
          </A>
        </div>
      </header>

      <div class={s.toolbar}>
        <SearchBar value={b.searchValue()} placeholder={tp('patients.search.placeholder')} onSearch={b.setSearch} />
        <StatusFilter value={b.statusValue()} allLabel={tp('patients.filter.all')} onStatus={b.setStatus} />
      </div>

      <Show
        when={!b.errorTag()}
        fallback={
          <ErrorRetry message={tp(b.errorTag()!)} retryLabel={tp('patients.retry')} onRetry={b.retry} />
        }
      >
        <Show when={!b.pending()} fallback={<ListSkeleton />}>
          <Show
            when={!b.empty()}
            fallback={<EmptyState message={tp(b.hasFilter() ? 'patients.empty.filtered' : 'patients.empty')} />}
          >
            <ul class={s.list}>
              <For each={b.state().items}>{(p) => <li><PatientRow patient={p} /></li>}</For>
            </ul>
            <div ref={sentinel} class={s.sentinel} />
          </Show>
        </Show>
      </Show>
    </section>
  )
}
