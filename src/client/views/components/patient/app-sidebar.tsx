import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, radius, alpha } from "../../../styles/tokens.ts"

interface AppSidebarProps {
  readonly userName: string
  readonly userInitials: string
  readonly familyCount: number
  readonly activeItem: string
}

const sidebarStyle = css`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 64px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid ${alpha(color.primary, 0.08)};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 0;
  z-index: 40;
  transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &:hover {
    width: 220px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const logoStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 12px ${alpha(color.primary, 0.3)};
  }
`

const brandStyle = css`
  font-family: ${font.erode};
  font-size: 14px;
  color: ${color.textSageSecondary};
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 2rem;
  text-decoration: none;

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }

  &:hover {
    color: ${color.primary};
  }
`

const navListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 0 12px;
`

const itemStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  text-decoration: none;
  color: ${color.textSageMuted};
  white-space: nowrap;
  border: none;
  background: none;
  font-family: inherit;
  width: 100%;

  &:hover {
    background: ${alpha(color.primary, 0.08)};
    color: ${color.textSageSecondary};
  }
`

const itemActiveStyle = css`
  background: ${alpha(color.primary, 0.08)};
  color: ${color.primary};
`

const iconStyle = css`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
`

const labelStyle = css`
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`

const badgeStyle = css`
  margin-left: auto;
  background: ${color.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: ${radius.pill};
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`

const footerStyle = css`
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 12px;
  width: 100%;
`

const avatarStyle = css`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${color.bgSage}, ${color.bgSageDeep});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: ${color.primaryDark};
  flex-shrink: 0;
`

const usernameStyle = css`
  font-size: 12px;
  color: ${color.textSageMuted};
  white-space: nowrap;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);

  nav:hover & {
    opacity: 1;
  }
`

const NAV_ITEMS = [
  { id: "familias", icon: "\u2630", label: "Familias", hasBadge: true, href: "/social-care" },
  { id: "cadastro", icon: "+", label: "Cadastro", hasBadge: false, href: "/patient-registration" },
  { id: "relatorios", icon: "\u25A6", label: "Relatorios", hasBadge: false, href: "#" },
  { id: "config", icon: "\u2699", label: "Config", hasBadge: false, href: "#" },
] as const

export const AppSidebar: FC<AppSidebarProps> = ({
  userName,
  userInitials,
  familyCount,
  activeItem,
}) => (
  <nav class={sidebarStyle} aria-label="Menu lateral">
    <a href="/hub" class={logoStyle} aria-label="Voltar para o Hub">C</a>
    <a href="/hub" class={brandStyle} aria-label="Voltar para o Hub">Conecta</a>

    <div class={navListStyle} role="list">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          class={`${itemStyle} ${item.id === activeItem ? itemActiveStyle : ""}`}
          href={item.href}
          aria-current={item.id === activeItem ? "page" : undefined}
          aria-label={item.label}
          role="listitem"
        >
          <span class={iconStyle} aria-hidden="true">{item.icon}</span>
          <span class={labelStyle}>{item.label}</span>
          {item.hasBadge && (
            <span class={badgeStyle} aria-label={`${familyCount} familias`}>{familyCount}</span>
          )}
        </a>
      ))}
    </div>

    <div class={footerStyle}>
      <div class={avatarStyle} aria-hidden="true">{userInitials}</div>
      <div class={usernameStyle}>{userName}</div>
    </div>
  </nav>
)
