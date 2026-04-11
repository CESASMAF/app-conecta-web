import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, radius, shadow, space, alpha } from "../../../styles/tokens.ts"

interface ModalShellProps {
  readonly maxWidth?: string
  readonly children: unknown
  readonly onClose: () => void
}

const backdropStyle = css`
  position: fixed;
  inset: 0;
  background: ${alpha(color.textPrimary, 0.4)};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const containerStyle = (maxWidth: string) => css`
  background: ${color.backgroundDark};
  border-radius: ${radius.modal};
  ${shadow.modal}
  padding: ${space[6]};
  max-width: ${maxWidth};
  width: 92vw;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
`

export const ModalShell: FC<ModalShellProps> = ({ maxWidth, children, onClose }) => (
  <div class={backdropStyle} onClick={onClose}>
    <div class={containerStyle(maxWidth ?? "760px")} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
)
