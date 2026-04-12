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
  bannerSlide,
  fadeInUp,
  sageButtonSecondary,
  sageDiagnosisCard,
  sageDiagnosisCardComplete,
  sageFormGrid,
  sageFullWidth,
  sageInputBase,
  sageInputError,
  sageInputLabel,
  sageTextError,
} from "../../../styles/base.ts";
import type { DiagnosisEntry } from "../../../viewmodels/registration/types.ts";

interface StepDiagnosesProps {
  readonly diagnoses: readonly DiagnosisEntry[];
  readonly errors: ReadonlyMap<string, string>;
  readonly onUpdateEntry: (
    index: number,
    field: keyof DiagnosisEntry,
    value: string,
  ) => void;
  readonly onAddDiagnosis: () => void;
  readonly onRemoveDiagnosis: (index: number) => void;
  readonly onApplyQuickCid: (
    index: number,
    code: string,
    description: string,
  ) => void;
}

// --- Quick CID data (8 chips) ---

const QUICK_CIDS = [
  { code: "G80", description: "Paralisia cerebral" },
  { code: "Q90", description: "Sindrome de Down" },
  { code: "F84.0", description: "Autismo infantil" },
  { code: "E70", description: "Fenilcetonuria" },
  { code: "G71.0", description: "Distrofia muscular" },
  { code: "R69", description: "Causas desconhecidas de morbidade" },
  { code: "Z03", description: "Observacao e avaliacao medica" },
  { code: "Z03.9", description: "Observacao por suspeita nao especificada" },
] as const;

// --- Formatting ---

const formatDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const unformatToDigits = (value: string): string => value.replace(/\D/g, "");

// --- DiagnosisStatus ---

interface DiagnosisStatusProps {
  readonly isComplete: boolean;
}

const statusStyle = css`
  position: absolute;
  top: 12px;
  right: 44px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
`;

const statusTextPendingStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${sage.textSoft};
`;

const statusTextCompleteStyle = css`
  ${statusTextPendingStyle} color: ${sage.greenPrimary};
`;

const statusDotPendingStyle = css`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(79, 132, 72, 0.2);
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ${easing.out};
`;

const statusDotCompleteStyle = css`
  ${statusDotPendingStyle} border-color: ${sage.greenPrimary};
  background: ${sage.greenPrimary};
`;

const StatusCheck: FC = () => (
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

const DiagnosisStatus: FC<DiagnosisStatusProps> = ({ isComplete }) => (
  <div class={statusStyle}>
    <span class={isComplete ? statusTextCompleteStyle : statusTextPendingStyle}>
      {isComplete ? "Completo" : "Pendente"}
    </span>
    <div class={isComplete ? statusDotCompleteStyle : statusDotPendingStyle}>
      {isComplete && <StatusCheck />}
    </div>
  </div>
);

// --- QuickCIDChip ---

interface QuickCIDChipProps {
  readonly code: string;
  readonly label: string;
  readonly isActive: boolean;
  readonly onClick: () => void;
}

const chipStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.medium};
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: rgba(255, 255, 255, 0.3);
  color: ${sage.textMuted};
  cursor: pointer;
  transition: all 150ms ${easing.out};
  white-space: nowrap;
  &:hover {
    border-color: ${sage.greenPrimary};
    color: ${sage.greenPrimary};
    background: ${sage.greenLight};
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const chipActiveStyle = css`
  ${chipStyle} border-color: ${sage.greenPrimary};
  background: ${sage.greenPrimary};
  color: white;
  font-weight: ${weight.semibold};
  &:hover {
    background: ${sage.greenDark};
    border-color: ${sage.greenDark};
    color: white;
  }
