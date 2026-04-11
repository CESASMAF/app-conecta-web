import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { space } from "../../../styles/tokens.ts"
import { Button } from "../ui/button.tsx"

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
  padding-top: ${space[5]};
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
        <Button variant="secondary" onClick={onBack} disabled={saving}>
          Voltar
        </Button>
      )}
      <Button variant="primary" onClick={onNext} disabled={saving}>
        {saving ? "Salvando..." : isLast ? "Salvar" : "Proximo"}
      </Button>
    </div>
  )
}
