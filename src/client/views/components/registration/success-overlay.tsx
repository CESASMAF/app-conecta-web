import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import {
  easing,
  font,
  sage,
  sageRadius,
  weight,
} from "../../../styles/tokens.ts";
import {
  checkDraw,
  fadeInUp,
  sageButtonPrimary,
  sageButtonSecondary,
  sageCard,
  successIn,
  successScale,
} from "../../../styles/base.ts";

interface SuccessOverlayProps {
  readonly visible: boolean;
  readonly onNewRegistration: () => void;
  readonly onViewFamilies: () => void;
}

const overlayStyle = css`
  position: fixed;
  inset: 0;
  background: rgba(248, 243, 236, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 500ms ${easing.out};
`;

const overlayVisibleStyle = css`
  ${overlayStyle} opacity: 1;
  pointer-events: auto;
`;

const cardStyle = css`
  ${sageCard} border-radius: ${sageRadius.xl};
  padding: 48px 56px;
  text-align: center;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
  animation: ${successIn} 800ms ${easing.spring};
  @media (max-width: 600px) {
    padding: 32px 24px;
    margin: 16px;
  }
`;

// --- Success Circle ---

const circleStyle = css`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${sage.greenPrimary}, ${sage.greenDark});
  box-shadow: ${sage.successCircleShadow};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: ${successScale} 600ms ${easing.spring};
`;

const checkPathStyle = css`
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: ${checkDraw} 500ms ${easing.out} 400ms forwards;
`;

const SuccessCircle: FC = () => (
  <div class={circleStyle}>
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        class={checkPathStyle}
        d="M7 14.5L12 19.5L21 9.5"
        stroke="white"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
);

// --- Title ---

const titleStyle = css`
  font-family: ${font.erode};
  font-size: 24px;
  font-weight: ${weight.bold};
  color: ${sage.textPrimary};
  margin: 0 0 8px;
  animation: ${fadeInUp} 500ms ${easing.out} 600ms both;
`;

// --- Subtitle ---

const subtitleStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
  line-height: 1.5;
  margin: 0 0 24px;
  animation: ${fadeInUp} 500ms ${easing.out} 750ms both;
`;

// --- Actions ---

const actionsStyle = css`
  display: flex;
  gap: 12px;
  justify-content: center;
  animation: ${fadeInUp} 500ms ${easing.out} 900ms both;
`;

const secondaryBtnStyle = css`
  ${sageButtonSecondary};
`;

const primaryBtnStyle = css`
  ${sageButtonPrimary};
`;

// --- Main Component ---

export const SuccessOverlay: FC<SuccessOverlayProps> = ({
  visible,
  onNewRegistration,
  onViewFamilies,
}) => (
  <div
    class={visible ? overlayVisibleStyle : overlayStyle}
    role="dialog"
    aria-modal="true"
    aria-labelledby="success-title"
  >
    <div class={cardStyle}>
      <SuccessCircle />
      <h2 id="success-title" class={titleStyle}>Cadastro realizado!</h2>
      <p class={subtitleStyle}>
        A familia foi cadastrada com sucesso no sistema Conecta.
      </p>
      <div class={actionsStyle}>
        <button
          type="button"
          class={secondaryBtnStyle}
          onClick={onNewRegistration}
        >
          Novo cadastro
        </button>
        <button type="button" class={primaryBtnStyle} onClick={onViewFamilies}>
          Ver familias &rarr;
        </button>
      </div>
    </div>
  </div>
);
