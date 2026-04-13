import type { FC } from "hono/jsx/dom"
import { StepIndicator } from "../ui/step-indicator.tsx"

interface WizardStepperProps {
  readonly currentStep: number
}

const STEP_LABELS = [
  "Dados Pessoais",
  "Documentos",
  "Endereco",
  "Diagnosticos",
  "Familia",
  "Especificidades",
  "Ingresso",
] as const

export const WizardStepper: FC<WizardStepperProps> = ({ currentStep }) => (
  <StepIndicator current={currentStep} total={7} labels={STEP_LABELS} />
)
