import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space, radius } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import { Button } from "../ui/button.tsx"
import type { DiagnosisEntry } from "../../../viewmodels/registration/types.ts"

interface StepDiagnosesProps {
  readonly diagnoses: readonly DiagnosisEntry[]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdateEntry: (index: number, field: keyof DiagnosisEntry, value: string) => void
  readonly onAddDiagnosis: () => void
  readonly onRemoveDiagnosis: (index: number) => void
  readonly onApplyQuickCid: (index: number, code: string, description: string) => void
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${space[5]};
`

const entryStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: ${space[6]};
  padding: ${space[4]};
  border: 1px solid ${color.inputLine};
  border-radius: ${radius.card};
  position: relative;
`

const fieldItem = css`
  min-width: 280px;
  flex: 1;
`

const removeBtn = css`
  position: absolute;
  top: ${space[2]};
  right: ${space[2]};
  border: none;
  background: transparent;
  color: ${color.danger};
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: ${space[1]};
  &:hover { opacity: 0.7; }
`

const suggestionsStyle = css`
  display: flex;
  gap: ${space[2]};
  flex-wrap: wrap;
  margin-top: ${space[1]};
`

const suggestionChip = css`
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.medium};
  padding: 4px 10px;
  border-radius: ${radius.pill};
  border: 1px solid ${color.inputLine};
  background: transparent;
  color: ${color.textPrimary};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${color.surface}; }
`

const emptyStyle = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  color: ${color.textMuted};
  text-align: center;
  padding: ${space[5]} 0;
`

const globalErrorStyle = css`
  font-family: ${font.satoshi};
  font-size: 13px;
  color: ${color.danger};
`

const QUICK_CIDS = [
  { code: "G80", description: "Paralisia cerebral" },
  { code: "Q90", description: "Sindrome de Down" },
  { code: "F84.0", description: "Autismo infantil" },
  { code: "E70", description: "Fenilcetonuria" },
  { code: "G71.0", description: "Distrofia muscular" },
] as const

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
      <span class={globalErrorStyle}>{errors.get("diagnoses")}</span>
    )}

    {diagnoses.length === 0 && (
      <p class={emptyStyle}>Nenhum diagnostico adicionado. Clique abaixo para adicionar.</p>
    )}

    {diagnoses.map((diag, index) => (
      <div class={entryStyle}>
        <button
          class={removeBtn}
          type="button"
          onClick={() => onRemoveDiagnosis(index)}
          aria-label="Remover diagnostico"
        >
          &times;
        </button>
        <div class={fieldItem}>
          <UnderlineInput
            label="Codigo CID"
            value={diag.code}
            onChange={(v) => onUpdateEntry(index, "code", v)}
            error={errors.get(`diagnosis_${index}_code`)}
          />
          <div class={suggestionsStyle}>
            {QUICK_CIDS.map((cid) => (
              <button
                class={suggestionChip}
                type="button"
                onClick={() => onApplyQuickCid(index, cid.code, cid.description)}
              >
                {cid.code}
              </button>
            ))}
          </div>
        </div>
        <div class={fieldItem}>
          <UnderlineInput
            label="Data do diagnostico"
            value={diag.date}
            onChange={(v) => onUpdateEntry(index, "date", v)}
            error={errors.get(`diagnosis_${index}_date`)}
          />
        </div>
        <div class={fieldItem}>
          <UnderlineInput
            label="Descricao"
            value={diag.description}
            onChange={(v) => onUpdateEntry(index, "description", v)}
            error={errors.get(`diagnosis_${index}_description`)}
          />
        </div>
      </div>
    ))}

    <Button variant="secondary" onClick={onAddDiagnosis}>
      Adicionar diagnostico
    </Button>
  </div>
)
