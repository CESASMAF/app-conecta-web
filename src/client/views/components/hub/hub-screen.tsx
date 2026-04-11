import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { color, breakpoint } from "../../../styles/tokens.ts"
import type { HubState } from "../../../viewmodels/auth-hub/types.ts"
import { AUTH_HUB_STRINGS } from "../../../viewmodels/auth-hub/strings.ts"
import { getGreeting } from "../../../viewmodels/auth-hub/reducer.ts"
import { HubHeader } from "./hub-header.tsx"
import { HubWelcome } from "./hub-welcome.tsx"
import { RecentAppCard } from "./recent-app-card.tsx"
import { AppGrid } from "./app-grid.tsx"
import { HubEmptyState } from "./hub-empty-state.tsx"
import { HubNetworkError } from "./hub-network-error.tsx"

interface HubScreenProps {
  readonly state: HubState
  readonly onSelectApp: (appId: string) => void
  readonly onLogout: () => void
  readonly onRetry: () => void
}

const screenStyle = css`
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

export const HubScreen: FC<HubScreenProps> = ({ state, onSelectApp, onLogout, onRetry }) => {
  const { user, apps, lastUsedAppId, error } = state
  if (!user) return null

  const recentApp = lastUsedAppId !== null && apps.length > 1
    ? apps.find((a) => a.id === lastUsedAppId) ?? null
    : null

  const hasNetworkError = error?.type === "network"
  const hasApps = apps.length > 0
  const greeting = getGreeting(user.firstName)

  return (
    <div class={screenStyle}>
      <HubHeader user={user} onLogout={onLogout} />
      <main class={mainStyle}>
        <HubWelcome
          greeting={greeting}
          subtitle={AUTH_HUB_STRINGS.hubSubtitle}
        />
        {hasNetworkError ? (
          <HubNetworkError onRetry={onRetry} />
        ) : !hasApps ? (
          <HubEmptyState onLogout={onLogout} />
        ) : (
          <>
            {recentApp ? (
              <RecentAppCard app={recentApp} onClick={() => onSelectApp(recentApp.id)} />
            ) : null}
            <AppGrid
              apps={apps}
              label={AUTH_HUB_STRINGS.allModulesLabel(apps.length)}
              onSelectApp={onSelectApp}
            />
          </>
        )}
      </main>
    </div>
  )
}
