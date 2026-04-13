import type { FC } from "hono/jsx/dom"
import { css, cx, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { DiagnosisEntry } from "../../../viewmodels/registration/types.ts"

interface StepDiagnosesProps {
  readonly diagnoses: readonly DiagnosisEntry[]
  readonly errors: ReadonlyMap<string, string>
  readonly onUpdateEntry: (index: number, field: keyof DiagnosisEntry, value: string) => void
  readonly onAddDiagnosis: () => void
  readonly onRemoveDiagnosis: (index: number) => void
  readonly onApplyQuickCid: (index: number, code: string, description: string) => void
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
`

const globalErrorStyle = css`
  padding: clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  background: ${alpha(color.dangerAlt, 0.06)};
  border: 1px solid ${alpha(color.dangerAlt, 0.15)};
  border-radius: 12px;
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.medium};
  color: ${color.dangerAlt};
  line-height: 1.4;
`

const cardStyle = css`
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  position: relative;
  animation: ${fadeInUp} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const cardComplete = css`
  border-color: ${alpha(color.primary, 0.3)};
  background: ${alpha(color.primary, 0.04)};
`

const diagGrid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem) clamp(1rem, 0.875rem + 0.5vw, 1.5rem);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const fullCol = css`
  grid-column: 1 / -1;
`

const removeBtn = css`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${alpha(color.primary, 0.15)};
  background: rgba(255, 255, 255, 0.3);
  color: ${color.textSageMuted};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;

  &:hover {
    border-color: ${color.dangerAlt};
    color: ${color.dangerAlt};
    background: ${alpha(color.dangerAlt, 0.08)};
  }
`

const statusStyle = css`
  position: absolute;
  top: 0.75rem;
  right: 2.75rem;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: ${font.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.6875rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${color.textSageSoft};
  white-space: nowrap;
`

const statusComplete = css`
  color: ${color.primary};
`

const statusIconBase = css`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 1.5px solid ${alpha(color.primary, 0.2)};
  color: transparent;
  background: rgba(255, 255, 255, 0.4);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
`

const statusIconComplete = css`
  border-color: ${color.primary};
  background: ${color.primary};
  color: #fff;
`

const quickCidsStyle = css`
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const cidChipBase = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  font-weight: ${weight.medium};
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid ${alpha(color.primary, 0.15)};
  background: rgba(255, 255, 255, 0.3);
  color: ${color.textSageMuted};
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${color.primary};
    color: ${color.primary};
    background: ${alpha(color.primary, 0.08)};
  }
`

const cidChipActive = css`
  border-color: ${color.primary};
  color: #fff;
  background: ${color.primary};
  font-weight: ${weight.semibold};
`

const addBtnStyle = css`
  background: rgba(255, 255, 255, 0.25);
  border: 1.5px dashed ${alpha(color.primary, 0.2)};
  color: ${color.textSageMuted};
  width: 100%;
  padding: clamp(0.75rem, 0.625rem + 0.5vw, 1rem);
  border-radius: 12px;
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    border-color: ${color.primary};
    color: ${color.primary};
    background: ${alpha(color.primary, 0.08)};
  }
`

const emptyStyle = css`
  text-align: center;
  padding: clamp(1.5rem, 1.25rem + 1vw, 2.5rem) 0;
  color: ${color.textSageSoft};
  font-family: ${font.satoshi};
  font-size: clamp(0.875rem, 0.8rem + 0.35vw, 0.9375rem);
`

const QUICK_CIDS = [
  { code: "G80", desc: "Paralisia cerebral" },
  { code: "Q90", desc: "Sindrome de Down" },
  { code: "F84.0", desc: "Autismo" },
  { code: "E70", desc: "Fenilcetonuria" },
  { code: "G71.0", desc: "Distrofia muscular" },
  { code: "R69", desc: "Morbidade n/e" },
  { code: "Z03", desc: "Obs. por suspeita" },
  { code: "Z03.9", desc: "Obs. n/e" },
] as const

export const StepDiagnoses: FC<StepDiagnosesProps> = ({
  diagnoses,
  errors,
  onUpdateEntry,
  onAddDiagnosis,
  onRemoveDiagnosis,
  onApplyQuickCid,
}) => {
  const isComplete = (d: DiagnosisEntry): boolean =>
    d.code.trim() !== "" && d.date.trim().length === 10 && d.description.trim() !== ""

  return (
    <div class={containerStyle}>
      {errors.get("diagnoses") && (
        <div class={globalErrorStyle}>{errors.get("diagnoses")}</div>
      )}

      {diagnoses.length === 0 && (
        <p class={emptyStyle}>Nenhum diagnostico adicionado. Clique abaixo para adicionar.</p>
      )}

      {diagnoses.map((diag, index) => {
        const complete = isComplete(diag)
        return (
          <div class={cx(cardStyle, complete ? cardComplete : undefined)} style={`--stagger: ${index * 60}ms`}>
            <div class={cx(statusStyle, complete ? statusComplete : undefined)}>
              <span class={cx(statusIconBase, complete ? statusIconComplete : undefined)}>&#10003;</span>
              <span>{complete ? "Completo" : "Pendente"}</span>
            </div>
            <button
              class={removeBtn}
              type="button"
              onClick={() => onRemoveDiagnosis(index)}
              aria-label="Remover diagnostico"
            >
              &times;
            </button>
            <div class={diagGrid}>
              <div>
                <UnderlineInput
                  label="Codigo CID"
                  value={diag.code}
                  onChange={(v) => onUpdateEntry(index, "code", v)}
                  error={errors.get(`diagnosis_${index}_code`)}
                />
              </div>
              <div>
                <UnderlineInput
                  label="Data"
                  value={diag.date}
                  onChange={(v) => onUpdateEntry(index, "date", v)}
                  error={errors.get(`diagnosis_${index}_date`)}
                />
              </div>
              <div class={fullCol}>
                <UnderlineInput
                  label="Descricao"
                  value={diag.description}
                  onChange={(v) => onUpdateEntry(index, "description", v)}
                  error={errors.get(`diagnosis_${index}_description`)}
                />
              </div>
              <div class={quickCidsStyle}>
                {QUICK_CIDS.map((cid) => (
                  <button
                    type="button"
                    class={cx(cidChipBase, diag.code === cid.code ? cidChipActive : undefined)}
                    onClick={() => onApplyQuickCid(index, cid.code, cid.desc)}
                    aria-label={`CID ${cid.code} - ${cid.desc}`}
                  >
                    {cid.code} &mdash; {cid.desc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <button class={addBtnStyle} type="button" onClick={onAddDiagnosis} aria-label="Adicionar diagnostico">
        + Adicionar diagnostico
      </button>
    </div>
  )
}
