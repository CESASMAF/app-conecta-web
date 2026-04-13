import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import type { PatientSummary } from "../../../viewmodels/social-care/types.ts"
import { color, font, weight } from "../../../styles/tokens.ts"
import { FamilyItem } from "./family-item.tsx"

interface FamilyListProps {
  readonly families: readonly PatientSummary[]
  readonly selectedId: string | null
  readonly onSelect: (id: string) => void
  readonly panelOpen: boolean
}

const headerStyle = css`
  display: flex;
  align-items: center;
  padding: 0 clamp(1rem, 0.75rem + 1vw, 1.375rem) 0.75rem;
  font-size: 10px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textSageSoft};
  font-family: ${font.satoshi};

  @media (max-width: 768px) {
    display: none;
  }
`

const headerRefStyle = css`
  flex: 1;
`

const headerMembersStyle = css`
  width: 100px;
  text-align: right;
`

const headerStatusStyle = css`
  width: 80px;
  text-align: right;
`

const containerStyle = css`
  transition: margin-right 450ms cubic-bezier(0.4, 0, 0.2, 1);
`

const containerWithPanelStyle = css`
  margin-right: 46%;

  @media (max-width: 1200px) {
    margin-right: 50%;
  }

  @media (max-width: 768px) {
    margin-right: 0;
  }
`

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const formatName = (f: PatientSummary): string => {
  if (f.lastName && f.firstName) return `${f.lastName}, ${f.firstName}`
  return f.fullName ?? "\u2014"
}

export const FamilyList: FC<FamilyListProps> = ({ families, selectedId, onSelect, panelOpen }) => (
  <div class={`${containerStyle} ${panelOpen ? containerWithPanelStyle : ""}`}>
    <div class={headerStyle}>
      <span class={headerRefStyle}>Referencia / Diagnostico</span>
      <span class={headerMembersStyle}>Membros</span>
      <span class={headerStatusStyle}>Status</span>
    </div>
    <div class={listStyle} role="list">
      {families.map((f, i) => (
        <FamilyItem
          key={f.patientId}
          index={i}
          displayName={formatName(f)}
          diagnosis={f.primaryDiagnosis}
          memberCount={f.memberCount}
          isActive={true}
          isSelected={f.patientId === selectedId}
          onSelect={() => onSelect(f.patientId)}
        />
      ))}
    </div>
  </div>
)
