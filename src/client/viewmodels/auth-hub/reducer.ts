// Auth Hub — Pure reducer + derived state helpers

import type { AppInfo, HubAction, HubState } from "./types.ts";
import { initialState } from "./types.ts";
import { AUTH_HUB_STRINGS } from "./strings.ts";

export const hubReducer = (
  state: HubState,
  action: HubAction,
): HubState => {
  switch (action.type) {
    case "INIT_SESSION_CHECK":
      return { ...state, screen: "loading", loadingContext: "authenticating" };

    case "NO_SESSION":
      return { ...state, screen: "landing", loadingContext: null, error: null };

    case "SESSION_EXPIRED":
      return {
        ...state,
        screen: "landing",
        loadingContext: null,
        user: null,
        error: {
          type: "session",
          title: AUTH_HUB_STRINGS.sessionExpiredTitle,
          message: AUTH_HUB_STRINGS.sessionExpiredDesc,
        },
      };

    case "AUTH_START":
      return { ...state, screen: "loading", loadingContext: "authenticating", error: null };

    case "AUTH_CALLBACK_SUCCESS": {
      const { user, apps, lastUsedAppId } = action;
      if (apps.length === 0) {
        return {
          ...state,
          screen: "hub",
          loadingContext: null,
          user,
          apps,
          lastUsedAppId: null,
          error: null,
        };
      }
      if (apps.length === 1) {
        return {
          ...state,
          screen: "redirect",
          loadingContext: null,
          user,
          apps,
          lastUsedAppId: apps[0]!.id,
          error: null,
        };
      }
      return {
        ...state,
        screen: "hub",
        loadingContext: null,
        user,
        apps,
        lastUsedAppId,
        error: null,
      };
    }

    case "AUTH_CALLBACK_FAILURE":
      return {
        ...state,
        screen: "landing",
        loadingContext: null,
        error: {
          type: "auth",
          title: action.title,
          message: action.message,
        },
      };

    case "LOAD_PERMISSIONS_START":
      return {
        ...state,
        screen: "loading",
        loadingContext: "loading-permissions",
        error: null,
      };

    case "LOAD_PERMISSIONS_SUCCESS": {
      const { apps, lastUsedAppId } = action;
      if (apps.length === 1) {
        return {
          ...state,
          screen: "redirect",
          loadingContext: null,
          apps,
          lastUsedAppId: apps[0]!.id,
        };
      }
      return {
        ...state,
        screen: "hub",
        loadingContext: null,
        apps,
        lastUsedAppId,
      };
    }

    case "LOAD_PERMISSIONS_FAILURE":
      return {
        ...state,
        screen: "hub",
        loadingContext: null,
        error: {
          type: "network",
          title: AUTH_HUB_STRINGS.networkErrorTitle,
          message: AUTH_HUB_STRINGS.networkErrorDesc,
        },
      };

    case "SELECT_APP":
      return {
        ...state,
        screen: "loading",
        loadingContext: "entering-app",
        lastUsedAppId: action.appId,
      };

    case "LOGOUT_START":
      return { ...state, screen: "loading", loadingContext: "authenticating" };

    case "LOGOUT_COMPLETE":
      return { ...initialState, screen: "landing" };
  }
};

/** Returns the single app when in redirect screen, or null otherwise. */
export const getRedirectApp = (state: HubState): AppInfo | null => {
  if (state.screen === "redirect" && state.apps.length === 1) {
    return state.apps[0] ?? null;
  }
  return null;
};

/** Contextual greeting based on current hour. */
export const getGreeting = (firstName: string): string => {
  const h = new Date().getHours();
  const period = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  return `${period}, ${firstName}`;
};
