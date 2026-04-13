import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepSpecificitiesProps {
  readonly specificity: WizardState["specificity"]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdate: (field: string, value: string) => void
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${space[4]};
`

const infoText = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.textMuted};
`

const optionsGrid = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${space[3]};
`

const optionLabel = css`
  display: flex;
  align-items: center;
  gap: ${space[2]};
  font-family: ${font.satoshi};
  font-size: 15px;
  color: ${color.textPrimary};
  cursor: pointer;
  padding: ${space[2]} ${space[3]};
  border: 1px solid ${color.inputLine};
  border-radius: 100px;
  transition: border-color 0.15s, background 0.15s;
  &:hover { background: ${color.surface}; }
`

const optionLabelSelected = css`
  ${optionLabel}
  border-color: ${color.primary};
  background: rgba(79, 132, 72, 0.06);
`

const descriptionWrapper = css`
  max-width: 480px;
`

const IDENTITY_OPTIONS = [
  { value: "INDIGENA", label: "Indigena" },
  { value: "QUILOMBOLA", label: "Quilombola" },
  { value: "CIGANO", label: "Cigano(a)" },
  { value: "RIBEIRINHO", label: "Ribeirinho(a)" },
  { value: "EXTRATIVISTA", label: "Extrativista" },
  { value: "OUTRO", label: "Outro" },
] as const

export const StepSpecificities: FC<StepSpecificitiesProps> = ({ specificity, errors, onUpdate }) => (
  <div class={containerStyle}>
    <p class={infoText}>
      Este passo e opcional. Selecione uma identidade social caso aplicavel.
    </p>

    <div class={optionsGrid}>
      {IDENTITY_OPTIONS.map((opt) => (
        <label class={specificity.selectedIdentity === opt.value ? optionLabelSelected : optionLabel}>
          <input
            type="radio"
            name="selectedIdentity"
            value={opt.value}
            checked={specificity.selectedIdentity === opt.value}
            onChange={() => onUpdate("selectedIdentity", opt.value)}
            style="display:none"
          />
          {opt.label}
        </label>
      ))}
    </div>

    {specificity.selectedIdentity && (
      <div class={descriptionWrapper}>
        <UnderlineInput
          label="Descricao adicional"
          value={specificity.description}
          onChange={(v) => onUpdate("description", v)}
          error={errors.get("description")}
        />
      </div>
    )}
  </div>
)
