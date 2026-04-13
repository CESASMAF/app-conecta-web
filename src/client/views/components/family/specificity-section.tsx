import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, alpha } from "../../../styles/tokens.ts"
import type { LookupItem } from "../../../viewmodels/family-composition/types.ts"

interface SpecificitySectionProps {
  readonly items: readonly LookupItem[]
  readonly selectedId: string | null
  readonly canSave: boolean
  readonly onSelect: (id: string) => void
  readonly onSave: () => void
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

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
  letter-spacing: -0.02em;
`

const subtitleStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.7rem + 0.15vw, 0.8125rem);
  color: ${color.textSageMuted};
  margin-top: 2px;
`

const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`

const specificityCard = (selected: boolean): string => css`
  padding: 1rem;
  background: ${selected ? alpha(color.primary, 0.08) : "rgba(255,255,255,0.3)"};
  border: 1.5px solid ${selected ? color.primary : alpha(color.primary, 0.1)};
  border-radius: 12px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${selected ? weight.semibold : weight.medium};
  color: ${selected ? color.primary : color.textSageMuted};
  ${selected ? `box-shadow: 0 0 0 3px ${alpha(color.primary, 0.08)};` : ""}

  &:hover {
    background: ${selected ? alpha(color.primary, 0.08) : "rgba(255,255,255,0.5)"};
    border-color: ${selected ? color.primary : alpha(color.primary, 0.2)};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`

const footerBar = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid ${alpha(color.primary, 0.08)};
  margin-top: 1.5rem;
`

const statusText = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.textSageSoft};
  font-style: italic;
`

const statusTextActive = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.primary};
  font-weight: ${weight.medium};
`

const saveBtn = css`
  font-family: ${font.satoshi};
  font-size: 0.8125rem;
  font-weight: ${weight.semibold};
  padding: 0.5rem 1rem;
  border-radius: ${radius.pill};
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${alpha(color.primary, 0.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${alpha(color.primary, 0.3)};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`

export const SpecificitySection: FC<SpecificitySectionProps> = ({
  items,
  selectedId,
  canSave: canSaveState,
  onSelect,
  onSave,
}) => (
  <div class={sectionCard}>
    <div>
      <div class={titleStyle}>Especificidade Social</div>
      <div class={subtitleStyle}>Identidade social, etnica ou cultural da familia</div>
    </div>
    <div class={gridStyle} role="radiogroup" aria-label="Especificidade social da familia">
      {items.map((item) => (
        <div
          key={item.id}
          class={specificityCard(selectedId === item.id)}
          role="radio"
          aria-checked={selectedId === item.id}
          aria-label={item.descricao}
          tabIndex={0}
          onClick={() => onSelect(item.id)}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item.id) }
          }}
        >
          {item.descricao}
        </div>
      ))}
    </div>
    <div class={footerBar}>
      <span class={canSaveState ? statusTextActive : statusText}>
        {canSaveState ? "Alteracao pendente" : "Nenhuma alteracao pendente"}
      </span>
      <button class={saveBtn} disabled={!canSaveState} onClick={onSave} aria-label="Salvar especificidade">
        Salvar especificidade
      </button>
    </div>
  </div>
)
