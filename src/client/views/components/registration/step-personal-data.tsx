import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import { UnderlineSelect } from "../ui/underline-select.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepPersonalDataProps {
  readonly fields: WizardState["fields"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
}

const gridStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${space[6]};
`

const fieldItem = css`
  min-width: 280px;
  flex: 1;
`

const radioGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${space[1]};
`

const radioGroupLabel = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  font-weight: ${weight.bold};
  letter-spacing: 0.65px;
  text-transform: uppercase;
  color: ${color.textMuted};
`

const radioOptionStyle = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 16px;
  color: ${color.textPrimary};
  cursor: pointer;
`

const radioErrorStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  color: ${color.danger};
  margin-top: ${space[1]};
`

const NATIONALITY_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "Brasileira", label: "Brasileira" },
  { value: "Naturalizada", label: "Naturalizada" },
  { value: "Estrangeira", label: "Estrangeira" },
] as const

const SEX_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
  { value: "OUTRO", label: "Outro" },
] as const

const formatDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const unformatToDigits = (value: string): string => value.replace(/\D/g, "")

export const StepPersonalData: FC<StepPersonalDataProps> = ({ fields, errors, onUpdate }) => (
  <div class={gridStyle}>
    <div class={fieldItem}>
      <UnderlineInput
        label="Nome"
        value={fields.firstName}
        onChange={(v) => onUpdate("firstName", v)}
        error={errors.get("firstName")}
        required
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Sobrenome"
        value={fields.lastName}
        onChange={(v) => onUpdate("lastName", v)}
        error={errors.get("lastName")}
        required
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Nome social"
        value={fields.socialName}
        onChange={(v) => onUpdate("socialName", v)}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Nome da mae"
        value={fields.motherName}
        onChange={(v) => onUpdate("motherName", v)}
        error={errors.get("motherName")}
        required
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Data de nascimento"
        value={formatDate(fields.birthDate)}
        onChange={(v) => onUpdate("birthDate", unformatToDigits(v))}
        error={errors.get("birthDate")}
        placeholder="DD/MM/AAAA"
        required
      />
    </div>
    <div class={fieldItem}>
      <UnderlineSelect
        label="Nacionalidade"
        value={fields.nationality}
        options={NATIONALITY_OPTIONS}
        onChange={(v) => onUpdate("nationality", v)}
        error={errors.get("nationality")}
        required
      />
    </div>
    <div class={fieldItem}>
      <div class={radioGroupStyle}>
        <span class={radioGroupLabel}>Sexo *</span>
        {SEX_OPTIONS.map((opt) => (
          <label class={radioOptionStyle}>
            <input
              type="radio"
              name="sex"
              value={opt.value}
              checked={fields.sex === opt.value}
              onChange={() => onUpdate("sex", opt.value)}
            />
            {opt.label}
          </label>
        ))}
        {errors.get("sex") && <span class={radioErrorStyle}>{errors.get("sex")}</span>}
      </div>
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Telefone"
        value={fields.phone}
        onChange={(v) => onUpdate("phone", v)}
      />
    </div>
  </div>
)
