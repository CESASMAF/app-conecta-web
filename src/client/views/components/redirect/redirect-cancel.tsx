import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"

interface RedirectCancelProps {
  readonly onClick: () => void
}

const cancelStyle = css`
  background: none;
  border: none;
  padding: 0;
  font-family: ${font.playfair};
  font-size: 13px;
  font-style: italic;
  font-weight: ${weight.light};
  color: ${color.textMuted};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  animation: ${fadeInUp} 500ms ease 400ms both;
  &:hover {
    color: ${color.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const RedirectCancel: FC<RedirectCancelProps> = ({ onClick }) => (
  <button class={cancelStyle} onClick={onClick} type="button">
    Não é o que esperava? Voltar
  </button>
)
