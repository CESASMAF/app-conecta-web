// Auth Hub — State + Action types

export type HubScreen = "landing" | "loading" | "hub" | "redirect";
export type HubLoadingContext =
  | "authenticating"
  | "loading-permissions"
  | "entering-app";
export type HubErrorType = "auth" | "session" | "network";

export type AppInfo = Readonly<{
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}>;

export type HubUser = Readonly<{
  name: string;
  firstName: string;
  initials: string;
  role: string;
}>;

export type HubError = Readonly<{
  type: HubErrorType;
  title: string;
  message: string;
}>;

export type HubState = Readonly<{
  screen: HubScreen;
  loadingContext: HubLoadingContext | null;
  user: HubUser | null;
  apps: readonly AppInfo[];
  lastUsedAppId: string | null;
  error: HubError | null;
}>;

export type HubAction =
  | Readonly<{ type: "INIT_SESSION_CHECK" }>
  | Readonly<{ type: "NO_SESSION" }>
  | Readonly<{ type: "SESSION_EXPIRED" }>
  | Readonly<{ type: "AUTH_START" }>
  | Readonly<{
    type: "AUTH_CALLBACK_SUCCESS";
    user: HubUser;
    apps: readonly AppInfo[];
    lastUsedAppId: string | null;
  }>
  | Readonly<{
    type: "AUTH_CALLBACK_FAILURE";
    title: string;
    message: string;
  }>
  | Readonly<{ type: "LOAD_PERMISSIONS_START" }>
  | Readonly<{
    type: "LOAD_PERMISSIONS_SUCCESS";
    apps: readonly AppInfo[];
    lastUsedAppId: string | null;
  }>
  | Readonly<{ type: "LOAD_PERMISSIONS_FAILURE" }>
  | Readonly<{ type: "SELECT_APP"; appId: string }>
  | Readonly<{ type: "LOGOUT_START" }>
  | Readonly<{ type: "LOGOUT_COMPLETE" }>;

export const initialState: HubState = {
  screen: "landing",
  loadingContext: null,
  user: null,
  apps: [],
  lastUsedAppId: null,
  error: null,
};