`;

const QuickCIDChip: FC<QuickCIDChipProps> = (
  { code, label, isActive, onClick },
) => (
  <button
    type="button"
    class={isActive ? chipActiveStyle : chipStyle}
    onClick={onClick}
  >
    {code} &mdash; {label}
  </button>
);

// --- Remove Button ---

const removeBtnStyle = css`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(79, 132, 72, 0.15);
  background: transparent;
  color: ${sage.textMuted};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  &:hover {
    border-color: ${sage.danger};
    color: ${sage.danger};
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

// --- FormField (inline) ---

const fieldWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const requiredStar = css`
  color: ${sage.danger};
`;

interface FormFieldProps {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly full?: boolean;
  readonly value: string;
  readonly error?: string;
  readonly onInput: (value: string) => void;
}

const FormField: FC<FormFieldProps> = ({
  label,
  name,
  placeholder,
  required,
  full,
  value,
  error,
  onInput,
}) => (
  <div class={`${fieldWrapperStyle} ${full ? sageFullWidth : ""}`}>
    <label class={sageInputLabel} for={name}>
      {label}
      {required && <span class={requiredStar}>*</span>}
    </label>
    <input
      id={name}
      name={name}
      type="text"
      class={`${sageInputBase} ${error ? sageInputError : ""}`}
      value={value}
      placeholder={placeholder}
      onInput={(e) => onInput((e.target as HTMLInputElement).value)}
    />
    {error && <span class={sageTextError} role="alert">{error}</span>}
  </div>
);

// --- QuickCID row ---

const chipRowStyle = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  grid-column: 1 / -1;
`;

// --- DiagnosisCard ---

const cardAnimStyle = css`
  animation: ${fadeInUp} 500ms ${easing.out};
`;

const cardSpacingStyle = css`
  & + & {
    margin-top: 12px;
  }
`;

// --- GlobalErrorBanner ---

const bannerStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(196, 66, 43, 0.06);
  border: 1px solid ${sage.dangerBorder};
  border-radius: ${sageRadius.md};
  animation: ${bannerSlide} 500ms ${easing.out};
`;

const bannerIconStyle = css`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${sage.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  flex-shrink: 0;
`;

const bannerTextStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.medium};
  color: ${sage.danger};
  line-height: 1.4;
`;

// --- Empty state ---

const emptyStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
  text-align: center;
  padding: 32px 0;
`;

// --- Add button ---

const addBtnStyle = css`
  ${sageButtonSecondary} align-self: flex-start;
`;

// --- Container ---

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeInUp} 500ms ${easing.out};
`;

// --- Helper ---

const isDiagnosisComplete = (d: DiagnosisEntry): boolean =>
  d.code.trim() !== "" && d.date.trim() !== "" && d.description.trim() !== "";

// --- Main Component ---

export const StepDiagnoses: FC<StepDiagnosesProps> = ({
  diagnoses,
  errors,
  onUpdateEntry,
  onAddDiagnosis,
  onRemoveDiagnosis,
  onApplyQuickCid,
}) => (
  <div class={containerStyle}>
    {errors.get("diagnoses") && (
      <div class={bannerStyle} role="alert">
        <span class={bannerIconStyle} aria-hidden="true">!</span>
        <span class={bannerTextStyle}>{errors.get("diagnoses")}</span>
      </div>
    )}

    {diagnoses.length === 0 && (
      <p class={emptyStyle}>
        Nenhum diagnostico adicionado. Clique abaixo para adicionar.
      </p>
    )}

    {diagnoses.map((diag, index) => {
      const complete = isDiagnosisComplete(diag);
      return (
        <div
          class={`${sageDiagnosisCard} ${
            complete ? sageDiagnosisCardComplete : ""
          } ${cardAnimStyle} ${cardSpacingStyle}`}
        >
          <DiagnosisStatus isComplete={complete} />
          <button
            type="button"
            class={removeBtnStyle}
            onClick={() => onRemoveDiagnosis(index)}
            aria-label={`Remover diagnostico ${index + 1}`}
          >
            &times;
          </button>

          <div class={sageFormGrid}>
            <FormField
              label="Codigo CID"
              name={`diag_${index}_code`}
              placeholder="Ex: G80, F84.0"
              required
              value={diag.code}
              error={errors.get(`diagnosis_${index}_code`)}
              onInput={(v) => onUpdateEntry(index, "code", v)}
            />
            <FormField
              label="Data do diagnostico"
              name={`diag_${index}_date`}
              placeholder="DD/MM/AAAA"
              required
              value={formatDate(diag.date)}
              error={errors.get(`diagnosis_${index}_date`)}
              onInput={(v) => onUpdateEntry(index, "date", unformatToDigits(v))}
            />
            <FormField
              label="Descricao"
              name={`diag_${index}_desc`}
              placeholder="Descricao do diagnostico"
              required
              full
              value={diag.description}
              error={errors.get(`diagnosis_${index}_description`)}
              onInput={(v) => onUpdateEntry(index, "description", v)}
            />
            <div class={chipRowStyle}>
              {QUICK_CIDS.map((cid) => (
                <QuickCIDChip
                  code={cid.code}
                  label={cid.description}
                  isActive={diag.quickCidId === cid.code}
                  onClick={() =>
                    onApplyQuickCid(index, cid.code, cid.description)}
                />
              ))}
            </div>
          </div>
        </div>
      );
    })}

    <button
      type="button"
      class={addBtnStyle}
      onClick={onAddDiagnosis}
    >
      + Adicionar diagnostico
    </button>
  </div>
);
