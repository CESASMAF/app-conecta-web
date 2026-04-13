import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
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

const blobFloat1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(2rem, 1.5rem) scale(1.05); }
`

const blobFloat2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-1.5rem, -1rem) scale(1.08); }
`

const bodyOverrideStyle = css`
  :-hono-global {
    body { background: ${color.bgSageDeep} !important; }
  }
`

const screenStyle = css`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
`

const bgGradientStyle = css`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${color.bgBase} 0%, ${color.bgWarm} 25%, ${color.bgSage} 55%, ${color.bgSageDeep} 100%);
  pointer-events: none;
`

const blobOneStyle = css`
  position: fixed;
  top: -15%;
  right: -10%;
  width: clamp(18rem, 15rem + 15vw, 31.25rem);
  height: clamp(18rem, 15rem + 15vw, 31.25rem);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79,132,72,0.07) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
  animation: ${blobFloat1} 20s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const blobTwoStyle = css`
  position: fixed;
  bottom: -20%;
  left: -5%;
  width: clamp(20rem, 16rem + 18vw, 37.5rem);
  height: clamp(20rem, 16rem + 18vw, 37.5rem);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180,160,100,0.05) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
  animation: ${blobFloat2} 25s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const contentStyle = css`
  position: relative;
  z-index: 1;
`

const mainStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1.5rem, 1rem + 2vw, 3rem) clamp(1.25rem, 0.5rem + 3vw, 3rem);
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
      <div class={bodyOverrideStyle} />
      <div class={bgGradientStyle} aria-hidden="true" />
      <div class={blobOneStyle} aria-hidden="true" />
      <div class={blobTwoStyle} aria-hidden="true" />
      <div class={contentStyle}>
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
    </div>
  )
}
