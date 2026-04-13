import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`

const topBarStyle = css`
  width: 100%;
  max-width: min(90%, 48rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${fadeIn} 400ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const backLinkStyle = css`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  color: ${color.textSageMuted};
  text-decoration: none;
  cursor: pointer;
  transition: color 150ms ease;
  border: none;
  background: none;
  padding: 0;

  &:hover {
    color: ${color.textSageSecondary};
  }
`

const draftHintStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  color: ${color.textSageSoft};
  font-weight: ${weight.medium};
`

export const WizardNavBar: FC = () => (
  <div class={topBarStyle}>
    <a href="/social-care" class={backLinkStyle} aria-label="Voltar para Familias">
      &#8592; Voltar para Familias
    </a>
    <span class={draftHintStyle}>Rascunho salvo automaticamente</span>
  </div>
)
