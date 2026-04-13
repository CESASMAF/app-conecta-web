import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, breakpoint } from "../../../styles/tokens.ts"
import { fadeInUp } from "../../../styles/auth-hub.ts"
import { AppCard } from "./app-card.tsx"

interface AppGridProps {
  readonly apps: readonly Readonly<{
    id: string
    name: string
    description: string
    icon: string
    color: string
  }>[]
  readonly label: string
  readonly onSelectApp: (appId: string) => void
}

const containerStyle = css`
  width: 100%;
  max-width: min(90%, 45rem);
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.5625rem, 0.5rem + 0.25vw, 0.625rem);
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textSageMuted};
  margin: 0 0 clamp(0.75rem, 0.5rem + 0.5vw, 1rem);
  animation: ${fadeInUp} 600ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(0.75rem, 0.5rem + 0.5vw, 1rem);
  width: 100%;
  @media (min-width: ${breakpoint.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(13.75rem, 1fr));
  }
`

export const AppGrid: FC<AppGridProps> = ({ apps, label, onSelectApp }) => (
  <nav class={containerStyle} aria-label="Modulos disponiveis">
    <h2 class={labelStyle}>{label}</h2>
    <div class={gridStyle}>
      {apps.map((app, index) => (
        <AppCard
          key={app.id}
          app={app}
          index={index}
          onClick={() => onSelectApp(app.id)}
        />
      ))}
    </div>
  </nav>
)
