import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"

interface SuccessOverlayProps {
  readonly message: string
  readonly onNewRegistration: () => void
}

const successScale = keyframes`
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const checkDraw = keyframes`
  to { stroke-dashoffset: 0; }
`

const successIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(248, 243, 236, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const glassStyle = css`
  background: ${color.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 20px;
  padding: clamp(2rem, 1.5rem + 2vw, 3rem) clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  text-align: center;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  animation: ${successIn} 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const circleStyle = css`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto clamp(1rem, 0.75rem + 1vw, 1.25rem);
  box-shadow: 0 4px 20px ${alpha(color.primary, 0.25)};
  animation: ${successScale} 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const checkSvg = css`
  width: 28px;
  height: 28px;
  stroke: white;
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: ${checkDraw} 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    stroke-dashoffset: 0;
  }
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.25rem, 1rem + 1vw, 1.5rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
  margin-bottom: 0.5rem;
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const subStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${color.textSageMuted};
  line-height: 1.5;
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) 750ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const actionsStyle = css`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const btnSecondary = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.semibold};
  padding: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem) clamp(1rem, 0.8rem + 1vw, 1.25rem);
  border-radius: 100px;
  background: transparent;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${alpha(color.primary, 0.4)};
    color: ${color.textSageSecondary};
  }
`

const btnPrimary = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.semibold};
  padding: clamp(0.5rem, 0.4rem + 0.5vw, 0.625rem) clamp(1rem, 0.8rem + 1vw, 1.25rem);
  border-radius: 100px;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 150ms ease;
  box-shadow: 0 2px 12px ${alpha(color.primary, 0.2)};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${alpha(color.primary, 0.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`

export const SuccessOverlay: FC<SuccessOverlayProps> = ({ message, onNewRegistration }) => (
  <div class={overlayStyle} role="dialog" aria-label="Cadastro realizado com sucesso">
    <div class={glassStyle}>
      <div class={circleStyle}>
        <svg class={checkSvg} viewBox="0 0 24 24">
          <polyline points="6 12 10 16 18 8" />
        </svg>
      </div>
      <div class={titleStyle}>Cadastro realizado!</div>
      <div class={subStyle}>A familia foi cadastrada com sucesso no sistema Conecta.</div>
      <div class={actionsStyle}>
        <button class={btnSecondary} type="button" onClick={onNewRegistration} aria-label="Novo cadastro">
          Novo cadastro
        </button>
        <a href="/social-care" class={btnPrimary} aria-label="Ver familias">
          Ver familias &#8594;
        </a>
      </div>
    </div>
  </div>
)
