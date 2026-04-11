import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color } from "../../../styles/tokens.ts"

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const spinnerStyle = css`
  width: 32px;
  height: 32px;
  border: 3px solid ${color.inputLine};
  border-top-color: ${color.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

export const Spinner: FC = () => <div class={spinnerStyle} />
