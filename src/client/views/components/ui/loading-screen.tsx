import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import { centeredContainer } from "../../../styles/auth-hub.ts"
import { Spinner } from "./spinner.tsx"

type HubLoadingContext = "authenticating" | "loading-permissions" | "entering-app"

interface LoadingScreenProps {
  readonly context: HubLoadingContext
  readonly appName?: string
}

const screenStyle = css`
  ${centeredContainer}
  background: ${color.background};
  gap: 24px;
`

const textStyle = css`
  font-family: ${font.playfair};
  font-size: 16px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${color.textMuted};
  margin: 0;
`

const contextText = (context: HubLoadingContext, appName?: string): string => {
  switch (context) {
    case "authenticating":
      return "Autenticando..."
    case "loading-permissions":
      return "Carregando módulos..."
    case "entering-app":
      return `Entrando em ${appName ?? ""}...`
  }
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ context, appName }) => (
  <div class={screenStyle} role="status" aria-live="polite" aria-busy="true">
    <Spinner />
    <p class={textStyle}>{contextText(context, appName)}</p>
  </div>
)
