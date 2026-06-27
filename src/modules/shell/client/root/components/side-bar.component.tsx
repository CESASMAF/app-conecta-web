// Nav rail (view burra — ADR-0012). Itens de menu já filtrados por permissão pela VM.
import { For } from 'solid-js'
import type { MenuItem } from '../root.view-model'
import * as s from '../root.css'

export type SideBarProps = Readonly<{
  items: readonly MenuItem[]
  isActive: (href: string) => boolean
}>

export function SideBar(props: SideBarProps) {
  return (
    <nav class={s.rail} aria-label="Navegação principal">
      <For each={props.items}>
        {(item) => (
          <a
            class={props.isActive(item.href) ? s.railItemActive : s.railItem}
            href={item.href}
            aria-current={props.isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
          </a>
        )}
      </For>
    </nav>
  )
}
