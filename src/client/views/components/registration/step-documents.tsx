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
  sageFormGrid,
  sageFullWidth,
  sageInputBase,
  sageInputError,
  sageInputLabel,
  sageTextError,
} from "../../../styles/base.ts";
import type { WizardState } from "../../../viewmodels/registration/types.ts";

interface StepDocumentsProps {
  readonly documents: WizardState["documents"];
  readonly errors: ReadonlyMap<string, string>;
  readonly onUpdate: (field: string, value: string) => void;
}

// --- FormField (inline, Sage-styled) ---

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

const fieldWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const requiredStar = css`
  color: ${sage.danger};
`;

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

const GlobalErrorBanner: FC<{ readonly message: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div class={bannerStyle} role="alert">
      <span class={bannerIconStyle} aria-hidden="true">!</span>
      <span class={bannerTextStyle}>{message}</span>
    </div>
  );
};

// --- Section Title ---

const sectionTitleStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  grid-column: 1 / -1;
  margin-top: 8px;
`;

const sectionBadge = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 100px;
  background: ${sage.greenLight};
  color: ${sage.greenPrimary};
`;

const sectionText = css`
  font-family: ${font.erode};
  font-size: 13px;
  font-weight: ${weight.semibold};
  color: ${sage.textSecondary};
`;

// --- Formatting ---

const formatCpf = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${
    digits.slice(9)
  }`;
};

const formatDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const unformatToDigits = (value: string): string => value.replace(/\D/g, "");

// --- Container ---

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${fadeInUp} 500ms ${easing.out};
`;

// --- Main Component ---

export const StepDocuments: FC<StepDocumentsProps> = (
  { documents, errors, onUpdate },
) => (
  <div class={containerStyle}>
    {errors.get("documents") && (
      <GlobalErrorBanner message={errors.get("documents") ?? ""} />
    )}

    <div class={sageFormGrid}>
      <FormField
        label="CPF"
        name="cpf"
        placeholder="000.000.000-00"
        value={formatCpf(documents.cpf)}
        error={errors.get("cpf")}
        onInput={(v) => onUpdate("cpf", unformatToDigits(v))}
      />
      <FormField
        label="NIS"
        name="nis"
        placeholder="Numero do NIS"
        value={documents.nis}
        error={errors.get("nis")}
        onInput={(v) => onUpdate("nis", v)}
      />
      <FormField
        label="CNS"
        name="cnsNumber"
        placeholder="Numero do CNS"
        value={documents.cnsNumber}
        error={errors.get("cnsNumber")}
        onInput={(v) => onUpdate("cnsNumber", v)}
      />

      <div class={sectionTitleStyle}>
        <span class={sectionBadge}>RG</span>
        <span class={sectionText}>Preencha todos ou nenhum</span>
      </div>

      <FormField
        label="Numero do RG"
        name="rgNumber"
        placeholder="Numero"
        value={documents.rgNumber}
        error={errors.get("rgNumber")}
        onInput={(v) => onUpdate("rgNumber", v)}
      />
      <FormField
        label="UF"
        name="rgUf"
        placeholder="Estado emissor"
        value={documents.rgUf}
        error={errors.get("rgUf")}
        onInput={(v) => onUpdate("rgUf", v)}
      />
      <FormField
        label="Orgao emissor"
        name="rgAgency"
        placeholder="Ex: SSP"
        value={documents.rgAgency}
        error={errors.get("rgAgency")}
        onInput={(v) => onUpdate("rgAgency", v)}
      />
      <FormField
        label="Data de emissao"
        name="rgDate"
        placeholder="DD/MM/AAAA"
        value={formatDate(documents.rgDate)}
        error={errors.get("rgDate")}
        onInput={(v) => onUpdate("rgDate", unformatToDigits(v))}
      />
    </div>
  </div>
);
