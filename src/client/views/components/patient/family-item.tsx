import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface FamilyItemProps {
  readonly lastName: string
  readonly firstName: string
  readonly memberCount: number
  readonly isSelected: boolean
  readonly isOtherSelected: boolean
  readonly onSelect: () => void
}

const itemStyle = css`
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  transition: color 250ms ease;
  color: ${color.textPrimary};
  font-family: ${font.satoshi};
`

const itemDimmedStyle = css`
  color: ${color.textMuted};
`

const surnameStyle = css`
  font-size: 40px;
  font-weight: ${weight.regular};
  transition: font-weight 250ms ease;
  line-height: 1.1;
`

const surnameBoldStyle = css`
  font-weight: ${weight.bold};
`

const detailsStyle = css`
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
  pointer-events: none;
  font-size: 16px;
  font-weight: ${weight.medium};
  white-space: nowrap;
`

const detailsVisibleStyle = css`
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
`

export const FamilyItem: FC<FamilyItemProps> = ({
  lastName,
  firstName,
  memberCount,
  isSelected,
  isOtherSelected,
  onSelect,
}) => {
  const expanded = isSelected

  return (
    <div
      class={`${itemStyle} ${isOtherSelected && !isSelected ? itemDimmedStyle : ""}`}
      onClick={onSelect}
      data-selected={String(isSelected)}
      data-expanded={String(expanded)}
    >
      <span class={`${surnameStyle} ${isSelected ? surnameBoldStyle : ""}`}>
        {lastName}
      </span>
      <span class={`${detailsStyle} ${expanded ? detailsVisibleStyle : ""}`}>
        {firstName} &middot; {memberCount} membros
      </span>
    </div>
  )
}
