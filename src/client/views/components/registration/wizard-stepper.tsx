import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import { easing, font, sage, weight } from "../../../styles/tokens.ts";

interface WizardStepperProps {
  readonly currentStep: number;
  readonly onGoToStep?: (step: number) => void;
}

const TOTAL_STEPS = 7;
const STEP_LABELS = [
  "Dados Pessoais",
  "Documentos",
  "Endereco",
  "Diagnosticos",
  "Familia",
  "Especificidades",
  "Ingresso",
] as const;

// --- ProgressBar ---

const progressTrackStyle = css`
  width: 100%;
  height: 3px;
  background: rgba(79, 132, 72, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const progressFillStyle = css`
  height: 100%;
  background: linear-gradient(90deg, ${sage.greenPrimary}, ${sage.greenDark});
  border-radius: 2px;
  transition: width 400ms ${easing.out};
`;

// --- StepDots ---

const dotsContainerStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  @media (max-width: 600px) {
    display: none;
  }
`;

const dotWrapperStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  cursor: default;
`;

const dotClickableStyle = css`
  cursor: pointer;
  &:focus-visible {
    outline: none;
  }
`;

const dotCircleBase = css`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ${easing.out};
  flex-shrink: 0;
`;

const dotCompletedStyle = css`
  ${dotCircleBase} background: ${sage.greenPrimary};
  border: 2px solid ${sage.greenPrimary};
`;

const dotCurrentStyle = css`
  ${dotCircleBase} background: transparent;
  border: 2px solid ${sage.greenPrimary};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.12);
`;

const dotPendingStyle = css`
  ${dotCircleBase} background: transparent;
  border: 2px solid rgba(79, 132, 72, 0.2);
`;

const dotLabelBase = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  transition: color 200ms ease;
`;

const dotLabelActiveStyle = css`
  ${dotLabelBase} color: ${sage.greenPrimary};
  font-weight: ${weight.semibold};
`;

const dotLabelPendingStyle = css`
  ${dotLabelBase} color: ${sage.textSoft};
  font-weight: ${weight.medium};
`;

// Checkmark SVG for completed dots
const CheckIcon: FC = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 5.5L4 7.5L8 3"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

// Inner dot for current step
const InnerDot: FC = () => (
  <span
    style={{
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: sage.greenPrimary,
    }}
    aria-hidden="true"
  />
);

interface StepDotProps {
  readonly index: number;
  readonly label: string;
  readonly status: "completed" | "current" | "pending";
  readonly onClick?: () => void;
}

const StepDot: FC<StepDotProps> = ({ index, label, status, onClick }) => {
  const isClickable = status === "completed" && onClick;
  const circleStyle = status === "completed"
    ? dotCompletedStyle
    : status === "current"
    ? dotCurrentStyle
    : dotPendingStyle;
  const labelStyle = status === "pending"
    ? dotLabelPendingStyle
    : dotLabelActiveStyle;

  return (
    <div
      class={`${dotWrapperStyle} ${isClickable ? dotClickableStyle : ""}`}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable
        ? (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (onClick) onClick();
          }
        }
        : undefined}
      aria-label={isClickable
        ? `Voltar para etapa ${index + 1}: ${label}`
        : undefined}
    >
      <div class={circleStyle}>
        {status === "completed" && <CheckIcon />}
        {status === "current" && <InnerDot />}
      </div>
      <span class={labelStyle}>{label}</span>
    </div>
  );
};

// --- Mobile Stepper ---

const mobileStepperStyle = css`
  display: none;
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.medium};
  color: ${sage.textMuted};
  text-align: center;
  @media (max-width: 600px) {
    display: block;
  }
`;

export const WizardStepper: FC<WizardStepperProps> = (
  { currentStep, onGoToStep },
) => {
  const progressWidth = `${(currentStep / (TOTAL_STEPS - 1)) * 100}%`;

  return (
    <div role="navigation" aria-label="Progresso do cadastro">
      <div class={progressTrackStyle}>
        <div class={progressFillStyle} style={{ width: progressWidth }} />
      </div>
      <div class={dotsContainerStyle}>
        {STEP_LABELS.map((label, i) => {
          const status = i < currentStep
            ? "completed" as const
            : i === currentStep
            ? "current" as const
            : "pending" as const;
          return (
            <StepDot
              index={i}
              label={label}
              status={status}
              onClick={status === "completed" && onGoToStep
                ? () => onGoToStep(i)
                : undefined}
            />
          );
        })}
      </div>
      <div class={mobileStepperStyle}>
        Etapa {currentStep + 1} de {TOTAL_STEPS} &mdash;{" "}
        {STEP_LABELS[currentStep]}
      </div>
    </div>
  );
};
