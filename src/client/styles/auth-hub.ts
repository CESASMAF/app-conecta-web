import { css, keyframes } from "hono/css"

// --- Shared Animations ---

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`

export const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, 30px) scale(1.05); }
`

export const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, -20px) scale(1.08); }
`

export const progressFill = keyframes`
  from { width: 0; }
  to { width: 100%; }
`

// --- Shared Styles ---

export const centeredContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: clip;
`

export const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
`
