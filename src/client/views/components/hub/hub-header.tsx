import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, radius, breakpoint } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface HubHeaderProps {
  readonly user: Readonly<{
    name: string
    initials: string
    role: string
  }>
  readonly onLogout: () => void
}

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
  flex-wrap: wrap;
  gap: 12px;
  animation: ${fadeInUp} 500ms ease both;
  @media (min-width: ${breakpoint.mobile}px) {
    padding: 32px 48px 0;
    flex-wrap: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const brandStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
`

const logoCircleStyle = css`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${color.backgroundDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 18px;
  font-weight: ${weight.bold};
  color: ${color.textOnDark};
`

const brandTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 18px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
`

const rightSectionStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`

const userInfoStyle = css`
  display: none;
  text-align: right;
  @media (min-width: ${breakpoint.mobile}px) {
    display: block;
  }
`

const userNameStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.medium};
  color: ${color.textPrimary};
  margin: 0;
`

const userRoleStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  color: ${color.textMuted};
  margin: 0;
`

const avatarStyle = css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${color.backgroundDark};
  color: ${color.textOnDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 16px;
  font-weight: ${weight.semibold};
`

const logoutStyle = css`
  background: none;
  border: 1px solid ${color.inputLine};
  padding: 8px 18px;
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.semibold};
  color: ${alpha(color.textPrimary, 0.7)};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${color.danger};
    color: ${color.danger};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

export const HubHeader: FC<HubHeaderProps> = ({ user, onLogout }) => (
  <header class={headerStyle}>
    <div class={brandStyle}>
      <div class={logoCircleStyle}>A</div>
      <span class={brandTextStyle}>ACDG</span>
    </div>
    <div class={rightSectionStyle}>
      <div class={userInfoStyle}>
        <p class={userNameStyle}>{user.name}</p>
        <p class={userRoleStyle}>{user.role}</p>
      </div>
      <div class={avatarStyle} aria-hidden="true">{user.initials}</div>
      <button
        class={logoutStyle}
        onClick={onLogout}
        aria-label="Sair da plataforma"
      >
        Sair
      </button>
    </div>
  </header>
)
