import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import type { PatientDetail } from "../../../viewmodels/social-care/types.ts"

interface PanelDadosProps {
  readonly detail: PatientDetail
}

const bodyStyle = css`
  padding: clamp(0.75rem, 0.5rem + 1vw, 1rem) clamp(1rem, 0.75rem + 1vw, 1.5rem);
`

const sectionStyle = css`
  margin-bottom: clamp(1rem, 0.75rem + 1vw, 1.5rem);
`

const sectionTitleStyle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textSageSoft};
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(79, 132, 72, 0.08);
`

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const fieldStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const fieldFullWidthStyle = css`
  grid-column: 1 / -1;
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${color.textSageSoft};
`

const valueStyle = css`
  font-family: ${font.satoshi};
  font-weight: ${weight.regular};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 0.9375rem);
  color: ${color.textSagePrimary};
`

const emptyValueStyle = css`
  color: ${color.textSageSoft};
  font-style: italic;
`

const DataField: FC<{
  readonly label: string
  readonly value: string | null
  readonly fullWidth?: boolean
}> = ({ label, value, fullWidth }) => (
  <div class={`${fieldStyle} ${fullWidth ? fieldFullWidthStyle : ""}`}>
    <span class={labelStyle}>{label}</span>
    <span class={`${valueStyle} ${!value ? emptyValueStyle : ""}`}>
      {value || "Nao informado"}
    </span>
  </div>
)

export const PanelDados: FC<PanelDadosProps> = ({ detail }) => {
  const pd = detail.personalData
  const docs = detail.civilDocuments
  const addr = detail.address

  const fullName = pd
    ? `${pd.firstName ?? ""} ${pd.lastName ?? ""}`.trim() || null
    : null

  return (
    <div class={bodyStyle}>
      <div class={sectionStyle}>
        <div class={sectionTitleStyle}>Dados Pessoais</div>
        <div class={gridStyle}>
          <DataField label="Nome Completo" value={fullName} />
          <DataField label="Data de Nascimento" value={pd?.birthDate ?? null} />
          <DataField label="CPF" value={docs?.cpf ?? null} />
          <DataField label="Telefone" value={pd?.phone ?? null} />
          <DataField label="Nome da Mae" value={pd?.motherName ?? null} fullWidth />
        </div>
      </div>

      <div class={sectionStyle}>
        <div class={sectionTitleStyle}>Endereco</div>
        <div class={gridStyle}>
          <DataField
            label="Logradouro"
            value={addr?.street ?? null}
            fullWidth
          />
          <DataField label="Cidade" value={addr?.city ?? null} />
          <DataField label="CEP" value={addr?.cep ?? null} />
        </div>
      </div>

      {detail.diagnoses.length > 0 && (
        <div class={sectionStyle}>
          <div class={sectionTitleStyle}>Diagnosticos</div>
          <div class={gridStyle}>
            {detail.diagnoses.map((d, i) => (
              <DataField
                key={i}
                label={d.icdCode || `Diagnostico ${i + 1}`}
                value={d.description}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
