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

interface StepIntakeProps {
  readonly intake: WizardState["intake"];
  readonly errors: ReadonlyMap<string, string>;
  readonly onUpdate: (field: string, value: string) => void;
  readonly onToggleProgram: (programId: string) => void;
}

// --- FormField ---

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

// --- FormSelect ---

const selectStyle = css`
  ${sageInputBase} appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B9E85' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  padding-right: 24px;
  cursor: pointer;
`;

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

// --- Textarea ---

const textareaStyle = css`
  border: 1.5px solid ${sage.inputBorder};
  border-radius: ${sageRadius.sm};
  padding: 12px 16px;
  font-family: ${font.satoshi};
  font-size: 15px;
  color: ${sage.textPrimary};
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: ${sage.greenPrimary};
  }
  &::placeholder {
    color: ${sage.textSoft};
    font-style: italic;
  }
`;

const textareaErrorStyle = css`
  border-color: ${sage.danger};
  &:focus {
    border-color: ${sage.danger};
  }
`;

// --- ProgramItem ---

interface ProgramItemProps {
  readonly label: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}

const programItemStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1.5px solid rgba(79, 132, 72, 0.1);
  border-radius: ${sageRadius.md};
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 150ms ${easing.out};
  &:hover {
    border-color: rgba(79, 132, 72, 0.2);
    background: rgba(255, 255, 255, 0.5);
  }
  &:focus-visible {
    outline: 2px solid ${sage.greenPrimary};
    outline-offset: 2px;
  }
`;

const programItemSelectedStyle = css`
  ${programItemStyle} border-color: ${sage.greenPrimary};
  background: ${sage.greenLight};
  box-shadow: 0 0 0 3px rgba(79, 132, 72, 0.08);
`;

const checkboxStyle = css`
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: 1.5px solid rgba(79, 132, 72, 0.2);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 150ms ease;
`;

const checkboxSelectedStyle = css`
  ${checkboxStyle} background: ${sage.greenPrimary};
  border-color: ${sage.greenPrimary};
`;

const programLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${sage.textMuted};
`;

const programLabelSelectedStyle = css`
  ${programLabelStyle} color: ${sage.greenPrimary};
  font-weight: ${weight.medium};
`;

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

const ProgramItem: FC<ProgramItemProps> = ({ label, selected, onToggle }) => (
  <div
    class={selected ? programItemSelectedStyle : programItemStyle}
    role="checkbox"
    aria-checked={selected ? "true" : "false"}
    tabIndex={0}
    onClick={onToggle}
    onKeyDown={(e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    }}
  >
    <div class={selected ? checkboxSelectedStyle : checkboxStyle}>
      {selected && <CheckIcon />}
    </div>
    <span class={selected ? programLabelSelectedStyle : programLabelStyle}>
      {label}
    </span>
  </div>
);

// --- ProgramsGrid ---

const programsGridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  grid-column: 1 / -1;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// --- Section Title ---

const sectionTitleStyle = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.semibold};
  color: ${sage.textLabel};
  text-transform: uppercase;
  letter-spacing: 1px;
  grid-column: 1 / -1;
  margin-top: 8px;
`;

// --- Data ---

const INGRESS_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "DEMANDA_ESPONTANEA", label: "Demanda espontanea" },
  { value: "BUSCA_ATIVA", label: "Busca ativa" },
  { value: "ENCAMINHAMENTO", label: "Encaminhamento" },
  { value: "REINCIDENCIA", label: "Reincidencia" },
] as const;

const SOCIAL_PROGRAMS = [
  { id: "BPC", label: "BPC (Beneficio de Prestacao Continuada)" },
  { id: "BOLSA_FAMILIA", label: "Bolsa Familia" },
  { id: "AUXILIO_BRASIL", label: "Auxilio Brasil" },
  { id: "PETI", label: "PETI" },
  { id: "OUTROS", label: "Outros programas" },
] as const;

// --- Container ---

const containerStyle = css`
  animation: ${fadeInUp} 500ms ${easing.out};
`;

// --- Main Component ---

export const StepIntake: FC<StepIntakeProps> = (
  { intake, errors, onUpdate, onToggleProgram },
) => (
  <div class={containerStyle}>
    <div class={sageFormGrid}>
      <FormSelect
        label="Tipo de ingresso"
        name="ingressType"
        required
        value={intake.ingressType}
        error={errors.get("ingressType")}
        options={INGRESS_OPTIONS}
        onInput={(v) => onUpdate("ingressType", v)}
      />
      <FormField
        label="Nome da origem"
        name="originName"
        placeholder="Instituicao ou pessoa"
        value={intake.originName}
        onInput={(v) => onUpdate("originName", v)}
      />
      <FormField
        label="Contato da origem"
        name="originContact"
        placeholder="Telefone ou email"
        value={intake.originContact}
        onInput={(v) => onUpdate("originContact", v)}
      />

      <div class={`${fieldWrapperStyle} ${sageFullWidth}`}>
        <label class={sageInputLabel} for="serviceReason">
          Motivo do atendimento<span class={requiredStar}>*</span>
        </label>
        <textarea
          id="serviceReason"
          class={`${textareaStyle} ${
            errors.get("serviceReason") ? textareaErrorStyle : ""
          }`}
          value={intake.serviceReason}
          placeholder="Descreva o motivo do atendimento"
          onInput={(e) =>
            onUpdate("serviceReason", (e.target as HTMLTextAreaElement).value)}
        />
        {errors.get("serviceReason") && (
          <span class={sageTextError} role="alert">
            {errors.get("serviceReason")}
          </span>
        )}
      </div>

      <span class={sectionTitleStyle}>Programas sociais vinculados</span>

      <div class={programsGridStyle}>
        {SOCIAL_PROGRAMS.map((prog) => (
          <ProgramItem
            label={prog.label}
            selected={intake.selectedPrograms.includes(prog.id)}
            onToggle={() => onToggleProgram(prog.id)}
          />
        ))}
      </div>

      <div class={`${fieldWrapperStyle} ${sageFullWidth}`}>
        <label class={sageInputLabel} for="observation">Observacao</label>
        <textarea
          id="observation"
          class={textareaStyle}
          value={intake.observation}
          placeholder="Observacoes adicionais (opcional)"
          onInput={(e) =>
            onUpdate("observation", (e.target as HTMLTextAreaElement).value)}
        />
      </div>
    </div>
  </div>
);
