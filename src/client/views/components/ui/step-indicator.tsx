import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"

interface StepIndicatorProps {
  readonly current: number
  readonly total: number
  readonly labels?: readonly string[]
}

const containerStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
`

const stepGroupStyle = css`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: ${space[1]};
`

const circleBase = css`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.bold};
  transition: background 0.2s, border-color 0.2s;
`

const circlePending = css`
  ${circleBase}
  background: transparent;
  border: 1.5px solid ${color.inputLine};
  color: ${color.textMuted};
`

const circleActive = css`
  ${circleBase}
  background: ${color.textPrimary};
  border: 1.5px solid ${color.textPrimary};
  color: ${color.background};
`

const circleComplete = css`
  ${circleBase}
  background: ${color.primary};
  border: 1.5px solid ${color.primary};
  color: white;
`

const lineBase = css`
  flex: 1;
  height: 2px;
  min-width: 24px;
  margin: 0 ${space[2]};
`

const lineComplete = css`
  ${lineBase}
  background: ${color.primary};
`

const linePending = css`
  ${lineBase}
  background: ${color.inputLine};
`

const labelStyleCss = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  font-weight: ${weight.medium};
  color: ${color.textMuted};
  margin-top: ${space[1]};
  text-align: center;
  white-space: nowrap;
`

export const StepIndicator: FC<StepIndicatorProps> = ({ current, total, labels }) => {
  const steps = Array.from({ length: total }, (_, i) => i)

  return (
    <div class={containerStyle}>
      {steps.map((step) => {
        const isPending = step > current
        const isActive = step === current
        const isComplete = step < current

        const circleClass = isComplete
          ? circleComplete
          : isActive
            ? circleActive
            : circlePending

        return (
          <>
            <div class={stepGroupStyle}>
              <div class={circleClass}>
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step + 1
                )}
              </div>
              {labels && labels[step] && (
                <span class={labelStyleCss}>{labels[step]}</span>
              )}
            </div>
            {step < total - 1 && (
              <div class={isComplete ? lineComplete : linePending} />
            )}
          </>
        )
      })}
    </div>
  )
}
