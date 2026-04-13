import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import type { PanelView, PatientDetail, FichaStatus } from "../../../viewmodels/social-care/types.ts"
import { PanelDados } from "./panel-dados.tsx"
import { PanelFichas } from "./panel-fichas.tsx"

interface DetailPanelProps {
  readonly visible: boolean
  readonly view: PanelView
  readonly detail: PatientDetail | null
  readonly fichas: readonly FichaStatus[]
  readonly onClose: () => void
  readonly onShowFichas: () => void
  readonly onShowDados: () => void
}

const panelStyle = css`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 44%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  transform: translateX(100%);
  transition: transform 450ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 30;

  @media (max-width: 1200px) {
    width: 50%;
  }

  @media (max-width: 768px) {
    width: 100%;
    z-index: 50;
  }
`

const panelOpenStyle = css`
  transform: translateX(0);
`

const innerStyle = css`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms,
              transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms;
`

const innerOpenStyle = css`
  opacity: 1;
  transform: translateX(0);
`

const headerStyle = css`
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(0.75rem, 0.5rem + 0.75vw, 1rem);
  border-bottom: 1px solid rgba(79, 132, 72, 0.1);
`

const headerTopStyle = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: clamp(0.75rem, 0.5rem + 0.75vw, 1rem);
`

const detailNameStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.25rem, 1rem + 1.25vw, 1.75rem);
  font-weight: ${weight.bold};
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: ${color.textSagePrimary};
`

const detailSubtitleStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${color.textSageMuted};
  font-style: italic;
  margin-bottom: 0.75rem;
`

const closeButtonStyle = css`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  color: ${color.textSageSecondary};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
    color: ${color.textSagePrimary};
  }
`

const tabsStyle = css`
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(79, 132, 72, 0.1);
`

const tabStyle = css`
  flex: 1;
  padding: 0.75rem 1rem;
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    color: ${color.textSageSecondary};
  }
`

const tabActiveStyle = css`
  color: ${color.primary};

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 1rem;
    right: 1rem;
    height: 2px;
    background: ${color.primary};
    border-radius: 1px;
  }
`

export const DetailPanel: FC<DetailPanelProps> = ({
  visible,
  view,
  detail,
  fichas,
  onClose,
  onShowFichas,
  onShowDados,
}) => {
  const pd = detail?.personalData
  const displayName = pd
    ? `${pd.firstName ?? ""} ${pd.lastName ?? ""}`.trim() || "\u2014"
    : "\u2014"
  const diagnosis = detail?.diagnoses?.[0]
    ? `${detail.diagnoses[0].description}${detail.diagnoses[0].icdCode ? ` (${detail.diagnoses[0].icdCode})` : ""}`
    : null

  const handleFichaClick = (route: string | null): void => {
    if (route) globalThis.location.href = route
  }

  return (
    <aside
      class={`${panelStyle} ${visible ? panelOpenStyle : ""}`}
      aria-label="Painel de detalhes"
      aria-hidden={!visible}
    >
      <div class={`${innerStyle} ${visible ? innerOpenStyle : ""}`}>
        <div class={headerStyle}>
          <div class={headerTopStyle}>
            <div>
              <h3 class={detailNameStyle}>{displayName}</h3>
              {diagnosis && <p class={detailSubtitleStyle}>{diagnosis}</p>}
            </div>
            <button
              class={closeButtonStyle}
              onClick={onClose}
              type="button"
              aria-label="Fechar painel"
            >
              &times;
            </button>
          </div>
        </div>

        <div class={tabsStyle}>
          <button
            class={`${tabStyle} ${view === "dados" ? tabActiveStyle : ""}`}
            onClick={onShowDados}
            type="button"
            aria-label="Aba dados"
          >
            Dados
          </button>
          <button
            class={`${tabStyle} ${view === "fichas" ? tabActiveStyle : ""}`}
            onClick={onShowFichas}
            type="button"
            aria-label="Aba fichas"
          >
            Fichas
          </button>
        </div>

        {detail && view === "dados" && <PanelDados detail={detail} />}
        {detail && view === "fichas" && (
          <PanelFichas fichas={fichas} onFichaClick={handleFichaClick} />
        )}
      </div>
    </aside>
  )
}
