import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space } from "../../../styles/tokens.ts"
import type { PatientDetail } from "../../../viewmodels/social-care/types.ts"

interface PanelDadosProps {
  readonly detail: PatientDetail
  readonly onShowFichas: () => void
  readonly onEdit: () => void
  readonly onClose: () => void
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  padding: ${space[5]};
  gap: ${space[4]};
  overflow-y: auto;
  height: 100%;
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 48px;
  font-weight: ${weight.bold};
  color: ${color.textOnDark};
  margin: 0;
`

const headerRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const circleButtonStyle = css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${color.borderOnDark};
  background: transparent;
  color: ${color.textOnDark};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 200ms ease, border-color 200ms ease;
  &:hover { background: rgba(242, 226, 196, 0.1); }
`

const closeButtonStyle = css`
  ${circleButtonStyle}
  &:hover { background: rgba(166, 41, 13, 0.2); }
`

const fieldStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  font-weight: ${weight.bold};
  color: rgba(242, 226, 196, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const valueStyle = css`
  font-family: ${font.satoshi};
  font-size: 16px;
  font-weight: ${weight.medium};
  color: ${color.textOnDark};
`

const fieldsGridStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${space[3]};
`

const actionsRowStyle = css`
  display: flex;
  gap: ${space[2]};
  margin-top: auto;
`

const DataField: FC<{ readonly label: string; readonly value: string | null }> = ({ label, value }) => (
  <div class={fieldStyle}>
    <span class={labelStyle}>{label}</span>
    <span class={valueStyle}>{value ?? "—"}</span>
  </div>
)

export const PanelDados: FC<PanelDadosProps> = ({ detail, onShowFichas, onEdit, onClose }) => {
  const pd = detail.personalData
  const docs = detail.civilDocuments
  const addr = detail.address

  return (
    <div class={containerStyle}>
      <div class={headerRowStyle}>
        <h2 class={titleStyle}>Dados</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button class={circleButtonStyle} onClick={onShowFichas} type="button" aria-label="Ver fichas">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </button>
          <button class={circleButtonStyle} onClick={onEdit} type="button" aria-label="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button class={`${circleButtonStyle} ${closeButtonStyle}`} onClick={onClose} type="button" aria-label="Fechar">
            &times;
          </button>
        </div>
      </div>

      <div class={fieldsGridStyle}>
        <DataField label="Nome" value={pd?.firstName ?? null} />
        <DataField label="Sobrenome" value={pd?.lastName ?? null} />
        <DataField label="Nome da mae" value={pd?.motherName ?? null} />
        <DataField label="Data de nascimento" value={pd?.birthDate ?? null} />
        <DataField label="Sexo" value={pd?.sex ?? null} />
        <DataField label="Telefone" value={pd?.phone ?? null} />
        <DataField label="CPF" value={docs?.cpf ?? null} />
        <DataField label="NIS" value={docs?.nis ?? null} />
        <DataField label="Cidade" value={addr?.city ?? null} />
        <DataField label="Estado" value={addr?.state ?? null} />
      </div>

      {detail.diagnoses.length > 0 && (
        <div class={fieldStyle}>
          <span class={labelStyle}>Diagnosticos</span>
          {detail.diagnoses.map((d, i) => (
            <span key={i} class={valueStyle}>{d.icdCode} — {d.description}</span>
          ))}
        </div>
      )}

      <div class={actionsRowStyle}>
        <button class={circleButtonStyle} onClick={onShowFichas} type="button">
          Ver fichas
        </button>
      </div>
    </div>
  )
}
