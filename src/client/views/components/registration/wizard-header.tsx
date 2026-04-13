import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface WizardHeaderProps {
  readonly stepNumber: string
  readonly title: string
  readonly description: string
}

const headerStyle = css`
  margin-bottom: clamp(1.5rem, 1rem + 2vw, 2rem);
`

const stepNumberStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textSageSoft};
  margin-bottom: 0.5rem;
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.5rem, 1.25rem + 1.25vw, 1.75rem);
  font-weight: ${weight.bold};
  letter-spacing: -0.02em;
  color: ${color.textSagePrimary};
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${color.textSageMuted};
  line-height: 1.5;
`

export const WizardHeader: FC<WizardHeaderProps> = ({ stepNumber, title, description }) => (
  <div class={headerStyle}>
    <div class={stepNumberStyle}>{stepNumber}</div>
    <h3 class={titleStyle}>{title}</h3>
    <p class={descStyle}>{description}</p>
  </div>
)
