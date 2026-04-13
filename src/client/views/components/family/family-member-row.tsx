import type { FC } from "hono/jsx/dom"
import { useState } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, alpha } from "../../../styles/tokens.ts"
import type { FamilyMemberModel } from "../../../viewmodels/family-composition/types.ts"
import { calculateAge } from "../../../viewmodels/family-composition/reducer.ts"

interface FamilyMemberRowProps {
  readonly member: FamilyMemberModel
  readonly index: number
  readonly onEdit: () => void
  readonly onRemove: () => void
  readonly onSetCaregiver: () => void
}

const rowFadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const rowStyle = css`
  display: grid;
  grid-template-columns: 32px 1fr 110px 90px 80px 36px;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid ${alpha(color.primary, 0.08)};
  transition: all 150ms ease;
  animation: ${rowFadeIn} 500ms cubic-bezier(0.16, 1, 0.3, 1) both;

  &:last-child { border-bottom: none; }
  &:hover {
    background: rgba(255,255,255,0.3);
    border-radius: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255,255,255,0.2);
    border-radius: 12px;
    margin-bottom: 0.5rem;
    border-bottom: none;
  }
`

const indexStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.textSageSoft};
  font-variant-numeric: tabular-nums;
  text-align: center;

  @media (max-width: 768px) { display: none; }
`

const nameStyle = css`
  font-family: ${font.erode};
  font-size: 0.9375rem;
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const relationshipStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.textSageMuted};
  margin-top: 1px;
`

const ageStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.8125rem;
  color: ${color.textSageSecondary};
  font-variant-numeric: tabular-nums;
`

const sexStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.textSageMuted};
`

const tagsWrap = css`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`

const tagBase = css`
  font-family: ${font.satoshi};
  font-size: 11px;
  font-weight: ${weight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: ${radius.pill};
  white-space: nowrap;
`

const tagPR = css`
  ${tagBase}
  background: ${alpha(color.primary, 0.12)};
  color: ${color.primary};
`

const tagCaregiver = css`
  ${tagBase}
  background: ${alpha(color.primary, 0.12)};
  color: ${color.primaryDark};
`

const tagDisability = css`
  ${tagBase}
  background: ${alpha(color.dangerAlt, 0.08)};
  color: ${color.dangerAlt};
`

const tagResides = css`
  ${tagBase}
  background: ${alpha(color.primary, 0.08)};
  color: ${color.textSageSecondary};
`

const actionMenu = css`
  position: relative;
`

const actionBtn = css`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${alpha(color.primary, 0.12)};
  background: transparent;
  color: ${color.textSageSoft};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  font-family: ${font.satoshi};

  &:hover {
    border-color: ${color.primary};
    color: ${color.primary};
    background: ${alpha(color.primary, 0.08)};
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
`

const dropdownIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`

const dropdown = css`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 12px;
  padding: 4px;
  min-width: 150px;
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  animation: ${dropdownIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const dropdownItem = css`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: ${font.satoshi};
  font-size: 0.8125rem;
  color: ${color.textSageSecondary};
  cursor: pointer;
  transition: all 150ms ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${alpha(color.primary, 0.08)};
    color: ${color.primary};
  }
`

const dropdownDanger = css`
  ${dropdownItem}
  color: ${color.dangerAlt};
  &:hover {
    background: ${alpha(color.dangerAlt, 0.08)};
    color: ${color.dangerAlt};
  }
`

const dropdownIcon = css`
  width: 16px;
  text-align: center;
  font-size: 12px;
`

export const FamilyMemberRow: FC<FamilyMemberRowProps> = ({
  member,
  index,
  onEdit,
  onRemove,
  onSetCaregiver,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const age = calculateAge(member.birthDate, new Date())

  const tags: readonly { label: string; style: string }[] = [
    ...(member.isPR ? [{ label: "PR", style: tagPR }] : []),
    ...(member.isPrimaryCaregiver ? [{ label: "Cuidador", style: tagCaregiver }] : []),
    ...(member.hasDisability ? [{ label: "PcD", style: tagDisability }] : []),
    ...(member.residesWithPatient && !member.isPR ? [{ label: "Reside", style: tagResides }] : []),
  ]

  return (
    <div class={rowStyle} style={`animation-delay: ${index * 60}ms`}>
      <span class={indexStyle}>{String(index + 1).padStart(2, "0")}</span>
      <div>
        <div class={nameStyle}>{member.name}</div>
        <div class={relationshipStyle}>
          {member.relationshipLabel}
          {member.requiredDocuments.length > 0 ? ` \u00B7 ${member.requiredDocuments.join(", ")}` : ""}
        </div>
      </div>
      <span class={ageStyle}>{age} anos</span>
      <span class={sexStyle}>{member.sex}</span>
      <div class={tagsWrap}>
        {tags.map((t) => <span key={t.label} class={t.style}>{t.label}</span>)}
      </div>
      <div class={actionMenu}>
        <button
          class={actionBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={`Acoes para ${member.name}`}
          aria-expanded={menuOpen}
        >&#8942;</button>
        {menuOpen && (
          <div class={dropdown}>
            {!member.isPrimaryCaregiver && (
              <button class={dropdownItem} onClick={() => { onSetCaregiver(); setMenuOpen(false) }}>
                <span class={dropdownIcon} aria-hidden="true">&#9733;</span> Tornar cuidador
              </button>
            )}
            <button class={dropdownItem} onClick={() => { onEdit(); setMenuOpen(false) }}>
              <span class={dropdownIcon} aria-hidden="true">&#9998;</span> Editar
            </button>
            {!member.isPR && (
              <button class={dropdownDanger} onClick={() => { onRemove(); setMenuOpen(false) }}>
                <span class={dropdownIcon} aria-hidden="true">&#10005;</span> Remover
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
