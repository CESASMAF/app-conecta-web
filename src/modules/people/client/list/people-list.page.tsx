// Tela da lista de pessoas (Admin/RH) — busca + lista paginada + estados. Scroll infinito por
// IntersectionObserver (nativo). O BFF é a autoridade (worker direto aqui → 403 tratado).
import { For, Show, onMount, onCleanup } from 'solid-js'
import { A } from '@solidjs/router'
import { usePeopleListBinding } from './people-list.binding'
import { tpe } from '~/shared/i18n/people'
import { formatDate } from '~/shared/date'
import * as s from '../people.css'

export function PeopleListPage() {
  const b = usePeopleListBinding()
  let sentinel: HTMLDivElement | undefined
  onMount(() => {
    if (!sentinel) return
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && void b.loadMore(), { rootMargin: '200px' })
    io.observe(sentinel)
    onCleanup(() => io.disconnect())
  })

  return (
    <section class={s.wrap}>
      <header class={s.header}>
        <h1 class={s.title}>{tpe('people.title')}</h1>
        <div class={s.headerActions}>
          <Show when={!b.pending() && !b.errorTag()}>
            <span class={s.count}>
              {b.state().items.length} de {b.total()}
            </span>
          </Show>
          <A href="/people/new" class={s.newBtn}>
            {tpe('people.new')}
          </A>
        </div>
      </header>

      <input
        class={s.searchInput}
        type="search"
        value={b.searchValue()}
        placeholder={tpe('people.search.placeholder')}
        onInput={(e) => b.setSearch(e.currentTarget.value)}
      />

      <Show
        when={!b.errorTag()}
        fallback={
          <div class={s.panel} role="alert">
            <p>{tpe(b.errorTag()!)}</p>
            <button type="button" class={s.btnGhost} onClick={b.retry}>
              {tpe('people.retry')}
            </button>
          </div>
        }
      >
        <Show when={!b.pending()} fallback={<p class={s.muted}>Carregando…</p>}>
          <Show when={!b.empty()} fallback={<p class={s.muted}>{tpe(b.hasFilter() ? 'people.empty.filtered' : 'people.empty')}</p>}>
            <ul class={s.list}>
              <For each={b.state().items}>
                {(p) => (
                  <li>
                    <A href={`/people/${p.id}`} class={s.row}>
                      <span>
                        <span class={s.name}>{p.fullName || 'Sem nome'}</span>
                        <br />
                        <span class={s.sub}>Nascimento: {formatDate(p.birthDate) || '—'}</span>
                      </span>
                      <span class={p.active ? s.badge : s.badgeOff}>{p.active ? tpe('people.active') : tpe('people.inactive')}</span>
                    </A>
                  </li>
                )}
              </For>
            </ul>
            <div ref={sentinel} class={s.sentinel} />
            <Show when={b.loadingMore()}>
              <p class={s.muted}>Carregando mais…</p>
            </Show>
          </Show>
        </Show>
      </Show>
    </section>
  )
}
