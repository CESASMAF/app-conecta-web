import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, breakpoint } from "../../../styles/tokens.ts"
import { LoadingScreen } from "../ui/loading-screen.tsx"
import { HubHeader } from "./hub-header.tsx"
import { HubWelcome } from "./hub-welcome.tsx"
import { RecentAppCard } from "./recent-app-card.tsx"
import { AppGrid } from "./app-grid.tsx"
import { HubEmptyState } from "./hub-empty-state.tsx"
import { HubNetworkError } from "./hub-network-error.tsx"

interface HubScreenProps {
  readonly user: Readonly<{ name: string; firstName: string; initials: string; role: string }> | null
  readonly apps: readonly Readonly<{ id: string; name: string; description: string; icon: string; color: string }>[]
  readonly lastUsedAppId: string | null
  readonly errorType: string | null
  readonly greeting: string
  readonly subtitle: string
  readonly allModulesLabel: string
  readonly lastUsedLabel: string
  readonly emptyStrings: Readonly<{
    emptyTitle: string; emptyDesc: string; emptyContactAdmin: string; emptyBackToStart: string
  }>
  readonly emptyMailtoHref: string
  readonly networkStrings: Readonly<{
    networkErrorTitle: string; networkErrorDesc: string; networkErrorRetry: string
  }>
  readonly onSelectApp: (appId: string) => void
  readonly onLogout: () => void
  readonly onRetry: () => void
}

const screenStyle = css`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${color.background};
`

const mainStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  @media (min-width: ${breakpoint.mobile}px) {
    padding: 48px;
  }
`

export const HubScreen: FC<HubScreenProps> = (props) => {
  const { user, apps, lastUsedAppId, errorType, greeting, subtitle, allModulesLabel, lastUsedLabel } = props
  const { emptyStrings, emptyMailtoHref, networkStrings, onSelectApp, onLogout, onRetry } = props

  if (!user) return <LoadingScreen context="loading-permissions" />

  const recentApp = lastUsedAppId !== null && apps.length > 1
    ? apps.find((a) => a.id === lastUsedAppId) ?? null
    : null

  const hasNetworkError = errorType === "network"
  const hasApps = apps.length > 0

  return (
    <div class={screenStyle}>
      <HubHeader user={user} onLogout={onLogout} />
      <main class={mainStyle}>
        <HubWelcome greeting={greeting} subtitle={subtitle} />
        {hasNetworkError ? (
          <HubNetworkError strings={networkStrings} onRetry={onRetry} />
        ) : !hasApps ? (
          <HubEmptyState strings={emptyStrings} mailtoHref={emptyMailtoHref} onLogout={onLogout} />
        ) : (
          <>
            {recentApp ? (
              <RecentAppCard app={recentApp} label={lastUsedLabel} onClick={() => onSelectApp(recentApp.id)} />
            ) : null}
            <AppGrid apps={apps} label={allModulesLabel} onSelectApp={onSelectApp} />
          </>
        )}
      </main>
    </div>
  )
}
