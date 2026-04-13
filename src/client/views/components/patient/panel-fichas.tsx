import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import type { FichaStatus } from "../../../viewmodels/social-care/types.ts"
import { FichaRow } from "./ficha-row.tsx"

interface PanelFichasProps {
  readonly lastName: string
  readonly fichas: readonly FichaStatus[]
  readonly filledCount: number
  readonly onBack: () => void
  readonly onClose: () => void
  readonly onFichaClick: (route: string | null) => void
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  padding: ${space[5]};
  gap: ${space[4]};
  overflow-y: auto;
  height: 100%;
`

const headerRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 48px;
  font-weight: ${weight.bold};
  color: ${color.textOnDark};
  margin: 0;
`

const subtitleStyle = css`
  font-family: ${font.playfair};
  font-size: 15px;
  font-weight: 300;
  font-style: italic;
  color: rgba(242, 226, 196, 0.7);
`

const circleButtonStyle = css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${color.borderOnDark};
  background: transparent;
  color: ${color.textOnDark};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 200ms ease;
  &:hover { background: rgba(242, 226, 196, 0.1); }
`

const closeButtonStyle = css`
  &:hover { background: rgba(166, 41, 13, 0.2); }
`

const listStyle = css`
  display: flex;
  flex-direction: column;
`

export const PanelFichas: FC<PanelFichasProps> = ({
  lastName,
  fichas,
  filledCount,
  onBack,
  onClose,
  onFichaClick,
}) => (
  <div class={containerStyle}>
    <div class={headerRowStyle}>
      <div>
        <h2 class={titleStyle}>Fichas</h2>
        <span class={subtitleStyle}>
          {lastName} &middot; {filledCount}/{fichas.length} preenchidas
        </span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button class={circleButtonStyle} onClick={onBack} type="button" aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button class={`${circleButtonStyle} ${closeButtonStyle}`} onClick={onClose} type="button" aria-label="Fechar">
          &times;
        </button>
      </div>
    </div>

    <div class={listStyle}>
      {fichas.map((f, i) => (
        <FichaRow
          key={i}
          name={f.name}
          filled={f.filled}
          onFichaClick={() => onFichaClick(f.route)}
        />
      ))}
    </div>
  </div>
)
