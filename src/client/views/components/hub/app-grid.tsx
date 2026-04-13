import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, font, weight, space, breakpoint } from "../../../styles/tokens.ts"
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
  max-width: 720px;
`

const labelStyle = css`
  font-family: ${font.satoshi};
  font-size: 10px;
  font-weight: ${weight.bold};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${color.textMuted};
  margin: 0 0 ${space[3]};
  animation: ${fadeInUp} 600ms ease 300ms both;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${space[3]};
  width: 100%;
  @media (min-width: ${breakpoint.mobile}px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
`

export const AppGrid: FC<AppGridProps> = ({ apps, label, onSelectApp }) => (
  <nav class={containerStyle} aria-label="Módulos disponíveis">
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
