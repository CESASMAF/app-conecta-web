import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface FichaRowProps {
  readonly name: string
  readonly filled: boolean
  readonly onFichaClick: () => void
}

const rowStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  transition: opacity 150ms ease;
  font-family: ${font.satoshi};
  font-size: 16px;
  font-weight: ${weight.medium};
  color: ${color.textOnDark};
  &:hover { opacity: 1 !important; }
`

const rowFilledStyle = css`
  opacity: 0.9;
`

const rowPendingStyle = css`
  opacity: 0.5;
`

const dotStyle = css`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`

const dotFilledStyle = css`
  background: ${color.primary};
`

const dotPendingStyle = css`
  background: ${color.textMuted};
`

export const FichaRow: FC<FichaRowProps> = ({ name, filled, onFichaClick }) => (
  <div
    class={`${rowStyle} ${filled ? rowFilledStyle : rowPendingStyle}`}
    onClick={onFichaClick}
    data-filled={String(filled)}
  >
    <span class={`${dotStyle} ${filled ? dotFilledStyle : dotPendingStyle}`} />
    <span>{name}</span>
  </div>
)
