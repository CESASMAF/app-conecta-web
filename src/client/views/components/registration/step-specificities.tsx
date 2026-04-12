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
  fadeInUp,
  sageInputBase,
  sageInputLabel,
  sageTextError,
} from "../../../styles/base.ts";
import type { WizardState } from "../../../viewmodels/registration/types.ts";

interface StepSpecificitiesProps {
  readonly specificity: WizardState["specificity"];
  readonly errors: ReadonlyMap<string, string>;
  readonly onUpdate: (field: string, value: string) => void;
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeInUp} 500ms ${easing.out};
`;

const infoTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
  line-height: 1.5;
`;

// --- CardSelectorGroup for identity ---

const cardGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const cardsRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`;

const cardOptionStyle = css`
  padding: 14px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${sageRadius.md};
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.medium};
  color: ${sage.textMuted};
  cursor: pointer;
  transition: all 150ms ${easing.out};
  min-width: 120px;
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const cardSelectedStyle = css`
  ${cardOptionStyle} background: ${sage.greenLight};
  border-color: ${sage.greenPrimary};
  color: ${sage.greenPrimary};
  font-weight: ${weight.semibold};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`;

// --- Description field ---

const descWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 480px;
  animation: ${fadeInUp} 400ms ${easing.out};
`;

const IDENTITY_OPTIONS = [
  { value: "INDIGENA", label: "Indigena" },
  { value: "QUILOMBOLA", label: "Quilombola" },
  { value: "CIGANO", label: "Cigano(a)" },
  { value: "RIBEIRINHO", label: "Ribeirinho(a)" },
  { value: "EXTRATIVISTA", label: "Extrativista" },
  { value: "OUTRO", label: "Outro" },
] as const;

export const StepSpecificities: FC<StepSpecificitiesProps> = (
  { specificity, errors, onUpdate },
) => (
  <div class={containerStyle}>
    <p class={infoTextStyle}>
      Este passo e opcional. Selecione uma identidade social caso aplicavel.
    </p>

    <div class={cardGroupStyle}>
      <span class={sageInputLabel}>Identidade sociocultural</span>
      <div
        class={cardsRow}
        role="radiogroup"
        aria-label="Identidade sociocultural"
      >
        {IDENTITY_OPTIONS.map((opt) => {
          const isSelected = specificity.selectedIdentity === opt.value;
          return (
            <div
              role="radio"
              aria-checked={isSelected ? "true" : "false"}
              tabIndex={0}
              class={isSelected ? cardSelectedStyle : cardOptionStyle}
              onClick={() => onUpdate("selectedIdentity", opt.value)}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onUpdate("selectedIdentity", opt.value);
                }
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </div>

    {specificity.selectedIdentity && (
      <div class={descWrapperStyle}>
        <label class={sageInputLabel} for="specificity-desc">
          Descricao adicional
        </label>
        <input
          id="specificity-desc"
          type="text"
          class={`${sageInputBase} ${
            errors.get("description")
              ? css`
                border-bottom-color: ${sage.danger};
              `
              : ""
          }`}
          value={specificity.description}
          placeholder="Descreva detalhes adicionais"
          onInput={(e) =>
            onUpdate("description", (e.target as HTMLInputElement).value)}
        />
        {errors.get("description") && (
          <span class={sageTextError} role="alert">
            {errors.get("description")}
          </span>
        )}
      </div>
    )}
  </div>
);
