import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight } from "../../../styles/tokens.ts"

interface FamilyItemProps {
  readonly index: number
  readonly displayName: string
  readonly diagnosis: string | null
  readonly memberCount: number
  readonly isActive: boolean
  readonly isSelected: boolean
  readonly onSelect: () => void
}

const cardFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const cardFadeInInactive = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 0.7;
    transform: translateY(0);
  }
`

const cardStyle = css`
  background: ${color.bgCard};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 16px;
  padding: clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem) clamp(1rem, 0.75rem + 1vw, 1.375rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: translateY(8px);
  animation: ${cardFadeIn} 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--stagger, 0ms);

  &:hover {
    background: ${color.bgCardHover};
    border-color: ${color.bgCardBorderHover};
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(79, 132, 72, 0.06);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    transform: none;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`

const cardSelectedStyle = css`
  background: ${color.bgCardHover};
  border-color: ${color.bgCardBorderHover};
  box-shadow: 0 4px 20px rgba(79, 132, 72, 0.08);
`

const cardInactiveStyle = css`
  animation-name: ${cardFadeInInactive};

  &:hover {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 0.7;
  }
`

const indexStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  font-weight: ${weight.medium};
  color: ${color.textSageSoft};
  width: 24px;
  text-align: center;
  flex-shrink: 0;
`

const infoStyle = css`
  flex: 1;
  min-width: 0;
`

const nameStyle = css`
  font-family: ${font.erode};
  font-size: clamp(0.875rem, 0.8125rem + 0.25vw, 1rem);
  font-weight: ${weight.semibold};
  color: ${color.textSagePrimary};
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const diagnosisStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  color: ${color.textSageMuted};
  margin-top: 2px;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const membersStyle = css`
  font-size: clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem);
  color: ${color.textSageSoft};
  width: 100px;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;

  & strong {
    color: ${color.textSageSecondary};
    font-weight: ${weight.semibold};
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const statusStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
  justify-content: flex-end;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`

const dotStyle = css`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
`

const dotActiveStyle = css`
  background: ${color.primary};
`

const dotInactiveStyle = css`
  background: ${color.dangerAlt};
`

const statusTextStyle = css`
  font-size: 10px;
  font-weight: ${weight.semibold};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`

const statusTextActiveStyle = css`
  color: ${color.primary};
`

const statusTextInactiveStyle = css`
  color: ${color.dangerAlt};
`

const mobileMetaStyle = css`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 0.375rem;
    font-size: clamp(0.625rem, 0.5625rem + 0.25vw, 0.6875rem);
    color: ${color.textSageSoft};
  }
`

const mobileMetaStatusStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
`

const mobileDotStyle = css`
  width: 6px;
  height: 6px;
  border-radius: 50%;
`

export const FamilyItem: FC<FamilyItemProps> = ({
  index,
  displayName,
  diagnosis,
  memberCount,
  isActive,
  isSelected,
  onSelect,
}) => {
  const statusText = isActive ? "Ativo" : "Inativo"
  const memberWord = memberCount === 1 ? "membro" : "membros"

  return (
    <div
      class={`${cardStyle} ${isSelected ? cardSelectedStyle : ""} ${!isActive ? cardInactiveStyle : ""}`}
      style={`--stagger: ${index * 60}ms`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`${displayName}, ${memberCount} ${memberWord}, ${statusText}`}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <span class={indexStyle}>{String(index + 1).padStart(2, "0")}</span>
      <div class={infoStyle}>
        <div class={nameStyle}>{displayName}</div>
        {diagnosis && <div class={diagnosisStyle}>{diagnosis}</div>}
      </div>
      <span class={membersStyle}>
        <strong>{memberCount}</strong> {memberWord}
      </span>
      <div class={statusStyle}>
        <span class={`${dotStyle} ${isActive ? dotActiveStyle : dotInactiveStyle}`} />
        <span class={`${statusTextStyle} ${isActive ? statusTextActiveStyle : statusTextInactiveStyle}`}>
          {statusText}
        </span>
      </div>
      <div class={mobileMetaStyle}>
        <span>{memberCount} {memberWord}</span>
        <span class={mobileMetaStatusStyle}>
          <span class={`${mobileDotStyle} ${isActive ? dotActiveStyle : dotInactiveStyle}`} />
          <span class={`${statusTextStyle} ${isActive ? statusTextActiveStyle : statusTextInactiveStyle}`}>
            {statusText}
          </span>
        </span>
      </div>
    </div>
  )
}
