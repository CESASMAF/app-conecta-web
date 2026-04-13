import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, space, radius } from "../../../styles/tokens.ts"
import { ModalShell } from "../ui/modal-shell.tsx"

interface ConfirmDialogProps {
  readonly title: string
  readonly message: string
  readonly confirmLabel: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 22px;
  font-weight: ${weight.bold};
  color: ${color.background};
  margin-bottom: ${space[3]};
`

const messageStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${alpha(color.background, 0.7)};
  line-height: 1.5;
  margin-bottom: ${space[5]};
`

const actionsStyle = css`
  display: flex;
  gap: ${space[3]};
  justify-content: flex-end;
`

const cancelBtn = css`
  padding: 10px 24px;
  border-radius: ${radius.pill};
  border: 1.5px solid ${alpha(color.background, 0.4)};
  background: transparent;
  color: ${color.background};
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.medium};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.8; }
`

const confirmBtn = css`
  padding: 10px 24px;
  border-radius: ${radius.pill};
  border: none;
  background: ${color.danger};
  color: white;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.bold};
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => (
  <ModalShell onClose={onCancel} maxWidth="420px">
    <h2 class={titleStyle}>{title}</h2>
    <p class={messageStyle}>{message}</p>
    <div class={actionsStyle}>
      <button class={cancelBtn} onClick={onCancel}>Cancelar</button>
      <button class={confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </ModalShell>
)
