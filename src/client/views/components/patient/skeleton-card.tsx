import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, alpha } from "../../../styles/tokens.ts"

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
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
`

const skeletonLine = css`
  background: linear-gradient(
    90deg,
    ${alpha(color.primary, 0.04)} 25%,
    ${alpha(color.primary, 0.08)} 50%,
    ${alpha(color.primary, 0.04)} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.8s infinite ease-in-out;
  border-radius: 8px;
  height: 12px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.6;
  }
`

const indexSkel = css`
  ${skeletonLine};
  width: 16px;
  flex-shrink: 0;
`

const infoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`

const nameLineSkel = css`
  ${skeletonLine};
  width: 60%;
`

const diagLineSkel = css`
  ${skeletonLine};
  width: 40%;
`

const membersSkel = css`
  ${skeletonLine};
  width: 60px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`

const statusSkel = css`
  ${skeletonLine};
  width: 50px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`

interface SkeletonListProps {
  readonly count?: number
}

export const SkeletonList: FC<SkeletonListProps> = ({ count = 6 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} class={cardStyle}>
        <div class={indexSkel} />
        <div class={infoStyle}>
          <div class={nameLineSkel} />
          <div class={diagLineSkel} />
        </div>
        <div class={membersSkel} />
        <div class={statusSkel} />
      </div>
    ))}
  </div>
)
