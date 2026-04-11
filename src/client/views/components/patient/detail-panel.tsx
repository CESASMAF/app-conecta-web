import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, alpha, radius } from "../../../styles/tokens.ts"
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

const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: ${alpha(color.textPrimary, 0.05)};
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;
  z-index: 90;
`

const overlayVisibleStyle = css`
  opacity: 1;
  pointer-events: auto;
`

const panelStyle = css`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: min(56vw, 720px);
  background: ${color.backgroundDark};
  border-radius: ${radius.panel} 0 0 ${radius.panel};
  transform: translateX(100%);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: -8px 0 40px ${alpha(color.textPrimary, 0.3)};
  overflow: hidden;
`

const panelVisibleStyle = css`
  transform: translateX(0);
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
  const filledCount = fichas.filter((f) => f.filled).length
  const lastName = detail?.personalData?.lastName ?? "—"

  const handleFichaClick = (route: string | null): void => {
    if (route) {
      globalThis.location.href = route
    }
  }

  return (
    <>
      <div
        class={`${overlayStyle} ${visible ? overlayVisibleStyle : ""}`}
        onClick={onClose}
      />
      <aside class={`${panelStyle} ${visible ? panelVisibleStyle : ""}`}>
        {detail && view === "dados" && (
          <PanelDados
            detail={detail}
            onShowFichas={onShowFichas}
            onEdit={() => {}}
            onClose={onClose}
          />
        )}
        {detail && view === "fichas" && (
          <PanelFichas
            lastName={lastName}
            fichas={fichas}
            filledCount={filledCount}
            onBack={onShowDados}
            onClose={onClose}
            onFichaClick={handleFichaClick}
          />
        )}
      </aside>
    </>
  )
}
