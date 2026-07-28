// Nav rail (view burra — ADR-0012). Logo + itens (filtrados por permissão pela VM) + card de usuário.
import { For, Show } from 'solid-js'
import type { MenuItem } from '../root.view-model'
import * as s from '../root.css'
import { avatar } from '../../../../../shared/ui/kit.css'
import { initials } from '../../../../../shared/ui/initials'

export type SideBarProps = Readonly<{
  items: readonly MenuItem[]
  isActive: (href: string) => boolean
  userName: string
  userRole: string
}>

export function SideBar(props: SideBarProps) {
  return (
    <nav class={s.rail} aria-label="Navegação principal">
      <div class={s.railLogo}>
        <img class={s.railLogoImg} src="/brand/raros.webp" alt="Raros Boa Vista" />
        <span class={s.railLogoText}>Raros Boa Vista</span>
      </div>
      <div class={s.railNav}>
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
      </div>
      <Show when={props.userName}>
        <div class={s.railUser}>
          <div class={avatar.sm} aria-hidden="true">
            {initials(props.userName)}
          </div>
          <div class={s.railUserInfo}>
            <span class={s.railUserName}>{props.userName}</span>
            <span class={s.railUserRole}>{props.userRole}</span>
          </div>
        </div>
      </Show>
    </nav>
  )
}
