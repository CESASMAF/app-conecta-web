import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, radius } from "../../../styles/tokens.ts"
import type { FichaStatus } from "../../../viewmodels/social-care/types.ts"

interface PanelFichasProps {
  readonly fichas: readonly FichaStatus[]
  readonly onFichaClick: (route: string | null) => void
}

const bodyStyle = css`
  padding: clamp(0.75rem, 0.5rem + 1vw, 1rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
`

const listStyle = css`
  display: flex;
  flex-direction: column;
`

const itemStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(79, 132, 72, 0.06);
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    padding-left: 0.5rem;
  }
`

const numberStyle = css`
  font-size: 11px;
  font-weight: ${weight.medium};
  color: ${color.textSageSoft};
  min-width: 20px;
  font-variant-numeric: tabular-nums;
  font-family: ${font.satoshi};
`

const nameStyle = css`
  flex: 1;
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  font-weight: ${weight.regular};
  color: ${color.textSageSecondary};
  font-family: ${font.satoshi};
  transition: color 150ms cubic-bezier(0.16, 1, 0.3, 1);

  div:hover > & {
    color: ${color.textSagePrimary};
  }
`

const pillStyle = css`
  font-size: 10px;
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
`

const pillFilledStyle = css`
  background: rgba(79, 132, 72, 0.1);
  color: ${color.primary};
`

const pillPendingStyle = css`
  background: rgba(107, 127, 101, 0.08);
  color: ${color.textSageSoft};
`

const arrowStyle = css`
  font-size: 14px;
  color: ${color.textSageSoft};
  opacity: 0;
  transform: translateX(-4px);
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);

  div:hover > & {
    opacity: 1;
    transform: translateX(0);
  }
`

export const PanelFichas: FC<PanelFichasProps> = ({ fichas, onFichaClick }) => (
  <div class={bodyStyle}>
    <div class={listStyle}>
      {fichas.map((f, i) => (
        <div
          key={i}
          class={itemStyle}
          onClick={() => onFichaClick(f.route)}
          role="button"
          tabIndex={0}
          aria-label={`${f.name}, ${f.filled ? "preenchida" : "pendente"}`}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onFichaClick(f.route)
            }
          }}
        >
          <span class={numberStyle}>{String(i + 1).padStart(2, "0")}</span>
          <span class={nameStyle}>{f.name}</span>
          <span class={`${pillStyle} ${f.filled ? pillFilledStyle : pillPendingStyle}`}>
            {f.filled ? "Preenchida" : "Pendente"}
          </span>
          <span class={arrowStyle} aria-hidden="true">&rarr;</span>
        </div>
      ))}
    </div>
  </div>
)
