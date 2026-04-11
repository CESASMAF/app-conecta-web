import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
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

const GENDER_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
  { value: "NAO_BINARIO", label: "Nao binario" },
] as const

export const StepPersonalData: FC<StepPersonalDataProps> = ({ fields, errors, onUpdate }) => (
  <div class={gridStyle}>
    <div class={fieldItem}>
      <UnderlineInput
        label="Nome"
        value={fields.firstName}
        onChange={(v) => onUpdate("firstName", v)}
        error={errors.get("firstName")}
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Sobrenome"
        value={fields.lastName}
        onChange={(v) => onUpdate("lastName", v)}
        error={errors.get("lastName")}
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
      />
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Nacionalidade"
        value={fields.nationality}
        onChange={(v) => onUpdate("nationality", v)}
        error={errors.get("nationality")}
      />
    </div>
    <div class={fieldItem}>
      <div class={radioGroupStyle}>
        <span class={radioGroupLabel}>Genero</span>
        {GENDER_OPTIONS.map((opt) => (
          <label class={radioOptionStyle}>
            <input
              type="radio"
              name="gender"
              value={opt.value}
              checked={fields.gender === opt.value}
              onChange={() => onUpdate("gender", opt.value)}
            />
            {opt.label}
          </label>
        ))}
        {errors.get("gender") && <span class={radioErrorStyle}>{errors.get("gender")}</span>}
      </div>
    </div>
    <div class={fieldItem}>
      <UnderlineInput
        label="Telefone"
        value={fields.phoneNumber}
        onChange={(v) => onUpdate("phoneNumber", v)}
      />
    </div>
  </div>
)
