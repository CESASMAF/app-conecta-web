import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, alpha } from "../../../styles/tokens.ts"

interface ConfirmDialogProps {
  readonly name: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(248,243,236,0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const scaleIn = keyframes`
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`

const modalStyle = css`
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  max-width: 400px;
  width: 90%;
  box-shadow: 0 16px 64px rgba(0,0,0,0.08);
  text-align: center;
  animation: ${scaleIn} 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const iconStyle = css`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${alpha(color.dangerAlt, 0.08)};
  color: ${color.dangerAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 1rem;
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.125rem, 1rem + 0.25vw, 1.25rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
  margin-bottom: 0.5rem;
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  color: ${color.textSageMuted};
  line-height: 1.5;
  margin-bottom: 1.5rem;
`

const actionsStyle = css`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`

const cancelBtn = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${weight.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${radius.pill};
  background: transparent;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${alpha(color.primary, 0.4)};
    color: ${color.textSageSecondary};
  }
`

const dangerBtn = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${weight.semibold};
  padding: 0.625rem 1.25rem;
  border-radius: ${radius.pill};
  background: transparent;
  border: 1.5px solid ${alpha(color.dangerAlt, 0.2)};
  color: ${color.dangerAlt};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${color.dangerAlt};
    background: ${alpha(color.dangerAlt, 0.08)};
  }
`

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  name,
  onConfirm,
  onCancel,
}) => (
  <div class={overlayStyle} onClick={onCancel} role="dialog" aria-modal="true" aria-label="Confirmar remocao">
    <div class={modalStyle} onClick={(e: Event) => e.stopPropagation()}>
      <div class={iconStyle} aria-hidden="true">&#9888;</div>
      <div class={titleStyle}>Remover membro?</div>
      <div class={descStyle}>
        Tem certeza que deseja remover <strong>{name}</strong> da composicao familiar? Esta acao nao pode ser desfeita.
      </div>
      <div class={actionsStyle}>
        <button class={cancelBtn} onClick={onCancel} aria-label="Cancelar">Cancelar</button>
        <button class={dangerBtn} onClick={onConfirm} aria-label="Remover membro">Remover</button>
      </div>
    </div>
  </div>
)
