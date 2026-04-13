import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

interface WizardStepperProps {
  readonly currentStep: number
  readonly totalSteps?: number
}

const STEP_LABELS = ["Pessoais", "Docs", "Endereço", "Diag.", "Família", "Espec.", "Ingresso"] as const
const TOTAL = 7

const stepperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2.5rem);
  width: 100%;
  max-width: min(90%, 48rem);
`

const progressBgStyle = css`
  width: 100%;
  height: 3px;
  background: ${alpha(color.primary, 0.1)};
  border-radius: 2px;
  overflow: hidden;
`

const progressFillStyle = css`
  height: 100%;
  background: linear-gradient(90deg, ${color.primary}, ${color.primaryDark});
  border-radius: 2px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
`

const stepsRowStyle = css`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;

  @media (max-width: 600px) {
    display: none;
  }
`

const stepItemStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  cursor: default;
`

const dotBase = css`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
`

const dotPending = css`
  background: ${alpha(color.primary, 0.15)};
`

const dotCurrent = css`
  background: #fff;
  border-color: ${color.primary};
  box-shadow: 0 0 0 3px ${alpha(color.primary, 0.12)};
`

const dotCompleted = css`
  background: ${color.primary};
  box-shadow: 0 0 0 3px ${alpha(color.primary, 0.1)};
`

const labelBase = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.75rem);
  white-space: nowrap;
  font-weight: ${weight.medium};
  transition: color 150ms ease;
  color: ${color.textSageSoft};
`

const labelCurrent = css`
  color: ${color.textSageSecondary};
  font-weight: ${weight.semibold};
`

const labelCompleted = css`
  color: ${color.primary};
`

const mobileStepperStyle = css`
  display: none;
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  color: ${color.textSageSoft};
  text-align: center;
  font-weight: ${weight.medium};
  padding: 0.75rem 0;
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);

  @media (max-width: 600px) {
    display: block;
  }
`

export const WizardStepper: FC<WizardStepperProps> = ({ currentStep }) => {
  const pct = (currentStep / (TOTAL - 1)) * 100

  return (
    <>
      <div class={stepperStyle}>
        <div class={progressBgStyle}>
          <div class={progressFillStyle} style={`width: ${pct}%`} />
        </div>
        <div class={stepsRowStyle}>
          {STEP_LABELS.map((label, i) => {
            const isCompleted = i < currentStep
            const isCurrent = i === currentStep
            return (
              <div class={stepItemStyle} key={i}>
                <div class={cx(dotBase, isCompleted ? dotCompleted : isCurrent ? dotCurrent : dotPending)} />
                <span class={cx(labelBase, isCompleted ? labelCompleted : isCurrent ? labelCurrent : undefined)}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div class={mobileStepperStyle}>
        Etapa {currentStep + 1} de {TOTAL} &mdash; {STEP_LABELS[currentStep]}
      </div>
    </>
  )
}
