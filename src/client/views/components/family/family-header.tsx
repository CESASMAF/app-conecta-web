import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space, radius, shadow } from "../../../styles/tokens.ts"

interface FamilyHeaderProps {
  readonly onAdd: () => void
}

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${space[3]};
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 38px;
  font-weight: ${weight.bold};
  color: ${color.textPrimary};
  line-height: 1.2;
`

const fabStyle = css`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${color.primary};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  ${shadow.fab}
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`

export const FamilyHeader: FC<FamilyHeaderProps> = ({ onAdd }) => (
  <div class={headerStyle}>
    <h1 class={titleStyle}>Composicao Familiar</h1>
    <button class={fabStyle} onClick={onAdd} aria-label="Adicionar membro">
      +
    </button>
  </div>
)
