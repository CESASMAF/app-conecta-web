import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import { centeredContainer, fadeInUp } from "../../../styles/auth-hub.ts"
import { RedirectIcon } from "./redirect-icon.tsx"
import { ProgressBar } from "./progress-bar.tsx"
import { RedirectCancel } from "./redirect-cancel.tsx"

interface AppInfo {
  readonly id: string
  readonly name: string
  readonly color: string
}

interface RedirectScreenProps {
  readonly app: AppInfo
  readonly onCancel: () => void
}

const screenStyle = css`
  ${centeredContainer}
  background: ${color.background};
  gap: 20px;
  text-align: center;
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 22px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  margin: 0;
  animation: ${fadeInUp} 500ms ease 100ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const subtitleStyle = css`
  font-family: ${font.playfair};
  font-size: 15px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${color.textMuted};
  margin: 0;
  animation: ${fadeInUp} 500ms ease 200ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const RedirectScreen: FC<RedirectScreenProps> = ({ app, onCancel }) => (
  <div class={screenStyle} role="status" aria-live="polite">
    <RedirectIcon color={app.color} />
    <h2 class={titleStyle}>{`Entrando em ${app.name}...`}</h2>
    <p class={subtitleStyle}>
      Você tem acesso a um módulo. Redirecionando automaticamente.
    </p>
    <ProgressBar />
    <RedirectCancel onClick={onCancel} />
  </div>
)
