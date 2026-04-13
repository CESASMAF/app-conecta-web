import type { FC } from "hono/jsx/dom"
import { css, cx } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepPersonalDataProps {
  readonly fields: WizardState["fields"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
}

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 0.75rem + 1vw, 1.5rem) clamp(1.25rem, 1rem + 1vw, 1.75rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const fullCol = css`
  grid-column: 1 / -1;
`

const fieldLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
  margin-bottom: 0.375rem;
`

const cardGroupStyle = css`
  display: flex;
  gap: 0.625rem;
  margin-top: 0.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const cardBase = css`
  flex: 1;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid ${alpha(color.primary, 0.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.medium};
  color: ${color.textSageMuted};

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    border-color: ${alpha(color.primary, 0.2)};
  }
`

const cardSelected = css`
  background: ${alpha(color.primary, 0.08)};
  border-color: ${color.primary};
  color: ${color.primary};
  font-weight: ${weight.semibold};
  box-shadow: 0 0 0 3px ${alpha(color.primary, 0.08)};
`

const cardErrorBorder = css`
  border-color: ${alpha(color.dangerAlt, 0.3)};
`

const errorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${color.dangerAlt};
  margin-top: 0.25rem;
`

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const unformatPhone = (value: string): string => value.replace(/\D/g, "")

const GENDER_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
  { value: "OUTRO", label: "Outro" },
] as const

const NATIONALITY_OPTIONS = ["Brasileira", "Naturalizada", "Estrangeira"] as const

const selectStyle = css`
  background: transparent;
  border: none;
  border-bottom: 1.5px solid ${alpha(color.primary, 0.15)};
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) 0;
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${color.textSagePrimary};
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${color.primary};
  }
`

const selectError = css`
  border-color: ${color.dangerAlt};
`

export const StepPersonalData: FC<StepPersonalDataProps> = ({ fields, errors, onUpdate }) => (
  <div class={gridStyle}>
    <div>
      <UnderlineInput
        label="Nome"
        value={fields.firstName}
        onChange={(v) => onUpdate("firstName", v)}
        error={errors.get("firstName")}
      />
    </div>
    <div>
      <UnderlineInput
        label="Sobrenome"
        value={fields.lastName}
        onChange={(v) => onUpdate("lastName", v)}
        error={errors.get("lastName")}
      />
    </div>
    <div>
      <UnderlineInput
        label="Nome Social"
        value={fields.socialName}
        onChange={(v) => onUpdate("socialName", v)}
      />
    </div>
    <div>
      <UnderlineInput
        label="Nome da Mãe"
        value={fields.motherName}
        onChange={(v) => onUpdate("motherName", v)}
        error={errors.get("motherName")}
      />
    </div>
    <div>
      <label class={fieldLabelStyle}>Nacionalidade</label>
      <select
        class={cx(selectStyle, errors.get("nationality") ? selectError : undefined)}
        value={fields.nationality}
        onChange={(e) => onUpdate("nationality", (e.target as HTMLSelectElement).value)}
        aria-label="Nacionalidade"
      >
        <option value="">Selecione...</option>
        {NATIONALITY_OPTIONS.map((n) => (
          <option value={n}>{n}</option>
        ))}
      </select>
      {errors.get("nationality") && <div class={errorTextStyle}>{errors.get("nationality")}</div>}
    </div>
    <div>
      <label class={fieldLabelStyle}>Sexo</label>
      <div class={cardGroupStyle}>
        {GENDER_OPTIONS.map((opt) => (
          <button
            type="button"
            class={cx(
              cardBase,
              fields.gender === opt.value ? cardSelected : undefined,
              errors.get("gender") && !fields.gender ? cardErrorBorder : undefined,
            )}
            onClick={() => onUpdate("gender", opt.value)}
            aria-label={`Sexo: ${opt.label}`}
            aria-pressed={fields.gender === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {errors.get("gender") && <div class={errorTextStyle}>{errors.get("gender")}</div>}
    </div>
    <div>
      <UnderlineInput
        label="Telefone"
        value={formatPhone(fields.phoneNumber)}
        onChange={(v) => onUpdate("phoneNumber", unformatPhone(v))}
      />
    </div>
  </div>
)
