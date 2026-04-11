import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, alpha, space } from "../../../styles/tokens.ts"
import type { LookupItem } from "../../../viewmodels/family-composition/types.ts"

interface SpecificitySectionProps {
  readonly items: readonly LookupItem[]
  readonly selectedId: string | null
  readonly onSelect: (id: string) => void
}

const sectionStyle = css`
  margin-top: ${space[5]};
`

const titleStyle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.bold};
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${color.textMuted};
  margin-bottom: ${space[3]};
`

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const itemStyle = (selected: boolean) => css`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${selected ? alpha(color.primary, 0.06) : "transparent"};
  transition: background 0.15s;
  &:hover { background: ${alpha(color.primary, 0.04)}; }
`

const radioOuter = css`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 2px solid ${color.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const radioInner = css`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${color.textPrimary};
`

const labelText = css`
  font-family: ${font.satoshi};
  font-size: 14px;
  font-weight: ${weight.regular};
  color: ${color.textPrimary};
`

export const SpecificitySection: FC<SpecificitySectionProps> = ({
  items,
  selectedId,
  onSelect,
}) => (
  <div class={sectionStyle}>
    <h3 class={titleStyle}>Especificidades Sociais</h3>
    <div class={listStyle}>
      {items.map((item) => (
        <div
          key={item.id}
          class={itemStyle(selectedId === item.id)}
          onClick={() => onSelect(item.id)}
        >
          <div class={radioOuter}>
            {selectedId === item.id && <div class={radioInner} />}
          </div>
          <span class={labelText}>{item.descricao}</span>
        </div>
      ))}
    </div>
  </div>
)
