import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css, cx, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { UnderlineInput } from "../ui/underline-input.tsx"
import type { WizardState } from "../../../viewmodels/registration/types.ts"

interface StepAddressProps {
  readonly address: WizardState["address"]
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
  font-size: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${color.textSageSoft};
  margin-bottom: 1rem;
`

const typeGroupStyle = css`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const typeCardBase = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1rem, 0.75rem + 1vw, 1.25rem) clamp(0.875rem, 0.75rem + 0.5vw, 1rem);
  gap: 0.25rem;
  min-height: 100px;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid ${alpha(color.primary, 0.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
`

const typeCardSelected = css`
  background: ${alpha(color.primary, 0.08)};
  border-color: ${color.primary};
  box-shadow: 0 0 0 3px ${alpha(color.primary, 0.08)};
`

const typeCardError = css`
  border-color: ${alpha(color.dangerAlt, 0.3)};
`

const typeIconStyle = css`
  font-size: 1.75rem;
  line-height: 1;
  margin-bottom: 0.25rem;
`

const typeLabelStyle = css`
  font-family: ${font.erode};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
`

const typeLabelSelected = css`
  color: ${color.primary};
`

const typeDescStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.625rem, 0.6rem + 0.15vw, 0.6875rem);
  color: ${color.textSageSoft};
  text-align: center;
  line-height: 1.3;
`

const typeDescSelected = css`
  color: ${color.primaryDark};
`

const errorTextStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem);
  color: ${color.dangerAlt};
  margin-top: 0.25rem;
`

const infoBannerStyle = css`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 0.4rem + 0.4vw, 0.625rem) clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem);
  background: ${alpha(color.primary, 0.06)};
  border: 1px solid ${alpha(color.primary, 0.12)};
  border-radius: 12px;
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem);
  font-weight: ${weight.medium};
  color: ${color.textSageSecondary};
  line-height: 1.4;
`

const infoIconStyle = css`
  font-size: 1rem;
  color: ${color.primary};
  flex-shrink: 0;
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

const disabledField = css`
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
`

const checkboxLabelStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0;
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  color: ${color.textSageMuted};
`

const UF_OPTIONS = [
  "", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ",
  "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const

const HOUSING_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "Propria", label: "Propria" },
  { value: "Alugada", label: "Alugada" },
  { value: "Cedida", label: "Cedida" },
  { value: "Outros", label: "Outros" },
] as const

const LOCATION_TYPES = [
  { value: "URBANO", icon: "\u{1F3D7}", label: "Urbano", desc: "Residencia em area urbana" },
  { value: "RURAL", icon: "\u{1F33E}", label: "Rural", desc: "Residencia em area rural" },
  { value: "RUA", icon: "\u{1F6CC}", label: "Situacao de Rua", desc: "Pessoa sem moradia fixa" },
] as const

const formatCep = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export const StepAddress: FC<StepAddressProps> = ({ address, errors, onUpdate }) => {
  const [locationType, setLocationType] = useState(address.residenceLocation)
  const isHomeless = locationType === "RUA"
  const isRural = locationType === "RURAL"
  const hasLocationType = locationType !== ""

  const handleSelectLocation = (type: string): void => {
    setLocationType(type)
    onUpdate("residenceLocation", type)
    if (type === "RUA") {
      onUpdate("housingSituation", "")
      onUpdate("street", "")
      onUpdate("number", "")
      onUpdate("complement", "")
      onUpdate("neighborhood", "")
      onUpdate("cep", "")
    } else if (type === "RURAL") {
      onUpdate("street", "")
      onUpdate("complement", "")
    }
  }

  return (
    <div>
      <div class={fullCol} style="margin-bottom: clamp(1.25rem, 1rem + 1vw, 1.5rem)">
        <label class={fieldLabelStyle}>Qual a situacao de moradia?</label>
        <div class={typeGroupStyle}>
          {LOCATION_TYPES.map((lt) => (
            <button
              type="button"
              class={cx(
                typeCardBase,
                locationType === lt.value ? typeCardSelected : undefined,
                errors.get("residenceLocation") && !locationType ? typeCardError : undefined,
              )}
              onClick={() => handleSelectLocation(lt.value)}
              aria-label={`Moradia: ${lt.label}`}
              aria-pressed={locationType === lt.value}
            >
              <div class={typeIconStyle}>{lt.icon}</div>
              <div class={cx(typeLabelStyle, locationType === lt.value ? typeLabelSelected : undefined)}>
                {lt.label}
              </div>
              <div class={cx(typeDescStyle, locationType === lt.value ? typeDescSelected : undefined)}>
                {lt.desc}
              </div>
            </button>
          ))}
        </div>
        {errors.get("residenceLocation") && (
          <div class={errorTextStyle}>{errors.get("residenceLocation")}</div>
        )}
      </div>

      {hasLocationType && (
        <div class={gridStyle}>
          {isHomeless && (
            <div class={infoBannerStyle}>
              <span class={infoIconStyle}>&#9432;</span>
              Apenas Estado e Cidade sao necessarios para cobertura territorial do CRAS.
            </div>
          )}
          {isRural && (
            <div class={infoBannerStyle}>
              <span class={infoIconStyle}>&#9432;</span>
              Rua e Complemento nao se aplicam para area rural.
            </div>
          )}

          <div class={isHomeless ? disabledField : undefined}>
            <label class={fieldLabelStyle}>Tipo de Moradia</label>
            <select
              class={selectStyle}
              value={address.housingSituation}
              onChange={(e) => onUpdate("housingSituation", (e.target as HTMLSelectElement).value)}
              disabled={isHomeless}
              aria-label="Tipo de moradia"
            >
              {HOUSING_OPTIONS.map((opt) => (
                <option value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.get("housingSituation") && (
              <div class={errorTextStyle}>{errors.get("housingSituation")}</div>
            )}
          </div>

          <div class={isHomeless ? disabledField : undefined}>
            <UnderlineInput
              label="CEP"
              value={formatCep(address.cep)}
              onChange={(v) => onUpdate("cep", v.replace(/\D/g, ""))}
              error={errors.get("cep")}
              disabled={isHomeless}
            />
          </div>

          <div class={isHomeless || isRural ? disabledField : undefined}>
            <UnderlineInput
              label="Rua"
              value={address.street}
              onChange={(v) => onUpdate("street", v)}
              error={errors.get("street")}
              disabled={isHomeless || isRural}
            />
          </div>

          <div class={isHomeless ? disabledField : undefined}>
            <UnderlineInput
              label="Numero"
              value={address.number}
              onChange={(v) => onUpdate("number", v)}
              error={errors.get("number")}
              disabled={isHomeless}
            />
          </div>

          <div class={isHomeless || isRural ? disabledField : undefined}>
            <UnderlineInput
              label="Complemento"
              value={address.complement}
              onChange={(v) => onUpdate("complement", v)}
              disabled={isHomeless || isRural}
            />
          </div>

          <div class={isHomeless ? disabledField : undefined}>
            <UnderlineInput
              label="Bairro"
              value={address.neighborhood}
              onChange={(v) => onUpdate("neighborhood", v)}
              error={errors.get("neighborhood")}
              disabled={isHomeless}
            />
          </div>

          <div>
            <label class={fieldLabelStyle}>Estado</label>
            <select
              class={selectStyle}
              value={address.state}
              onChange={(e) => onUpdate("state", (e.target as HTMLSelectElement).value)}
              aria-label="Estado"
            >
              {UF_OPTIONS.map((uf) => (
                <option value={uf}>{uf || "Selecione..."}</option>
              ))}
            </select>
            {errors.get("state") && <div class={errorTextStyle}>{errors.get("state")}</div>}
          </div>

          <div>
            <UnderlineInput
              label="Cidade"
              value={address.city}
              onChange={(v) => onUpdate("city", v)}
              error={errors.get("city")}
            />
          </div>
        </div>
      )}
    </div>
  )
}
