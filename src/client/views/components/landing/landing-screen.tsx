import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font } from "../../../styles/tokens.ts"
import { fadeInUp, centeredContainer, reducedMotion } from "../../../styles/auth-hub.ts"
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
  background: linear-gradient(155deg, ${color.bgBase} 0%, ${color.bgWarm} 25%, ${color.bgSage} 55%, ${color.bgSageDeep} 100%);
  background-attachment: fixed;
  font-family: ${font.satoshi};
`

const bodyOverride = css`
  :-hono-global {
    body { background: ${color.bgSageDeep} !important; }
  }
`

const contentStyle = css`
  ${reducedMotion}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.25rem, 1rem + 1.5vw, 1.75rem);
  z-index: 1;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  max-width: min(90%, 32rem);
  animation: ${fadeInUp} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
`

export const LandingScreen: FC<LandingScreenProps> = ({ alert, onLogin, loading }) => (
  <main class={screenStyle} aria-label="P\u00e1gina de login">
    <div class={bodyOverride} />
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
