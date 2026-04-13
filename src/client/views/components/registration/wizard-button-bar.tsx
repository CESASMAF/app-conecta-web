import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

interface WizardButtonBarProps {
  readonly currentStep: number
  readonly totalSteps: number
  readonly saving: boolean
  readonly onBack: () => void
  readonly onNext: () => void
}

const barStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  padding-top: clamp(1.25rem, 1rem + 1vw, 2rem);
  border-top: 1px solid ${alpha(color.primary, 0.08)};
`

const btnBase = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.semibold};
  border-radius: 100px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  border: none;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const btnSecondary = css`
  ${btnBase}
  background: transparent;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  padding: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem) clamp(1rem, 0.8rem + 1vw, 1.25rem);

  &:hover:not(:disabled) {
    border-color: ${alpha(color.primary, 0.4)};
    color: ${color.textSageSecondary};
  }
`

const btnPrimary = css`
  ${btnBase}
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);
  box-shadow: 0 2px 12px ${alpha(color.primary, 0.2)};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${alpha(color.primary, 0.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover:not(:disabled) {
      transform: none;
    }
  }
`

export const WizardButtonBar: FC<WizardButtonBarProps> = ({
  currentStep,
  totalSteps,
  saving,
  onBack,
  onNext,
}) => {
  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  return (
    <div class={barStyle}>
      {isFirst ? <div /> : (
        <button
          class={btnSecondary}
          onClick={onBack}
          disabled={saving}
          type="button"
          aria-label="Etapa anterior"
        >
          &#8592; Anterior
        </button>
      )}
      <button
        class={btnPrimary}
        onClick={onNext}
        disabled={saving}
        type="button"
        aria-label={isLast ? "Salvar cadastro" : "Proxima etapa"}
      >
        {saving ? "Salvando..." : isLast ? "Salvar Cadastro" : "Proximo \u2192"}
      </button>
    </div>
  )
}
