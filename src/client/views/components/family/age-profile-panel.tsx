import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../../styles/tokens.ts"
import { AGE_BUCKETS } from "../../../viewmodels/family-composition/types.ts"

interface AgeProfilePanelProps {
  readonly ageProfile: Readonly<Record<string, number>>
  readonly totalMembers: number
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
  padding: clamp(1rem, 0.75rem + 0.75vw, 1.5rem);
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
  font-size: 1rem;
  font-weight: ${weight.semibold};
  color: ${color.textSageSecondary};
`

const subtitleStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.textSageMuted};
  margin-top: 2px;
`

const histogram = css`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 0.75rem 0 0;
`

const histCol = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const barWrap = css`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`

const barFilled = css`
  width: 100%;
  border-radius: 6px 6px 2px 2px;
  background: linear-gradient(180deg, ${color.primary} 0%, ${color.primaryDark} 100%);
  position: relative;
  box-shadow: 0 2px 8px ${alpha(color.primary, 0.2)};
  transition: height 800ms cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const barEmpty = css`
  width: 100%;
  background: ${color.bgSage};
  min-height: 6px;
  border-radius: 3px;
  position: relative;
`

const countLabel = css`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.bold};
  color: ${color.primary};
`

const countLabelEmpty = css`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: ${font.satoshi};
  font-size: 12px;
  font-weight: ${weight.medium};
  color: ${color.textSageSoft};
`

const bucketLabel = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.semibold};
  color: ${color.textSageMuted};
  white-space: nowrap;
  letter-spacing: 1.5px;
  text-transform: uppercase;
`

const totalStyle = css`
  font-family: ${font.satoshi};
  font-size: 0.75rem;
  color: ${color.textSageMuted};
  margin-top: 0.75rem;
  text-align: right;
`

const totalStrong = css`
  color: ${color.primary};
  font-weight: ${weight.bold};
`

export const AgeProfilePanel: FC<AgeProfilePanelProps> = ({ ageProfile, totalMembers }) => {
  const counts = AGE_BUCKETS.map((b) => ageProfile[b] ?? 0)
  const maxCount = Math.max(...counts, 1)

  return (
    <div class={sectionCard}>
      <div>
        <div class={titleStyle}>Perfil Etario</div>
        <div class={subtitleStyle}>Distribuicao por faixa etaria dos membros</div>
      </div>
      <div class={histogram} role="img" aria-label="Histograma de distribuicao por faixa etaria">
        {AGE_BUCKETS.map((bucket, i) => {
          const count = counts[i] ?? 0
          const height = count > 0 ? Math.max(12, (count / maxCount) * 68) : 0

          return (
            <div key={bucket} class={histCol}>
              <div class={barWrap}>
                <div
                  class={count > 0 ? barFilled : barEmpty}
                  style={count > 0 ? `height: ${height}px` : undefined}
                >
                  <span class={count > 0 ? countLabel : countLabelEmpty}>{count}</span>
                </div>
              </div>
              <span class={bucketLabel}>{bucket}</span>
            </div>
          )
        })}
      </div>
      <div class={totalStyle}>
        Total: <span class={totalStrong}>{totalMembers} membros</span>
      </div>
    </div>
  )
}
