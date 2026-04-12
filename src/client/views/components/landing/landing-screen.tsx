import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color } from "../../../styles/tokens.ts"
import { fadeInUp, centeredContainer } from "../../../styles/auth-hub.ts"
import { LandingOrbs } from "./landing-orbs.tsx"
import { LandingLogo } from "./landing-logo.tsx"
import { LandingTitle } from "./landing-title.tsx"
import { LandingTagline } from "./landing-tagline.tsx"
import type { LandingAlertProps } from "./landing-alert.tsx"
import { LandingAlert } from "./landing-alert.tsx"
import { LandingButton } from "./landing-button.tsx"
import { LandingFooter } from "./landing-footer.tsx"

interface LandingScreenProps {
  readonly alert?: LandingAlertProps | null
  readonly onLogin: () => void
  readonly loading?: boolean
}

const screenStyle = css`
  ${centeredContainer}
  background: ${color.backgroundDark};
`

const contentStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 1;
  padding: 40px;
  max-width: 520px;
  animation: ${fadeInUp} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  @media (max-width: 599px) {
    padding: 24px;
    max-width: 100%;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const LandingScreen: FC<LandingScreenProps> = ({ alert, onLogin, loading }) => (
  <main class={screenStyle} aria-label="Página de login">
    <LandingOrbs />
    <div class={contentStyle}>
      <LandingLogo />
      <LandingTitle />
      <LandingTagline />
      {alert ? (
        <LandingAlert type={alert.type} title={alert.title} description={alert.description} />
      ) : null}
      <LandingButton onClick={onLogin} loading={loading} />
    </div>
    <LandingFooter />
  </main>
)
