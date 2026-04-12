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
  sageFormGrid,
  sageFullWidth,
  sageInputBase,
  sageInputError,
  sageInputLabel,
  sageTextError,
} from "../../../styles/base.ts";
import type { WizardState } from "../../../viewmodels/registration/types.ts";

interface StepPersonalDataProps {
  readonly fields: WizardState["fields"];
  readonly errors: ReadonlyMap<string, string>;
  readonly onUpdate: (field: string, value: string) => void;
}

// --- FormField sub-component ---

interface FormFieldProps {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly full?: boolean;
  readonly value: string;
  readonly error?: string;
  readonly maxLength?: number;
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
  maxLength,
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
      maxLength={maxLength}
      onInput={(e) => onInput((e.target as HTMLInputElement).value)}
    />
    {error && <span class={sageTextError} role="alert">{error}</span>}
  </div>
);

// --- FormSelect sub-component ---

interface FormSelectProps {
  readonly label: string;
  readonly name: string;
  readonly required?: boolean;
  readonly value: string;
  readonly error?: string;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
  readonly onInput: (value: string) => void;
}

const selectStyle = css`
  ${sageInputBase} appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B9E85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  padding-right: 24px;
  cursor: pointer;
`;

const FormSelect: FC<FormSelectProps> = ({
  label,
  name,
  required,
  value,
  error,
  options,
  onInput,
}) => (
  <div class={fieldWrapperStyle}>
    <label class={sageInputLabel} for={name}>
      {label}
      {required && <span class={requiredStar}>*</span>}
    </label>
    <select
      id={name}
      name={name}
      class={`${selectStyle} ${error ? sageInputError : ""}`}
      value={value}
      onChange={(e) => onInput((e.target as HTMLSelectElement).value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span class={sageTextError} role="alert">{error}</span>}
  </div>
);

// --- CardSelectorGroup sub-component ---

interface CardSelectorGroupProps {
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
  readonly selected: string | null;
  readonly onSelect: (value: string) => void;
  readonly error?: string;
  readonly label: string;
}

const cardGroupContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const cardGroupStyle = css`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const cardOptionStyle = css`
  flex: 1;
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
  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: rgba(79, 132, 72, 0.2);
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const cardOptionSelectedStyle = css`
  ${cardOptionStyle} background: ${sage.greenLight};
  border-color: ${sage.greenPrimary};
  color: ${sage.greenPrimary};
  font-weight: ${weight.semibold};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`;

const cardOptionErrorStyle = css`
  border-color: rgba(196, 66, 43, 0.3);
`;

const CardSelectorGroup: FC<CardSelectorGroupProps> = ({
  options,
  selected,
  onSelect,
  error,
  label,
}) => (
  <div class={`${cardGroupContainerStyle} ${sageFullWidth}`}>
    <span class={sageInputLabel}>
      {label}
      <span class={requiredStar}>*</span>
    </span>
    <div class={cardGroupStyle} role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <div
            role="radio"
            aria-checked={isSelected ? "true" : "false"}
            tabIndex={0}
            class={`${isSelected ? cardOptionSelectedStyle : cardOptionStyle} ${
              error && !isSelected ? cardOptionErrorStyle : ""
            }`}
            onClick={() => onSelect(opt.value)}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(opt.value);
              }
            }}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
    {error && <span class={sageTextError} role="alert">{error}</span>}
  </div>
);

// --- Data ---

const NATIONALITY_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "Brasileira", label: "Brasileira" },
  { value: "Naturalizada", label: "Naturalizada" },
  { value: "Estrangeira", label: "Estrangeira" },
] as const;

const SEX_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
  { value: "OUTRO", label: "Outro" },
] as const;

// --- Formatting ---

const formatDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const unformatToDigits = (value: string): string => value.replace(/\D/g, "");

// --- Container ---

const containerStyle = css`
  animation: ${fadeInUp} 500ms ${easing.out};
`;

// --- Main Component ---

export const StepPersonalData: FC<StepPersonalDataProps> = (
  { fields, errors, onUpdate },
) => (
  <div class={containerStyle}>
    <div class={sageFormGrid}>
      <FormField
        label="Nome"
        name="firstName"
        placeholder="Nome do paciente"
        required
        value={fields.firstName}
        error={errors.get("firstName")}
        onInput={(v) => onUpdate("firstName", v)}
      />
      <FormField
        label="Sobrenome"
        name="lastName"
        placeholder="Sobrenome"
        required
        value={fields.lastName}
        error={errors.get("lastName")}
        onInput={(v) => onUpdate("lastName", v)}
      />
      <FormField
        label="Nome social"
        name="socialName"
        placeholder="Nome social (opcional)"
        value={fields.socialName}
        onInput={(v) => onUpdate("socialName", v)}
      />
      <FormField
        label="Nome da mae"
        name="motherName"
        placeholder="Nome completo da mae"
        required
        value={fields.motherName}
        error={errors.get("motherName")}
        onInput={(v) => onUpdate("motherName", v)}
      />
      <FormField
        label="Data de nascimento"
        name="birthDate"
        placeholder="DD/MM/AAAA"
        required
        value={formatDate(fields.birthDate)}
        error={errors.get("birthDate")}
        onInput={(v) => onUpdate("birthDate", unformatToDigits(v))}
      />
      <FormSelect
        label="Nacionalidade"
        name="nationality"
        required
        value={fields.nationality}
        error={errors.get("nationality")}
        options={NATIONALITY_OPTIONS}
        onInput={(v) => onUpdate("nationality", v)}
      />
      <CardSelectorGroup
        label="Sexo"
        options={SEX_OPTIONS}
        selected={fields.sex || null}
        onSelect={(v) => onUpdate("sex", v)}
        error={errors.get("sex")}
      />
      <FormField
        label="Telefone"
        name="phone"
        placeholder="(00) 00000-0000"
        value={fields.phone}
        onInput={(v) => onUpdate("phone", v)}
      />
    </div>
  </div>
);
