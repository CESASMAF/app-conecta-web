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
  padding: clamp(1rem, 0.5rem + 1.5vw, 2rem) clamp(1.25rem, 0.5rem + 3vw, 3rem) 0;
  flex-wrap: wrap;
  gap: clamp(0.5rem, 0.25rem + 1vw, 0.75rem);
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (min-width: ${breakpoint.mobile}px) {
    flex-wrap: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const brandStyle = css`
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 0.25rem + 0.5vw, 0.625rem);
`

const logoCircleStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.erode};
  font-size: 16px;
  font-weight: ${weight.bold};
  color: #fff;
`

const brandTextStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  font-weight: ${weight.semibold};
  color: ${color.textSageSecondary};
`

const rightSectionStyle = css`
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 0.25rem + 0.5vw, 0.75rem);
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
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${weight.medium};
  color: ${color.textSagePrimary};
  margin: 0;
`

const userRoleStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  color: ${color.textSageMuted};
  margin: 0;
`

const avatarStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${color.bgSage}, ${color.bgSageDeep});
  color: ${color.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  font-weight: ${weight.semibold};
`

const logoutStyle = css`
  background: none;
  border: 1px solid ${alpha(color.primary, 0.15)};
  padding: clamp(0.375rem, 0.25rem + 0.5vw, 0.5rem) clamp(0.875rem, 0.5rem + 1vw, 1.125rem);
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.semibold};
  color: ${color.textSageMuted};
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease;
  &:hover {
    border-color: ${color.dangerAlt};
    color: ${color.dangerAlt};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

export const HubHeader: FC<HubHeaderProps> = ({ user, onLogout }) => (
  <header class={headerStyle}>
    <div class={brandStyle}>
      <div class={logoCircleStyle} aria-hidden="true">A</div>
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
