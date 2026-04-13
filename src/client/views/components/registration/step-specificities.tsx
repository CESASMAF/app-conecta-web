import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepSpecificitiesProps {
  readonly specificity: WizardState["specificity"]
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

const fieldLabelStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
`

const textareaStyle = css`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px solid ${alpha(color.primary, 0.12)};
  border-radius: 12px;
  padding: 0.75rem;
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
  color: ${color.textSagePrimary};
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 300ms cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:focus {
    border-color: ${color.primary};
  }

  &::placeholder {
    color: ${color.textSageSoft};
    font-style: italic;
  }
`

const fullCol = css`
  grid-column: 1 / -1;
`

const IDENTITY_OPTIONS = [
  "Quilombola",
  "Indigena",
  "Ribeirinho",
  "Cigano",
  "Extrativista",
  "Pescador artesanal",
  "Pertencente a comunidade de terreiro",
  "Nenhuma das anteriores",
] as const

export const StepSpecificities: FC<StepSpecificitiesProps> = ({ specificity, errors, onUpdate }) => (
  <div class={gridStyle}>
    <div>
      <label class={fieldLabelStyle}>Identidade Social</label>
      <select
        class={selectStyle}
        value={specificity.selectedIdentity}
        onChange={(e) => onUpdate("selectedIdentity", (e.target as HTMLSelectElement).value)}
        aria-label="Identidade social"
      >
        <option value="">Selecione...</option>
        {IDENTITY_OPTIONS.map((opt) => (
          <option value={opt}>{opt}</option>
        ))}
      </select>
    </div>
    <div>
      <UnderlineInput
        label="Descricao"
        value={specificity.description}
        onChange={(v) => onUpdate("description", v)}
        error={errors.get("description")}
      />
    </div>
    <div class={fullCol}>
      <label class={fieldLabelStyle}>Observa\u00e7\u00f5es</label>
      <textarea
        class={textareaStyle}
        placeholder="Informa\u00e7\u00f5es complementares sobre especificidades..."
        aria-label="Observa\u00e7\u00f5es sobre especificidades"
        value={specificity.observations}
        onInput={(e) => onUpdate("observations", (e.target as HTMLTextAreaElement).value)}
      />
    </div>
  </div>
)
