import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"
import type { FamilyMemberModel } from "../../../viewmodels/family-composition/types.ts"
import { FamilyMemberRow } from "./family-member-row.tsx"

interface FamilyTableProps {
  readonly members: readonly FamilyMemberModel[]
  readonly onEdit: (index: number) => void
  readonly onRemove: (personId: string) => void
  readonly onSetCaregiver: (personId: string) => void
}

const containerFadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`

const sectionCard = css`
  background: ${color.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  animation: ${containerFadeIn} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
  letter-spacing: -0.02em;
`

const listHeaderStyle = css`
  display: grid;
  grid-template-columns: 32px 1fr 110px 90px 80px 36px;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem 0.75rem;
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textSageSoft};

  @media (max-width: 768px) {
    display: none;
  }
`

export const FamilyTable: FC<FamilyTableProps> = ({
  members,
  onEdit,
  onRemove,
  onSetCaregiver,
}) => (
  <div class={sectionCard}>
    <div class={headerStyle}>
      <div class={titleStyle}>Membros</div>
    </div>
    <div class={listHeaderStyle} aria-hidden="true">
      <span>#</span>
      <span>Nome / Parentesco</span>
      <span>Idade</span>
      <span>Sexo</span>
      <span>Tags</span>
      <span></span>
    </div>
    <div>
      {members.map((member, index) => (
        <FamilyMemberRow
          key={member.personId}
          member={member}
          index={index}
          onEdit={() => onEdit(index)}
          onRemove={() => onRemove(member.personId)}
          onSetCaregiver={() => onSetCaregiver(member.personId)}
        />
      ))}
    </div>
  </div>
)
