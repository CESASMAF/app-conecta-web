import type { FC } from "hono/jsx/dom"
import { useReducer, useEffect } from "hono/jsx/dom"
import { hubReducer, getRedirectApp, getGreeting } from "../../viewmodels/auth-hub/reducer.ts"
import { initialState } from "../../viewmodels/auth-hub/types.ts"
import type { HubAction } from "../../viewmodels/auth-hub/types.ts"
import { AUTH_HUB_STRINGS } from "../../viewmodels/auth-hub/strings.ts"
import { LandingScreen } from "../components/landing/landing-screen.tsx"
import { LoadingScreen } from "../components/ui/loading-screen.tsx"
import { HubScreen } from "../components/hub/hub-screen.tsx"
import { RedirectScreen } from "../components/redirect/redirect-screen.tsx"

const mailtoHref = `mailto:${AUTH_HUB_STRINGS.emptyContactEmail}?subject=${encodeURIComponent(AUTH_HUB_STRINGS.emptyContactSubject)}`

/** Session check via raw fetch to avoid base-client auto-redirect on 401. */
const checkSession = async (dispatch: (a: HubAction) => void): Promise<void> => {
  try {
    const res = await fetch("/api/v1/me", {
      credentials: "same-origin",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
    if (res.status === 401) {
      dispatch({ type: "NO_SESSION" })
      return
    }
    if (!res.ok) {
      dispatch({ type: "LOAD_PERMISSIONS_FAILURE", title: AUTH_HUB_STRINGS.networkErrorTitle, message: AUTH_HUB_STRINGS.networkErrorDesc })
      return
    }
    const json = await res.json()
    const d = json.data ?? json
    dispatch({
      type: "AUTH_CALLBACK_SUCCESS",
      user: { name: d.name, firstName: d.firstName, initials: d.initials, role: d.role },
      apps: d.apps,
      lastUsedAppId: d.lastUsedAppId ?? null,
    })
  } catch {
    dispatch({ type: "LOAD_PERMISSIONS_FAILURE", title: AUTH_HUB_STRINGS.networkErrorTitle, message: AUTH_HUB_STRINGS.networkErrorDesc })
  }
}

export const AuthHubPage: FC = () => {
  const [state, dispatch] = useReducer(hubReducer, initialState)

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search)
    if (params.get("error")) {
      dispatch({ type: "AUTH_CALLBACK_FAILURE", title: AUTH_HUB_STRINGS.authErrorTitle, message: AUTH_HUB_STRINGS.authErrorDesc })
      return
    }
    if (params.get("reason") === "session_expired") {
      dispatch({ type: "SESSION_EXPIRED", title: AUTH_HUB_STRINGS.sessionExpiredTitle, message: AUTH_HUB_STRINGS.sessionExpiredDesc })
      return
    }
    dispatch({ type: "INIT_SESSION_CHECK" })
    checkSession(dispatch)
  }, [])

  const handleLogin = (): void => { globalThis.location.href = "/auth/login" }
  const handleLogout = (): void => { globalThis.location.href = "/auth/logout" }
  const handleCancelRedirect = (): void => { dispatch({ type: "NO_SESSION" }) }

  const handleSelectApp = (appId: string): void => {
    dispatch({ type: "SELECT_APP", appId })
    const app = state.apps.find((a) => a.id === appId)
    if (app) setTimeout(() => { globalThis.location.href = app.route }, 1500)
  }

  const handleRetry = (): void => {
    dispatch({ type: "LOAD_PERMISSIONS_START" })
    checkSession(dispatch)
  }

  const alertForLanding = state.error
    ? { type: state.error.type === "session" ? "warning" as const : "error" as const, title: state.error.title, description: state.error.message }
    : null

  switch (state.screen) {
    case "landing":
      return <LandingScreen alert={alertForLanding} onLogin={handleLogin} />
    case "loading": {
      const loadingApp = state.lastUsedAppId ? state.apps.find((a) => a.id === state.lastUsedAppId) : null
      return <LoadingScreen context={state.loadingContext ?? "authenticating"} appName={loadingApp?.name} />
    }
    case "hub":
      return (
        <HubScreen
          user={state.user}
          apps={state.apps}
          lastUsedAppId={state.lastUsedAppId}
          errorType={state.error?.type ?? null}
          greeting={state.user ? getGreeting(state.user.firstName, new Date().getHours()) : ""}
          subtitle={AUTH_HUB_STRINGS.hubSubtitle}
          allModulesLabel={AUTH_HUB_STRINGS.allModulesLabel(state.apps.length)}
          lastUsedLabel={AUTH_HUB_STRINGS.lastUsedLabel}
          emptyStrings={{
            emptyTitle: AUTH_HUB_STRINGS.emptyTitle,
            emptyDesc: AUTH_HUB_STRINGS.emptyDesc,
            emptyContactAdmin: AUTH_HUB_STRINGS.emptyContactAdmin,
            emptyBackToStart: AUTH_HUB_STRINGS.emptyBackToStart,
          }}
          emptyMailtoHref={mailtoHref}
          networkStrings={{
            networkErrorTitle: AUTH_HUB_STRINGS.networkErrorTitle,
            networkErrorDesc: AUTH_HUB_STRINGS.networkErrorDesc,
            networkErrorRetry: AUTH_HUB_STRINGS.networkErrorRetry,
          }}
          onSelectApp={handleSelectApp}
          onLogout={handleLogout}
          onRetry={handleRetry}
        />
      )
    case "redirect": {
      const redirectApp = getRedirectApp(state)
      if (!redirectApp) return <LoadingScreen context="authenticating" />
      return <RedirectScreen app={redirectApp} onCancel={handleCancelRedirect} />
    }
  }
}
