import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
// tokens not needed directly — sage styles come from base.ts
import {
  sageButtonDisabled,
  sageButtonPrimary,
  sageButtonSecondary,
} from "../../../styles/base.ts";

interface WizardButtonBarProps {
  readonly currentStep: number;
  readonly isLastStep: boolean;
  readonly saving: boolean;
  readonly onBack: () => void;
  readonly onNext: () => void;
}

const barStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(79, 132, 72, 0.08);
`;

const backBtnStyle = css`
  ${sageButtonSecondary};
`;

const nextBtnStyle = css`
  ${sageButtonPrimary};
`;

const hiddenStyle = css`
  visibility: hidden;
`;

export const WizardButtonBar: FC<WizardButtonBarProps> = ({
  currentStep,
  isLastStep,
  saving,
  onBack,
  onNext,
}) => {
  const isFirst = currentStep === 0;
  const nextLabel = saving
    ? "Salvando..."
    : isLastStep
    ? "Salvar Cadastro"
    : "Proximo \u2192";

  return (
    <div class={barStyle}>
      <button
        type="button"
        class={`${backBtnStyle} ${isFirst ? hiddenStyle : ""}`}
        onClick={onBack}
        disabled={saving}
        aria-label="Voltar para etapa anterior"
      >
        &larr; Anterior
      </button>
      <button
        type="button"
        class={`${nextBtnStyle} ${saving ? sageButtonDisabled : ""}`}
        onClick={onNext}
        disabled={saving}
        aria-label={isLastStep
          ? "Salvar cadastro"
          : "Avancar para proxima etapa"}
      >
        {nextLabel}
      </button>
    </div>
  );
};
