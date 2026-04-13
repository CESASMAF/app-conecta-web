import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, radius, alpha } from "../../../styles/tokens.ts"

interface FamilyHeaderProps {
  readonly memberCount: number
  readonly onAdd: () => void
}

const headerStyle = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: clamp(1.5rem, 1rem + 1vw, 2rem);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
  letter-spacing: -0.03em;
  line-height: 1;
`

const countStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
  color: ${color.textSageMuted};
  margin-top: 0.5rem;
`

const btnPrimary = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${weight.semibold};
  padding: 0.5rem 1.75rem;
  border-radius: ${radius.pill};
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  box-shadow: 0 2px 12px ${alpha(color.primary, 0.2)};
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px ${alpha(color.primary, 0.3)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
  }
`

export const FamilyHeader: FC<FamilyHeaderProps> = ({ memberCount, onAdd }) => (
  <div class={headerStyle}>
    <div>
      <h1 class={titleStyle}>Composicao Familiar</h1>
      <p class={countStyle}>{memberCount} membros cadastrados</p>
    </div>
    <div>
      <button class={btnPrimary} onClick={onAdd} aria-label="Adicionar membro">
        <span aria-hidden="true">+</span> Adicionar membro
      </button>
    </div>
  </div>
)
