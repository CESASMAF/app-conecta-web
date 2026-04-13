import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, alpha } from "../../../styles/tokens.ts"

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`

const sectionCard = css`
  background: ${color.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 1vw, 2rem);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-top: 1.5rem;
`

const skeletonLine = css`
  background: linear-gradient(90deg, ${alpha(color.primary, 0.04)} 25%, ${alpha(color.primary, 0.08)} 50%, ${alpha(color.primary, 0.04)} 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.8s infinite ease-in-out;
  border-radius: 8px;
  height: 12px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const headerBlock = css`
  margin-bottom: 1.5rem;
`

const skeletonRow = css`
  display: grid;
  grid-template-columns: 32px 1fr 110px 90px 80px 36px;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid ${alpha(color.primary, 0.08)};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
`

export const FamilyLoadingSkeleton: FC = () => (
  <div class={sectionCard}>
    <div class={headerBlock}>
      <div class={skeletonLine} style="width: 200px; height: 20px; margin-bottom: 0.5rem" />
      <div class={skeletonLine} style="width: 140px; height: 12px" />
    </div>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} class={skeletonRow}>
        <div class={skeletonLine} style="width: 20px" />
        <div class={skeletonLine} style="width: 60%" />
        <div class={skeletonLine} style="width: 40%" />
        <div class={skeletonLine} style="width: 40%" />
        <div class={skeletonLine} style="width: 40%" />
        <div />
      </div>
    ))}
  </div>
)
