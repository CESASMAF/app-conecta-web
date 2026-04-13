import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, radius, alpha } from "../../../styles/tokens.ts"

interface FamilyEmptyStateProps {
  readonly onAdd: () => void
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
  padding: clamp(2rem, 1.5rem + 1.5vw, 3rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-top: 1.5rem;
  animation: ${containerFadeIn} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }
`

const emptyWrap = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 1.5rem + 1vw, 3rem) 1.5rem;
  text-align: center;
`

const iconStyle = css`
  font-size: 48px;
  color: ${color.textSageSoft};
  margin-bottom: 1rem;
  opacity: 0.4;
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(1rem, 0.875rem + 0.5vw, 1.125rem);
  font-weight: ${weight.bold};
  color: ${color.textSageSecondary};
  margin-bottom: 0.5rem;
`

const descStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  color: ${color.textSageMuted};
  font-style: italic;
  max-width: 300px;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`

const btnPrimary = css`
  font-family: ${font.satoshi};
  font-size: 0.875rem;
  font-weight: ${weight.semibold};
  padding: 0.75rem 1.75rem;
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

export const FamilyEmptyState: FC<FamilyEmptyStateProps> = ({ onAdd }) => (
  <div class={sectionCard}>
    <div class={emptyWrap}>
      <div class={iconStyle} aria-hidden="true">&#128106;</div>
      <div class={titleStyle}>Nenhum membro cadastrado</div>
      <div class={descStyle}>Adicione os membros da familia para compor o perfil familiar do paciente.</div>
      <button class={btnPrimary} onClick={onAdd} aria-label="Adicionar primeiro membro">
        <span aria-hidden="true">+</span> Adicionar primeiro membro
      </button>
    </div>
  </div>
)
