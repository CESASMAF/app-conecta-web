import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

const fabStyle = css`
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${color.primary};
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 28px;
  font-weight: ${weight.bold};
  box-shadow: 0 4px 24px rgba(79, 132, 72, 0.35);
  transition: transform 200ms ease, box-shadow 200ms ease;
  z-index: 80;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 32px rgba(79, 132, 72, 0.45);
  }
`

export const NewRegistrationFab: FC = () => (
  <button
    class={fabStyle}
    onClick={() => { globalThis.location.href = "/patient-registration" }}
    type="button"
    aria-label="Novo cadastro"
  >
    +
  </button>
)
