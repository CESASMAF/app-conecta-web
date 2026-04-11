import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import type { PatientSummary } from "../../../viewmodels/social-care/types.ts"
import { FamilyItem } from "./family-item.tsx"

interface FamilyListProps {
  readonly families: readonly PatientSummary[]
  readonly selectedId: string | null
  readonly onSelect: (id: string) => void
}

const listStyle = css`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
`

export const FamilyList: FC<FamilyListProps> = ({ families, selectedId, onSelect }) => (
  <div class={listStyle} data-has-selection={String(selectedId !== null)}>
    {families.map((f) => (
      <FamilyItem
        key={f.patientId}
        lastName={f.lastName ?? "—"}
        firstName={f.firstName ?? ""}
        memberCount={f.memberCount}
        isSelected={f.patientId === selectedId}
        isOtherSelected={selectedId !== null && f.patientId !== selectedId}
        onSelect={() => onSelect(f.patientId)}
      />
    ))}
  </div>
)
